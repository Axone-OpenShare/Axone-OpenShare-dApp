use cosmwasm_std::{Addr, Storage, StdResult};
use cw_storage_plus::Item;
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct FileMetadata {
    pub owner: Addr,
    pub file_name: String,
    pub file_size: u64,
    pub upload_time: u64,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct State {
    pub file_count: u64,
    pub axone_token_denom: String,
}

pub const STATE: Item<State> = Item::new("state");

pub fn read_state(storage: &dyn Storage) -> StdResult<State> {
    STATE.load(storage)
}

pub fn save_state(storage: &mut dyn Storage, state: &State) -> StdResult<()> {
    STATE.save(storage, state)
}