import chai, { expect } from 'chai'
import { Contract, constants, BigNumber } from 'ethers'
import { waffle } from 'hardhat'
const { solidity, deployContract, createFixtureLoader, provider } = waffle

import { tokenFixture } from './shared/fixtures'
import { expandTo18Decimals } from './shared/utilities'

import StartfiFarm from '../artifacts/contracts/StartfiFarm.sol/StartfiFarm.json'
const { AddressZero } = constants

chai.use(solidity)

let blockBefore: any
const dayInSec = 24 * 60 * 60
let launchTime: number // after 2 days from now
let deadline: number // after 5 days
let releaseTime: number // after 5 days
const vidalMax = 10
const nextMax = 30
const ragMax = 100
// const vidalMax = 2
// const nextMax = 3
// const ragMax = 10
function* generateSequence(start: number, end: number) {
  for (let i = start; i <= end; i++) {
    yield i
  }
}
// describe('Startfi Farm : checking cap and rewards', () => {
//   /**Basic Numbers:
// Seconds per day = 86,400
// Seconds per 30 Days = 2,592,000

// Farm Pools: 3 Pools (STFI, NT, RAG)
// Period: 30 Days

// STFI Pool:
// Interest rate per second 0.00000385802 rSTFI   0.000023148148148148147 %
// 6000 * 0.000038580246913580246 * (60*60*24)*30
// 600000
// Minimum staked amount 1000 STFI
// how many token this pool can hold (What do you mean?)
// pool total share  of RSTFI in the whole farm 20%
// NT Pool:
// Interest rate per second 0.00000385802 rSTFI
// Minimum staked amount 1000 NT
// how many token this pool can hold (What do you mean?)
// pool total share  of RSTFI in the whole farm 30%
// RAG Pool:
// Interest rate per second 0.0000385802 rSTFI  // 0.000038580246913580246
// 10000*(10000/25920000000)*(30*24*60*60)
// 10000
// Minimum staked amount 100 RAG
// how many token this pool can hold (What do you mean?)
// pool total share  of RSTFI in the whole farm 50%
//  */
//   const [wallet, other, user1, user2, user3] = provider.getWallets()
//   const loadFixture = createFixtureLoader([wallet])

//   let farm: Contract
//   let startfiPool: Contract
//   let nextPool: Contract
//   let RAGPool: Contract
//   let testTokenPool: Contract
//   let vidalnft: Contract
//   let nextNft: Contract
//   let RagNft: Contract
//   const startfiPoolDetails = {
//    _shareAPR: BigNumber.from("38580246913580246"),
//     _shareAPRBase:BigNumber.from( "10000"),
//     _minimumStake:expandTo18Decimals (1000),
//     _cap: expandTo18Decimals(4000),
//     _totalShare: 20,
//     _totalShareBase: 1,
//   }
//   const nextPoolDetails = {
//       _shareAPR: BigNumber.from("00003858"),
//     _shareAPRBase: BigNumber.from( "10000"),
//     _minimumStake: expandTo18Decimals(1000),
//     _cap: expandTo18Decimals(6000),
//     _totalShare: 30,
//     _totalShareBase: 1,
//   }
//   const ragPoolDetails = {
//     _shareAPR: BigNumber.from("38580246913580246"),
//     _shareAPRBase:BigNumber.from( "10000"),
//     _minimumStake: expandTo18Decimals(100),
//     _cap: expandTo18Decimals(10000),
//     _totalShare: 30,
//     _totalShareBase: 1,
//   }
//   const vidalNFTDetails = {
//     _tokenId: 0,
//     _priceInPoint: expandTo18Decimals(40000),
//     _minimumStakeRequired: 0,
//     _nftAddress: null,
//     _owner: user1,
//     _tokenLinked: null,
//   }
//   const nextNftDetails = {
//     _tokenId: 0,
//     _priceInPoint: expandTo18Decimals(20000),
//     _minimumStakeRequired: 0,
//     _nftAddress: null,
//     _owner: user1,
//     _tokenLinked: null,
//   }
//   const ragNftDetails = {
//     _tokenId: 0,
//     _priceInPoint: expandTo18Decimals(10000),
//     _minimumStakeRequired: 0,
//     _nftAddress: null,
//     _owner: user1,
//     _tokenLinked: null,
//   }
//   /**StartFi (STFI): Cap: 20% = $4,000 USD = 400,000 rSTFI
// NexType (NT): Cap 30% = $6,000 USD = 600,000 rSTFI
// Rage Fan(RAG): Cap 50% = $10,000 USD = 1,000,000 rSTFI
//  */

//   before(async () => {
//     const fixture = await loadFixture(tokenFixture)
//     RAGPool = fixture.RAG
//     testTokenPool = fixture.testToken
//     startfiPool = fixture.startfi
//     nextPool = fixture.NexType
//     vidalnft = fixture.VidalNFT
//     nextNft = fixture.NextNFT
//     RagNft = fixture.RAGNFT
//     const blockNumBefore = await provider.getBlockNumber()
//     blockBefore = await provider.getBlock(blockNumBefore)
//     launchTime = blockBefore.timestamp + dayInSec * 2 // after 2 days from now
//     deadline = launchTime + dayInSec * 30
//     releaseTime = deadline + dayInSec * 50
//     farm = await deployContract(wallet, StartfiFarm, [launchTime, deadline, releaseTime])
//     await vidalnft.setApprovalForAll(farm.address, true)
//     await nextNft.setApprovalForAll(farm.address, true)
//     await RagNft.setApprovalForAll(farm.address, true)
//     console.log(deadline-launchTime,'time inveriant');

//     const ragReward =await farm._calcReward(ragPoolDetails._cap,
//       ragPoolDetails._shareAPR,
//       ragPoolDetails._shareAPRBase,

//      2592000);
//     console.log({ragReward});
//     console.log(ragReward.toString(),'reward');

//   })

//   it('checking launch time and deadline ', async () => {
//     expect(await farm.launchTime()).to.eq(launchTime)
//     expect(await farm.farmDeadline()).to.eq(deadline)

//   })

//   // it('Only owner can add pools to farm ', async () => {
//   //   await expect(
//   //     farm
//   //       .connect(user1)
//   //       .addPool(
//   //         startfiPool.address,
//   //         startfiPoolDetails._shareAPR,
//   //         startfiPoolDetails._shareAPRBase,
//   //         startfiPoolDetails._minimumStake,
//   //         startfiPoolDetails._cap,
//   //         startfiPoolDetails._totalShare,
//   //         startfiPoolDetails._totalShareBase
//   //       )
//   //   ).to.be.reverted
//   //   await expect(
//   //     farm
//   //       .connect(wallet)
//   //       .addPool(
//   //         startfiPool.address,
//   //         startfiPoolDetails._shareAPR,
//   //         startfiPoolDetails._shareAPRBase,
//   //         startfiPoolDetails._minimumStake,
//   //         startfiPoolDetails._cap,
//   //         startfiPoolDetails._totalShare,
//   //         startfiPoolDetails._totalShareBase
//   //       )
//   //   ).to.emit(farm,'PoolAdded')
//   //   await expect(
//   //     farm.addPool(
//   //       startfiPool.address,
//   //       startfiPoolDetails._shareAPR,
//   //       startfiPoolDetails._shareAPRBase,
//   //       startfiPoolDetails._minimumStake,
//   //       startfiPoolDetails._cap,
//   //       startfiPoolDetails._totalShare,
//   //       startfiPoolDetails._totalShareBase
//   //     )
//   //   ).to.be.revertedWith('Duplicated value is not allowed')
//   //   await expect(
//   //     farm.addPool(
//   //       nextPool.address,
//   //       nextPoolDetails._shareAPR,
//   //       nextPoolDetails._shareAPRBase,
//   //       nextPoolDetails._minimumStake,
//   //       nextPoolDetails._cap,
//   //       nextPoolDetails._totalShare,
//   //       nextPoolDetails._totalShareBase
//   //     )
//   //   ).to.emit(farm,'PoolAdded')
//   //   await expect(
//   //     farm.addPool(
//   //       RAGPool.address,
//   //       ragPoolDetails._shareAPR,
//   //       ragPoolDetails._shareAPRBase,
//   //       ragPoolDetails._minimumStake,
//   //       ragPoolDetails._cap,
//   //       ragPoolDetails._totalShare,
//   //       ragPoolDetails._totalShareBase
//   //     )
//   //   ).to.emit(farm,'PoolAdded')
//   //   await expect(
//   //     farm.addPool(
//   //       testTokenPool.address,
//   //       ragPoolDetails._shareAPR,
//   //       ragPoolDetails._shareAPRBase,
//   //       ragPoolDetails._minimumStake,
//   //       ragPoolDetails._cap,
//   //       ragPoolDetails._totalShare,
//   //       ragPoolDetails._totalShareBase
//   //     )
//   //   ).to.be.revertedWith('exceed cap')
//   //   // expect(awai`t farm.farmDeadline()).to.eq(deadline);
//   // })

//   // it('Only owner can add reward tokens to farm ', async () => {
//   //   await expect(
//   //     farm
//   //       .connect(user1)
//   //       .addTokenReward(
//   //         vidalNFTDetails._tokenId,
//   //         vidalNFTDetails._priceInPoint,
//   //         vidalNFTDetails._minimumStakeRequired,
//   //         vidalnft.address,
//   //         wallet.address,
//   //         AddressZero
//   //       )
//   //   ).to.be.reverted

//   //   for await (let value of generateSequence(1, vidalMax)) {
//   //     await expect(
//   //       farm
//   //         .connect(wallet)
//   //         .addTokenReward(
//   //           value - 1,
//   //           vidalNFTDetails._priceInPoint,
//   //           vidalNFTDetails._minimumStakeRequired,
//   //           vidalnft.address,
//   //           wallet.address,
//   //           AddressZero
//   //         )
//   //     ).to.emit(farm,'PoolAdded')
//   //   }
//   //   for await (let value of generateSequence(1, nextMax)) {
//   //     await expect(
//   //       farm
//   //         .connect(wallet)
//   //         .addTokenReward(
//   //           value - 1,
//   //           nextNftDetails._priceInPoint,
//   //           nextNftDetails._minimumStakeRequired,
//   //           nextNft.address,
//   //           wallet.address,
//   //           nextPool.address
//   //         )
//   //     ).to.emit(farm,'PoolAdded')
//   //   }

//   //   for await (let value of generateSequence(1, ragMax)) {
//   //     await expect(
//   //       farm
//   //         .connect(wallet)
//   //         .addTokenReward(
//   //           value - 1,
//   //           ragNftDetails._priceInPoint,
//   //           ragNftDetails._minimumStakeRequired,
//   //           RagNft.address,
//   //           wallet.address,
//   //           AddressZero
//   //         )
//   //     ).to.emit(farm,'PoolAdded')
//   //   }

//   //   const cap =
//   //     vidalNFTDetails._priceInPoint.mul(vidalMax).add(nextNftDetails._priceInPoint.mul(
//   //       nextMax).add(ragNftDetails._priceInPoint.mul(ragMax)));

//   //   expect(await farm.cap()).to.eq(cap)
//   // })
//   // it('user can stake or unstake before launch time ', async () => {
//   //   // distribute token between test accounts
//   //   await startfiPool.transfer(other.address,startfiPoolDetails._cap)

//   //   await nextPool.transfer(other.address, nextPoolDetails._cap)

//   //   await RAGPool.transfer(other.address,ragPoolDetails._cap)

//   //   await startfiPool.connect(other).approve(farm.address, startfiPoolDetails._cap)
//   //   await expect(startfiPool.connect(user1).approve(farm.address, startfiPoolDetails._cap))
//   //     .to.emit(startfiPool, 'Approval')
//   //     .withArgs(user1.address, farm.address, startfiPoolDetails._cap)

//   //   await nextPool.connect(other).approve(farm.address, nextPoolDetails._cap)

//   //   await RAGPool.connect(other).approve(farm.address, ragPoolDetails._cap)

//   //   await expect(farm.connect(other).stake(startfiPool.address, startfiPoolDetails._cap)).to.emit(farm,'Stake')
//   //   await expect(farm.connect(other).stake(nextPool.address, nextPoolDetails._cap)).to.emit(farm,'Stake')
//   //   await expect(farm.connect(other).stake(RAGPool.address, ragPoolDetails._cap)).to.emit(farm,'Stake')
//   //    })

//   // it('go in time to the fram end time , user can unstake , unstakeBatch or claim regardless the time as long as balalnce is enough ', async () => {
//   //   await provider.send('evm_increaseTime', [launchTime])
//   //   await provider.send('evm_mine', [])

//   //   const reward = await farm.userRewards(other.address);
//   //   console.log({reward});
//   //   console.log(reward.toString());

//   //  })
// })
describe('Startfi Farm', () => {
  /**Basic Numbers: 
Seconds per day = 86,400
Seconds per 30 Days = 2,592,000

Farm Pools: 3 Pools (STFI, NT, RAG)
Period: 30 Days

STFI Pool:
Interest rate per second 0.00000385802 rSTFI   0.000023148148148148147 %  
6000 * 0.000038580246913580246 * (60*60*24)*30
600000
Minimum staked amount 1000 STFI
how many token this pool can hold (What do you mean?)
pool total share  of RSTFI in the whole farm 20%
NT Pool:
Interest rate per second 0.00000385802 rSTFI
Minimum staked amount 1000 NT
how many token this pool can hold (What do you mean?)
pool total share  of RSTFI in the whole farm 30%
RAG Pool:
Interest rate per second 0.0000385802 rSTFI  // 0.000038580246913580246
10000*(10000/25920000000)*(30*24*60*60)
10000
Minimum staked amount 100 RAG
how many token this pool can hold (What do you mean?)
pool total share  of RSTFI in the whole farm 50%
 */
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
    _cap: expandTo18Decimals(10000),
    _totalShare: 30,
    _totalShareBase: 1,
  }
  const vidalNFTDetails = {
    _tokenId: 0,
    _priceInPoint: expandTo18Decimals(40000),
    _minimumStakeRequired: 0,
    _nftAddress: null,
    _owner: user1,
    _tokenLinked: null,
  }
  const nextNftDetails = {
    _tokenId: 0,
    _priceInPoint: expandTo18Decimals(20000),
    _minimumStakeRequired: 0,
    _nftAddress: null,
    _owner: user1,
    _tokenLinked: null,
  }
  const ragNftDetails = {
    _tokenId: 0,
    _priceInPoint: expandTo18Decimals(10000),
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
    deadline = launchTime + dayInSec * 30
    releaseTime = deadline + dayInSec * 50
    farm = await deployContract(wallet, StartfiFarm, [launchTime, deadline, releaseTime])
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
    ).to.emit(farm, 'PoolAdded')
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
    ).to.emit(farm, 'PoolAdded')
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
    ).to.emit(farm, 'PoolAdded')
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
      ).to.emit(farm, 'RewardAdded')
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
      ).to.emit(farm, 'RewardAdded')
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
      ).to.emit(farm, 'RewardAdded')
    }

    const cap = vidalNFTDetails._priceInPoint
      .mul(vidalMax)
      .add(nextNftDetails._priceInPoint.mul(nextMax).add(ragNftDetails._priceInPoint.mul(ragMax)))
    console.log(cap.toHexString(), 'cap')

    expect(await farm.cap()).to.eq(cap)
  })
  it('user can stake or unstake before launch time ', async () => {
    // distribute token between test accounts
    await startfiPool.transfer(other.address, expandTo18Decimals(10000))
    await startfiPool.transfer(user1.address, expandTo18Decimals(10000))
    await startfiPool.transfer(user2.address, expandTo18Decimals(10000))
    await startfiPool.transfer(user3.address, expandTo18Decimals(10000))

    await nextPool.transfer(other.address, expandTo18Decimals(10000))
    await nextPool.transfer(user1.address, expandTo18Decimals(20000))
    await nextPool.transfer(user2.address, expandTo18Decimals(20000))
    await nextPool.transfer(user3.address, expandTo18Decimals(10000))

    await RAGPool.transfer(other.address, expandTo18Decimals(30000))
    await RAGPool.transfer(user1.address, expandTo18Decimals(20000))
    await RAGPool.transfer(user2.address, expandTo18Decimals(30000))
    await RAGPool.transfer(user3.address, expandTo18Decimals(20000))

    // approve
    let balance = await startfiPool.balanceOf(user1.address)
    let allownce = await startfiPool.allowance(user1.address, farm.address)

    await startfiPool.connect(other).approve(farm.address, expandTo18Decimals(1000))
    await expect(startfiPool.connect(user1).approve(farm.address, expandTo18Decimals(1000)))
      .to.emit(startfiPool, 'Approval')
      .withArgs(user1.address, farm.address, expandTo18Decimals(1000))
    await startfiPool.connect(user2).approve(farm.address, expandTo18Decimals(1000))
    await startfiPool.connect(user3).approve(farm.address, expandTo18Decimals(1000))

    await nextPool.connect(other).approve(farm.address, expandTo18Decimals(2000))
    await nextPool.connect(user1).approve(farm.address, expandTo18Decimals(2000))
    await nextPool.connect(user2).approve(farm.address, expandTo18Decimals(1000))
    await nextPool.connect(user3).approve(farm.address, expandTo18Decimals(1000))

    await RAGPool.connect(other).approve(farm.address, expandTo18Decimals(3000))
    await RAGPool.connect(user1).approve(farm.address, expandTo18Decimals(2000))
    await RAGPool.connect(user2).approve(farm.address, expandTo18Decimals(3000))
    await RAGPool.connect(user3).approve(farm.address, expandTo18Decimals(2000))

    await expect(farm.connect(other).stake(startfiPool.address, expandTo18Decimals(1000))).to.emit(farm, 'Stake')
    await expect(farm.connect(other).stake(nextPool.address, expandTo18Decimals(2000))).to.emit(farm, 'Stake')
    await expect(farm.connect(other).stake(RAGPool.address, expandTo18Decimals(3000))).to.emit(farm, 'Stake')
    await expect(farm.connect(other).unstake(RAGPool.address)).to.be.reverted
    await expect(farm.connect(other).unStakeEarly(RAGPool.address)).to.emit(farm, 'Unstake')
    await RAGPool.connect(other).approve(farm.address, expandTo18Decimals(3000))

    await expect(farm.connect(other).stake(RAGPool.address, expandTo18Decimals(3000))).to.emit(farm, 'Stake')

    //   const test =await  farm.connect(user1).stake(startfiPool.address, expandTo18Decimals (2000))
    // console.log(test);
    await expect(
      farm
        .connect(user1)
        .stakeBatch(
          [startfiPool.address, nextPool.address, RAGPool.address],
          [expandTo18Decimals(1000), expandTo18Decimals(2000), expandTo18Decimals(2000)]
        )
    ).to.emit(farm, 'Stake')

    // await expect(farm.connect(user1).stake(startfiPool.address, expandTo18Decimals (2000))).to.emit(farm,'Stake')
    // await expect(farm.connect(user1).stake(nextPool.address, expandTo18Decimals (1000))).to.emit(farm,'Stake')
    // await expect(farm.connect(user1).stake(RAGPool.address, expandTo18Decimals (2000))).to.emit(farm,'Stake')

    await expect(farm.connect(user2).stake(startfiPool.address, expandTo18Decimals(1000))).to.emit(farm, 'Stake')
    await expect(farm.connect(user2).stake(nextPool.address, expandTo18Decimals(1000))).to.emit(farm, 'Stake')
    await expect(farm.connect(user2).stake(RAGPool.address, expandTo18Decimals(3000))).to.emit(farm, 'Stake')

    await expect(farm.connect(user3).stake(startfiPool.address, expandTo18Decimals(1000))).to.emit(farm, 'Stake')
    await expect(farm.connect(user3).stake(nextPool.address, expandTo18Decimals(1000))).to.emit(farm, 'Stake')
    await expect(farm.connect(user3).stake(RAGPool.address, expandTo18Decimals(2000))).to.emit(farm, 'Stake')
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
    const rewards = await await farm.userRewards(other.address)
    console.log(rewards, 'rewardssssssss')

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
      }
      await expect(farm.connect(user1).redeemBatch([startfiPool.address, nextPool.address, RAGPool.address])).to.emit(
        farm,
        'Redeem'
      )
      expect(await farm.connect(user3).redeem(RAGPool.address)).to.emit(farm, 'Redeem')
    }
    // await provider.send('evm_increaseTime', [launchTime + dayInSec])
    // await provider.send('evm_mine', [])
    // user1Test = await farm.test(user1.address)
    // ///uint256 _totalRewards ,uint256 currentBlock,uint256 timestamp
    // console.log(user1Test._totalRewards.toNumber(), 'user1 rewards 222222')
    // console.log(user1Test.currentBlock.toNumber(), 'user1 currentBlock 22222')
    // console.log(user1Test.timestamp.toNumber(), 'user1 timestamp 22222222')
    // let calc = await farm._calcReward(4, startfiPoolDetails._shareAPR, startfiPoolDetails._shareAPRBase, 172787)
    // console.log(calc.toNumber(), 'calc')
  })

  it('go in time to the fram end time , user can unstake , unstakeBatch or claim regardless the time as long as balalnce is enough ', async () => {
    await provider.send('evm_increaseTime', [launchTime])
    await provider.send('evm_mine', [])

    const othertestBlock = await farm.testBlock(other.address, RAGPool.address)
    const otherReward = await farm.userRewards(other.address)
    const user1Reward = await farm.userRewards(user1.address)
    const user2Reward = await farm.userRewards(user2.address)
    const user3Reward = await farm.userRewards(user3.address)
    console.log({ othertestBlock })
    console.log({ user3Reward })
    console.log({ user2Reward })
    console.log({ user1Reward })
    console.log({ otherReward })

    
    // let user1CalcRewards = await farm._calcReward(
    //   expandTo18Decimals(1000),
    //   startfiPoolDetails._shareAPR,
    //   startfiPoolDetails._shareAPRBase,

    //   2592000
    // )
    // console.log({ user1CalcRewards })

    // user1CalcRewards = await farm._calcReward(
    //   expandTo18Decimals(2000),
    //   nextPoolDetails._shareAPR,
    //   nextPoolDetails._shareAPRBase,

    //   2592000
    // )
    // console.log({ user1CalcRewards })
    // user1CalcRewards = await farm._calcReward(
    //   expandTo18Decimals(2000),
    //   ragPoolDetails._shareAPR,
    //   ragPoolDetails._shareAPRBase,

    //   2592000
    // )
    // console.log({ user1CalcRewards })
  let  user1CalcRewards = await farm._calcReward(
      expandTo18Decimals(5000),
      ragPoolDetails._shareAPR,
      ragPoolDetails._shareAPRBase,

      2592000
    )
    console.log({ user1CalcRewards })

     await expect(
      farm.connect(other).redeemAndClaim([startfiPool.address, nextPool.address, RAGPool.address], 5)
    ).to.emit(farm, 'RewardClaimed')
    await expect(farm.connect(other).unstake(RAGPool.address)).to.emit(farm, 'Unstake')
    await expect(farm.connect(other).unstakeBatch([startfiPool.address, nextPool.address])).to.emit(farm, 'Unstake')
    await expect(farm.connect(user1).unstakeBatch([startfiPool.address, nextPool.address, RAGPool.address])).to.emit(
      farm,
      'Unstake'
    )
    await expect(farm.connect(user2).unstakeBatch([startfiPool.address, nextPool.address, RAGPool.address])).to.emit(
      farm,
      'Unstake'
    )
    await expect(farm.connect(user3).unstakeBatch([startfiPool.address, nextPool.address, RAGPool.address])).to.emit(
      farm,
      'Unstake'
    )
    const otherBalance = await farm.balanceOf(other.address)
    console.log({ otherBalance })
    const user1Balance = await farm.balanceOf(user1.address)
    console.log({ user1Balance })
    const total = await farm.totalSupply();
    console.log({total});
    await expect(farm.connect(user1).claim(6)).to.emit(farm, 'RewardClaimed')
    await expect(farm.connect(user3).claim(7)).to.emit(farm, 'RewardClaimed')
  })
})
