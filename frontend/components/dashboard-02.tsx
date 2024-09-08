import Link from 'next/link';
import {
  CircleUser,
  Home,
  LineChart,
  Menu,
  Package2,
  Loader2,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { CHAIN_NAMESPACES, IProvider, WEB3AUTH_NETWORK } from '@web3auth/base';
import { EthereumPrivateKeyProvider } from '@web3auth/ethereum-provider';
import { Web3Auth } from '@web3auth/modal';
import { ethers } from 'ethers';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import RPC from '../app/ethersRPC';

// Web3Auth configuration
const clientId =
  'BLbCXyNiOGrarAnvaWr3lyW3YeTH8EI9NHIA8mlFrPQaGcX2SVnPnGU67I54R5bnIXippsBruZDcqFc1A9PY0Ng';
const chainConfig = {
  chainNamespace: CHAIN_NAMESPACES.EIP155,
  chainId: '0xaa36a7',
  rpcTarget: 'https://rpc.ankr.com/eth_sepolia',
  displayName: 'Ethereum Sepolia Testnet',
  blockExplorerUrl: 'https://sepolia.etherscan.io',
  ticker: 'ETH',
  tickerName: 'Ethereum',
};

const privateKeyProvider = new EthereumPrivateKeyProvider({
  config: { chainConfig },
});
const web3auth = new Web3Auth({
  clientId,
  web3AuthNetwork: WEB3AUTH_NETWORK.TESTNET,
  privateKeyProvider,
});

export default function Dashboard() {
  const [provider, setProvider] = useState<IProvider | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [chain, setChain] = useState('eth_sepolia');
  const [artifact, setArtifact] = useState('');
  const [deploymentResult, setDeploymentResult] = useState<{
    contractAddress?: string;
    transactionHash?: string;
    error?: string;
  } | null>(null);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployedContract, setDeployedContract] =
    useState<ethers.Contract | null>(null);
  const [contractFunctions, setContractFunctions] = useState<any[]>([]);
  const [selectedFunction, setSelectedFunction] = useState<string | null>(null);
  const [functionInputs, setFunctionInputs] = useState<{
    [key: string]: string;
  }>({});
  const [functionResult, setFunctionResult] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        console.log('Initializing Web3Auth...');
        await web3auth.initModal();
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
    try {
      console.log('Connecting to Web3Auth...');
      const web3authProvider = await web3auth.connect();
      setProvider(web3authProvider);
      if (web3auth.connected) {
        setLoggedIn(true);
      }
    } catch (error) {
      console.error('User login has failed:', error);
    }
  };

  const logout = async () => {
    await web3auth.logout();
    setProvider(null);
    setLoggedIn(false);
  };

  const generateApiKey = async () => {
    try {
      const response = await fetch(
        'https://ethonline-2024.vercel.app/api/generateApiKey',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: 'test@test.com' }),
        }
      );
      if (!response.ok) throw new Error('Failed to generate API key');
      const data = await response.json();
      setApiKey(data.apiKey);
    } catch (error) {
      console.error('Error generating API key:', error);
    }
  };

  const getApiKey = async () => {
    try {
      const response = await fetch(
        'https://ethonline-2024.vercel.app/api/getapikey',
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        }
      );
      if (!response.ok) throw new Error('Failed to get API key');
      const data = await response.json();
      setApiKey(data.apiKey);
    } catch (error) {
      console.error('Error getting API key:', error);
    }
  };

  const deployContract = async () => {
    try {
      setIsDeploying(true);
      setDeploymentResult(null); // Reset previous result
      const response = await fetch(
        'https://ethonline-2024.vercel.app/api/deployContract',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            artifact: JSON.parse(artifact),
            network: chain,
          }),
        }
      );
      if (!response.ok) throw new Error('Failed to deploy contract');
      const data = await response.json();
      console.log('Contract deployed:', data);
      setDeploymentResult({
        contractAddress: data.contractAddress,
        transactionHash: data.transactionHash,
      });

      // Set up the contract instance
      const artifactData = JSON.parse(artifact);
      const provider = new ethers.JsonRpcProvider(chainConfig.rpcTarget);
      const contract = new ethers.Contract(
        data.contractAddress,
        artifactData.abi,
        provider
      );
      setDeployedContract(contract);

      // Extract contract functions from ABI
      const functions = artifactData.abi.filter(
        (item: any) => item.type === 'function'
      );
      setContractFunctions(functions);
    } catch (error) {
      console.error('Error deploying contract:', error);
      setDeploymentResult({
        error: (error as Error).message || 'Unknown error occurred',
      });
    } finally {
      setIsDeploying(false);
    }
  };

  const handleFunctionSelect = (functionName: string) => {
    setSelectedFunction(functionName);
    setFunctionInputs({});
    setFunctionResult(null);
  };

  const handleInputChange = (name: string, value: string) => {
    setFunctionInputs((prev) => ({ ...prev, [name]: value }));
  };

  const callContractFunction = async () => {
    if (!deployedContract || !selectedFunction) return;
    try {
      // Use type assertion and optional chaining
      const func = (deployedContract as any)[selectedFunction];
      if (typeof func === 'function') {
        const inputs =
          contractFunctions
            .find((f: any) => f.name === selectedFunction)
            ?.inputs.map((input: any) => functionInputs[input.name]) || [];

        const result = await func(...inputs);
        setFunctionResult(JSON.stringify(result));
      } else {
        throw new Error('Selected function is not callable');
      }
    } catch (error) {
      console.error('Error calling contract function:', error);
      setFunctionResult(
        `Error: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  };

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <Package2 className="h-6 w-6" />
              <span className="">Our Project</span>
            </Link>
          </div>
          <div className="flex-1">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              <Link
                href="#"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              >
                <Home className="h-4 w-4" />
                Dashboard
              </Link>
              <Link
                href="#"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              >
                <LineChart className="h-4 w-4" />
                Settings
              </Link>
            </nav>
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 md:hidden"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col">
              <div className="mt-auto"></div>
            </SheetContent>
          </Sheet>
          <Button variant={'secondary'} onClick={loggedIn ? logout : login}>
            {loggedIn ? 'Disconnect' : 'Connect'}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="rounded-full">
                <CircleUser className="h-5 w-5" />
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold md:text-2xl">Dashboard</h1>
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
          </div>
          <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-1">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">API Key</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {apiKey || 'Not Generated'}
                </div>
                <p className="text-xs text-muted-foreground">
                  {apiKey
                    ? 'API Key generated'
                    : 'Generate an API Key to get started'}
                </p>
                <Button
                  className="mt-2"
                  onClick={apiKey ? getApiKey : generateApiKey}
                >
                  {apiKey ? 'Get API Key' : 'Generate API Key'}
                </Button>
              </CardContent>
            </Card>
            <Card className="md:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Deploy Contract
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Paste your contract artifact here"
                  value={artifact}
                  onChange={(e) => setArtifact(e.target.value)}
                  className="mb-2"
                />
                <Button
                  onClick={deployContract}
                  className="w-full"
                  disabled={isDeploying}
                >
                  {isDeploying ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Deploying...
                    </>
                  ) : (
                    'Deploy Contract'
                  )}
                </Button>
                {isDeploying && (
                  <div className="mt-4 text-center">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <p className="mt-2">Deploying contract, please wait...</p>
                  </div>
                )}
                {deploymentResult && !isDeploying && (
                  <div className="mt-4 p-4 bg-muted rounded-md">
                    <h3 className="font-semibold mb-2">Deployment Result:</h3>
                    {deploymentResult.error ? (
                      <p className="text-red-500">{deploymentResult.error}</p>
                    ) : (
                      <>
                        <p>
                          <strong>Contract Address:</strong>{' '}
                          {deploymentResult.contractAddress}
                        </p>
                        <p>
                          <strong>Transaction Hash:</strong>{' '}
                          {deploymentResult.transactionHash}
                        </p>
                      </>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
            {deployedContract && (
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Interact with Contract</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <Label>Select Function</Label>
                    <select
                      className="w-full mt-1 p-2 border rounded"
                      onChange={(e) => handleFunctionSelect(e.target.value)}
                      value={selectedFunction || ''}
                    >
                      <option value="">Select a function</option>
                      {contractFunctions.map((func: any) => (
                        <option key={func.name} value={func.name}>
                          {func.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedFunction && (
                    <>
                      {contractFunctions
                        .find((f: any) => f.name === selectedFunction)
                        ?.inputs.map((input: any) => (
                          <div key={input.name} className="mb-2">
                            <Label>
                              {input.name} ({input.type})
                            </Label>
                            <Input
                              type="text"
                              placeholder={input.type}
                              onChange={(e) =>
                                handleInputChange(input.name, e.target.value)
                              }
                              value={functionInputs[input.name] || ''}
                            />
                          </div>
                        ))}
                      <Button onClick={callContractFunction} className="mt-4">
                        Call Function
                      </Button>
                    </>
                  )}

                  {functionResult && (
                    <div className="mt-4 p-4 bg-muted rounded-md">
                      <h4 className="font-semibold mb-2">Result:</h4>
                      <pre className="whitespace-pre-wrap">
                        {functionResult}
                      </pre>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
