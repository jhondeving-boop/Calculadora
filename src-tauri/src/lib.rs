mod calculator;

use calculator::{commands, AppState};
use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let log_level = if cfg!(debug_assertions) { "info" } else { "warn" };
    env_logger::Builder::from_env(env_logger::Env::default().default_filter_or(log_level)).init();
    log::info!("RapidCalc starting...");

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .setup(|app| {
            let app_data_dir = app.path().app_data_dir()
                .expect("Failed to get app data directory");
            
            log::info!("App data directory: {:?}", app_data_dir);
            
            app.manage(AppState::new(app_data_dir));
            
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::evaluate,
            commands::convert_unit,
            commands::convert_base,
            commands::get_conversion_categories,
            commands::add_history,
            commands::get_history,
            commands::clear_history,
            commands::delete_history_entry,
            commands::get_history_stats,
            commands::health_check,
            commands::toggle_always_on_top,
            commands::is_always_on_top,
            commands::force_always_on_top,
            commands::set_floating_mode,
            commands::resize_window,
            commands::get_window_size,
            commands::close_window,
            commands::show_window,
            commands::hide_window,
            commands::register_global_shortcut,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}