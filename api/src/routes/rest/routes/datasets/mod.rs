mod assets;
mod get_dataset;
mod list_datasets;
mod post_datasets;

use axum::{
    routing::{get, post},
    Router,
};

pub fn router() -> Router {
    Router::new()
        .route("/", get(list_datasets::list_datasets))
        .route("/", post(post_datasets::post_datasets))
        .route("/:dataset_id", get(get_dataset::get_dataset))
        .nest("/:dataset_id", assets::router())
}
