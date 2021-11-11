import chai, { expect } from 'chai'
import { Contract, constants, BigNumber } from 'ethers'

import { solidity, MockProvider, deployContract, createFixtureLoader } from 'ethereum-waffle'
import { tokenFixture } from './shared/fixtures'

import StartfiFarm from '../artifacts/contracts/StartfiFarm.sol/StartfiFarm.json'
const { AddressZero } = constants

chai.use(solidity)

let blockBefore: any
const dayInSec = 24 * 60 * 60
let launchTime: number // after 2 days from now
let deadline: number // after 5 days
// const vidalMax = 10
// const nextMax = 30
// const ragMax = 100
const vidalMax = 2
const nextMax = 3
const ragMax = 10
function* generateSequence(start: number, end: number) {
  for (let i = start; i <= end; i++) {
    yield i
  }
}
describe('Startfi Farm', () => {
  const provider = new MockProvider()
  const [wallet, other, user1, user2, user3] = provider.getWallets()
  const loadFixture = createFixtureLoader([wallet])

  let farm: Contract
  let startfiPool: Contract
  let nextPool: Contract
  let RAGPool: Contract
  let testTokenPool: Contract
  let vidalnft: Contract
  let nextNft: Contract
  let RagNft: Contract
  const startfiPoolDetails = {
    _shareAPR: 1,
    _shareAPRBase: 100,
    _minimumStake: 5,
    _cap: 400000,
    _totalShare: 20,
    _totalShareBase: 1,
  }
  const nextPoolDetails = {
    _shareAPR: 1,
    _shareAPRBase: 100,
    _minimumStake: 5,
    _cap: 600000,
    _totalShare: 30,
    _totalShareBase: 1,
  }
  const ragPoolDetails = {
    _shareAPR: 1,
    _shareAPRBase: 100,
    _minimumStake: 5,
    _cap: 600000,
    _totalShare: 30,
    _totalShareBase: 1,
  }
  const vidalNFTDetails = {
    _tokenId: 0,
    _priceInPoint: 40000,
    _minimumStakeRequired: 0,
    _nftAddress: null,
    _owner: user1,
    _tokenLinked: null,
  }
  const nextNftDetails = {
    _tokenId: 0,
    _priceInPoint: 40000,
    _minimumStakeRequired: 0,
    _nftAddress: null,
    _owner: user1,
    _tokenLinked: null,
  }
  const ragNftDetails = {
    _tokenId: 0,
    _priceInPoint: 10000,
    _minimumStakeRequired: 0,
    _nftAddress: null,
    _owner: user1,
    _tokenLinked: null,
  }
  /**StartFi (STFI): Cap: 20% = $4,000 USD = 400,000 rSTFI
NexType (NT): Cap 30% = $6,000 USD = 600,000 rSTFI
Rage Fan(RAG): Cap 50% = $10,000 USD = 1,000,000 rSTFI
 */

  before(async () => {
    const fixture = await loadFixture(tokenFixture)
    RAGPool = fixture.RAG
    testTokenPool = fixture.testToken
    startfiPool = fixture.startfi
    nextPool = fixture.NexType
    vidalnft = fixture.VidalNFT
    nextNft = fixture.NextNFT
    RagNft = fixture.RAGNFT
    const blockNumBefore = await provider.getBlockNumber()
    blockBefore = await provider.getBlock(blockNumBefore)
    launchTime = blockBefore.timestamp + dayInSec * 2 // after 2 days from now
    deadline = launchTime + dayInSec * 5
    farm = await deployContract(wallet, StartfiFarm, [launchTime, deadline])
    await vidalnft.setApprovalForAll(farm.address, true)
    await nextNft.setApprovalForAll(farm.address, true)
    await RagNft.setApprovalForAll(farm.address, true)
  })

  it('checking launch time and deadline ', async () => {
    expect(await farm.launchTime()).to.eq(launchTime)
    expect(await farm.farmDeadline()).to.eq(deadline)
  })

  it('Only owner can add pools to farm ', async () => {
    await expect(
      farm
        .connect(user1)
        .addPool(
          startfiPool.address,
          startfiPoolDetails._shareAPR,
          startfiPoolDetails._shareAPRBase,
          startfiPoolDetails._minimumStake,
          startfiPoolDetails._cap,
          startfiPoolDetails._totalShare,
          startfiPoolDetails._totalShareBase
        )
    ).to.be.reverted
    await expect(
      farm
        .connect(wallet)
        .addPool(
          startfiPool.address,
          startfiPoolDetails._shareAPR,
          startfiPoolDetails._shareAPRBase,
          startfiPoolDetails._minimumStake,
          startfiPoolDetails._cap,
          startfiPoolDetails._totalShare,
          startfiPoolDetails._totalShareBase
        )
    ).to.not.be.reverted
    await expect(
      farm.addPool(
        startfiPool.address,
        startfiPoolDetails._shareAPR,
        startfiPoolDetails._shareAPRBase,
        startfiPoolDetails._minimumStake,
        startfiPoolDetails._cap,
        startfiPoolDetails._totalShare,
        startfiPoolDetails._totalShareBase
      )
    ).to.be.revertedWith('Duplicated value is not allowed')
    await expect(
      farm.addPool(
        nextPool.address,
        nextPoolDetails._shareAPR,
        nextPoolDetails._shareAPRBase,
        nextPoolDetails._minimumStake,
        nextPoolDetails._cap,
        nextPoolDetails._totalShare,
        nextPoolDetails._totalShareBase
      )
    ).to.not.be.reverted
    await expect(
      farm.addPool(
        RAGPool.address,
        ragPoolDetails._shareAPR,
        ragPoolDetails._shareAPRBase,
        ragPoolDetails._minimumStake,
        ragPoolDetails._cap,
        ragPoolDetails._totalShare,
        ragPoolDetails._totalShareBase
      )
    ).to.not.be.reverted
    await expect(
      farm.addPool(
        testTokenPool.address,
        ragPoolDetails._shareAPR,
        ragPoolDetails._shareAPRBase,
        ragPoolDetails._minimumStake,
        ragPoolDetails._cap,
        ragPoolDetails._totalShare,
        ragPoolDetails._totalShareBase
      )
    ).to.be.revertedWith('exceed cap')
    // expect(awai`t farm.farmDeadline()).to.eq(deadline);
  })

  it('Only owner can add reward tokens to farm ', async () => {
    await expect(
      farm
        .connect(user1)
        .addTokenReward(
          vidalNFTDetails._tokenId,
          vidalNFTDetails._priceInPoint,
          vidalNFTDetails._minimumStakeRequired,
          vidalnft.address,
          wallet.address,
          AddressZero
        )
    ).to.be.reverted

    for await (let value of generateSequence(1, vidalMax)) {
      await expect(
        farm
          .connect(wallet)
          .addTokenReward(
            value - 1,
            vidalNFTDetails._priceInPoint,
            vidalNFTDetails._minimumStakeRequired,
            vidalnft.address,
            wallet.address,
            AddressZero
          )
      ).to.not.be.reverted
    }
    for await (let value of generateSequence(1, nextMax)) {
      await expect(
        farm
          .connect(wallet)
          .addTokenReward(
            value - 1,
            nextNftDetails._priceInPoint,
            nextNftDetails._minimumStakeRequired,
            nextNft.address,
            wallet.address,
            nextPool.address
          )
      ).to.not.be.reverted
    }

    for await (let value of generateSequence(1, ragMax)) {
      await expect(
        farm
          .connect(wallet)
          .addTokenReward(
            value - 1,
            ragNftDetails._priceInPoint,
            ragNftDetails._minimumStakeRequired,
            RagNft.address,
            wallet.address,
            AddressZero
          )
      ).to.not.be.reverted
    }

    const cap =
      vidalMax * vidalNFTDetails._priceInPoint +
      nextMax * nextNftDetails._priceInPoint +
      ragMax * ragNftDetails._priceInPoint
    expect(await farm.cap()).to.eq(cap)
  })
  it('user can stake or unstake before launch time ', async () => {
    // distribute token between test accounts
    await startfiPool.transfer(other.address, 10000)
    await startfiPool.transfer(user1.address, 10000)
    await startfiPool.transfer(user2.address, 10000)
    await startfiPool.transfer(user3.address, 10000)

    await nextPool.transfer(other.address, 10000)
    await nextPool.transfer(user1.address, 20000)
    await nextPool.transfer(user2.address, 20000)
    await nextPool.transfer(user3.address, 10000)

    await RAGPool.transfer(other.address, 30000)
    await RAGPool.transfer(user1.address, 20000)
    await RAGPool.transfer(user2.address, 30000)
    await RAGPool.transfer(user3.address, 20000)

    // approve
    let balance = await startfiPool.balanceOf(user1.address)
    let allownce = await startfiPool.allowance(user1.address, farm.address)
    console.log(balance.toNumber(), 'balance')
    console.log(allownce.toNumber(), 'allownce1')

    await startfiPool.connect(other).approve(farm.address, 1000)
    await expect(startfiPool.connect(user1).approve(farm.address, 2000))
      .to.emit(startfiPool, 'Approval')
      .withArgs(user1.address, farm.address, 2000)
    // expect(await startfiPool.allowance(user1.address, farm.address)).to.eq(2000)
    // allownce = await startfiPool.allowance(user1.address, farm.address)
    // console.log(allownce.toNumber(),'allownce2');

    await startfiPool.connect(user2).approve(farm.address, 2000)
    await startfiPool.connect(user3).approve(farm.address, 1000)

    await nextPool.connect(other).approve(farm.address, 1000)
    await nextPool.connect(user1).approve(farm.address, 1000)
    await nextPool.connect(user2).approve(farm.address, 1000)
    await nextPool.connect(user3).approve(farm.address, 1000)

    await RAGPool.connect(other).approve(farm.address, 3000)
    await RAGPool.connect(user1).approve(farm.address, 2000)
    await RAGPool.connect(user2).approve(farm.address, 3000)
    await RAGPool.connect(user3).approve(farm.address, 2000)

    await expect(farm.connect(other).stake(startfiPool.address, 1000)).to.not.be.reverted
    await expect(farm.connect(other).stake(nextPool.address, 1000)).to.not.be.reverted
    await expect(farm.connect(other).stake(RAGPool.address, 3000)).to.not.be.reverted
    await expect(farm.connect(other).unstake(RAGPool.address)).to.be.reverted
    await expect(farm.connect(other).unStakeEarly(RAGPool.address)).to.not.be.reverted
    await RAGPool.connect(other).approve(farm.address, 3000)

    await expect(farm.connect(other).stake(RAGPool.address, 3000)).to.not.be.reverted

    //   const test =await  farm.connect(user1).stake(startfiPool.address, 2000)
    // console.log(test);
    await expect(
      farm.connect(user1).stakeBatch([startfiPool.address, nextPool.address, RAGPool.address], [2000, 1000, 2000])
    ).to.not.be.reverted

    // await expect(farm.connect(user1).stake(startfiPool.address, 2000)).to.not.be.reverted
    // await expect(farm.connect(user1).stake(nextPool.address, 1000)).to.not.be.reverted
    // await expect(farm.connect(user1).stake(RAGPool.address, 2000)).to.not.be.reverted

    await expect(farm.connect(user2).stake(startfiPool.address, 2000)).to.not.be.reverted
    await expect(farm.connect(user2).stake(nextPool.address, 1000)).to.not.be.reverted
    await expect(farm.connect(user2).stake(RAGPool.address, 2000)).to.not.be.reverted

    await expect(farm.connect(user3).stake(startfiPool.address, 1000)).to.not.be.reverted
    await expect(farm.connect(user3).stake(nextPool.address, 1000)).to.not.be.reverted
    await expect(farm.connect(user3).stake(RAGPool.address, 2000)).to.not.be.reverted
  })
  it('go in time and calculate points , user can not unstake ', async () => {
    await provider.send('evm_increaseTime', [launchTime - blockBefore.timestamp - 100])
    await provider.send('evm_mine', [])
    let blockNumBefore = await provider.getBlockNumber()
    blockBefore = await provider.getBlock(blockNumBefore)
    console.log(blockBefore.timestamp, launchTime, deadline, 'blockBefore.timestamp')
    if (blockBefore.timestamp <= launchTime) {
      expect(await farm.userRewards(other.address)).to.eq(BigNumber.from(0))
    }
    await provider.send('evm_increaseTime', [2 * dayInSec])
    await provider.send('evm_mine', [])
    blockNumBefore = await provider.getBlockNumber()
    blockBefore = await provider.getBlock(blockNumBefore)
    if (blockBefore.timestamp > launchTime) {
      expect(await farm.userRewards(other.address)).to.not.eq(0)
    }

    console.log(blockBefore.timestamp, launchTime, deadline, 'blockBefore.timestamp')
    blockNumBefore = await provider.getBlockNumber()
    blockBefore = await provider.getBlock(blockNumBefore)
    if (blockBefore.timestamp < deadline) {
      await RAGPool.connect(other).approve(farm.address, 100)

      await expect(farm.connect(other).stake(RAGPool.address, 100)).to.be.reverted

      await expect(farm.connect(other).unstake(RAGPool.address)).to.be.reverted
      await expect(farm.connect(other).unStakeEarly(RAGPool.address)).to.be.reverted
    }
    await provider.send('evm_increaseTime', [1 * dayInSec])
    await provider.send('evm_mine', [])
    blockNumBefore = await provider.getBlockNumber()
    blockBefore = await provider.getBlock(blockNumBefore)
    if (blockBefore.timestamp > launchTime) {
      const otherRewards = await farm.userRewards(other.address)
      if (otherRewards >= vidalNFTDetails._priceInPoint) {
        console.log({ otherRewards })

        await expect(
          farm.connect(other).redeemAndClaim([startfiPool.address, nextPool.address, RAGPool.address], 2)
        ).to.emit(farm, 'Transfer')
      }
      await expect(
        farm.connect(user1).redeemBatch([startfiPool.address, nextPool.address, RAGPool.address])
      ).to.emit(farm, 'Transfer')
    }
    // await provider.send('evm_increaseTime', [launchTime + dayInSec])
    // await provider.send('evm_mine', [])
    // user1Test = await farm.test(user1.address)
    // ///uint256 _totalRewards ,uint256 currentBlock,uint256 timestamp
    // console.log(user1Test._totalRewards.toNumber(), 'user1 rewards 222222')
    // console.log(user1Test.currentBlock.toNumber(), 'user1 currentBlock 22222')
    // console.log(user1Test.timestamp.toNumber(), 'user1 timestamp 22222222')
    let calc = await farm._calcReward(4, startfiPoolDetails._shareAPR, startfiPoolDetails._shareAPRBase, 172787)
    console.log(calc.toNumber(), 'calc')

    // // expect(await farm.userRewards(other.address)).to.eq(0);
    // await provider.send('evm_increaseTime', [deadline])
    // await provider.send('evm_mine', [])
    expect(await farm.connect(user3).redeem(RAGPool.address)).to.emit(farm, 'Transfer')
    // user1Test = await farm.test(user1.address)
    // ///uint256 _totalRewards ,uint256 currentBlock,uint256 timestamp
    // console.log(user1Test._totalRewards.toNumber(), 'user1 rewards 333333')
    // console.log(user1Test.currentBlock.toNumber(), 'user1 currentBlock 3333')
    // console.log(user1Test.timestamp.toNumber(), 'user1 timestamp 333')
    // console.log(deadline, 'user1 deadline 333')
    // const percentage =
    //   startfiPoolDetails._shareAPR /
    //   (startfiPoolDetails._shareAPRBase *100);
    //   const blockNumBefore = await provider.getBlockNumber();
    // const blockBefore = await provider.getBlock(blockNumBefore);
    // console.log(blockBefore.timestamp, deadline-launchTime,'blockBefore.timestamp');

    // const pointsinDay= ( 5000*percentage ) * (deadline-launchTime)
    // console.log({pointsinDay});

    //     expect(await farm._calcReward(  5000,
    //    startfiPoolDetails._shareAPR,
    //      startfiPoolDetails._shareAPRBase,
    //      deadline-launchTime)).to.eq(pointsinDay);
    // const userPools = await farm.getUserPools(other.address);
    // console.log({userPools});
    // const userPoolDetails = await farm.userPoolDetails(other.address,startfiPool.address);
    // console.log(userPoolDetails.amount.toNumber(),userPoolDetails.lastRewardBlock.toNumber(),launchTime,userPoolDetails.stakeTime.toNumber());

    //      expect(await farm.userRewards(other.address)).to.eq(pointsinDay);
  })
  // it('go in time and calculate points , user can not unstake ', async () => {
  //   await provider.send('evm_increaseTime', [(launchTime-blockBefore.timestamp ) + 100])
  //   await provider.send('evm_mine', [])
  //   // expect(await farm.userRewards(other.address)).to.eq(0);

  //   let user1Test = await farm.testTime(user1.address)
  //   console.log(blockBefore.timestamp, launchTime, deadline, ' blockBefore.timestamp')

  //   ///uint256 _totalRewards ,uint256 currentBlock,uint256 timestamp
  //   console.log(user1Test._totalRewards.toNumber(), 'user1 rewards 111111111')
  //   console.log(user1Test.currentBlock.toNumber(), 'user1 currentBlock 1111111111')
  //   console.log(user1Test.timestamp.toNumber(), 'user1 timestamp 11111111')
  //   // // await RAGPool.connect(other).approve(farm.address, 100)

  //   // await expect(farm.connect(other).stake(RAGPool.address, 100)).to.be.reverted

  //   // await expect(farm.connect(other).unstake(RAGPool.address)).to.be.reverted
  //   // await expect(farm.connect(other).unStakeEarly(RAGPool.address)).to.be.reverted
  //   // await provider.send('evm_increaseTime', [launchTime + dayInSec])
  //   // await provider.send('evm_mine', [])
  //   // user1Test = await farm.test(user1.address)
  //   // ///uint256 _totalRewards ,uint256 currentBlock,uint256 timestamp
  //   // console.log(user1Test._totalRewards.toNumber(), 'user1 rewards 222222')
  //   // console.log(user1Test.currentBlock.toNumber(), 'user1 currentBlock 22222')
  //   // console.log(user1Test.timestamp.toNumber(), 'user1 timestamp 22222222')
  //   let calc = await farm._calcReward(4, startfiPoolDetails._shareAPR, startfiPoolDetails._shareAPRBase, 172787)
  //   console.log(calc.toNumber(), 'calc')

  //   // // expect(await farm.userRewards(other.address)).to.eq(0);
  //   // await provider.send('evm_increaseTime', [deadline])
  //   // await provider.send('evm_mine', [])

  //   // user1Test = await farm.test(user1.address)
  //   // ///uint256 _totalRewards ,uint256 currentBlock,uint256 timestamp
  //   // console.log(user1Test._totalRewards.toNumber(), 'user1 rewards 333333')
  //   // console.log(user1Test.currentBlock.toNumber(), 'user1 currentBlock 3333')
  //   // console.log(user1Test.timestamp.toNumber(), 'user1 timestamp 333')
  //   // console.log(deadline, 'user1 deadline 333')
  //   // const percentage =
  //   //   startfiPoolDetails._shareAPR /
  //   //   (startfiPoolDetails._shareAPRBase *100);
  //   //   const blockNumBefore = await provider.getBlockNumber();
  //   // const blockBefore = await provider.getBlock(blockNumBefore);
  //   // console.log(blockBefore.timestamp, deadline-launchTime,'blockBefore.timestamp');

  //   // const pointsinDay= ( 5000*percentage ) * (deadline-launchTime)
  //   // console.log({pointsinDay});

  //   //     expect(await farm._calcReward(  5000,
  //   //    startfiPoolDetails._shareAPR,
  //   //      startfiPoolDetails._shareAPRBase,
  //   //      deadline-launchTime)).to.eq(pointsinDay);
  //   // const userPools = await farm.getUserPools(other.address);
  //   // console.log({userPools});
  //   // const userPoolDetails = await farm.userPoolDetails(other.address,startfiPool.address);
  //   // console.log(userPoolDetails.amount.toNumber(),userPoolDetails.lastRewardBlock.toNumber(),launchTime,userPoolDetails.stakeTime.toNumber());

  //   //      expect(await farm.userRewards(other.address)).to.eq(pointsinDay);
  // })
})