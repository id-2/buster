use std::collections::HashMap;

use anyhow::Result;
use inquire::{Select, Text};
use serde::{Deserialize, Serialize};
use tokio::fs;

use super::profiles::get_dbt_profile_names;

#[derive(Serialize, Deserialize)]
struct BusterProjectConfig<'a> {
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
    models: HashMap<&'a str, HashMap<&'a str, ModelConfig<'a>>>,
}

#[derive(Serialize, Deserialize)]
struct ModelConfig<'a> {
    #[serde(rename = "+materialized")]
    materialized: &'a str,
}

// Right now, the buster project file is the same as the dbt project file.
#[derive(Serialize, Deserialize)]
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
    models: HashMap<&'a str, HashMap<&'a str, ModelConfig<'a>>>,
}

pub async fn create_dbt_project_yml(
    name: &str,
    profile_name: &str,
    default_materialization: &str,
) -> Result<()> {
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
        models: HashMap::new(),
    };

    let yaml = serde_yaml::to_string(&config)?;
    fs::write("dbt_project.yml", yaml).await?;
    Ok(())
}

pub async fn create_buster_from_dbt_project_yml(dbt_project_yml_path: &str) -> Result<()> {
    let contents = fs::read_to_string(dbt_project_yml_path).await?;
    let dbt_config: DbtProjectConfig = serde_yaml::from_str(&contents)?;

    let buster_config = BusterProjectConfig {
        name: dbt_config.name,
        version: dbt_config.version,
        profile: dbt_config.profile,
        model_paths: dbt_config.model_paths,
        analysis_paths: dbt_config.analysis_paths,
        test_paths: dbt_config.test_paths,
        seed_paths: dbt_config.seed_paths,
        macro_paths: dbt_config.macro_paths,
        snapshot_paths: dbt_config.snapshot_paths,
        clean_targets: dbt_config.clean_targets,
        models: HashMap::new(),
    };

    fs::write("buster_project.yml", serde_yaml::to_string(&buster_config)?).await?;
    Ok(())
}

pub async fn create_buster_project_yml() -> Result<()> {
    let project_name = match Text::new("Enter the name of the project").prompt() {
        Ok(name) => name,
        Err(e) => anyhow::bail!("Failed to get user input: {}", e),
    };

    let mut profile_names = get_dbt_profile_names().await?;
    profile_names.push("Create new profile".to_string());

    let profile_name = if profile_names.is_empty() {
        "default".to_string()
    } else {
        match Select::new("Select a profile", profile_names).prompt() {
            Ok(name) => name,
            Err(e) => anyhow::bail!("Failed to get user input: {}", e),
        }
    };

    let config = BusterProjectConfig {
        name: &project_name,
        version: "1.0.0",
        profile: &profile_name,
        model_paths: vec!["models"],
        analysis_paths: vec!["analyses"],
        test_paths: vec!["tests"],
        seed_paths: vec!["seeds"],
        macro_paths: vec!["macros"],
        snapshot_paths: vec!["snapshots"],
        clean_targets: vec!["target", "dbt_packages"],
        models: HashMap::new(),
    };

    fs::write("buster_project.yml", serde_yaml::to_string(&config)?).await?;
    Ok(())
}

pub async fn find_dbt_projects() -> Result<Vec<String>> {
    let mut dbt_projects = Vec::new();

    let mut entries = tokio::fs::read_dir(".").await?;
    while let Some(entry) = entries.next_entry().await? {
        if entry.file_type().await?.is_dir() {
            let dir_name = entry.file_name();
            let dir_name = dir_name.to_string_lossy().to_string();

            let project_path = format!("{}/dbt_project.yml", dir_name);
            if tokio::fs::try_exists(&project_path).await? {
                dbt_projects.push(dir_name);
            }
        }
    }

    Ok(dbt_projects)
}
