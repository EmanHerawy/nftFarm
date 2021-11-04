import chai, { expect } from "chai";
import { Contract,  } from "ethers";
import { solidity, MockProvider, deployContract } from "ethereum-waffle";

import SimpleToken from "../artifacts/contracts/SimpleToken.sol/SimpleToken.json";
 chai.use(solidity);
 const name = "templateToken";
const symbol = "TT";

describe("SimpleToken", () => {
  const provider = new MockProvider();
  const [wallet, other, user2] = provider.getWallets();
  let token: Contract;
  before(async () => {

    
    token = await deployContract(wallet, SimpleToken, [
      name,
      symbol,

    ]);
  })


  it("name, symbol, ", async () => {
  
    const _name = await token.name();
    expect(_name).to.eq(name);
    expect(await token.symbol()).to.eq(symbol);
   
  });
})