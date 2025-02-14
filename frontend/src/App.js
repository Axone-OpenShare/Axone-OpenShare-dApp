import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { SigningStargateClient } from '@cosmjs/stargate';
import { axoneChain } from './chains/axone';
import './App.css';

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadMessage, setUploadMessage] = useState('');
  const [txHash, setTxHash] = useState('');
  const [userDID, setUserDID] = useState('');
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [userBalance, setUserBalance] = useState(0);
  const [uploading, setUploading] = useState(false);

  // Connect wallet with Keplr and fetch user balance
  const connectWallet = useCallback(async () => {
    if (!window.keplr) {
      alert('Please install Keplr wallet!');
      return;
    }
    try {
      await window.keplr.enable(axoneChain.chainId);
      const offlineSigner = window.keplr.getOfflineSigner(axoneChain.chainId);
      const accounts = await offlineSigner.getAccounts();
      const walletAddress = accounts[0].address;
      setUserDID(walletAddress);
      setIsWalletConnected(true);

      // Fetch user balance from blockchain
      const client = await SigningStargateClient.connect(axoneChain.rpc);
      const balance = await client.getBalance(walletAddress, axoneChain.stakeCurrency.coinMinimalDenom);
      setUserBalance(Number(balance.amount) / Math.pow(10, axoneChain.stakeCurrency.coinDecimals));
    } catch (error) {
      console.error('Wallet connection error:', error);
      alert('Connection failed: ' + error.message);
    }
  }, []);

  // Handle file selection
  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  // Handle file upload and ensure $AXONE payment
  const handleUpload = async () => {
    if (!selectedFile || !userDID) {
      alert("Please select a file and connect wallet!");
      return;
    }
    if (userBalance < 1) {
      alert(`Insufficient balance! Need 1 ${axoneChain.stakeCurrency.coinDenom}`);
      return;
    }
    setUploading(true);
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("userDID", userDID);

    try {
      // Use the backend URL from your environment variables (or hardcode for now)
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
      const response = await axios.post(`${backendUrl}/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      if (response.data.txHash) {
        setTxHash(response.data.txHash);
        setUploadMessage('File uploaded successfully!');
      } else {
        setUploadMessage('File uploaded, but transaction failed.');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error uploading file: ' + error.message);
    }
    setUploading(false);
  };

  useEffect(() => {
    if (!isWalletConnected) {
      connectWallet();
    }
  }, [isWalletConnected, connectWallet]);

  return (
    <div className="App">
      <header className="App-header">
        <img src={axoneChain.chainName === 'Axone' ? axoneChain.chainName : 'logo'} className="App-logo" alt="logo" />
        <h1>Axone OpenShare</h1>
      </header>

      {!isWalletConnected ? (
        <button onClick={connectWallet}>Connect Wallet</button>
      ) : (
        <div>
          <p>Connected as: {userDID}</p>
          <p>Balance: {userBalance} {axoneChain.stakeCurrency.coinDenom}</p>
        </div>
      )}

      <div style={{ margin: "20px" }}>
        <input type="file" onChange={handleFileChange} />
      </div>

      <button onClick={handleUpload} disabled={uploading || !isWalletConnected}>
        {uploading ? 'Processing...' : 'Upload File'}
      </button>

      {uploadMessage && <div className="status-message">{uploadMessage}</div>}
      {txHash && (
        <div className="tx-hash">
          Transaction Hash: <a href={`${axoneChain.explorer}/txs/${txHash}`} target="_blank" rel="noopener noreferrer">
            {txHash.slice(0, 12)}...{txHash.slice(-6)}
          </a>
        </div>
      )}
    </div>
  );
}

export default App;
