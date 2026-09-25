#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            #[cfg(desktop)]
            app.handle().plugin(tauri_plugin_updater::Builder::new().build())?;
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_platform,
            check_update,
            install_update,
            open_releases
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tauri::command]
fn get_platform() -> String {
    std::env::consts::OS.to_string()
}

#[tauri::command]
async fn check_update(app: tauri::AppHandle) -> Result<Option<serde_json::Value>, String> {
    #[cfg(desktop)]
    {
        use tauri_plugin_updater::UpdaterExt;
        if let Some(u) = app
            .updater()
            .map_err(|e| e.to_string())?
            .check()
            .await
            .map_err(|e| e.to_string())?
        {
            return Ok(Some(serde_json::json!({
                "version": u.version,
                "body": u.body,
                "date": u.date.map(|d| d.to_string())
            })));
        }
        Ok(None)
    }
    #[cfg(not(desktop))]
    {
        let _ = app;
        Ok(None)
    }
}

#[tauri::command]
async fn install_update(app: tauri::AppHandle) -> Result<bool, String> {
    #[cfg(desktop)]
    {
        use tauri_plugin_updater::UpdaterExt;
        let u = app
            .updater()
            .map_err(|e| e.to_string())?
            .check()
            .await
            .map_err(|e| e.to_string())?
            .ok_or("no update available".to_string())?;
        u.download_and_install(|_len, _total| {}, || {})
            .await
            .map_err(|e| e.to_string())?;
        // reinicia a app (nunca retorna)
        app.restart()
    }
    #[cfg(not(desktop))]
    {
        let _ = app;
        Ok(false)
    }
}

#[tauri::command]
fn open_releases() -> Result<(), String> {
    tauri_plugin_opener::open_url(
        "https://github.com/sharillas/Smart-Led-Calc/releases",
        None::<&str>,
    )
    .map_err(|e| e.to_string())
}
