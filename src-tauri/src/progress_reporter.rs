use tauri::Emitter;
use std::sync::{Arc, Mutex};

pub struct ProgressReporter {
    total: usize,
    current: Arc<Mutex<usize>>,
    step_size: usize,
    message: String,
    emitter: Option<tauri::AppHandle>,
}

impl ProgressReporter {
    pub fn new(total: usize, message: String) -> Self {
        Self {
            total,
            current: Arc::new(Mutex::new(0)),
            step_size: std::cmp::max(1, total / 20),
            message,
            emitter: None,
        }
    }

    /* ========================================================================================== */
    pub fn with_step_size(mut self, step_size: usize) -> Self {
        self.step_size = step_size;
        self
    }

    /* ========================================================================================== */
    pub fn with_emitter(mut self, app: tauri::AppHandle)-> Self {
        self.emitter = Some(app);
        self
    }

    /* ========================================================================================== */
    pub fn set_message(&mut self, message: String) {
        self.message = message;
    }

    /* ========================================================================================== */
    pub fn emit_progress(&self, current: usize, message: &str) {
        println!("{}", message);

        if let Some(ref app) = self.emitter {
            let _ = app.emit("progress", crate::ProgressEvent {
                current,
                total: self.total,
                message: message.to_string(),
            });
        }
    } 

    /* ========================================================================================== */
    pub fn finish(&self, completion_message: &str) {
        println!("✅ {}", completion_message);

        // Emit final progress
        self.emit_progress(self.total, completion_message);
    }

    /* ========================================================================================== */
    pub fn get_current(&self) -> usize {
        *self.current.lock().unwrap()
    }

    /* ========================================================================================== */
    pub fn get_total(&self) -> usize {
        self.total
    }

    /* ========================================================================================== */
    // For parallel processing - returns a thread-safe counter
    pub fn create_counter(&self) -> Arc<Mutex<usize>> {
        self.current.clone()
    }
}