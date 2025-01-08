use anyhow::Result;
use axum::{extract::Path, Extension, Json};
use axum::http::StatusCode;
use diesel::prelude::*;
use diesel_async::RunQueryDsl;
use serde::Serialize;
use uuid::Uuid;

use crate::database::{
    lib::get_pg_pool,
    models::User,
    schema::dataset_permissions,
};
use crate::routes::rest::ApiResponse;
use crate::utils::security::checks::is_user_workspace_admin_or_data_admin;

#[derive(Debug, Serialize)]
pub struct DatasetOverview {
    pub dataset_id: Uuid,
    pub total_permission_groups: i64,
    pub total_dataset_groups: i64,
    pub total_users: i64,
}

pub async fn get_dataset_overview(
    Extension(user): Extension<User>,
    Path(dataset_id): Path<Uuid>,
) -> Result<ApiResponse<DatasetOverview>, (StatusCode, &'static str)> {
    // Check if user is workspace admin or data admin
    match is_user_workspace_admin_or_data_admin(&user.id).await {
        Ok(true) => (),
        Ok(false) => return Err((StatusCode::FORBIDDEN, "Insufficient permissions")),
        Err(e) => {
            tracing::error!("Error checking user permissions: {:?}", e);
            return Err((StatusCode::INTERNAL_SERVER_ERROR, "Error checking user permissions"));
        }
    }

    let mut conn = get_pg_pool().get().await.map_err(|e| {
        tracing::error!("Error getting database connection: {:?}", e);
        (StatusCode::INTERNAL_SERVER_ERROR, "Database error")
    })?;

    // Count active permissions for each type
    let permission_groups_count = dataset_permissions::table
        .filter(
            dataset_permissions::dataset_id
                .eq(dataset_id)
                .and(dataset_permissions::permission_type.eq("permission_group"))
                .and(dataset_permissions::deleted_at.is_null()),
        )
        .count()
        .get_result::<i64>(&mut *conn)
        .await
        .map_err(|e| {
            tracing::error!("Error counting permission groups: {:?}", e);
            (StatusCode::INTERNAL_SERVER_ERROR, "Database error")
        })?;

    let dataset_groups_count = dataset_permissions::table
        .filter(
            dataset_permissions::dataset_id
                .eq(dataset_id)
                .and(dataset_permissions::permission_type.eq("dataset_group"))
                .and(dataset_permissions::deleted_at.is_null()),
        )
        .count()
        .get_result::<i64>(&mut *conn)
        .await
        .map_err(|e| {
            tracing::error!("Error counting dataset groups: {:?}", e);
            (StatusCode::INTERNAL_SERVER_ERROR, "Database error")
        })?;

    let users_count = dataset_permissions::table
        .filter(
            dataset_permissions::dataset_id
                .eq(dataset_id)
                .and(dataset_permissions::permission_type.eq("user"))
                .and(dataset_permissions::deleted_at.is_null()),
        )
        .count()
        .get_result::<i64>(&mut *conn)
        .await
        .map_err(|e| {
            tracing::error!("Error counting users: {:?}", e);
            (StatusCode::INTERNAL_SERVER_ERROR, "Database error")
        })?;

    let overview = DatasetOverview {
        dataset_id,
        total_permission_groups: permission_groups_count,
        total_dataset_groups: dataset_groups_count,
        total_users: users_count,
    };

    Ok(ApiResponse::JsonData(overview))
}
