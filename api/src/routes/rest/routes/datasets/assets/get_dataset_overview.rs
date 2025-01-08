use anyhow::Result;
use axum::http::StatusCode;
use axum::{extract::Path, Extension};
use diesel::prelude::*;
use diesel_async::RunQueryDsl;
use serde::Serialize;
use uuid::Uuid;

use crate::database::{
    enums::{UserOrganizationRole, UserOrganizationStatus},
    lib::get_pg_pool,
    models::User,
    schema::{
        dataset_permissions, datasets_to_permission_groups, permission_groups_to_users, users,
        users_to_organizations,
    },
};
use crate::routes::rest::ApiResponse;
use crate::utils::security::checks::is_user_workspace_admin_or_data_admin;

#[derive(Debug, Serialize)]
pub struct UserPermissionLineage {
    pub id: Option<Uuid>,
    #[serde(rename = "type")]
    pub type_: String,
    pub name: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct UserOverviewItem {
    pub id: Uuid,
    pub name: String,
    pub can_query: bool,
    pub lineage: Vec<Vec<UserPermissionLineage>>,
}

#[derive(Debug, Serialize)]
pub struct DatasetOverview {
    pub dataset_id: Uuid,
    pub users: Vec<UserOverviewItem>,
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
    let users = users_to_organizations::table
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

    let users = users
        .into_iter()
        .map(|(id, email, role)| {
            let can_query = match role {
                UserOrganizationRole::WorkspaceAdmin => true,
                UserOrganizationRole::DataAdmin => true,
                UserOrganizationRole::Querier => true,
                _ => false,
            };

            let mut lineage = vec![];
            let mut org_lineage = vec![UserPermissionLineage {
                id: Some(id),
                type_: String::from("user"),
                name: Some(String::from("Default Access")),
            }];

            match role {
                UserOrganizationRole::WorkspaceAdmin => {
                    org_lineage.push(UserPermissionLineage {
                        id: Some(id),
                        type_: String::from("user"),
                        name: Some(String::from("Workspace Admin")),
                    });
                }
                UserOrganizationRole::DataAdmin => {
                    org_lineage.push(UserPermissionLineage {
                        id: Some(id),
                        type_: String::from("user"),
                        name: Some(String::from("Data Admin")),
                    });
                }
                UserOrganizationRole::Querier => {
                    org_lineage.push(UserPermissionLineage {
                        id: Some(id),
                        type_: String::from("user"),
                        name: Some(String::from("Querier")),
                    });
                }
                UserOrganizationRole::RestrictedQuerier => {
                    org_lineage.push(UserPermissionLineage {
                        id: Some(id),
                        type_: String::from("user"),
                        name: Some(String::from("Restricted Querier")),
                    });
                }
                UserOrganizationRole::Viewer => {
                    org_lineage.push(UserPermissionLineage {
                        id: Some(id),
                        type_: String::from("user"),
                        name: Some(String::from("Viewer")),
                    });
                }
                _ => (),
            }

            lineage.push(org_lineage);

            return UserOverviewItem {
                id,
                name: email,
                can_query,
                lineage,
            };
        })
        .collect();

    let overview = DatasetOverview { dataset_id, users };

    Ok(ApiResponse::JsonData(overview))
}
