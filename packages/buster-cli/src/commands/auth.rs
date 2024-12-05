use anyhow::Result;
use inquire::{Password, Text};

use crate::utils::{
    buster_credentials::{get_buster_credentials, set_buster_credentials, BusterCredentials},
    BusterClient,
};

pub async fn auth() -> Result<()> {
    // Get the API key from the credentials file.
    // If the file doesn't exist, set it to the default.
    let mut buster_creds = match get_buster_credentials().await {
        Ok(buster_creds) => buster_creds,
        Err(_) => match set_buster_credentials(BusterCredentials::default()).await {
            Ok(_) => get_buster_credentials().await?,
            Err(e) => anyhow::bail!("Failed to set credentials: {}", e),
        },
    };

    let url_input = Text::new("Enter the URL of your Buster API")
        .with_default(&buster_creds.url)
        .prompt()?;

    // If no URL at all, error
    if url_input.is_empty() {
        anyhow::bail!("URL is required");
    }
    buster_creds.url = url_input;

    // Obfuscate the API key for display
    let obfuscated_api_key = if buster_creds.api_key.is_empty() {
        String::from("None")
    } else {
        format!("{}****", &buster_creds.api_key[..4])
    };

    let api_key_input = Password::new(&format!("Enter your API key [{obfuscated_api_key}]:"))
        .without_confirmation()
        .prompt()?;

    if !api_key_input.is_empty() {
        buster_creds.api_key = api_key_input;
    } else if buster_creds.api_key.is_empty() {
        anyhow::bail!("API key is required");
    }

    // Validate the API key.
    let buster_client = BusterClient::new(buster_creds.url.clone(), buster_creds.api_key.clone())?;

    if !buster_client.validate_api_key().await? {
        anyhow::bail!("Invalid API key");
    }

    // Save the credentials.
    set_buster_credentials(buster_creds).await?;

    println!("Authentication successful!");

    Ok(())
}
