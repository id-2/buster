use anyhow::Result;

use serde::{Deserialize, Serialize};
use tokio::fs;

use crate::utils::{
    BusterClient, PostDatasetsColumnsRequest, PostDatasetsEntityRelationshipsRequest,
    PostDatasetsRequest,
};

use super::{
    buster_credentials::BusterCredentials,
    profiles::{get_project_profile, Profile},
};

#[derive(Debug, Serialize, Deserialize)]
pub struct BusterModelObject {
    pub sql_definition: String,
    pub model_file: BusterModel,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct BusterModel {
    pub version: i32,
    pub semantic_models: Vec<SemanticModel>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SemanticModel {
    pub name: String,
    pub defaults: ModelDefaults,
    pub description: String,
    pub model: Option<String>,
    pub entities: Vec<Entity>,
    pub dimensions: Vec<Dimension>,
    pub measures: Vec<Measure>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ModelDefaults {
    pub agg_time_dimension: String,
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

    // Walk through models directory recursively
    let models_dir = std::path::Path::new("models");
    let mut dir = tokio::fs::read_dir(models_dir).await?;
    while let Some(entry) = dir.next_entry().await? {
        let path = entry.path();

        // Check if this is a .yml file
        if let Some(ext) = path.extension() {
            if ext == "yml" {
                // Get corresponding .sql file path
                let sql_path = path.with_extension("sql");

                if sql_path.exists() {
                    // Read SQL definition
                    let sql_definition = tokio::fs::read_to_string(&sql_path).await?;

                    // Parse YAML into BusterModel
                    let yaml_content = fs::read_to_string(path).await?;
                    let model: BusterModel = serde_yaml::from_str(&yaml_content)?;

                    model_objects.push(BusterModelObject {
                        sql_definition,
                        model_file: model,
                    });
                }
            }
        }
    }

    Ok(model_objects)
}

pub async fn upload_model_files(
    model_objects: Vec<BusterModelObject>,
    buster_creds: BusterCredentials,
) -> Result<()> {
    // First, get the project profile so we can know where the models were written
    let (profile_name, profile) = get_project_profile().await?;

    // Need to get the schema. TODO: Allow for target-specific commands
    let schema = get_schema_name(&profile)?;

    let mut post_datasets_req_body = Vec::new();

    // Iterate through each model object and the semantic models within. These are the datasets we want to create.
    for model in model_objects {
        for semantic_model in model.model_file.semantic_models {
            let mut columns = Vec::new();

            for column in semantic_model.dimensions {
                columns.push(PostDatasetsColumnsRequest {
                    name: column.name,
                    description: column.description,
                    semantic_type: Some(String::from("dimension")),
                    expr: Some(column.expr),
                    type_: None,
                    agg: None,
                });
            }

            for column in semantic_model.measures {
                columns.push(PostDatasetsColumnsRequest {
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
                entity_relationships.push(PostDatasetsEntityRelationshipsRequest {
                    name: entity.name,
                    expr: vec![entity.expr],
                    type_: entity.entity_type,
                });
            }

            let dataset = PostDatasetsRequest {
                data_source_name: profile_name.clone(),
                env: profile.target.clone(),
                name: semantic_model.name,
                model: semantic_model.model,
                schema: schema.clone(),
                description: semantic_model.description,
                entity_relationships: Some(entity_relationships),
                columns,
            };

            post_datasets_req_body.push(dataset);
        };
    };

    let buster = BusterClient::new(buster_creds.url, buster_creds.api_key)?;

    if let Err(e) = buster.post_datasets(post_datasets_req_body).await {
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
