# AXONE OPEN_SHARE

## Overview
This dApp provides functionality for uploading files and querying metadata, using AXONE tokens as a form of payment for file uploads.

## Features
- Users can upload file metadata (file name, size, and timestamp) by paying AXONE tokens.
- The contract enforces a 10MB file size limit.
- The file metadata is stored on-chain and can be queried later.
- It tracks the total number of uploaded files.

## Contract Structure
- **`contract.rs`**: Implements contract logic (instantiation, execution, and queries).
- **`state.rs`**: Defines the state structures and handles persistent storage.

## State Storage
### `State`
```rust
pub struct State {
    pub file_count: u64, // Total number of uploaded files
    pub axone_token_denom: String, // AXONE token denomination
}
```
### `FileMetadata`
```rust
pub struct FileMetadata {
    pub owner: Addr,
    pub file_name: String,
    pub file_size: u64,
    pub upload_time: u64,
}
```

## Entry Points
### Instantiate
Initializes the contract with:
- `axone_token_denom`: The token used for payments.

```rust
pub fn instantiate(
    deps: DepsMut,
    env: Env,
    info: MessageInfo,
    msg: InstantiateMsg,
) -> Result<Response, ContractError>
```

### Execute
#### Upload File Metadata
Users call this function to upload a file by providing:
- `file_name`: Name of the file.
- `file_size`: Size of the file (must be <= 10MB).
- Must send 1 AXONE token as payment.

```rust
pub fn execute_upload_file(
    deps: DepsMut,
    env: Env,
    info: MessageInfo,
    file_name: String,
    file_size: u64,
) -> Result<Response, ContractError>
```

### Query
#### Get File Metadata
Retrieves stored file metadata by file name.

```rust
pub fn query_file_metadata(
    deps: Deps,
    env: Env,
    file_name: String,
) -> StdResult<Binary>
```

## Storage
- **State:** Stores the global contract state.
- **File Metadata:** Uses `cw_storage_plus::Map` to store metadata keyed by `file_name`.

## Error Handling
- `InsufficientFunds`: Returned if a user does not send 1 AXONE token.
- `FileSizeTooLarge`: Returned if file size exceeds 10MB.
- `FileNotFound`: Returned if the queried file does not exist.

### Notice
  - This is the first iteration of this project. For now this repository contains only contracts and at their first iteration, our developers are actively researching and working to see the finish of this project.
