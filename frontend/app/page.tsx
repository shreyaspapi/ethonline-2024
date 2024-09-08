'use client';

import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

import { CHAIN_NAMESPACES, IProvider, WEB3AUTH_NETWORK } from '@web3auth/base';
import { EthereumPrivateKeyProvider } from '@web3auth/ethereum-provider';
// IMP START - Quick Start
import { Web3Auth } from '@web3auth/modal';
import { useEffect, useState } from 'react';
// IMP END - Quick Start

// IMP START - Blockchain Calls
import RPC from './ethersRPC';
import { ModeToggle } from '@/components/mode-toggle';
import { Button } from '@/components/ui/button';
import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
// import RPC from "./viemRPC";
// import RPC from "./web3RPC";
// IMP END - Blockchain Calls

// IMP START - Dashboard Registration
const clientId =
  'BPi5PB_UiIZ-cPz1GtV5i1I2iOSOHuimiXBI0e-Oe_u6X3oVAbCiAZOTEBtTXw4tsluTITPqA8zMsfxIKMjiqNQ'; // get from https://dashboard.web3auth.io
// IMP END - Dashboard Registration

// IMP START - Chain Config
const chainConfig = {
  chainNamespace: CHAIN_NAMESPACES.EIP155,
  chainId: '0xaa36a7',
  rpcTarget: 'https://rpc.ankr.com/eth_sepolia',
  // Avoid using public rpcTarget in production.
  // Use services like Infura, Quicknode etc
  displayName: 'Ethereum Sepolia Testnet',
  blockExplorerUrl: 'https://sepolia.etherscan.io',
  ticker: 'ETH',
  tickerName: 'Ethereum',
  logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
};
// IMP END - Chain Config

// IMP START - SDK Initialization
const privateKeyProvider = new EthereumPrivateKeyProvider({
  config: { chainConfig },
});

const web3auth = new Web3Auth({
  clientId,
  web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_MAINNET,
  privateKeyProvider,
});
// IMP END - SDK Initialization

function App() {
  const [provider, setProvider] = useState<IProvider | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        // IMP START - SDK Initialization
        await web3auth.initModal();
        // IMP END - SDK Initialization
        setProvider(web3auth.provider);

        if (web3auth.connected) {
          setLoggedIn(true);
        }
      } catch (error) {
        console.error(error);
      }
    };

    init();
  }, []);

  const login = async () => {
    // IMP START - Login
    try {
      const web3authProvider = await web3auth.connect();
      // IMP END - Login
      setProvider(web3authProvider);
      if (web3auth.connected) {
        setLoggedIn(true);
      }
    } catch (error) {
      console.error('User login has failed:', error);
    }
  };

  const getUserInfo = async () => {
    // IMP START - Get User Information
    const user = await web3auth.getUserInfo();
    // IMP END - Get User Information
    uiConsole(user);
  };

  const logout = async () => {
    // IMP START - Logout
    await web3auth.logout();
    // IMP END - Logout
    setProvider(null);
    setLoggedIn(false);
    uiConsole('logged out');
  };

  // IMP START - Blockchain Calls
  // Check the RPC file for the implementation
  const getAccounts = async () => {
    if (!provider) {
      uiConsole('provider not initialized yet');
      return;
    }
    const address = await RPC.getAccounts(provider);
    uiConsole(address);
  };

  const getBalance = async () => {
    if (!provider) {
      uiConsole('provider not initialized yet');
      return;
    }
    const balance = await RPC.getBalance(provider);
    uiConsole(balance);
  };

  const signMessage = async () => {
    if (!provider) {
      uiConsole('provider not initialized yet');
      return;
    }
    const signedMessage = await RPC.signMessage(provider);
    uiConsole(signedMessage);
  };

  const sendTransaction = async () => {
    if (!provider) {
      uiConsole('provider not initialized yet');
      return;
    }
    uiConsole('Sending Transaction...');
    const transactionReceipt = await RPC.sendTransaction(provider);
    uiConsole(transactionReceipt);
  };
  // IMP END - Blockchain Calls

  function uiConsole(...args: any[]): void {
    const el = document.querySelector('#console>p');
    if (el) {
      el.innerHTML = JSON.stringify(args || {}, null, 2);
      console.log(...args);
    }
  }

  const loggedInView = (
    <>
      <div className="flex-container">
        <div>
          <button onClick={getUserInfo} className="card">
            Get User Info
          </button>
        </div>
        <div>
          <button onClick={getAccounts} className="card">
            Get Accounts
          </button>
        </div>
        <div>
          <button onClick={getBalance} className="card">
            Get Balance
          </button>
        </div>
        <div>
          <button onClick={signMessage} className="card">
            Sign Message
          </button>
        </div>
        <div>
          <button onClick={sendTransaction} className="card">
            Send Transaction
          </button>
        </div>
        <div>
          <button onClick={logout} className="card">
            Log Out
          </button>
        </div>
      </div>
    </>
  );

  const generateApiKey = async () => {
    try {
      const response = await fetch(
        'https://ethonline-2024.vercel.app/api/generateApiKey',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: 'test@test.com',
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to generate API key');
      }

      const data = await response.json();
      console.log('Generated API Key:', data.apiKey);
      setApiKey(data.apiKey);
    } catch (error) {
      console.error('Error generating API key:', error);
    }
  };

  const deployContract = async (artifact: string, network: string) => {
    try {
      const response = await fetch(
        'https://ethonline-2024.vercel.app/api/deployContract',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            artifact: JSON.parse(artifact),
            network: network,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to deploy contract');
      }

      const data = await response.json();
      console.log('Contract deployed:', data);
    } catch (error) {
      console.error('Error deploying contract:', error);
    }
  };

  const [chain, setChain] = React.useState('eth_sepo');
  const ChainSelector = () => {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">Select Chain</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuLabel>Chain</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup value={chain} onValueChange={setChain}>
            <DropdownMenuRadioItem value="eth_sepolia">
              Ethereum Sepolia
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="arb_sepolia">
              Arbitrum Sepolia
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="op_sepolia">
              Optimism Sepolia
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  const TextareaWithText = () => {
    const [message, setMessage] = useState('');

    return (
      <>
        <div className="grid w-full gap-1.5">
          <Label htmlFor="message-2">Your Message</Label>
          <Textarea
            placeholder="Type your message here."
            id="message-2"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <p className="text-sm text-muted-foreground">
            Your message will be copied to the support team.
          </p>
        </div>
        <Button onClick={() => deployContract(message, chain)}>
          Deploy Contract
        </Button>
      </>
    );
  };
  const getApiKey = async () => {
    try {
      const response = await fetch(
        'https://ethonline-2024.vercel.app/api/getapikey',
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to get API key');
      }

      const data = await response.json();
      console.log('Retrieved API Key:', data.apiKey);
      setApiKey(data.apiKey);
    } catch (error) {
      console.error('Error getting API key:', error);
    }
  };

  return (
    <div className="container mt-4 mx-auto">
      <div className="flex justify-end gap-2 items-center mb-4">
        <ModeToggle />
        <Button onClick={login}>Login</Button>
      </div>
      <div className="grid">{loggedIn && loggedInView}</div>
      <Button onClick={generateApiKey}>Generate API Key</Button>
      {apiKey && <p>API Key: {apiKey}</p>}
      <Button onClick={getApiKey}>Get API Key</Button>
      <div id="console" style={{ whiteSpace: 'pre-line' }}>
        <p style={{ whiteSpace: 'pre-line' }}></p>
      </div>
      <ChainSelector />
      <TextareaWithText />
    </div>
  );
}

export default App;
