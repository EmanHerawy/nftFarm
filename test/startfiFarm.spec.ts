import chai, { expect } from "chai";
import { Contract,  } from "ethers";
import { solidity, MockProvider, deployContract,createFixtureLoader } from "ethereum-waffle";
import { tokenFixture } from './shared/fixtures'
 
import StartfiFarm from "../artifacts/contracts/StartfiFarm.sol/StartfiFarm.json";
chai.use(solidity);
const dayInSec = 24 * 60 * 60;
 const launchTime = Date.now()+(dayInSec*2);// after 2 days from now
const deadline = launchTime+(dayInSec*5); // after 5 days

describe("Startfi Farm", () => {
  const provider = new MockProvider();
  const [wallet, other,user1, user2] = provider.getWallets();
        const loadFixture = createFixtureLoader([wallet])

  let farm: Contract;
  before(async () => {

    const fixture = await loadFixture(tokenFixture)

    farm = await deployContract(wallet, StartfiFarm, [
      launchTime,
      deadline,

    ]);
  })


  it("checking launch time and deadline ", async () => {
  
    
    expect(await farm.launchTime()).to.eq(launchTime);
    expect(await farm.farmDeadline()).to.eq(deadline);
   
  });
})