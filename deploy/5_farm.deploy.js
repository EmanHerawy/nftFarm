// deploy/00_deploy_my_contract.js
const ethers = require('ethers')
const { constants, BigNumber } = ethers
const { AddressZero } = constants
function expandTo18Decimals(n) {
  return BigNumber.from(n).mul(BigNumber.from(10).pow(18))
}
function* generateSequence(start, end) {
  for (let i = start; i <= end; i++) {
    yield i
  }
}
let baseUri = 'http://ipfs.io'
const name1 = 'StartFiToken'
const symbol1 = 'STFI'
const name2 = 'NexType'
const symbol2 = 'NT'
const name3 = 'Rage Fan'
const symbol3 = 'RAG'
module.exports = async ({ getNamedAccounts, deployments, network }) => {
  // let StartfiFarm = await ethers.getContractFactory('StartfiFarm')
  const { deploy, execute, get } = deployments

  const { deployer } = await getNamedAccounts()

  // generate dummy setup test data
  const startfiPool = await deploy('AnyERC20', {
    from: deployer,
    args: [name1, symbol1, expandTo18Decimals(100000000), deployer],
    log: true,
  })
  const nextPool = await deploy('AnyERC20', {
    from: deployer,
    args: [name2, symbol2, expandTo18Decimals(100000000), deployer],
    log: true,
  })
  const RAGPool = await deploy('AnyERC20', {
    from: deployer,
    args: [name3, symbol3, expandTo18Decimals(100000000), deployer],
    log: true,
  })
  const user1 = deployer //"0x7e33ca6d5fe6a06ae484E81262ACB74919Dc25fb"
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

  const dayInSec = 24 * 60 * 60
  const vidalMax = 1
  const nextMax = 3
  const ragMax = 10
  const launchTime = 1639409512 + dayInSec * 5 // after 5 days from now
  const deadline = launchTime + dayInSec * 30
  const releaseTime = deadline + dayInSec * 50
  const vidalnft = await get('AnyERC721')

  for await (let value of generateSequence(1, ragMax + vidalMax + ragMax)) {
    await execute(
      'AnyERC721',
      { from: deployer },
      'mint',

      deployer
    )
  }
  // deploy farm
  const farm = await deploy('StartfiFarm', {
    from: deployer,
    args: [launchTime, deadline, releaseTime],
    log: true,
  })

  /********************setup goes here******************************* */
  // mint test reward

  await execute('AnyERC721', { from: deployer }, 'setApprovalForAll', farm.address, true)
  await execute(
    'StartfiFarm',
    { from: deployer },
    'addPool',
    nextPool.address,
    nextPoolDetails._shareAPR,
    nextPoolDetails._shareAPRBase,
    nextPoolDetails._minimumStake,
    nextPoolDetails._cap,
    nextPoolDetails._totalShare,
    nextPoolDetails._totalShareBase
  )
  await execute(
    'StartfiFarm',
    { from: deployer },
    'addPool',
    RAGPool.address,
    ragPoolDetails._shareAPR,
    ragPoolDetails._shareAPRBase,
    ragPoolDetails._minimumStake,
    ragPoolDetails._cap,
    ragPoolDetails._totalShare,
    ragPoolDetails._totalShareBase
  )
  await execute(
    'StartfiFarm',
    { from: deployer },
    'addPool',
    startfiPool.address,
    ragPoolDetails._shareAPR,
    ragPoolDetails._shareAPRBase,
    ragPoolDetails._minimumStake,
    ragPoolDetails._cap,
    ragPoolDetails._totalShare,
    ragPoolDetails._totalShareBase
  )
  let tokenId = 0
  for await (let value of generateSequence(1, vidalMax)) {
    await execute(
      'StartfiFarm',
      { from: deployer },
      'addTokenReward',
      tokenId,
      vidalNFTDetails._priceInPoint,
      vidalNFTDetails._minimumStakeRequired,
      vidalnft.address,
      deployer,
      AddressZero
    )
    tokenId++
  }
  for await (let value of generateSequence(1, nextMax)) {
    await execute(
      'StartfiFarm',
      { from: deployer },
      'addTokenReward',
      tokenId,
      nextNftDetails._priceInPoint,
      nextNftDetails._minimumStakeRequired,
      vidalnft.address,
      deployer,
      AddressZero
    )
    tokenId++
  }
  for await (let value of generateSequence(1, ragMax)) {
    await execute(
      'StartfiFarm',
      { from: deployer },
      'addTokenReward',
      tokenId,
      ragNftDetails._priceInPoint,
      ragNftDetails._minimumStakeRequired,
      vidalnft.address,
      deployer,
      AddressZero
    )
    tokenId++
  }
}

module.exports.tags = ['StartfiFarm']
