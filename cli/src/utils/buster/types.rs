use serde::{Deserialize, Serialize};

use crate::utils::profiles::Credential;

#[derive(Debug, Deserialize)]
pub struct ValidateApiKeyResponse {
    pub valid: bool,
}

#[derive(Debug, Serialize)]
pub struct ValidateApiKeyRequest {
    pub api_key: String,
}

#[derive(Debug, Serialize)]
pub struct PostDataSourcesRequest {
    pub name: String,
    pub env: String,
    #[serde(flatten)]
    pub credential: Credential,
}

#[derive(Debug, Serialize)]
pub struct DeployDatasetsRequest {
    pub data_source_name: String,
    pub env: String,
    pub name: String,
    pub model: Option<String>,
    pub schema: String,
    pub description: String,
    pub sql_definition: Option<String>,
    pub entity_relationships: Option<Vec<DeployDatasetsEntityRelationshipsRequest>>,
    pub columns: Vec<DeployDatasetsColumnsRequest>,
    pub yml_file: String,
}

#[derive(Debug, Serialize)]
pub struct DeployDatasetsColumnsRequest {
    pub name: String,
    pub description: String,
    pub semantic_type: Option<String>,
    pub expr: Option<String>,
    #[serde(rename = "type")]
    pub type_: Option<String>,
    pub agg: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct DeployDatasetsEntityRelationshipsRequest {
    pub name: String,
    pub expr: String,
    #[serde(rename = "type")]
    pub type_: String,
}
