use anyhow::Result;

use serde::{Deserialize, Serialize};
use tokio::fs;

use crate::utils::{
    BusterClient, DeployDatasetsColumnsRequest, DeployDatasetsEntityRelationshipsRequest,
    DeployDatasetsRequest,
};

use super::{
    buster_credentials::BusterCredentials,
    profiles::{get_project_profile, Profile},
};

#[derive(Debug, Serialize, Deserialize)]
pub struct BusterModelObject {
    pub sql_definition: String,
    pub model_file: BusterModel,
    pub yml_content: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct BusterModel {
    pub version: i32,
    pub models: Vec<Model>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Model {
    pub name: String,
    pub description: String,
    pub model: Option<String>,
    pub entities: Vec<Entity>,
    pub dimensions: Vec<Dimension>,
    pub measures: Vec<Measure>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Entity {
    pub name: String,
    pub expr: String,
    #[serde(rename = "type")]
    pub entity_type: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Dimension {
    pub name: String,
    pub expr: String,
    #[serde(rename = "type")]
    pub dimension_type: String,
    pub description: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Measure {
    pub name: String,
    pub expr: String,
    pub agg: String,
    pub description: String,
}

pub async fn get_model_files() -> Result<Vec<BusterModelObject>> {
    let mut model_objects = Vec::new();
    process_directory(std::path::Path::new("models"), &mut model_objects).await?;
    Ok(model_objects)
}

async fn process_directory(
    dir_path: &std::path::Path,
    model_objects: &mut Vec<BusterModelObject>,
) -> Result<()> {
    let mut dir = tokio::fs::read_dir(dir_path).await?;

    while let Some(entry) = dir.next_entry().await? {
        let path = entry.path();

        if path.is_dir() {
            Box::pin(process_directory(&path, model_objects)).await?;
            continue;
        }

        if let Some(ext) = path.extension() {
            if ext == "yml" {
                let sql_path = path.with_extension("sql");
                if sql_path.exists() {
                    let sql_definition = tokio::fs::read_to_string(&sql_path).await?;
                    let yaml_content = fs::read_to_string(&path).await?;
                    let model: BusterModel = serde_yaml::from_str(&yaml_content)?;

                    model_objects.push(BusterModelObject {
                        sql_definition,
                        model_file: model,
                        yml_content: yaml_content,
                    });
                }
            }
        }
    }
    Ok(())
}

pub async fn upload_model_files(
    model_objects: Vec<BusterModelObject>,
    buster_creds: BusterCredentials,
) -> Result<()> {
    println!("Uploading model files to Buster");

    // First, get the project profile so we can know where the models were written
    let (profile_name, profile) = get_project_profile().await?;

    // Need to get the schema. TODO: Allow for target-specific commands
    let schema = get_schema_name(&profile)?;

    let mut post_datasets_req_body = Vec::new();

    // Iterate through each model object and the semantic models within. These are the datasets we want to create.
    for model in model_objects {
        for semantic_model in model.model_file.models {
            let mut columns = Vec::new();

            for column in semantic_model.dimensions {
                columns.push(DeployDatasetsColumnsRequest {
                    name: column.name,
                    description: column.description,
                    semantic_type: Some(String::from("dimension")),
                    expr: Some(column.expr),
                    type_: None,
                    agg: None,
                });
            }

            for column in semantic_model.measures {
                columns.push(DeployDatasetsColumnsRequest {
                    name: column.name,
                    description: column.description,
                    semantic_type: Some(String::from("measure")),
                    expr: Some(column.expr),
                    type_: None,
                    agg: Some(column.agg),
                });
            }

            let mut entity_relationships = Vec::new();

            for entity in semantic_model.entities {
                entity_relationships.push(DeployDatasetsEntityRelationshipsRequest {
                    name: entity.name,
                    expr: entity.expr,
                    type_: entity.entity_type,
                });
            }

            let dataset = DeployDatasetsRequest {
                data_source_name: profile_name.clone(),
                env: profile.target.clone(),
                name: semantic_model.name,
                model: semantic_model.model,
                schema: schema.clone(),
                description: semantic_model.description,
                sql_definition: Some(model.sql_definition.clone()),
                entity_relationships: Some(entity_relationships),
                columns,
                yml_file: Some(model.yml_content.clone()),
                id: None,
                type_: String::from("view"),
            };

            post_datasets_req_body.push(dataset);
        }
    }

    let buster = BusterClient::new(buster_creds.url, buster_creds.api_key)?;

    if let Err(e) = buster.deploy_datasets(post_datasets_req_body).await {
        return Err(anyhow::anyhow!(
            "Failed to upload model files to Buster: {}",
            e
        ));
    };

    Ok(())
}

fn get_schema_name(profile: &Profile) -> Result<String> {
    let credentials = profile
        .outputs
        .get(&profile.target)
        .ok_or(anyhow::anyhow!("Target not found: {}", profile.target))?;

    Ok(credentials.credential.get_schema())
}
