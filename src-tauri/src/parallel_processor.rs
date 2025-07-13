use rayon::prelude::*;
use  crate::utils::{create_thread_pool, calculate_progress_step_size};
use crate::progress_reporter::ProgressReporter;
use crate::traits::{ThreadCountConfigurable, ProgressConfigurable};

pub struct ParallelProcessor {
    thread_count: Option<usize>,
    show_progress: bool,
    progress_emitter: Option<tauri::AppHandle>,
}

impl ParallelProcessor {
    pub fn new() -> Self {
        Self { 
            thread_count: None,
            show_progress: true,
            progress_emitter: None,
        }
    }

    /* ========================================================================================== */
    pub fn with_progress_emitter(mut self, app: tauri::AppHandle) -> Self {
        self.progress_emitter = Some(app);
        self
    }

    /* ========================================================================================== */
    pub fn process<T, R, F>(
        &self,
        items: Vec<T>,
        processor: F,
        message: &str,
    ) -> Result<Vec<R>, Box<dyn std::error::Error>> 
    where
        T: Send + Sync,
        R: Send,
        F: Fn(&T) -> Result<R, Box<dyn std::error::Error + Send + Sync>> + Send + Sync,
    {
        let pool = create_thread_pool(self.thread_count)?;
        let total = items.len();

        let mut progress = ProgressReporter::new(total, message.to_string())
            .with_step_size(calculate_progress_step_size(total, 20));
        
        if let Some(ref app) = self.progress_emitter {
            progress = progress.with_emitter(app.clone());
        }

        progress.emit_progress(0, &format!("{} {} items...", message, total));

        let results: Result<Vec<_>, Box<dyn std::error::Error + Send + Sync>> = if self.show_progress {
            let progress_counter = progress.create_counter();

            pool.install(|| {
                items
                    .par_iter()
                    .map(|item| {
                        let current = {
                            let mut counter = progress_counter.lock().unwrap();
                            *counter += 1;
                            *counter
                        };

                        if current % 10 == 0 || current == total {
                            progress.emit_progress(current, &format!("Processing item {} of {}...", current, total));
                        }

                        processor(item)
                    })
                    .collect()
            })
        } else {
            pool.install(|| {
                items
                    .par_iter()
                    .map(|item| processor(item))
                    .collect()
            })
        };

        // progress.finish("Processing complete!");

        results.map_err(|e| -> Box<dyn std::error::Error> {
            Box::new(std::io::Error::new(std::io::ErrorKind::Other, e.to_string()))
        })
    }

    /* ========================================================================================== */
    pub fn process_flat_map<T, R, F>(
         &self,
        items: Vec<T>,
        mapper: F,
        message: &str,
    ) -> Result<Vec<R>, Box<dyn std::error::Error>>
    where
        T: Send + Sync,
        R: Send,
        F: Fn(&T) -> Vec<R> + Send + Sync,
    {
        let pool = create_thread_pool(self.thread_count)?;
        let total = items.len();

        let mut progress = ProgressReporter::new(total, message.to_string())
            .with_step_size(calculate_progress_step_size(total, 20));
        
        if let Some(ref app) = self.progress_emitter {
            progress = progress.with_emitter(app.clone());
        }

        progress.emit_progress(0, &format!("{} {} items...", message, total));

        let results: Vec<R> = if self.show_progress {
            let progress_counter = progress.create_counter();

            pool.install(|| {
                items
                    .par_iter()
                    .flat_map(|item| {
                        let current = {
                            let mut counter = progress_counter.lock().unwrap();
                            *counter += 1;
                            *counter
                        };

                        if current % 10 == 0 || current == total {
                            progress.emit_progress(current, &format!("Processing item {} of {}...", current, total));
                        }
                        mapper(item)
                    })
                    .collect()
            })
        } else {
            pool.install(|| {
                items
                    .par_iter()
                    .flat_map(|item| mapper(item))
                    .collect()
            })
        };

        // progress.finish("Processing complete!");
        Ok(results)
    }
}

impl ThreadCountConfigurable for ParallelProcessor {
    fn with_thread_count(mut self, count: usize) -> Self {
        self.thread_count = Some(count);
        self
    }
}

impl ProgressConfigurable for ParallelProcessor {
    fn with_progress(mut self, show_progress: bool) -> Self {
        self.show_progress = show_progress;
        self
    }
}