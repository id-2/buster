use anyhow::Result;
use axum::{Extension, Json};
use diesel_async::RunQueryDsl;

use crate::database::lib::get_pg_pool;
use crate::database::models::User;
use crate::database::schema::users;
use crate::routes::rest::ApiResponse;
use crate::utils::clients::sentry_utils::send_sentry_error;
use axum::http::StatusCode;
use diesel::{update, ExpressionMethods};
use serde::Deserialize;
use uuid::Uuid;

#[derive(Deserialize)]
pub struct UpdateUserRequest {
    pub name: Option<String>,
}

pub async fn update_user(
    Extension(user): Extension<User>,
    Json(body): Json<UpdateUserRequest>,
) -> Result<ApiResponse<User>, (StatusCode, &'static str)> {
    let user_info_object = match update_user_handler(&user.id, body.name).await {
        Ok(user_info_object) => user_info_object,
        Err(e) => {
            tracing::error!("Error getting user information: {:?}", e);
            send_sentry_error(&e.to_string(), Some(&user.id));
            return Err((
                StatusCode::INTERNAL_SERVER_ERROR,
                "Error getting user information",
            ));
        }
    };

    Ok(ApiResponse::JsonData(user_info_object))
}

pub async fn update_user_handler(user_id: &Uuid, name: Option<String>) -> Result<User> {
    let pg_pool = get_pg_pool();

    let mut conn = match pg_pool.get().await {
        Ok(conn) => conn,
        Err(_e) => {
            return Err(anyhow::anyhow!("Error getting postgres connection"));
        }
    };

    let user = match update(users::table)
        .filter(users::id.eq(user_id))
        .set(users::name.eq(name))
        .returning(users::all_columns)
        .get_result::<User>(&mut conn)
        .await
    {
        Ok(user) => user,
        Err(e) => return Err(anyhow::anyhow!("Error updating user: {:?}", e)),
    };

    Ok(user)
}
