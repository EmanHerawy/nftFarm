// deploy/00_deploy_my_contract.js
module.exports = async ({getNamedAccounts, deployments}) => {
    const {deploy} = deployments;
  const { deployer } = await getNamedAccounts();
    const baseURI = 'ipfs://QmY1DA4kK2B3B8pyTH5C7Gr8YqKomLKZyH8MY421wtGK9s/'
  let name = "StartFiNFTToken", symbol = "STFI";
    await deploy('AnyERC721', {
      from: deployer,
      args: [name,symbol,baseURI],
      log: true,
    });
  };
  module.exports.tags = ['AnyERC721'];