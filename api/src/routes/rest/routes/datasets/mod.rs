mod assets;
mod get_dataset;
mod get_dataset_data_sample;
mod list_datasets;
mod deploy_datasets;

use axum::{
    routing::{get, post},
    Router,
};

pub fn router() -> Router {
    Router::new()
        .route("/", get(list_datasets::list_datasets))
        .route("/deploy", post(deploy_datasets::deploy_datasets))
        .route("/:dataset_id", get(get_dataset::get_dataset))
        .route(
            "/:dataset_id/data/sample",
            get(get_dataset_data_sample::get_dataset_data_sample),
        )
        .nest("/:dataset_id", assets::router())
}
