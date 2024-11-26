use anyhow::Result;
use inquire::{MultiSelect, Select};
use tokio::task::JoinSet;

use crate::utils::{
    command::{check_dbt_installation, dbt_command},
    credentials::get_and_validate_buster_credentials,
    project_files::{create_buster_from_dbt_project_yml, find_dbt_projects},
};

use super::auth;

/// Check to make sure that the appropriate credentials are in.
/// Check to see if an existing dbt project exists.
///   - If it does, ask if they want to use it for Buster
///     - If yes:
///        -
///     - If no, as if no dbt exists
///   - If not, create a new example project

pub async fn init() -> Result<()> {
    check_dbt_installation().await?;

    // Get buster credentials
    let buster_creds = match get_and_validate_buster_credentials().await {
        Ok(buster_creds) => Some(buster_creds),
        Err(_) => {
            println!("No Buster credentials found. Beginning authentication flow...");
            None
        }
    };

    // If no buster credentials, go through auth flow.
    let buster_creds = if let Some(buster_creds) = buster_creds {
        buster_creds
    } else {
        match auth().await {
            Ok(_) => match get_and_validate_buster_credentials().await {
                Ok(buster_creds) => buster_creds,
                Err(e) => anyhow::bail!("Failed to authenticate: {}", e),
            },
            Err(e) => anyhow::bail!("Failed to authenticate: {}", e),
        }
    };

    // Check if dbt projects exist.
    let dbt_projects = find_dbt_projects().await?;

    if !dbt_projects.is_empty() {
        // If dbt projects exist, ask user which ones to use for Buster.
        println!("Found already existing dbt projects...");
        let selected_dbt_projects = MultiSelect::new(
            "Please select the dbt projects you want to use for Buster (leave empty for all):",
            dbt_projects,
        )
        .with_vim_mode(true)
        .prompt()?;

        let mut dbt_project_set = JoinSet::new();

        for project in selected_dbt_projects {
            dbt_project_set
                .spawn(async move { create_buster_from_dbt_project_yml(&project).await });
        }

        while let Some(result) = dbt_project_set.join_next().await {
            result??;
        }
    } else {
        // If no dbt projects exist, create a new one.
        println!("No dbt projects found. Creating a new dbt project...");
        dbt_command("init").await?;

        let dbt_projects = find_dbt_projects().await?;

        create_buster_from_dbt_project_yml(&dbt_projects[0]).await?;
    }

    Ok(())
}
