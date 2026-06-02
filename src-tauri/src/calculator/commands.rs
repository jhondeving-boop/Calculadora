use crate::calculator::{
    converter::{ConversionCategory, ConversionResult, UnitConverter},
    history::{HistoryEntry, Database, HistoryStats},
    programmer::{Base, BaseConversion, ProgrammerConverter},
    math::MathEvaluator,
    AppState,
};
use serde::{Deserialize, Serialize};
use tauri::{State, Window, Manager, Emitter};
use tauri_plugin_global_shortcut::{Code, GlobalShortcutExt, Modifiers, Shortcut};

#[derive(Debug, Serialize, Deserialize)]
pub struct EvaluateRequest {
    pub expression: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct EvaluateResponse {
    pub result: String,
    pub formatted: String,
    pub is_error: bool,
    pub error_message: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct WindowSizeResponse {
    pub width: f64,
    pub height: f64,
}

#[tauri::command]
pub fn evaluate(request: EvaluateRequest) -> EvaluateResponse {
    log::info!("Evaluating expression: {}", request.expression);
    
    let evaluator = MathEvaluator::new();
    
    match evaluator.evaluate(&request.expression) {
        Ok(value) => {
            let formatted = MathEvaluator::format_result(value);
            log::info!("Result: {} -> {}", value, formatted);
            
            EvaluateResponse {
                result: value.to_string(),
                formatted,
                is_error: false,
                error_message: None,
            }
        }
        Err(e) => {
            log::warn!("Evaluation error: {}", e);
            
            EvaluateResponse {
                result: "0".to_string(),
                formatted: "Error".to_string(),
                is_error: true,
                error_message: Some(e.to_string()),
            }
        }
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ConvertUnitRequest {
    pub value: f64,
    pub category: String,
    pub from_unit: String,
    pub to_unit: String,
}

#[tauri::command]
pub fn convert_unit(request: ConvertUnitRequest) -> Result<ConversionResult, String> {
    log::info!(
        "Converting {} from {} to {} in {}",
        request.value, request.from_unit, request.to_unit, request.category
    );
    
    UnitConverter::convert(
        request.value,
        &request.category,
        &request.from_unit,
        &request.to_unit,
    )
    .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_conversion_categories() -> Vec<ConversionCategory> {
    log::debug!("Getting conversion categories");
    UnitConverter::get_categories()
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ConvertBaseRequest {
    pub value: String,
    pub from_base: String,
}

#[tauri::command]
pub fn convert_base(request: ConvertBaseRequest) -> Result<BaseConversion, String> {
    log::info!("Converting base: {} from {}", request.value, request.from_base);
    
    let base = Base::from_str(&request.from_base)
        .map_err(|e| e.to_string())?;
    
    ProgrammerConverter::convert_all(&request.value, base)
        .map_err(|e| e.to_string())
}

#[derive(Debug, Serialize, Deserialize)]
pub struct HistoryAddRequest {
    pub expression: String,
    pub result: String,
}

#[tauri::command]
pub fn add_history(
    state: State<'_, AppState>,
    request: HistoryAddRequest,
) -> Result<HistoryEntry, String> {
    log::info!("Adding history entry: {} = {}", request.expression, request.result);
    
    let conn = state.history.conn.lock().map_err(|e| e.to_string())?;
    
    Database::add_entry(&conn, &request.expression, &request.result)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_history(
    state: State<'_, AppState>,
    filter: Option<String>,
    limit: Option<i64>,
) -> Result<Vec<HistoryEntry>, String> {
    log::debug!("Getting history, filter: {:?}", filter);
    
    let conn = state.history.conn.lock().map_err(|e| e.to_string())?;
    
    match filter {
        Some(f) if !f.is_empty() => Database::search(&conn, &f).map_err(|e| e.to_string()),
        _ => Database::get_all(&conn, limit).map_err(|e| e.to_string()),
    }
}

#[tauri::command]
pub fn clear_history(state: State<'_, AppState>) -> Result<(), String> {
    log::info!("Clearing history");
    
    let conn = state.history.conn.lock().map_err(|e| e.to_string())?;
    
    Database::clear(&conn).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn delete_history_entry(
    state: State<'_, AppState>,
    id: i64,
) -> Result<(), String> {
    log::info!("Deleting history entry: {}", id);
    
    let conn = state.history.conn.lock().map_err(|e| e.to_string())?;
    
    Database::delete_entry(&conn, id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_history_stats(state: State<'_, AppState>) -> Result<HistoryStats, String> {
    log::debug!("Getting history statistics");
    
    let conn = state.history.conn.lock().map_err(|e| e.to_string())?;
    
    Database::get_statistics(&conn).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn health_check() -> String {
    "RapidCalc backend is healthy".to_string()
}

#[tauri::command]
pub fn toggle_always_on_top(window: Window) -> Result<bool, String> {
    let current = window.is_always_on_top().map_err(|e| e.to_string())?;
    let new_state = !current;
    window.set_always_on_top(new_state).map_err(|e| {
        log::error!("Failed to set always on top: {}", e);
        e.to_string()
    })?;
    log::info!("Always on top set to: {}", new_state);
    Ok(new_state)
}

#[tauri::command]
pub fn is_always_on_top(window: Window) -> Result<bool, String> {
    window.is_always_on_top().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn force_always_on_top(window: Window) -> Result<(), String> {
    window.set_always_on_top(true).map_err(|e| {
        log::error!("Failed to force always on top: {}", e);
        e.to_string()
    })?;
    log::info!("Forced always on top");
    Ok(())
}

#[tauri::command]
pub fn set_floating_mode(window: Window, enabled: bool) -> Result<String, String> {
    // Set always on top (Tauri's cross-platform way)
    if let Err(e) = window.set_always_on_top(enabled) {
        log::warn!("Tauri set_always_on_top failed: {}", e);
    }
    
    #[cfg(target_os = "linux")]
    {
        use std::process::Command;
        
        if std::env::var("HYPRLAND_INSTANCE_SIGNATURE").is_ok() {
            // Buscamos la ventana por título/clase y obtenemos su dirección
            let get_addr = "hyprctl clients -j | jq -r '.[] | select(.class == \"rapidcalc\" or .class == \"calculator-tauri-svelte\" or .title == \"RapidCalc\") | .address'";
            let output = Command::new("sh").args(["-c", get_addr]).output();
            
            if let Ok(o) = output {
                let address = String::from_utf8_lossy(&o.stdout).trim().to_string();
                if !address.is_empty() {
                    log::info!("Hyprland window found at address: {}", address);
                    
                    if enabled {
                        // CUANDO ESTÁ FLOTANTE: Debe ser GLOBAL (visible en todos los workspaces)
                        // 1. Forzar flotación
                        let _ = Command::new("hyprctl").args(["dispatch", "setfloating", &format!("address:{}", address)]).status();
                        
                        // 2. PIN - Hacer visible en todos los workspaces (global)
                        let _ = Command::new("hyprctl").args(["dispatch", "pin", &format!("address:{}", address)]).status();
                        
                        // 3. Always on top
                        let _ = Command::new("hyprctl").args(["setprop", &format!("address:{}", address), "alwaysontop", "1"]).status();
                        
                        log::info!("Floating mode enabled: window is now global (pinned in all workspaces)");
                    } else {
                        // CUANDO ESTÁ NORMAL: Desactivar flotación, pin y always on top
                        // 1. Desactivar flotación (toggle back)
                        let _ = Command::new("hyprctl").args(["dispatch", "setfloating", &format!("address:{}", address)]).status();
                        
                        // 2. Quitar PIN para que sea workspace-specific
                        let _ = Command::new("hyprctl").args(["dispatch", "pin", &format!("address:{}", address)]).status();
                        
                        // 3. Quitar always on top
                        let _ = Command::new("hyprctl").args(["setprop", &format!("address:{}", address), "alwaysontop", "0"]).status();
                        
                        log::info!("Floating mode disabled: window is now normal (no longer floating/pinned)");
                    }
                } else {
                    log::warn!("Window address not found, trying class-based fallback");
                }
            }
        }
    }
    
    Ok(format!("Floating mode {}", if enabled { "enabled (global)" } else { "disabled" }))
}

#[tauri::command]
pub fn resize_window(window: Window, width: f64, height: f64) -> Result<(), String> {
    window.set_size(tauri::Size::Logical(tauri::LogicalSize { width, height }))
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_window_size(window: Window) -> Result<WindowSizeResponse, String> {
    let size = window.inner_size().map_err(|e| e.to_string())?;
    Ok(WindowSizeResponse {
        width: size.width as f64,
        height: size.height as f64,
    })
}

#[tauri::command]
pub fn close_window(window: Window) -> Result<(), String> {
    window.close().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn show_window(window: Window) -> Result<(), String> {
    window.show().map_err(|e| e.to_string())?;
    window.set_focus().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn hide_window(window: Window) -> Result<(), String> {
    window.hide().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn register_global_shortcut(app: tauri::AppHandle) -> Result<String, String> {
    let shortcut_show = Shortcut::new(Some(Modifiers::CONTROL | Modifiers::SHIFT), Code::KeyC);
    let shortcut_zen = Shortcut::new(Some(Modifiers::CONTROL | Modifiers::ALT), Code::KeyZ);
    
    let app_handle = app.clone();
    app.global_shortcut().on_shortcut(shortcut_show, move |_app, _shortcut, _event| {
        log::info!("Show shortcut triggered");
        if let Some(win) = _app.get_webview_window("main") {
            let _ = win.set_focus();
            let _ = win.unminimize();
            let _ = win.show();
        }
    }).map_err(|e| e.to_string())?;

    app_handle.global_shortcut().on_shortcut(shortcut_zen, move |_app, _shortcut, _event| {
        log::info!("Zen toggle shortcut triggered");
        let _ = _app.emit("toggle-compact", ());
    }).map_err(|e| e.to_string())?;
    
    Ok("Shortcuts registered".to_string())
}