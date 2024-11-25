use anyhow::Result;
use dirs::home_dir;
use serde_yaml::Value;
use tokio::fs;
use serde::Serialize;

#[derive(Serialize)]
struct DbtProjectConfig<'a> {
    name: &'a str,
    version: &'a str,
    profile: &'a str,
    #[serde(rename = "model-paths")]
    model_paths: Vec<&'a str>,
    #[serde(rename = "analysis-paths")]
    analysis_paths: Vec<&'a str>,
    #[serde(rename = "test-paths")]
    test_paths: Vec<&'a str>,
    #[serde(rename = "seed-paths")]
    seed_paths: Vec<&'a str>,
    #[serde(rename = "macro-paths")]
    macro_paths: Vec<&'a str>,
    #[serde(rename = "snapshot-paths")]
    snapshot_paths: Vec<&'a str>,
    #[serde(rename = "clean-targets")]
    clean_targets: Vec<&'a str>,
    models: Models<'a>,
}

#[derive(Serialize)]
struct Models<'a> {
    #[serde(flatten)]
    project: std::collections::HashMap<&'a str, ProjectConfig<'a>>,
}

#[derive(Serialize)]
struct ProjectConfig<'a> {
    example: Example<'a>,
}

#[derive(Serialize)]
struct Example<'a> {
    #[serde(rename = "+materialized")]
    materialized: &'a str,
}


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

pub async fn create_dbt_profiles_yml() -> Result<()> {
    Ok(())
}

pub async fn create_dbt_project_yml(name: &str, profile_name: &str, default_materialization: &str) -> Result<()> {
    let config = DbtProjectConfig {
        name,
        version: "1.0.0",
        profile: profile_name,
        model_paths: vec!["models"],
        analysis_paths: vec!["analyses"],
        test_paths: vec!["tests"],
        seed_paths: vec!["seeds"],
        macro_paths: vec!["macros"],
        snapshot_paths: vec!["snapshots"],
        clean_targets: vec!["target", "dbt_packages"],
        models: Models {
            project: [(name, ProjectConfig {
                example: Example {
                    materialized: default_materialization,
                },
            })].into_iter().collect(),
        },
    };

    let yaml = serde_yaml::to_string(&config)?;
    fs::write("dbt_project.yml", yaml).await?;
    Ok(())
}

pub async fn create_buster_profiles_yml() -> Result<()> {
    Ok(())
}
