use std::collections::HashSet;
use crate::text_processor::{TextProcessor};
use crate::parallel_processor::ParallelProcessor;
use serde::{Deserialize, Serialize};
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
    pub fn extract_classes_parallel(&self, files_with_content: Vec<(PathBuf, String)>) -> Result<Vec<CssClass>, Box<dyn std::error::Error>> {
        let text_processor = Arc::new(
            TextProcessor::new()
                .add_pattern("css_class", r"\.([a-zA-Z][a-zA-Z0-9_-]*)")?
        );

        let mut parallel_processor = ParallelProcessor::new(self.thread_count);
        
        if let Some(ref app) = self.progress_emitter {
            parallel_processor = parallel_processor.with_progress_emitter(app.clone());
        }

        let all_classes = parallel_processor.process_flat_map(
            files_with_content,
            |item| {
                let (file_path, content) = item;
                let matches = text_processor.process_content(content);
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
            },
            "Extracting CSS classes"
        )?;
        
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