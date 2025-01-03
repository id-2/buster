use axum::{
    routing::{get, put},
    Router,
};

pub mod get_user;
pub mod update_user;

pub fn router() -> Router {
    Router::new()
        .route("/", get(get_user::get_user))
        .route("/", put(update_user::update_user))
}
