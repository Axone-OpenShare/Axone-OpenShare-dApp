use schemars::JsonSchema;
use serde::{Deserialize, Serialize};
use cosmwasm_schema::QueryResponses;

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct InstantiateMsg {
    pub axone_token_denom: String,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
#[serde(rename_all = "snake_case")]
pub enum ExecuteMsg {
    UploadFile { file_name: String, file_size: u64 },
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema, QueryResponses)]
#[serde(rename_all = "snake_case")]
pub enum QueryMsg {
    #[returns(FileMetadataResponse)] // Specify return type for the query
    GetFileMetadata { file_name: String },
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct FileMetadataResponse {
    pub owner: String,
    pub file_name: String,
    pub file_size: u64,
    pub upload_time: u64,
}
