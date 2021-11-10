import { Contract, Wallet, providers } from 'ethers'
import { deployContract, MockProvider } from 'ethereum-waffle'

import { expandTo18Decimals } from './utilities'

import ERC20 from '../../artifacts/contracts/test-supplements-contracts/AnyERC20.sol/AnyERC20.json'
import ERC721 from '../../artifacts/contracts/test-supplements-contracts/AnyERC721.sol/AnyERC721.json'
const { Web3Provider } = providers
interface ContractsFixture {
  startfi: Contract
  NexType: Contract
  RAG: Contract
  testToken: Contract
  VidalNFT: Contract
  NextNFT: Contract
  RAGNFT: Contract
}

const overrides = {
  gasLimit: 9999999,
}
let baseUri = 'http://ipfs.io'
const name1 = 'StartFiToken'
const symbol1 = 'STFI'
const name2 = 'NexType'
const symbol2 = 'NT'
const name3 = 'Rage Fan'
const symbol3 = 'RAG'
export async function tokenFixture([wallet]: Wallet[], _: MockProvider): Promise<ContractsFixture> {
  const startfi = await deployContract(wallet, ERC20, [name1, symbol1, expandTo18Decimals(10000), wallet.address])
  const NexType = await deployContract(wallet, ERC20, [name2, symbol2, expandTo18Decimals(10000), wallet.address])
  const RAG = await deployContract(wallet, ERC20, [name3, symbol3, expandTo18Decimals(10000), wallet.address])
  const testToken = await deployContract(wallet, ERC20, [name1, symbol3, expandTo18Decimals(10000), wallet.address])
  const VidalNFT = await deployContract(wallet, ERC721, [name1, symbol1, baseUri])
  const NextNFT = await deployContract(wallet, ERC721, [name2, symbol2, baseUri])
  const RAGNFT = await deployContract(wallet, ERC721, [name3, symbol3, baseUri])
  // mint
   await VidalNFT.mint(wallet.address)
    await NextNFT.mint(wallet.address)
    await RAGNFT.mint(wallet.address)

  return { startfi, NexType, RAG,testToken, VidalNFT, NextNFT, RAGNFT }
}
