pub mod css_parser;
pub mod file_walker;
pub mod progress_reporter;
pub mod scanner;
pub mod text_processor;
pub mod unused_detector;
pub mod utils;
pub mod config;

pub use css_parser::*;
pub use file_walker::*;
pub use progress_reporter::*;
pub use scanner::{FileScanner, ScanResult};
pub use text_processor::*;
pub use unused_detector::*;
pub use utils::*;
pub use config::Config;

use tauri::Emitter;
use std::fs;
use std::path::{Path};
use serde::{Serialize};

#[derive(Clone, Serialize)]
pub struct ProgressEvent {
    pub current: usize,
    pub total: usize,
    pub message: String,
}

#[derive(Clone, Serialize)]
pub struct DirectoryItem {
    name: String,
    path: String,
    is_directory: bool,
    children: Option<Vec<DirectoryItem>>,
}

/* ======================================= Tauri wrappers ======================================= */
#[tauri::command]
async fn find_unused_css_tags(app: tauri::AppHandle, directory: String) -> Result<UnusedReport, String> {
    match analyze_directory_gui(&app, &directory).await {
        Ok(report) => Ok(report),
        Err(e) => Err(format!("Error analyzing directory: {}", e)),
    }
}

#[tauri::command]
async fn find_word_in_files(app: tauri::AppHandle, word: String, directory: String) -> Result<ScanResult, String> {
    match find_word_gui(&app, &word, &directory).await {
        Ok(result) => Ok(result),
        Err(e) => Err(format!("Error finding word: {}", e)),
    }
}

#[tauri::command]
async fn load_config() -> Result<Config, String> {
    match Config::load_or_default() {
        config => Ok(config),
    }
}

#[tauri::command]
async fn save_config(config: Config) -> Result<(), String> {
    let config_path = "tag-finder.toml";
    let toml_string = toml::to_string(&config)
        .map_err(|e| format!("Failed to serialize config: {}", e))?;
    
    fs::write(config_path, toml_string)
        .map_err(|e| format!("Failed to write config file: {}", e))?;
    
    Ok(())
}

#[tauri::command]
async fn get_directory_structure(path: String) -> Result<Vec<DirectoryItem>, String> {
    let path = Path::new(&path);
    if !path.exists() || !path.is_dir() {
        return Err("Invalid directory path".to_string());
    }

    get_directory_items(path, 2) // Limit depth to 2 levels initially
        .map_err(|e| format!("Failed to read directory: {}", e))
}

fn get_directory_items(dir: &Path, max_depth: usize) -> Result<Vec<DirectoryItem>, std::io::Error> {
    if max_depth == 0 {
        return Ok(vec![]);
    }

    let mut items = Vec::new();
    let entries = fs::read_dir(dir)?;

    for entry in entries {
        let entry = entry?;
        let path = entry.path();
        let name = entry.file_name().to_string_lossy().to_string();
        
        // Skip hidden files and common uninteresting directories
        if name.starts_with('.') && !matches!(name.as_str(), ".git" | ".vscode" | ".idea") {
            continue;
        }

        if path.is_dir() {
            let children = if max_depth > 1 {
                Some(get_directory_items(&path, max_depth - 1)?)
            } else {
                None
            };

            items.push(DirectoryItem {
                name,
                path: path.to_string_lossy().to_string(),
                is_directory: true,
                children,
            });
        }
    }

    // Sort directories first, then by name
    items.sort_by(|a, b| {
        a.name.to_lowercase().cmp(&b.name.to_lowercase())
    });

    Ok(items)
}

/* =============================== Some clean wrappers for the GUI ============================== */
async fn analyze_directory_gui(app: &tauri::AppHandle, directory: &str) -> Result<UnusedReport, Box<dyn std::error::Error>> {
    // Emit initial progress
    let _ = app.emit("progress", ProgressEvent { 
        current: 0,
        total: 0,
        message: "Initializing...".to_string() 
    });

    // Load config
    let config = Config::load_or_default();

    // Detector invokes file walkers as needed
    let detector = UnusedDetector::new(directory.to_string())
                                                  .with_progress_emitter(app.clone())
                                                  .with_config(config);
    detector.generate_report()
}

/* ============================================================================================== */
async fn find_word_gui(app: &tauri::AppHandle, word: &str, directory: &str) -> Result<ScanResult, Box<dyn std::error::Error>> {
    // Emit initial progress
    let _ = app.emit("progress", ProgressEvent { 
        current: 0,
        total: 0,
        message: "Reading files...".to_string() 
    });
    
    // Load config
    let config = Config::load_or_default();

    // Need to manually invoke walker ourselves
    let mut scanner = FileScanner::new();
    let mut walker = FileWalker::new(directory.to_string())
                                            .with_progress_emitter(app.clone())
                                            .with_config(config);
    let threads = None;
    
    if let Some(thread_count) = threads {
        scanner = scanner.with_thread_count(thread_count);
        walker = walker.with_thread_count(thread_count)
    }

    let files_with_content = walker.walk_with_content_parallel()?;
    let total_files = files_with_content.len();

    let _ = app.emit("progress", ProgressEvent { current: 0, total: total_files, message: "Scanning files...".to_string() });

    scanner.scan(word.to_string(), files_with_content)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let builder = tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init());

    let builder = match tauri_plugin_dialog::init() {
        plugin => builder.plugin(plugin),
    };

    builder
        .invoke_handler(tauri::generate_handler![
            find_unused_css_tags,
            find_word_in_files,
            load_config,
            save_config,
            get_directory_structure
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
