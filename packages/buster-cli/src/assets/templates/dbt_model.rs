pub struct DbtModel {
    pub version: u32,
    pub models: Vec<Model>,
}

pub struct Model {
    pub name: String,
    pub description: Option<String>,
    pub docs: Option<Docs>,
    pub latest_version: Option<String>,
    pub deprecation_date: Option<String>,
    pub access: Option<Access>,
    pub config: Option<std::collections::HashMap<String, String>>,
    pub constraints: Option<Vec<String>>,
    pub tests: Option<Vec<String>>,
    pub columns: Option<Vec<Column>>,
    pub time_spine: Option<TimeSpine>,
    pub versions: Option<Vec<Version>>,
}

pub struct Docs {
    pub show: Option<bool>,
    pub node_color: Option<String>,
}

pub enum Access {
    Private,
    Protected,
    Public,
}

pub struct Column {
    pub name: String,
    pub description: Option<String>,
    pub meta: Option<std::collections::HashMap<String, String>>,
    pub quote: Option<bool>,
    pub constraints: Option<Vec<String>>,
    pub tests: Option<Vec<String>>,
    pub tags: Option<Vec<String>>,
    pub granularity: Option<String>,
}

pub struct TimeSpine {
    pub standard_granularity_column: String,
}

pub struct Version {
    pub v: String,
    pub defined_in: Option<String>,
    pub description: Option<String>,
    pub docs: Option<Docs>,
    pub access: Option<Access>,
    pub constraints: Option<Vec<String>>,
    pub config: Option<std::collections::HashMap<String, String>>,
    pub tests: Option<Vec<String>>,
    pub columns: Option<Vec<VersionColumn>>,
}

pub struct VersionColumn {
    pub include: Option<String>,
    pub exclude: Option<Vec<String>>,
    pub name: Option<String>,
    pub quote: Option<bool>,
    pub constraints: Option<Vec<String>>,
    pub tests: Option<Vec<String>>,
    pub tags: Option<Vec<String>>,
}