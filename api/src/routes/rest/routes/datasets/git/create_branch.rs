use std::env;

use anyhow::Result;
use axum::http::StatusCode;
use axum::{extract::Path, Extension, Json};
use jsonwebtoken::EncodingKey;
use octocrab::auth::{create_jwt, AppAuth, Auth};
use octocrab::Octocrab;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::{
    database::models::User, routes::rest::ApiResponse,
    utils::security::checks::is_user_workspace_admin_or_data_admin,
};

#[derive(Debug, Deserialize)]
pub struct CreateBranchRequest {
    pub branch_name: String,
}

#[derive(Debug, Serialize)]
pub struct CreateBranchResponse {
    pub branch_name: String,
}

pub async fn create_branch(
    Extension(user): Extension<User>,
    Json(request): Json<CreateBranchRequest>,
) -> Result<ApiResponse<()>, (StatusCode, &'static str)> {
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

    match create_branch_handler().await {
        Ok(_) => Ok(ApiResponse::NoContent),
        Err(e) => {
            tracing::error!("Error creating branch: {:?}", e);
            Err((StatusCode::INTERNAL_SERVER_ERROR, "Error creating branch"))
        }
    }

    // TODO: Implement git branch creation logic here
}

async fn create_branch_handler() -> Result<()> {
    let app_id = env::var("GITHUB_CLIENT_ID")
        .unwrap()
        .parse::<u64>()
        .unwrap();
    let app_secret = match env::var("GITHUB_PRIVATE_KEY") {
        Ok(secret) => match EncodingKey::from_base64_secret(secret.as_str()) {
            Ok(key) => key,
            Err(e) => {
                tracing::error!("Error creating encoding key: {:?}", e);
                return Err(anyhow::anyhow!("Error creating encoding key"));
            }
        },
        Err(e) => {
            tracing::error!("Error getting GitHub private key: {:?}", e);
            return Err(anyhow::anyhow!("Error getting GitHub private key"));
        }
    };

    let jwt = match create_jwt(octocrab::models::AppId(app_id), &app_secret) {
        Ok(jwt) => jwt,
        Err(e) => {
            tracing::error!("Error creating JWT: {:?}", e);
            return Err(anyhow::anyhow!("Error creating JWT"));
        }
    };

    println!("jwt: {:?}", jwt);

    let octocrab = match Octocrab::builder().personal_token(jwt).build() {
        Ok(octocrab) => octocrab,
        Err(e) => {
            tracing::error!("Error creating Octocrab: {:?}", e);
            return Err(anyhow::anyhow!("Error creating Octocrab"));
        }
    };

    let installations = match octocrab.apps().installations().send().await {
        Ok(installations) => installations,
        Err(e) => {
            tracing::error!("Error getting installations: {:?}", e);
            return Err(anyhow::anyhow!("Error getting installations"));
        }
    };

    println!("{:?}", installations);

    Ok(())
}
