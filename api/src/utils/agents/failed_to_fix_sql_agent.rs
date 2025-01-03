use serde_json::Value;
use std::fmt;
use tokio::sync::mpsc;

use crate::utils::{
    agent_builder::nodes::{
        error_node::ErrorNode,
        prompt_node::{prompt_node, PromptNodeMessage, PromptNodeSettings},
    },
    prompts::analyst_chat_prompts::failed_to_fix_sql_prompts::{
            failed_to_fix_sql_system_prompt, failed_to_fix_sql_user_prompt,
        },
};

pub enum FailedToFixSqlAgent {
    MissingKey,
    ObjectNotJson,
    PromptNodeError,
}

impl fmt::Display for FailedToFixSqlAgent {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::MissingKey => write!(f, "missing_key"),
            Self::ObjectNotJson => write!(f, "object_not_json"),
            Self::PromptNodeError => write!(f, "prompt_node_error"),
        }
    }
}

pub struct FailedToFixSqlAgentOptions {
    pub outputs: Value,
    pub message_history: Vec<Value>,
    pub input: String,
    pub output_sender: mpsc::Sender<Value>,
}

pub async fn failed_to_fix_sql_agent(
    options: FailedToFixSqlAgentOptions,
) -> Result<Value, ErrorNode> {
    // Extract required fields from outputs, defaulting to null if not found
    let action_decisions = options
        .outputs
        .get("action_decisions")
        .and_then(|v| v.as_object())
        .and_then(|obj| serde_json::to_string(obj).ok());

    let dataset_selection = options
        .outputs
        .get("dataset_selection")
        .and_then(|v| v.as_object())
        .and_then(|obj| serde_json::to_string(obj).ok());

    let sql = options
        .outputs
        .get("sql")
        .and_then(|obj| serde_json::to_string(obj).ok());

    let error = options
        .outputs
        .get("error")
        .and_then(|obj| serde_json::to_string(obj).ok());

    // Create prompt settings
    let failed_to_fix_prompt_settings = PromptNodeSettings {
        messages: vec![
            PromptNodeMessage {
                role: "system".to_string(),
                content: failed_to_fix_sql_system_prompt(),
            },
            PromptNodeMessage {
                role: "user".to_string(),
                content: failed_to_fix_sql_user_prompt(
                    &options.input,
                    &action_decisions,
                    &dataset_selection,
                    &sql,
                    &error,
                ),
            },
        ],
        stream: Some(options.output_sender),
        stream_name: Some("failed_to_fix_sql".to_string()),
        prompt_name: "failed_to_fix_sql".to_string(),
        ..Default::default()
    };

    // Execute prompt node
    let response = match prompt_node(failed_to_fix_prompt_settings).await {
        Ok(response) => response,
        Err(e) => {
            return Err(e);
        }
    };

    // Combine master response with first part of response
    let combined_response = match (
        response.as_str(),
        options.outputs.get("first_part_of_response"),
    ) {
        (Some(master_str), Some(first_part)) => {
            if let Some(first_part_str) = first_part.as_str() {
                Value::String(format!("{}\n\n{}", first_part_str, master_str))
            } else {
                response
            }
        }
        _ => response,
    };

    Ok(combined_response)
}
