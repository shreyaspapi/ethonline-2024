// deploy-cli.js
const axios = require('axios');
const fs = require('fs');

const deployContract = async (apikey, artifactPath, network) => {
  try {
    const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
    const response = await axios.post(
      'https://ethonline-2024.vercel.app/api/deployContract',
      {
        artifact,
        network,
      },
      {
        headers: { 'x-api-key': apikey },
      }
    );
    console.log('Contract deployed at:', response.data.contractAddress);
    console.log('Transaction Hash:', response.data.transactionHash);
  } catch (error) {
    console.error(
      'Deployment failed:',
      error.response ? error.response.data : error.message
    );
  }
};

const args = process.argv.slice(2);
const apiKey = args[0];
const artifactPath = args[1];
const network = args[2] || 'goerli';

deployContract(apiKey, artifactPath, network);

// node deploy-cli.js YOUR_API_KEY ./path_to_artifact.json goerli
