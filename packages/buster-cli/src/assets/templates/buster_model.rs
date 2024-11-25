use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct DbtModel {
    pub version: u32,
    pub semantic_models: Vec<SemanticModel>,
}

#[derive(Serialize, Deserialize)]
pub struct SemanticModel {
    pub name: String,
    pub description: Option<String>,
    pub model: String,
    pub defaults: Defaults,
    pub aliases: Option<Vec<String>>,
    pub entities: Vec<Entity>,
    pub measures: Option<Vec<Measure>>,
    pub dimensions: Option<Vec<Dimension>>,
}

#[derive(Serialize, Deserialize)]
pub struct Defaults {
    pub agg_time_dimension: String,
}

#[derive(Serialize, Deserialize)]
pub struct Entity {
    pub name: String,
    #[serde(rename = "type")]
    pub entity_type: EntityType,
    pub description: Option<String>,
    pub expr: Option<String>,
    pub join_type: Option<JoinType>,
    pub relationship_type: Option<RelationshipType>,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum EntityType {
    Primary,
    Natural,
    Foreign,
    Unique,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum JoinType {
    AlwaysLeft,
    Inner,
    FullOuter,
    Cross,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum RelationshipType {
    OneToOne,
    OneToMany,
    ManyToOne,
    ManyToMany,
}

#[derive(Serialize, Deserialize)]
pub struct Measure {
    pub name: String,
    pub description: Option<String>,
    pub agg: String,
    pub expr: String,
    pub agg_params: Option<String>,
    pub agg_time_dimension: Option<String>,
    pub non_additive_dimension: Option<String>,
    pub alias: Option<Vec<String>>,
}

#[derive(Serialize, Deserialize)]
pub struct Dimension {
    pub name: String,
    #[serde(rename = "type")]
    pub dimension_type: DimensionType,
    pub label: Option<String>,
    pub type_params: String,
    pub description: Option<String>,
    pub expr: Option<String>,
    pub sql: Option<String>,
    pub searchable: Option<bool>,
    pub alias: Option<Vec<String>>,
    pub timezone: Option<String>,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum DimensionType {
    Categorical,
    Time,
}