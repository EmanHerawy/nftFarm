import { Contract, Wallet, providers } from 'ethers'
import { deployContract, MockProvider } from 'ethereum-waffle'

import { expandTo18Decimals } from './utilities'

import ERC20 from '../../artifacts/contracts/test-supplements-contracts/AnyERC20.sol/AnyERC20.json'
import ERC721 from '../../artifacts/contracts/test-supplements-contracts/AnyERC721.sol/AnyERC721.json'
const { Web3Provider } = providers
interface ContractsFixture {
  pool1: Contract
  pool2: Contract
  nft1: Contract
  nft2: Contract
  }

const overrides = {
  gasLimit: 9999999,
}
let baseUri = 'http://ipfs.io'
const name1 = 'StartFiToken'
const symbol1 = 'STFI'
const name2 = 'XToken'
const symbol2 = 'xT'
export async function tokenFixture([wallet]: Wallet[], _: MockProvider): Promise<ContractsFixture> {
  const pool1 = await deployContract(wallet, ERC20, [name1, symbol1, expandTo18Decimals(10000), wallet.address])
  const pool2 = await deployContract(wallet, ERC20, [name2, symbol2, expandTo18Decimals(10000), wallet.address])
  const nft1 = await deployContract(wallet, ERC721, [name1, symbol1, baseUri])
  const nft2 = await deployContract(wallet, ERC721, [name2, symbol2, baseUri])


  return { pool1, pool2, nft1, nft2 }
}


