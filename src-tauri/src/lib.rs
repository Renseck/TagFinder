pub mod css_parser;
pub mod file_walker;
pub mod progress_reporter;
pub mod scanner;
pub mod text_processor;
pub mod unused_detector;
pub mod utils;

pub use css_parser::*;
pub use file_walker::*;
pub use progress_reporter::*;
pub use scanner::{FileScanner, ScanResult};
pub use text_processor::*;
pub use unused_detector::*;
pub use utils::*;

/* ======================================= Tauri wrappers ======================================= */
#[tauri::command]
async fn find_unused_css_tags(directory: String) -> Result<UnusedReport, String> {
    match analyze_directory_gui(&directory).await {
        Ok(report) => Ok(report),
        Err(e) => Err(format!("Error analyzing directory: {}", e)),
    }
}

#[tauri::command]
async fn find_word_in_files(word: String, directory: String) -> Result<ScanResult, String> {
    match find_word_gui(&word, &directory).await {
        Ok(result) => Ok(result),
        Err(e) => Err(format!("Error finding word: {}", e)),
    }
}

/* =============================== Some clean wrappers for the GUI ============================== */
async fn analyze_directory_gui(
    directory: &str,
) -> Result<UnusedReport, Box<dyn std::error::Error>> {
    let detector = UnusedDetector::new(directory.to_string());
    detector.generate_report_parallel()
}

/* ============================================================================================== */
async fn find_word_gui(
    word: &str,
    directory: &str,
) -> Result<ScanResult, Box<dyn std::error::Error>> {
    let scanner = FileScanner::new(word.to_string(), directory.to_string());
    scanner.scan_parallel()
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
            find_word_in_files
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
