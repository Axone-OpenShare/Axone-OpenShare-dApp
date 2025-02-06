import React, { useState } from 'react';
import axios from 'axios';
import logo from './logo.svg';
import './App.css';

function App() {
    const [fileName, setFileName] = useState('');
    const [fileSize, setFileSize] = useState(0);
    const [userWallet, setUserWallet] = useState('');
    const [txHash, setTxHash] = useState('');

    const handleUpload = async () => {
        try {
            const response = await axios.post('http://localhost:3001/upload', {
                fileName: fileName,
                fileSize: fileSize,
                userWallet: userWallet
            });
            setTxHash(response.data.txHash);
        } catch (error) {
            console.error("Error uploading file:", error);
            alert("Error uploading file: " + error.message);
        }
    };

    return (
        <div className="App">
            <header className="App-header">
                <img src={logo} className="App-logo" alt="logo" />
                <p>
                    Edit <code>src/App.js</code> and save to reload.
                </p>
                <a
                    className="App-link"
                    href="https://reactjs.org"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Learn React
                </a>
            </header>
            <h1>Axone OpenShare</h1>
            <div>
                <label>File Name:</label>
                <input type="text" value={fileName} onChange={e => setFileName(e.target.value)} />
            </div>
            <div>
                <label>File Size (bytes):</label>
                <input type="number" value={fileSize} onChange={e => setFileSize(parseInt(e.target.value))} />
            </div>
            <div>
                <label>User Wallet:</label>
                <input type="text" value={userWallet} onChange={e => setUserWallet(e.target.value)} />
            </div>
            <button onClick={handleUpload}>Upload File</button>
            {txHash && <div>Transaction Hash: {txHash}</div>}
        </div>
    );
}

export default App;
