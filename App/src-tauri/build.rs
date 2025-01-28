use std::fs;
use std::path::Path;
use toml::Value;

fn is_valid_log_level(level: &str) -> bool {
    matches!(
        level.to_lowercase().as_str(),
        "trace" | "debug" | "info" | "warn" | "error"
    )
}

fn check_loglevel_config() -> Result<(), Box<dyn std::error::Error>> {
    let cargo_toml_path = Path::new(env!("CARGO_MANIFEST_DIR")).join("Cargo.toml");
    let contents = fs::read_to_string(cargo_toml_path)?;
    let toml: Value = contents.parse()?;

    if let Some(package) = toml.get("package") {
        if let Some(metadata) = package.get("metadata") {
            if let Some(loglevel) = metadata.get("loglevel") {
                // 检查必需的字段
                let required_fields = ["debug", "release"];
                for field in required_fields {
                    let level = loglevel
                        .get(field)
                        .and_then(|v| v.as_str())
                        .ok_or_else(|| format!("缺少必需的 loglevel 配置: {}", field))?;

                    if !is_valid_log_level(level) {
                        panic!("无效的日志级别 '{}' 在 '{}' 配置中。有效值为: trace, debug, info, warn, error", level, field);
                    }
                }

                // 获取构建模式
                let profile = std::env::var("PROFILE").unwrap_or_else(|_| "debug".to_string());
                let is_debug = profile == "debug";

                // 根据构建模式获取对应的日志级别
                let log_level = if is_debug {
                    loglevel.get("debug").and_then(|v| v.as_str())
                } else {
                    loglevel.get("release").and_then(|v| v.as_str())
                }
                .unwrap();

                // 设置环境变量
                println!("cargo:rustc-env=RUST_LOG_LEVEL={}", log_level);
                println!("cargo:rerun-if-changed=Cargo.toml");
                println!("cargo:rerun-if-env-changed=PROFILE");

                return Ok(());
            }
        }
    }
    panic!("Cargo.toml 中缺少 package.metadata.loglevel 配置");
}

fn main() {
    // 检查 loglevel 配置
    if let Err(e) = check_loglevel_config() {
        panic!("检查 loglevel 配置失败: {}", e);
    }
    tauri_build::build()
}
