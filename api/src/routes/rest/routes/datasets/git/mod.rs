use axum::{
    routing::{get, post},
    Router,
};

mod create_branch;

pub fn git_router() -> Router {
    Router::new().route("/branch", post(create_branch::create_branch))
}
