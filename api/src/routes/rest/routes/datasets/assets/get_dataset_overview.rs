use anyhow::Result;
use axum::http::StatusCode;
use axum::{extract::Path, Extension, Json};
use diesel::prelude::*;
use diesel_async::RunQueryDsl;
use serde::Serialize;
use uuid::Uuid;

use crate::database::{
    enums::{UserOrganizationRole, UserOrganizationStatus},
    lib::get_pg_pool,
    models::{User, UserToOrganization},
    schema::{
        dataset_permissions, datasets_to_permission_groups, permission_groups_to_users, users,
        users_to_organizations,
    },
};
use crate::routes::rest::ApiResponse;
use crate::utils::security::checks::is_user_workspace_admin_or_data_admin;

#[derive(Debug, Serialize)]
pub struct UserPermissionLineage {
    pub user_id: Uuid,
    pub email: String,
    pub can_query: bool,
    pub organization_role_access: bool,
    pub permission_group_access: bool,
    pub dataset_group_access: bool,
    pub direct_access: bool,
}

#[derive(Debug, Serialize)]
pub struct DatasetOverview {
    pub dataset_id: Uuid,
    pub total_permission_groups: i64,
    pub total_dataset_groups: i64,
    pub total_users: i64,
    pub user_permission_lineages: Vec<UserPermissionLineage>,
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
            return Err((
                StatusCode::INTERNAL_SERVER_ERROR,
                "Error checking user permissions",
            ));
        }
    }

    let mut conn = get_pg_pool().get().await.map_err(|e| {
        tracing::error!("Error getting database connection: {:?}", e);
        (StatusCode::INTERNAL_SERVER_ERROR, "Database error")
    })?;

    // Get all active users in the organization
    let all_users = users_to_organizations::table
        .inner_join(users::table.on(users_to_organizations::user_id.eq(users::id)))
        .filter(users_to_organizations::status.eq(UserOrganizationStatus::Active))
        .filter(users_to_organizations::deleted_at.is_null())
        .select((users::id, users::email, users_to_organizations::role))
        .load::<(Uuid, String, UserOrganizationRole)>(&mut conn)
        .await
        .map_err(|e| {
            tracing::error!("Error getting users: {:?}", e);
            (StatusCode::INTERNAL_SERVER_ERROR, "Database error")
        })?;

    // Get permission group access for all users
    let permission_group_access = permission_groups_to_users::table
        .inner_join(
            datasets_to_permission_groups::table
                .on(datasets_to_permission_groups::permission_group_id
                    .eq(permission_groups_to_users::permission_group_id)),
        )
        .filter(datasets_to_permission_groups::dataset_id.eq(dataset_id))
        .filter(datasets_to_permission_groups::deleted_at.is_null())
        .select(permission_groups_to_users::user_id)
        .load::<Uuid>(&mut conn)
        .await
        .map_err(|e| {
            tracing::error!("Error checking permission group access: {:?}", e);
            (StatusCode::INTERNAL_SERVER_ERROR, "Database error")
        })?;

    // Get dataset group access
    let dataset_group_access = dataset_permissions::table
        .filter(
            dataset_permissions::dataset_id
                .eq(dataset_id)
                .and(dataset_permissions::permission_type.eq("dataset_group"))
                .and(dataset_permissions::deleted_at.is_null()),
        )
        .select(dataset_permissions::permission_id)
        .load::<Uuid>(&mut conn)
        .await
        .map_err(|e| {
            tracing::error!("Error checking dataset group access: {:?}", e);
            (StatusCode::INTERNAL_SERVER_ERROR, "Database error")
        })?;

    // Get direct access users
    let direct_access = dataset_permissions::table
        .filter(
            dataset_permissions::dataset_id
                .eq(dataset_id)
                .and(dataset_permissions::permission_type.eq("user"))
                .and(dataset_permissions::deleted_at.is_null()),
        )
        .select(dataset_permissions::permission_id)
        .load::<Uuid>(&mut conn)
        .await
        .map_err(|e| {
            tracing::error!("Error checking direct access: {:?}", e);
            (StatusCode::INTERNAL_SERVER_ERROR, "Database error")
        })?;

    // Build user lineages
    let user_permission_lineages = all_users
        .into_iter()
        .map(|(user_id, email, role)| {
            let organization_role_access = matches!(
                role,
                UserOrganizationRole::WorkspaceAdmin
                    | UserOrganizationRole::DataAdmin
                    | UserOrganizationRole::Querier
            );

            let permission_group_access = permission_group_access.contains(&user_id);
            let dataset_group_access = dataset_group_access.contains(&user_id);
            let direct_access = direct_access.contains(&user_id);

            let can_query = if role == UserOrganizationRole::Viewer {
                false
            } else {
                organization_role_access
                    || (role == UserOrganizationRole::RestrictedQuerier
                        && (permission_group_access || dataset_group_access || direct_access))
            };

            UserPermissionLineage {
                user_id,
                email,
                can_query,
                organization_role_access,
                permission_group_access,
                dataset_group_access,
                direct_access,
            }
        })
        .collect();

    // Count active permissions for each type
    let permission_groups_count = dataset_permissions::table
        .filter(
            dataset_permissions::dataset_id
                .eq(dataset_id)
                .and(dataset_permissions::permission_type.eq("permission_group"))
                .and(dataset_permissions::deleted_at.is_null()),
        )
        .count()
        .get_result::<i64>(&mut conn)
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
        .get_result::<i64>(&mut conn)
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
        .get_result::<i64>(&mut conn)
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
        user_permission_lineages,
    };

    Ok(ApiResponse::JsonData(overview))
}
