use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct BusterProject {
    pub name: String,
    pub version: String,
    pub profile: String,
    #[serde(rename = "model-paths")]
    pub model_paths: Vec<String>,
    #[serde(rename = "analysis-paths")] 
    pub analysis_paths: Vec<String>,
    #[serde(rename = "test-paths")]
    pub test_paths: Vec<String>,
    #[serde(rename = "seed-paths")]
    pub seed_paths: Vec<String>,
    #[serde(rename = "macro-paths")]
    pub macro_paths: Vec<String>,
    #[serde(rename = "snapshot-paths")]
    pub snapshot_paths: Vec<String>,
    #[serde(rename = "clean-targets")]
    pub clean_targets: Vec<String>,
    pub models: Models,
}

#[derive(Serialize, Deserialize)]
pub struct Models {
    pub buster: BusterModels,
}

#[derive(Serialize, Deserialize)]
pub struct BusterModels {
    pub example: Example,
}

#[derive(Serialize, Deserialize)]
pub struct Example {
    #[serde(rename = "+materialized")]
    pub materialized: String,
}
