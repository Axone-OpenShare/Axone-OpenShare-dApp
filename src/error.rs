use cosmwasm_std::StdError;
use thiserror::Error;

#[derive(Error, Debug)]
pub enum ContractError {
    #[error("{0}")]
    Std(#[from] StdError),

    #[error("Unauthorized")]
    Unauthorized {},

    #[error("Insufficient funds: {required} AXONE tokens required")]
    InsufficientFunds { required: u128 },

    #[error("File size exceeds the limit")]
    FileSizeTooLarge {},
}
