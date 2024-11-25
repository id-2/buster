use std::path::PathBuf;
use thiserror::Error;

#[derive(Debug, Error)]
pub enum BusterError {
    #[error("Invalid credentials")]
    InvalidCredentials,
    #[error("File not found: {path}")]
    FileNotFound { path: PathBuf },
    #[error("Failed to parse file: {error}")]
    ParseError { error: String },
    #[error("Failed to write file: {path}")]
    FileWriteError { path: PathBuf, error: String },
}
