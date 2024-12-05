use anyhow::Result;
use buster_cli::utils::file::profiles::{create_dbt_project_yml};
use tempfile::tempdir;
use std::fs::read_to_string;

#[tokio::test]
async fn test_create_dbt_project_yml() -> Result<()> {
    // Create a temporary directory for the test
    let dir = tempdir()?;
    std::env::set_current_dir(dir.path())?;

    // Create the project file
    create_dbt_project_yml("test_project", "test_profile", "view").await?;

    // Read the created file
    let contents = read_to_string("dbt_project.yml")?;
    let yaml: serde_yaml::Value = serde_yaml::from_str(&contents)?;

    // Assert expected values
    assert_eq!(yaml["name"], "test_project");
    assert_eq!(yaml["version"], "1.0.0");
    assert_eq!(yaml["profile"], "test_profile");
    assert_eq!(yaml["model-paths"][0], "models");
    assert_eq!(yaml["models"]["test_project"]["example"]["+materialized"], "view");

    Ok(())
}
