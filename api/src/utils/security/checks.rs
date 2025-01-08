use anyhow::Result;
use diesel::{ExpressionMethods, QueryDsl};
use diesel_async::RunQueryDsl;
use uuid::Uuid;

use crate::database::{
    enums::{UserOrganizationRole, UserOrganizationStatus},
    lib::get_pg_pool,
    models::UserToOrganization,
    schema::users_to_organizations,
};

/// Checks if a user has workspace admin or data admin privileges
///
/// # Arguments
/// * `user_id` - UUID of the user to check permissions for
///
/// # Returns
/// * `bool` - True if user is workspace admin or data admin, false otherwise
///
/// # Errors
/// * Database connection errors
/// * User not found errors
pub async fn is_user_workspace_admin_or_data_admin(user_id: &Uuid) -> Result<bool> {
    // Get database connection from pool
    let mut conn = get_pg_pool().get().await.map_err(|e| anyhow::anyhow!(e))?;

    // Query user's organization role
    let user = users_to_organizations::table
        .filter(users_to_organizations::user_id.eq(user_id))
        .filter(users_to_organizations::status.eq(UserOrganizationStatus::Active))
        .filter(users_to_organizations::deleted_at.is_null())
        .first::<UserToOrganization>(&mut conn)
        .await?;

    // Check if user has admin privileges
    Ok(user.role == UserOrganizationRole::WorkspaceAdmin
        || user.role == UserOrganizationRole::DataAdmin)
}
