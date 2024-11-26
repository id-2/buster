use anyhow::Result;
use inquire::MultiSelect;
use ratatui::style::Stylize;
use tokio::task::JoinSet;

use crate::utils::{
    buster_credentials::get_and_validate_buster_credentials,
    command::{check_dbt_installation, dbt_command},
    profiles::{get_dbt_profile_credentials, upload_dbt_profiles_to_buster},
    project_files::{create_buster_from_dbt_project_yml, find_dbt_projects},
    text::print_error,
};

use super::auth;

pub async fn init() -> Result<()> {
    if let Err(e) = check_dbt_installation().await {
        print_error("Error: Failed to check dbt installation");
        return Err(anyhow::anyhow!("Failed to check dbt installation: {}", e));
    }

    // Get buster credentials
    let buster_creds = match get_and_validate_buster_credentials().await {
        Ok(buster_creds) => Some(buster_creds),
        Err(_) => {
            print_error("No Buster credentials found. Beginning authentication flow...");
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
                Err(e) => {
                    print_error("Error: Authentication failed during credential validation");
                    return Err(anyhow::anyhow!("Failed to authenticate: {}", e));
                }
            },
            Err(e) => {
                print_error("Error: Authentication process failed");
                return Err(anyhow::anyhow!("Failed to authenticate: {}", e));
            }
        }
    };

    // Check if dbt projects exist.
    let mut dbt_projects = match find_dbt_projects().await {
        Ok(projects) => projects,
        Err(e) => {
            print_error("Error: Failed to find dbt projects");
            return Err(anyhow::anyhow!("Failed to find dbt projects: {}", e));
        }
    };

    if !dbt_projects.is_empty() {
        // If dbt projects exist, ask user which ones to use for Buster.
        print_error("Found already existing dbt projects...");
        let selected_dbt_projects = match MultiSelect::new(
            "Please select the dbt projects you want to use for Buster (leave empty for all):",
            dbt_projects.clone(),
        )
        .with_vim_mode(true)
        .prompt()
        {
            Ok(projects) => projects,
            Err(e) => {
                print_error("Error: Failed to get user selection");
                return Err(anyhow::anyhow!("Failed to get user selection: {}", e));
            }
        };

        let mut dbt_project_set = JoinSet::new();

        for project in selected_dbt_projects {
            dbt_project_set.spawn(async move {
                create_buster_from_dbt_project_yml(&format!("{}/dbt_project.yml", project)).await
            });
        }

        while let Some(result) = dbt_project_set.join_next().await {
            if let Err(e) = result {
                print_error("Error: Failed to process dbt project");
                return Err(anyhow::anyhow!("Failed to process dbt project: {}", e));
            }
        }
    } else {
        // If no dbt projects exist, create a new one.
        print_error("No dbt projects found. Creating a new dbt project...");
        if let Err(e) = dbt_command("init").await {
            print_error("Error: Failed to initialize dbt project");
            return Err(anyhow::anyhow!("Failed to initialize dbt project: {}", e));
        }

        dbt_projects = match find_dbt_projects().await {
            Ok(projects) => projects,
            Err(e) => {
                print_error("Error: Failed to find newly created dbt project");
                return Err(anyhow::anyhow!(
                    "Failed to find newly created dbt project: {}",
                    e
                ));
            }
        };

        if let Err(e) =
            create_buster_from_dbt_project_yml(&format!("{}/dbt_project.yml", dbt_projects[0]))
                .await
        {
            print_error("Error: Failed to create Buster project from dbt project");
            return Err(anyhow::anyhow!("Failed to create Buster project: {}", e));
        }
    }

    println!(
        "Uploading {} dbt profile(s) to Buster...",
        dbt_projects.len()
    );

    // Get dbt profile credentials to upload to Buster
    let dbt_profile_credentials = match get_dbt_profile_credentials(&dbt_projects).await {
        Ok(creds) => creds,
        Err(e) => {
            print_error("Error: Failed to get dbt profile credentials");
            return Err(anyhow::anyhow!(
                "Failed to get dbt profile credentials: {}",
                e
            ));
        }
    };

    // Upload the profiles to Buster
    if let Err(e) = upload_dbt_profiles_to_buster(dbt_profile_credentials, buster_creds).await {
        print_error("Error: Failed to upload profiles to Buster");
        return Err(anyhow::anyhow!(
            "Failed to upload profiles to Buster: {}",
            e
        ));
    }

    Ok(())
}
