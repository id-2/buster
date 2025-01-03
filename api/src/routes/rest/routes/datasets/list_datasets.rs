use anyhow::{anyhow, Result};
use axum::{extract::Query, Extension};
use chrono::{DateTime, Utc};
use diesel::{
    dsl::sql,
    sql_types::{Nullable, Timestamptz},
    BoolExpressionMethods, ExpressionMethods, JoinOnDsl, NullableExpressionMethods, QueryDsl,
};
use diesel_async::RunQueryDsl;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::{
    database::{
        enums::IdentityType,
        lib::{get_pg_pool, PgPool},
        models::User,
        schema::{
            data_sources, datasets, datasets_to_permission_groups, messages,
            permission_groups_to_identities, teams_to_users, users,
        },
    },
    routes::rest::ApiResponse,
    utils::user::user_info::get_user_organization_id,
};

#[derive(Deserialize)]
pub struct ListDatasetsQuery {
    pub page: Option<i64>,
    pub page_size: Option<i64>,
    pub admin_view: Option<bool>,
    pub enabled: Option<bool>,
    pub imported: Option<bool>,
    pub permission_group_id: Option<Uuid>,
    pub belongs_to: Option<bool>,
    pub data_source_id: Option<Uuid>,
}

#[derive(Serialize)]
pub struct ListDatasetOwner {
    pub id: Uuid,
    pub name: String,
    pub avatar_url: Option<String>,
}

#[derive(Serialize)]
pub struct ListDatasetDataSource {
    pub id: Uuid,
    pub name: String,
}

#[derive(Serialize)]
pub struct ListDatasetObject {
    pub id: Uuid,
    pub name: String,
    pub data_source: ListDatasetDataSource,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub last_queried: Option<DateTime<Utc>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub created_at: Option<DateTime<Utc>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub updated_at: Option<DateTime<Utc>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub enabled: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub imported: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub owner: Option<ListDatasetOwner>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub belongs_to: Option<bool>,
}

pub async fn list_datasets(
    Extension(user): Extension<User>,
    Query(query): Query<ListDatasetsQuery>,
) -> Result<ApiResponse<Vec<ListDatasetObject>>, (axum::http::StatusCode, &'static str)> {
    let datasets = match list_datasets_handler(
        &user.id,
        query.page,
        query.page_size,
        query.admin_view,
        query.enabled,
        query.imported,
        query.permission_group_id,
        query.belongs_to,
        query.data_source_id,
    )
    .await
    {
        Ok(datasets) => datasets,
        Err(e) => {
            tracing::error!("Error listing datasets: {:?}", e);
            return Err((
                axum::http::StatusCode::INTERNAL_SERVER_ERROR,
                "Failed to list datasets",
            ));
        }
    };

    Ok(ApiResponse::JsonData(datasets))
}

async fn list_datasets_handler(
    user_id: &Uuid,
    page: Option<i64>,
    page_size: Option<i64>,
    admin_view: Option<bool>,
    enabled: Option<bool>,
    imported: Option<bool>,
    permission_group_id: Option<Uuid>,
    _belongs_to: Option<bool>,
    data_source_id: Option<Uuid>,
) -> Result<Vec<ListDatasetObject>> {
    let page = page.unwrap_or(0);
    let page_size = page_size.unwrap_or(25);
    let admin_view = admin_view.unwrap_or(false);

    let pg_pool = get_pg_pool();

    let organization_id = get_user_organization_id(&user_id).await?;

    let list_of_datasets = if let Some(permission_group_id) = permission_group_id {
        list_permission_group_datasets(
            pg_pool,
            organization_id,
            page,
            page_size,
            permission_group_id,
        )
        .await?
    } else {
        match admin_view {
            true => {
                get_org_datasets(
                    pg_pool,
                    &organization_id,
                    page,
                    page_size,
                    enabled,
                    imported,
                    data_source_id,
                )
                .await?
            }
            false => get_user_permissioned_datasets(pg_pool, &user_id, page, page_size).await?,
        }
    };

    Ok(list_of_datasets)
}

async fn get_user_permissioned_datasets(
    pool: &PgPool,
    user_id: &Uuid,
    page: i64,
    page_size: i64,
) -> Result<Vec<ListDatasetObject>> {
    let mut conn = match pool.get().await {
        Ok(conn) => conn,
        Err(e) => return Err(anyhow!("Unable to get connection from pool: {}", e)),
    };

    let list_dataset_records = match datasets::table
        .inner_join(data_sources::table.on(datasets::data_source_id.eq(data_sources::id)))
        .inner_join(
            datasets_to_permission_groups::table.on(datasets::id
                .eq(datasets_to_permission_groups::dataset_id)
                .and(datasets_to_permission_groups::deleted_at.is_null())),
        )
        .inner_join(
            permission_groups_to_identities::table.on(
                datasets_to_permission_groups::permission_group_id
                    .eq(permission_groups_to_identities::permission_group_id)
                    .and(permission_groups_to_identities::deleted_at.is_null()),
            ),
        )
        .left_join(
            teams_to_users::table.on(permission_groups_to_identities::identity_id
                .eq(teams_to_users::team_id)
                .and(permission_groups_to_identities::identity_type.eq(IdentityType::Team))
                .and(teams_to_users::deleted_at.is_null())),
        )
        .inner_join(users::table.on(datasets::created_by.eq(users::id)))
        .left_join(messages::table.on(messages::dataset_id.eq(datasets::id.nullable())))
        .select((
            datasets::id,
            datasets::name,
            datasets::created_at,
            datasets::updated_at,
            datasets::enabled,
            datasets::imported,
            users::id,
            users::name.nullable(),
            users::email,
            data_sources::id,
            data_sources::name,
            sql::<Nullable<Timestamptz>>("max(messages.created_at) as last_queried"),
        ))
        .group_by((
            datasets::id,
            datasets::name,
            datasets::created_at,
            datasets::updated_at,
            datasets::enabled,
            datasets::imported,
            users::id,
            users::name,
            users::email,
            data_sources::id,
            data_sources::name,
        ))
        .filter(datasets::deleted_at.is_null())
        .filter(
            permission_groups_to_identities::identity_id
                .eq(user_id)
                .or(teams_to_users::user_id.eq(user_id)),
        )
        .limit(page_size)
        .offset(page * page_size)
        .load::<(
            Uuid,
            String,
            DateTime<Utc>,
            DateTime<Utc>,
            bool,
            bool,
            Uuid,
            Option<String>,
            String,
            Uuid,
            String,
            Option<DateTime<Utc>>,
        )>(&mut conn)
        .await
    {
        Ok(datasets) => datasets,
        Err(e) => return Err(anyhow!("Unable to get datasets from database: {}", e)),
    };

    let list_dataset_objects: Vec<ListDatasetObject> = list_dataset_records
        .into_iter()
        .map(
            |(
                id,
                name,
                created_at,
                updated_at,
                enabled,
                imported,
                user_id,
                user_name,
                user_email,
                data_source_id,
                data_source_name,
                last_queried,
            )| {
                ListDatasetObject {
                    id,
                    name,
                    created_at: Some(created_at),
                    updated_at: Some(updated_at),
                    enabled: Some(enabled),
                    imported: Some(imported),
                    data_source: ListDatasetDataSource {
                        id: data_source_id,
                        name: data_source_name,
                    },
                    last_queried,
                    owner: Some(ListDatasetOwner {
                        id: user_id,
                        name: user_name.unwrap_or(user_email),
                        avatar_url: None,
                    }),
                    belongs_to: None,
                }
            },
        )
        .collect();

    Ok(list_dataset_objects)
}

async fn get_org_datasets(
    pool: &PgPool,
    organization_id: &Uuid,
    page: i64,
    page_size: i64,
    enabled: Option<bool>,
    imported: Option<bool>,
    data_source_id: Option<Uuid>,
) -> Result<Vec<ListDatasetObject>> {
    let mut conn = match pool.get().await {
        Ok(conn) => conn,
        Err(e) => return Err(anyhow!("Unable to get connection from pool: {}", e)),
    };

    let mut query = datasets::table
        .inner_join(data_sources::table.on(datasets::data_source_id.eq(data_sources::id)))
        .inner_join(users::table.on(datasets::created_by.eq(users::id)))
        .left_join(messages::table.on(messages::dataset_id.eq(datasets::id.nullable())))
        .select((
            datasets::id,
            datasets::name,
            datasets::created_at,
            datasets::updated_at,
            datasets::enabled,
            datasets::imported,
            users::id,
            users::name.nullable(),
            users::email,
            data_sources::id,
            data_sources::name,
            sql::<Nullable<Timestamptz>>("max(messages.created_at) as last_queried"),
        ))
        .group_by((
            datasets::id,
            datasets::name,
            datasets::created_at,
            datasets::updated_at,
            datasets::enabled,
            datasets::imported,
            users::id,
            users::name,
            users::email,
            data_sources::id,
            data_sources::name,
        ))
        .filter(datasets::organization_id.eq(organization_id))
        .filter(datasets::deleted_at.is_null())
        .into_boxed();

    if let Some(enabled_value) = enabled {
        query = query.filter(datasets::enabled.eq(enabled_value));
    } else {
        query = query.filter(datasets::enabled.eq(true));
    }

    if let Some(data_source_id) = data_source_id {
        query = query.filter(datasets::data_source_id.eq(data_source_id));
    }

    if let Some(imported_value) = imported {
        query = query.filter(datasets::imported.eq(imported_value));
    }

    let list_dataset_records = match query
        .limit(page_size)
        .offset(page * page_size)
        .load::<(
            Uuid,
            String,
            DateTime<Utc>,
            DateTime<Utc>,
            bool,
            bool,
            Uuid,
            Option<String>,
            String,
            Uuid,
            String,
            Option<DateTime<Utc>>,
        )>(&mut conn)
        .await
    {
        Ok(datasets) => datasets,
        Err(e) => return Err(anyhow!("Unable to get datasets from database: {}", e)),
    };

    let list_dataset_objects: Vec<ListDatasetObject> = list_dataset_records
        .into_iter()
        .map(
            |(
                id,
                name,
                created_at,
                updated_at,
                enabled,
                imported,
                user_id,
                user_name,
                user_email,
                data_source_id,
                data_source_name,
                last_queried,
            )| {
                ListDatasetObject {
                    id,
                    name,
                    created_at: Some(created_at),
                    updated_at: Some(updated_at),
                    enabled: Some(enabled),
                    imported: Some(imported),
                    data_source: ListDatasetDataSource {
                        id: data_source_id,
                        name: data_source_name,
                    },
                    last_queried,
                    owner: Some(ListDatasetOwner {
                        id: user_id,
                        name: user_name.unwrap_or(user_email),
                        avatar_url: None,
                    }),
                    belongs_to: None,
                }
            },
        )
        .collect();

    Ok(list_dataset_objects)
}

async fn list_permission_group_datasets(
    pool: &PgPool,
    organization_id: Uuid,
    page: i64,
    page_size: i64,
    permission_group_id: Uuid,
) -> Result<Vec<ListDatasetObject>> {
    let mut conn = match pool.get().await {
        Ok(conn) => conn,
        Err(e) => return Err(anyhow!("Unable to get connection from pool: {}", e)),
    };

    let list_dataset_records = match datasets::table
        .inner_join(data_sources::table.on(datasets::data_source_id.eq(data_sources::id)))
        .left_join(
            datasets_to_permission_groups::table.on(datasets::id
                .eq(datasets_to_permission_groups::dataset_id)
                .and(datasets_to_permission_groups::permission_group_id.eq(permission_group_id))
                .and(datasets_to_permission_groups::deleted_at.is_null())),
        )
        .select((
            datasets::id,
            datasets::name,
            data_sources::id,
            data_sources::name,
            datasets_to_permission_groups::permission_group_id.nullable(),
        ))
        .filter(datasets::organization_id.eq(organization_id))
        .filter(datasets::deleted_at.is_null())
        .filter(datasets::enabled.eq(true))
        .limit(page_size)
        .offset(page * page_size)
        .load::<(Uuid, String, Uuid, String, Option<Uuid>)>(&mut conn)
        .await
    {
        Ok(datasets) => datasets,
        Err(e) => return Err(anyhow!("Unable to get datasets from database: {}", e)),
    };

    let list_dataset_objects: Vec<ListDatasetObject> = list_dataset_records
        .into_iter()
        .map(
            |(id, name, data_source_id, data_source_name, permission_group_id)| ListDatasetObject {
                id,
                name,
                created_at: None,
                updated_at: None,
                enabled: None,
                imported: None,
                data_source: ListDatasetDataSource {
                    id: data_source_id,
                    name: data_source_name,
                },
                last_queried: None,
                owner: None,
                belongs_to: Some(permission_group_id.is_some()),
            },
        )
        .collect();

    Ok(list_dataset_objects)
}
