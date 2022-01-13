// We require the Hardhat Runtime Environment explicitly here. This is optional 
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");
const { constants, BigNumber } = hre.ethers
const { AddressZero } = constants
function expandTo18Decimals(n) {
  return BigNumber.from(n).mul(BigNumber.from(10).pow(18))
}
function* generateSequence(start , end ) {
  for (let i = start; i <= end; i++) {
    yield i
  }
}
async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile 
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy
  const accounts = await ethers.getSigners();
   let owner =accounts[0].address;
console.log(owner,'owner');

/*******************************get Artifacts ******************************* */ 
  // const StartFiToken = await hre.ethers.getContractFactory("StartFiToken");
  // const StartFiRoyaltyNFT = await hre.ethers.getContractFactory("StartFiRoyaltyNFT");
  // const StartFiStakes = await hre.ethers.getContractFactory("StartFiStakes");
  const Farm = await hre.ethers.getContractFactory("StartfiFarm");
  const anyERc20 = await hre.ethers.getContractFactory("AnyERC20");
  const anyERc721 = await hre.ethers.getContractFactory("AnyERC721");
  const farm = await Farm.attach("0x6f2219716998131D01ef901B0ec2C7224dA6E4b9");
    const nextPool = await anyERc20.attach("0x86c4386c4cb3C9F196d22c4C541f9767E8400D93");
    const RAGPool = await anyERc20.attach("0x84f5eF55d070999D28d44a35E44938A3D32E0Fcf");
  const startfiPool = await anyERc20.attach("0x4e85a1047860733a74a24db836c8e6878945185d");
  const vidalnft = await anyERc721.attach("0xB87056037974887A8D045fe84aCf2DEb6ff9Ac0A");
 
  const user1 = owner //"0x7e33ca6d5fe6a06ae484E81262ACB74919Dc25fb"


  const startfiPoolDetails = {
    _shareAPR: BigNumber.from('5898525'),
    _shareAPRBase: BigNumber.from('10000000000'),
    _minimumStake: expandTo18Decimals(1000),
    _cap: expandTo18Decimals(4000),
    _totalShare: 20,
    _totalShareBase: 1,
  }
 
 
  const nextPoolDetails = {
    _shareAPR: BigNumber.from('5898525'),
    _shareAPRBase: BigNumber.from('10000000000'),
    _minimumStake: expandTo18Decimals(1000),
    _cap: expandTo18Decimals(6000),
    _totalShare: 30,
    _totalShareBase: 1,
  }
  const ragPoolDetails = {
    _shareAPR: BigNumber.from('5898525'),
    _shareAPRBase: BigNumber.from('10000000000'),
    _minimumStake: expandTo18Decimals(100),
    _cap: expandTo18Decimals(1000),
    _totalShare: 30,
    _totalShareBase: 1,
  }
  const vidalNFTDetails = {
    _tokenId: 0,
    _priceInPoint: expandTo18Decimals(4000),
    _minimumStakeRequired: 0,
    _nftAddress: null,
    _owner: user1,
    _tokenLinked: null,
  }
  const nextNftDetails = {
    _tokenId: 0,
    _priceInPoint: expandTo18Decimals(2000),
    _minimumStakeRequired: 0,
    _nftAddress: null,
    _owner: user1,
    _tokenLinked: null,
  }
  const ragNftDetails = {
    _tokenId: 0,
    _priceInPoint: expandTo18Decimals(1000),
    _minimumStakeRequired: 0,
    _nftAddress: null,
    _owner: user1,
    _tokenLinked: null,
  }

  const vidalMax = 1
  const nextMax = 3
  const ragMax = 10


    await vidalnft.setApprovalForAll(farm.address, true)

  
 const test = await farm .addPool(
          startfiPool.address,
          startfiPoolDetails._shareAPR,
          startfiPoolDetails._shareAPRBase,
          startfiPoolDetails._minimumStake,
          startfiPoolDetails._cap,
          startfiPoolDetails._totalShare,
          startfiPoolDetails._totalShareBase
        )
 
  console.log({test});
await farm.addPool(
    RAGPool.address,
    ragPoolDetails._shareAPR,
    ragPoolDetails._shareAPRBase,
    ragPoolDetails._minimumStake,
    ragPoolDetails._cap,
    ragPoolDetails._totalShare,
    ragPoolDetails._totalShareBase
  )
 await farm.addPool(
    nextPool.address,
     nextPoolDetails._shareAPR,
        nextPoolDetails._shareAPRBase,
        nextPoolDetails._minimumStake,
        nextPoolDetails._cap,
        nextPoolDetails._totalShare,
        nextPoolDetails._totalShareBase
  )
  let tokenId = 0
  for await (let value of generateSequence(1, vidalMax)) {
  await farm.addTokenReward(
      
      tokenId,
      vidalNFTDetails._priceInPoint,
      vidalNFTDetails._minimumStakeRequired,
      vidalnft.address,
      owner,
      AddressZero
    )
    tokenId++
  }
  for await (let value of generateSequence(1, nextMax)) {
   await farm.addTokenReward(
      tokenId,
      nextNftDetails._priceInPoint,
      nextNftDetails._minimumStakeRequired,
      vidalnft.address,
      owner,
      AddressZero
    )
    tokenId++
  }
  for await (let value of generateSequence(1, ragMax)) {
   await farm.addTokenReward(
      tokenId,
      ragNftDetails._priceInPoint,
      ragNftDetails._minimumStakeRequired,
      vidalnft.address,
      owner,
      AddressZero
    )
    tokenId++
  }   
 console.log(tokenId);
  
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
