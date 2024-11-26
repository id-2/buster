use anyhow::Result;
use dirs::home_dir;
use inquire::{Select, Text, Password};
use serde::{Deserialize, Serialize};
use serde_yaml::Value;
use std::collections::HashMap;
use tokio::fs;

#[derive(Debug, Serialize, Deserialize)]
pub struct DbtProfiles {
    #[serde(flatten)]
    pub profiles: HashMap<String, Profile>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Profile {
    pub target: String,
    pub outputs: HashMap<String, Output>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Output {
    #[serde(rename = "type")]
    pub db_type: DbType,
    pub schema: String,
    pub threads: u32,
    // TODO: Make this a struct for each of the different db types
    #[serde(flatten)]
    pub connection_config: Value,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum DbType {
    Bigquery,
    Postgres,
    Redshift,
    Snowflake,
    #[serde(other)]
    Other,
}

pub async fn get_dbt_profiles_yml() -> Result<DbtProfiles> {
    let mut path = home_dir().unwrap_or_default();
    path.push(".dbt");
    path.push("profiles.yml");

    if !fs::try_exists(&path).await? {
        return Err(anyhow::anyhow!("File not found: {}", path.display()));
    }

    let contents = fs::read_to_string(path).await?;
    Ok(serde_yaml::from_str(&contents)?)
}

pub async fn create_dbt_profiles_yml(profiles: Option<Vec<(String, Profile)>>) -> Result<()> {
    let mut path = home_dir().unwrap_or_default();
    path.push(".dbt");
    fs::create_dir_all(&path).await?;
    path.push("profiles.yml");

    let profiles = DbtProfiles {
        profiles: profiles.unwrap_or_default().into_iter().collect(),
    };

    fs::write(path, serde_yaml::to_string(&profiles)?).await?;
    Ok(())
}

pub async fn upsert_dbt_profiles(new_profiles: Vec<(String, Profile)>) -> Result<()> {
    let mut profiles = get_dbt_profiles_yml().await.unwrap_or(DbtProfiles {
        profiles: HashMap::new(),
    });

    for (key, profile) in new_profiles {
        profiles.profiles.insert(key, profile);
    }

    fs::write(
        home_dir().unwrap_or_default().join(".dbt/profiles.yml"),
        serde_yaml::to_string(&profiles)?,
    )
    .await?;
    Ok(())
}

pub async fn delete_dbt_profiles(profile_keys: Vec<String>) -> Result<()> {
    let mut profiles = get_dbt_profiles_yml().await?;
    for key in profile_keys {
        profiles.profiles.remove(&key);
    }
    fs::write(
        home_dir().unwrap_or_default().join(".dbt/profiles.yml"),
        serde_yaml::to_string(&profiles)?,
    )
    .await?;
    Ok(())
}

pub async fn get_dbt_profile_names() -> Result<Vec<String>> {
    let profiles = get_dbt_profiles_yml().await?;
    Ok(profiles.profiles.keys().cloned().collect())
}

pub async fn create_new_profile() -> Result<()> {
    let profile_name = match Text::new("Enter the name of the profile").prompt() {
        Ok(name) => name,
        Err(e) => anyhow::bail!("Failed to get user input: {}", e),
    };

    let profile_type = match Select::new(
        "Select the type of profile",
        vec!["Bigquery", "Postgres", "Redshift", "Snowflake"],
    )
    .prompt()
    {
        Ok(name) => name,
        Err(e) => anyhow::bail!("Failed to get user input: {}", e),
    };

    let profile = match profile_type {
        "Postgres" => create_new_postgres_profile().await?,
        _ => anyhow::bail!("Profile type not yet implemented"),
    };

    upsert_dbt_profiles(vec![(profile_name, profile)]).await?;
    Ok(())
}

async fn create_new_postgres_profile() -> Result<Profile> {
    let host = Text::new("Enter host").prompt()?;
    let user = Text::new("Enter username").prompt()?;
    let password = Password::new("Enter password").prompt()?;
    let port = Text::new("Enter port (default: 5432)")
        .with_default("5432")
        .prompt()?
        .parse::<u32>()?;
    let dbname = Text::new("Enter database name").prompt()?;
    let schema = Text::new("Enter schema").prompt()?;
    let threads = Text::new("Enter number of threads (default: 1)")
        .with_default("1")
        .prompt()?
        .parse::<u32>()?;

    let connection_config = serde_json::json!({
        "host": host,
        "user": user,
        "password": password,
        "port": port,
        "dbname": dbname,
    });

    Ok(Profile {
        target: "dev".to_string(),
        outputs: [(
            "dev".to_string(),
            Output {
                db_type: DbType::Postgres,
                schema,
                threads,
                connection_config: serde_yaml::to_value(connection_config)?,
            },
        )]
        .into_iter()
        .collect(),
    })
}
