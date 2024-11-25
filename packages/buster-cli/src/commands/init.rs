use anyhow::Result;

use crate::utils::credentials::get_and_validate_buster_credentials;

use super::auth;

/// Check to make sure that the appropriate credentials are in.
/// Check to see if an existing dbt project exists.
///   - If it does, ask if they want to use it for Buster
///     - If yes:
///        - 
///     - If no, as if no dbt exists
///   - If not, create a new example project

pub async fn init() -> Result<()> {
    // Get buster credentials
    let buster_creds = match get_and_validate_buster_credentials().await {
        Ok(buster_creds) => Some(buster_creds),
        Err(_) => {
            println!("No Buster credentials found. Beginning authentication flow...");
            None
        }
    };

    // If no buster credentials, go through auth flow.
    let buster_creds = if let None = buster_creds {
        match auth().await {
            Ok(_) => match get_and_validate_buster_credentials().await {
                Ok(buster_creds) => Some(buster_creds),
                Err(e) => anyhow::bail!("Failed to authenticate: {}", e),
            },
            Err(e) => anyhow::bail!("Failed to authenticate: {}", e),
        };
    };

    // check if existing dbt project
    let dbt_project_exists = match tokio::fs::try_exists("dbt_project.yml").await {
        Ok(true) => true,
        Ok(false) => false,
        Err(e) => anyhow::bail!("Failed to check for dbt project: {}", e),
    };

    // If dbt project, ask if they want to piggyback off the existing project.
    let use_exising_dbt = if dbt_project_exists {
        let use_exising_dbt_input = match Select::new("A dbt project was found. Do you want to use it for Buster?")
        .with_default("No")
        .with_options(&["Yes", "No"])
        .prompt() {
            Ok("Yes") => true,
            Ok("No") => false,
            Err(e) => anyhow::bail!("Failed to get user input: {}", e),
        };
    } else {
        false
    };

    // If no dbt project, create new example project
    if !use_exising_dbt {
        create_dbt_project_yml(name, profile_name, default_materialization).await?;
    }

    Ok(())
}
