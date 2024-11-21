use anyhow::Result;
use reqwest::{
    header::{HeaderMap, HeaderValue},
    Client,
};
use serde::{Deserialize, Serialize};

pub struct BusterClient {
    client: Client,
    base_url: String,
    api_key: String,
}

#[derive(Debug, Deserialize)]
pub struct ValidateApiKeyResponse {
    pub valid: bool,
}

#[derive(Debug, Serialize)]
pub struct ValidateApiKeyRequest {
    pub api_key: String,
}

impl BusterClient {
    pub fn new(base_url: String, api_key: String) -> Result<Self> {
        let client = Client::builder().build()?;

        Ok(Self {
            client,
            base_url,
            api_key,
        })
    }

    fn build_headers(&self) -> Result<HeaderMap> {
        let mut headers = HeaderMap::new();
        headers.insert(
            "Authorization",
            HeaderValue::from_str(&format!("Bearer {}", self.api_key))?,
        );
        Ok(headers)
    }

    pub async fn validate_api_key(&self) -> Result<bool> {
        let request = ValidateApiKeyRequest {
            api_key: self.api_key.clone(),
        };

        let response = self
            .client
            .post(format!("{}/api/v1/api_keys/validate", self.base_url))
            .json(&request)
            .send()
            .await?;

        if response.status().is_client_error() {
            return Err(anyhow::anyhow!(
                "Failed to validate API key. This could be due to an invalid URL"
            ));
        }

        match response.json::<ValidateApiKeyResponse>().await {
            Ok(validate_response) => Ok(validate_response.valid),
            Err(e) => Err(anyhow::anyhow!(
                "Failed to parse validate API key response: {}",
                e
            )),
        }
    }
}
