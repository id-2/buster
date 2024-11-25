use anyhow::Result;
use dirs::home_dir;
use serde_yaml::Value;
use tokio::fs;

pub async fn get_buster_profiles_yml() -> Result<Value> {
    let mut path = home_dir().unwrap_or_default();
    path.push(".buster");
    path.push("profiles.yml");

    if !fs::try_exists(&path).await? {
        return Err(anyhow::anyhow!("File not found: {}", path.display()));
    }

    let contents = fs::read_to_string(path).await?;
    Ok(serde_yaml::from_str(&contents)?)
}

pub async fn get_dbt_profiles_yml() -> Result<Value> {
    let mut path = home_dir().unwrap_or_default();
    path.push(".dbt");
    path.push("profiles.yml");

    if !fs::try_exists(&path).await? {
        return Err(anyhow::anyhow!("File not found: {}", path.display()));
    }

    let contents = fs::read_to_string(path).await?;
    Ok(serde_yaml::from_str(&contents)?)
}

