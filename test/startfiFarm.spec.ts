import chai, { expect } from 'chai'
import { Contract } from 'ethers'
import { solidity, MockProvider, deployContract, createFixtureLoader } from 'ethereum-waffle'
import { tokenFixture } from './shared/fixtures'

import StartfiFarm from '../artifacts/contracts/StartfiFarm.sol/StartfiFarm.json'
chai.use(solidity)
const dayInSec = 24 * 60 * 60
const launchTime = Date.now() + dayInSec * 2 // after 2 days from now
const deadline = launchTime + dayInSec * 5 // after 5 days

describe('Startfi Farm', () => {
  const provider = new MockProvider()
  const [wallet, other, user1, user2] = provider.getWallets()
  const loadFixture = createFixtureLoader([wallet])

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
  /**StartFi (STFI): Cap: 20% = $4,000 USD = 400,000 rSTFI
NexType (NT): Cap 30% = $6,000 USD = 600,000 rSTFI
Rage Fan(RAG): Cap 50% = $10,000 USD = 1,000,000 rSTFI
 */

  let farm: Contract
  let startfiPool: Contract
  let nextPool: Contract
  let RAGPool: Contract
  let testTokenPool: Contract
  let vidalnft: Contract
  let nextNft: Contract
  let RagNft: Contract
  before(async () => {
    const fixture = await loadFixture(tokenFixture)
    RAGPool = fixture.RAG
    testTokenPool = fixture.testToken
    startfiPool = fixture.startfi
    nextPool = fixture.NexType
    vidalnft = fixture.VidalNFT
    nextNft = fixture.NextNFT
    RagNft = fixture.RAGNFT
    farm = await deployContract(wallet, StartfiFarm, [launchTime, deadline])
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
    ).to.be.revertedWith("exceed cap")
    // expect(awai`t farm.farmDeadline()).to.eq(deadline);
  })
})
