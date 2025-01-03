use arrow::array::Array;
use indexmap::IndexMap;

use anyhow::{anyhow, Error};
use chrono::{LocalResult, TimeZone, Utc};
use snowflake_api::SnowflakeApi;

use serde_json::Value;

use crate::utils::query_engine::data_types::DataType;

pub async fn snowflake_query(
    snowflake_client: SnowflakeApi,
    query: String,
) -> Result<Vec<IndexMap<std::string::String, DataType>>, Error> {
    let rows = match snowflake_client.exec(&query).await {
        Ok(result) => match result {
            snowflake_api::QueryResult::Arrow(result) => {
                result
                    .iter()
                    .flat_map(|batch| {
                        let schema = batch.schema();
                        (0..batch.num_rows()).map(move |row_idx| {
                            schema
                                .fields()
                                .iter()
                                .enumerate()
                                .map(|(col_idx, field)| {
                                    let column = batch.column(col_idx);
                                    let value = match column.data_type() {
                                        arrow::datatypes::DataType::Int64 => {
                                            let array = column
                                                .as_any()
                                                .downcast_ref::<arrow::array::Int64Array>()
                                                .unwrap();
                                            if array.is_null(row_idx) {
                                                Value::Null
                                            } else {
                                                Value::Number(array.value(row_idx).into())
                                            }
                                        }
                                        arrow::datatypes::DataType::Float64 => {
                                            let array = column
                                                .as_any()
                                                .downcast_ref::<arrow::array::Float64Array>()
                                                .unwrap();
                                            if array.is_null(row_idx) {
                                                Value::Null
                                            } else {
                                                Value::Number(
                                                    serde_json::Number::from_f64(
                                                        array.value(row_idx),
                                                    )
                                                    .unwrap_or(serde_json::Number::from(0)),
                                                )
                                            }
                                        }
                                        arrow::datatypes::DataType::Utf8 => {
                                            let array = column
                                                .as_any()
                                                .downcast_ref::<arrow::array::StringArray>()
                                                .unwrap();
                                            if array.is_null(row_idx) {
                                                Value::Null
                                            } else {
                                                Value::String(array.value(row_idx).to_string())
                                            }
                                        }
                                        // Add other data types as needed
                                        _ => Value::Null,
                                    };
                                    (field.name().clone(), value)
                                })
                                .collect::<IndexMap<String, Value>>()
                        })
                    })
                    .collect()
            }
            _ => Vec::new(),
        },
        Err(e) => {
            tracing::error!("There was an issue while fetching the tables: {}", e);
            return Err(anyhow!(e));
        }
    };

    let result = rows
        .iter()
        .map(|row| {
            row.iter()
                .map(|(key, value)| {
                    (
                        key.clone(),
                        match value {
                            Value::Null => DataType::Null,
                            Value::Bool(val) => DataType::Bool(Some(val.clone())),
                            Value::Number(val) => match val.as_i64() {
                                Some(int_val) => DataType::Int8(Some(int_val)),
                                None => match val.as_f64() {
                                    Some(float_val) => DataType::Float8(Some(float_val)),
                                    None => DataType::Null,
                                },
                            },
                            Value::String(val) => DataType::Text(Some(val.clone())),
                            Value::Array(_) => DataType::Null,
                            Value::Object(val) => {
                                tracing::debug!("OBJECT: {:#?}", val);
                                if let (
                                    Some(&Value::Number(ref epoch)),
                                    Some(&Value::Number(ref fraction)),
                                    Some(&Value::Number(ref timezone)),
                                ) = (val.get("epoch"), val.get("fraction"), val.get("timezone"))
                                {
                                    if let (Some(epoch), Some(fraction), Some(_)) =
                                        (epoch.as_i64(), fraction.as_i64(), timezone.as_i64())
                                    {
                                        match Utc.timestamp_opt(epoch, 0) {
                                            LocalResult::Single(dt) => {
                                                let nanos = fraction as u32;
                                                let dt = dt
                                                    + chrono::Duration::nanoseconds(nanos as i64);
                                                DataType::Timestamptz(Some(dt))
                                            }
                                            _ => DataType::Null,
                                        }
                                    } else {
                                        DataType::Null
                                    }
                                } else {
                                    DataType::Null
                                }
                            }
                        },
                    )
                })
                .collect::<IndexMap<String, DataType>>()
        })
        .collect::<Vec<IndexMap<String, DataType>>>();

    Ok(result)
}
