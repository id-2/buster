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
pub struct PostDatasetsRequest {
    pub data_source_name: String,
    pub env: String,
    pub name: String,
    pub model: Option<String>,
    pub schema: String,
    pub description: String,
    pub sql_definition: Option<String>,
    pub entity_relationships: Option<Vec<PostDatasetsEntityRelationshipsRequest>>,
    pub columns: Vec<PostDatasetsColumnsRequest>,
}

#[derive(Debug, Serialize)]
pub struct PostDatasetsColumnsRequest {
    pub name: String,
    pub description: String,
    pub semantic_type: Option<String>,
    pub expr: Option<String>,
    #[serde(rename = "type")]
    pub type_: Option<String>,
    pub agg: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct PostDatasetsEntityRelationshipsRequest {
    pub name: String,
    pub expr: Vec<String>,
    #[serde(rename = "type")]
    pub type_: String,
}
