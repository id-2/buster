use anyhow::{anyhow, Result};
use axum::{extract::Path, Extension};
use chrono::{DateTime, Utc};
use diesel::{ExpressionMethods, JoinOnDsl, QueryDsl};
use diesel_async::RunQueryDsl;
use serde::Serialize;
use uuid::Uuid;

use crate::{
    database::{
        enums::{DatasetType, UserOrganizationRole},
        lib::get_pg_pool,
        models::{DataSource, Dataset, User},
        schema::{data_sources, datasets, users, users_to_organizations},
    },
    routes::rest::ApiResponse,
};

#[derive(Serialize)]
pub struct GetDatasetOwner {
    pub id: Uuid,
    pub name: String,
    pub avatar_url: Option<String>,
}

#[derive(Serialize)]
pub struct GetDatasetDataSource {
    pub id: Uuid,
    pub name: String,
}

#[derive(Serialize)]
pub struct GetDatasetResponse {
    pub id: Uuid,
    pub name: String,
    pub database_name: String,
    pub when_to_use: Option<String>,
    pub when_not_to_use: Option<String>,
    #[serde(rename = "type")]
    pub type_: DatasetType,
    pub definition: String,
    pub schema: String,
    pub enabled: bool,
    pub imported: bool,
    pub data_source: GetDatasetDataSource,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub owner: GetDatasetOwner,
    pub yml_file: Option<String>,
}

pub async fn get_dataset(
    Extension(user): Extension<User>,
    Path(dataset_id): Path<Uuid>,
) -> Result<ApiResponse<GetDatasetResponse>, (axum::http::StatusCode, &'static str)> {
    match get_dataset_handler(&dataset_id, &user).await {
        Ok(dataset) => Ok(ApiResponse::JsonData(dataset)),
        Err(e) => {
            tracing::error!("Error getting dataset: {:?}", e);
            Err((
                axum::http::StatusCode::INTERNAL_SERVER_ERROR,
                "Failed to get dataset",
            ))
        }
    }
}

async fn get_dataset_handler(dataset_id: &Uuid, user: &User) -> Result<GetDatasetResponse> {
    let mut conn = match get_pg_pool().get().await {
        Ok(conn) => conn,
        Err(e) => return Err(anyhow!("Unable to get connection from pool: {}", e)),
    };

    // First check if user has admin access through their organization role
    let user_role = match users_to_organizations::table
        .inner_join(datasets::table.on(users_to_organizations::organization_id.eq(datasets::organization_id)))
        .select(users_to_organizations::role)
        .filter(datasets::id.eq(dataset_id))
        .filter(users_to_organizations::user_id.eq(user.id))
        .filter(users_to_organizations::deleted_at.is_null())
        .first::<UserOrganizationRole>(&mut conn)
        .await
    {
        Ok(role) => role,
        Err(e) => return Err(anyhow!("Unable to get user role: {}", e)),
    };

    let has_admin_access = matches!(user_role, UserOrganizationRole::WorkspaceAdmin | UserOrganizationRole::DataAdmin);

    if !has_admin_access {
        return Err(anyhow!("User does not have permission to access this dataset"));
    }

    let (dataset, data_source, owner) = match datasets::table
        .inner_join(data_sources::table.on(datasets::data_source_id.eq(data_sources::id)))
        .inner_join(users::table.on(datasets::created_by.eq(users::id)))
        .filter(datasets::id.eq(dataset_id))
        .filter(datasets::deleted_at.is_null())
        .select((
            datasets::all_columns,
            data_sources::all_columns,
            users::all_columns,
        ))
        .first::<(Dataset, DataSource, User)>(&mut conn)
        .await
    {
        Ok(result) => result,
        Err(e) => return Err(anyhow!("Unable to get dataset from database: {}", e)),
    };

    Ok(GetDatasetResponse {
        id: dataset.id,
        name: dataset.name,
        database_name: dataset.database_name,
        when_to_use: dataset.when_to_use,
        when_not_to_use: dataset.when_not_to_use,
        type_: dataset.type_,
        definition: dataset.definition,
        schema: dataset.schema,
        enabled: dataset.enabled,
        imported: dataset.imported,
        data_source: GetDatasetDataSource {
            id: data_source.id,
            name: data_source.name,
        },
        created_at: dataset.created_at,
        updated_at: dataset.updated_at,
        owner: GetDatasetOwner {
            id: owner.id,
            name: owner.name.unwrap_or(owner.email),
            avatar_url: None,
        },
        yml_file: dataset.yml_file,
    })
}
