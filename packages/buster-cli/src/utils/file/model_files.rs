use anyhow::Result;
use serde_yaml::{Mapping, Value};

use serde::{Deserialize, Serialize};
use tokio::fs;

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
    pub model: String,
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
