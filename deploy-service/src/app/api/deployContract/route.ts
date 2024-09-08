import { ethers } from 'ethers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json({ message: 'Hello World working' });
}

export async function POST(request: NextRequest) {
  const { artifact, network } = await request.json();

  if (!artifact || !artifact.bytecode || !artifact.abi) {
    return NextResponse.json(
      { message: 'Invalid contract artifact' },
      { status: 400 }
    );
  }

  try {
    const provider = new ethers.JsonRpcProvider(getRpcUrlForNetwork(network));
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) throw new Error('PRIVATE_KEY is not set');
    const wallet = new ethers.Wallet(privateKey, provider);
    const factory = new ethers.ContractFactory(
      artifact.abi,
      artifact.bytecode,
      wallet
    );

    const contract = await factory.deploy();
    // await contract.waitForDeployment();

    return NextResponse.json({
      contractAddress: await contract.getAddress(),
      transactionHash: contract.deploymentTransaction()?.hash ?? null,
    });
  } catch (error) {
    console.error('Deployment failed:', error);
    return NextResponse.json(
      {
        message: 'Deployment failed',
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

function getRpcUrlForNetwork(network: string): string {
  const networks: { [key: string]: string } = {
    eth_sepolia: `https://sepolia.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
    op_sepolia: `https://optimism-sepolia.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
    arb_sepolia: `https://arbitrum-sepolia.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
    // Add more networks as needed
  };

  const rpcUrl = networks[network];
  if (!rpcUrl) {
    throw new Error(`Unsupported network: ${network}`);
  }

  return rpcUrl;
}
