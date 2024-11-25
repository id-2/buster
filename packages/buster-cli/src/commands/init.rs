use anyhow::Result;

use crate::utils::credentials::get_and_validate_buster_credentials;

use super::auth;

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
    if let None = buster_creds {
        match auth().await {
            Ok(_) => (),
            Err(e) => anyhow::bail!("Failed to authenticate: {}", e),
        };
    };

    // TODO: Check for dbt .profiles? create one if not exists.

    // check if existing dbt project
    let dbt_project_exists = tokio::fs::try_exists("dbt_project.yml").await?;

    // If dbt project, ask if they want to piggyback off the existing project.

    // If no, create new example project

    // If no dbt project, create new example project

    Ok(())
}
