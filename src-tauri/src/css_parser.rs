use std::collections::HashSet;
use crate::text_processor::{TextProcessor};
use crate::progress_reporter::ProgressReporter;
use serde::{Deserialize, Serialize};
use rayon::prelude::*;
use std::sync::{Arc};
use std::path::PathBuf;

pub struct CssParser {
    thread_count: Option<usize>,
    progress_emitter: Option<tauri::AppHandle>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CssClass {
    pub name: String,
    pub file: String,
    pub line: usize,
}

impl CssParser {
    pub fn new() -> Self {
        Self { 
            thread_count: None,
            progress_emitter: None,
        }
    }

    /* ========================================================================================== */
    pub fn with_thread_count(mut self, count: usize) -> Self {
        self.thread_count = Some(count);
        self
    }

    /* ========================================================================================== */
    pub fn with_progress_emitter(mut self, app: tauri::AppHandle) -> Self {
        self.progress_emitter = Some(app);
        self
    }

    /* ========================================================================================== */
    // Currently unused
    pub fn extract_classes(&self, files_with_content: Vec<(PathBuf, String)>) -> Result<Vec<CssClass>, Box<dyn std::error::Error>> {
        let processor = TextProcessor::new()
            .add_pattern("css_class", r"\.([a-zA-Z][a-zA-Z0-9_-]*)")?;
        
        let total = files_with_content.len();
        let mut progress = ProgressReporter::new(total, "Processing CSS files".to_string())
            .with_step_size(std::cmp::max(1, total / 20));

        if let Some(ref app) = self.progress_emitter {
            progress = progress.with_emitter(app.clone());
        }

        progress.emit_progress(0, &format!("Extracting classes from {} files...", total));

        let mut classes = Vec::new();
        let mut processed = 0;
        
        for (file_path, content) in files_with_content {
            processed += 1;
            
            // Emit progress every 10 files or on completion
            if processed % 10 == 0 || processed == total {
                progress.emit_progress(processed, &format!("Processing file {} of {}...", processed, total));
            }
            
            let matches = processor.process_content(&content);
            let file_path_str = file_path.to_string_lossy().to_string();
            
            for text_match in matches {
                if text_match.pattern_name == "css_class" && self.is_valid_class_name(&text_match.matched_text) {
                    classes.push(CssClass {
                        name: text_match.matched_text,
                        file: file_path_str.clone(),
                        line: text_match.line,
                    });
                }
            }
        }
        
        progress.finish("CSS extraction complete!");
        self.deduplicate_classes(&mut classes);
        Ok(classes)
    }

    /* ========================================================================================== */
    pub fn extract_classes_parallel(&self, files_with_content: Vec<(PathBuf, String)>) -> Result<Vec<CssClass>, Box<dyn std::error::Error>> {
        let processor = Arc::new(
            TextProcessor::new()
                .add_pattern("css_class", r"\.([a-zA-Z][a-zA-Z0-9_-]*)")?
        );
        
        let total = files_with_content.len();

        let mut progress = ProgressReporter::new(total, "Extracting CSS classes".to_string())
            .with_step_size(std::cmp::max(1, total / 20));
        
        if let Some(ref app) = self.progress_emitter {
            progress = progress.with_emitter(app.clone());
        }

        progress.emit_progress(0, &format!("Extracting classes from {} files...", total));

        // Configure thread pool
        let pool = match self.thread_count {
            Some(count) => rayon::ThreadPoolBuilder::new().num_threads(count).build()?,
            None => rayon::ThreadPoolBuilder::new().build()?,
        };

        let progress_counter = progress.create_counter();

        let all_classes: Vec<CssClass> = pool.install(|| {
            files_with_content
                .par_iter()
                .flat_map(|(file_path, content)| {
                    // Update progress (thread-safe)
                    let current = {
                        let mut counter = progress_counter.lock().unwrap();
                        *counter += 1;
                        *counter
                    };

                    // Emit progress every 10 files or on completion
                    if current % 10 == 0 || current == total {
                        progress.emit_progress(current, &format!("Processing file {} of {}...", current, total));
                    }
                    
                    let matches = processor.process_content(content);
                    let file_path_str = file_path.to_string_lossy().to_string();
                    
                    matches
                        .into_iter()
                        .filter(|text_match| {
                            text_match.pattern_name == "css_class" 
                                && self.is_valid_class_name(&text_match.matched_text)
                        })
                        .map(|text_match| CssClass {
                            name: text_match.matched_text,
                            file: file_path_str.clone(),
                            line: text_match.line,
                        })
                        .collect::<Vec<_>>()
                })
                .collect()
        });
        
        progress.finish("CSS extraction complete!");
        
        let mut classes = all_classes;
        self.deduplicate_classes(&mut classes);
        Ok(classes)
    }

    /* ========================================================================================== */
    fn is_valid_class_name(&self, name: &str) -> bool {
        name.len() >= 2 && !name.chars().all(|c| c.is_ascii_digit())
    }

    /* ========================================================================================== */
    fn deduplicate_classes(&self, classes: &mut Vec<CssClass>) {
        let mut seen = HashSet::new();
        classes.retain(|class| {
            let key = (class.name.clone(), class.file.clone());
            seen.insert(key)
        });
    }
}