mod api_keys;
mod assets;
mod data_sources;
mod datasets;
mod permission_groups;
mod users;

use axum::{middleware, Router};

use crate::buster_middleware::auth::auth;

pub fn router() -> Router {
    Router::new().nest("/api_keys", api_keys::router()).merge(
        Router::new()
            .nest("/users", users::router())
            .nest("/assets", assets::router())
            .nest("/datasets", datasets::router())
            .nest("/data_sources", data_sources::router())
            .nest("/permission_groups", permission_groups::router())
            .route_layer(middleware::from_fn(auth)),
    )
}
