use cosmwasm_std::{
    DepsMut, Env, MessageInfo, Response, StdResult, Coin, Uint128,
    Deps, to_json_binary, Binary, Addr, MemoryStorage,
};
use crate::error::ContractError;
use crate::msg::{ExecuteMsg, InstantiateMsg, QueryMsg, FileMetadataResponse};
use crate::state::{State, save_state, read_state, FileMetadata};

#[cfg_attr(not(feature = "library"), cosmwasm_std::entry_point)]
pub fn instantiate(
    deps: DepsMut,
    env: Env,
    info: MessageInfo,
    msg: InstantiateMsg,
) -> Result<Response, ContractError> {
    let mut store = MemoryStorage::new();
    let state = State {
        file_count: 0,
        axone_token_denom: msg.axone_token_denom,
    };
    save_state(&mut store, &state)?;
    Ok(Response::new()
        .add_attribute("method", "instantiate")
        .add_attribute("owner", info.sender))
}

#[cfg_attr(not(feature = "library"), cosmwasm_std::entry_point)]
pub fn execute(
    deps: DepsMut,
    env: Env,
    info: MessageInfo,
    msg: ExecuteMsg,
) -> Result<Response, ContractError> {
    match msg {
        ExecuteMsg::UploadFile { file_name, file_size } => execute_upload_file(deps, env, info, file_name, file_size),
    }
}

pub fn execute_upload_file(
    deps: DepsMut,
    env: Env,
    info: MessageInfo,
    file_name: String,
    file_size: u64,
) -> Result<Response, ContractError> {
    let mut store = MemoryStorage::new();
    let mut state = State {
        file_count: 0,
        axone_token_denom: "uaxone".to_string(),
    };
    // Check if the correct amount of AXONE tokens was sent
    let required_deposit = Coin {
        denom: state.axone_token_denom.clone(),
        amount: Uint128::from(1u128), // 1 AXONE token
    };
    if info.funds.len() != 1 || info.funds[0] != required_deposit {
        return Err(ContractError::InsufficientFunds { required: required_deposit.amount.u128() });
    }
    // Basic file size limit check (10 MB = 10485760 bytes)
    if file_size > 10 * 1024 * 1024 {
        return Err(ContractError::FileSizeTooLarge {});
    }
    // Increment file count
    state.file_count += 1;
    save_state(&mut store, &state)?;
    // Store file metadata
    let file_metadata = FileMetadata {
        owner: info.sender.clone(),
        file_name: file_name.clone(),
        file_size,
        upload_time: env.block.time.seconds(),
    };
    Ok(Response::new()
        .add_attribute("method", "upload_file")
        .add_attribute("owner", info.sender)
        .add_attribute("file_name", file_name))
}

#[cfg_attr(not(feature = "library"), cosmwasm_std::entry_point)]
pub fn query(
    deps: Deps,
    env: Env,
    msg: QueryMsg,
) -> StdResult<Binary> {
    match msg {
        QueryMsg::GetFileMetadata { file_name } => query_file_metadata(deps, env, file_name),
    }
}

pub fn query_file_metadata(
    deps: Deps,
    env: Env,
    file_name: String,
) -> StdResult<Binary> {
    let mut store = MemoryStorage::new();
    let state = read_state(&mut store)?;
    // Get file metadata from the chain
    let file_metadata = FileMetadata {
        owner: Addr::unchecked("owner"), // Replace with actual owner
        file_name: file_name.clone(),
        file_size: 1024, // Replace with actual file size
        upload_time: env.block.time.seconds(),
    };
    // Create and serialize the response
    let response = FileMetadataResponse {
        owner: file_metadata.owner.to_string(),
        file_name: file_metadata.file_name,
        file_size: file_metadata.file_size,
        upload_time: file_metadata.upload_time,
    };
    to_json_binary(&response)
}