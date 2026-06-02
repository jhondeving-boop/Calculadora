pub mod math;
pub mod converter;
pub mod programmer;
pub mod history;
pub mod commands;

#[allow(unused_imports)]
pub use history::{HistoryEntry, HistoryStats, Database, HistoryState};

use std::path::PathBuf;

pub struct AppState {
    pub history: HistoryState,
}

impl AppState {
    pub fn new(app_data_dir: PathBuf) -> Self {
        let history = HistoryState::new(app_data_dir)
            .expect("Failed to initialize database");
        
        Self { history }
    }
}