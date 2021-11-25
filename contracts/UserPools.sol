// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;
// import 'hardhat/console.sol';

import './FarmPools.sol';
import './lib/SafeDecimalMath.sol';
import '@openzeppelin/contracts/utils/structs/EnumerableSet.sol';
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';

abstract contract UserPools is FarmPools {
    using SafeDecimalMath for uint256;
    using EnumerableSet for EnumerableSet.AddressSet;

    struct userPool {
        // address token;
        uint256 amount;
        uint256 stakeTime;
        uint256 lastRewardBlock;
    }
    // user address to token address to stake details
    mapping(address => mapping(address => userPool)) private userPools;
    mapping(address => EnumerableSet.AddressSet) private _userToPools;

    event Stake(address indexed staker, address indexed pool, uint256 amount, uint256 timestamp);
    event Unstake(address indexed staker, address indexed pool, uint256 amount, uint256 timestamp);
    event Redeem(address indexed redeemer, address indexed pool, uint256 amount, uint256 timestamp);




   /// @notice calculate user rewards at the call time ( between launchtime to deadline) in all user pools
    /// @param user user address
    /// @return _totalRewards number of rewards
    function userRewards(address user) external view returns (uint256 _totalRewards) {
        address[] memory _userPools = _userToPools[user].values();
        uint256 currentBlock = _farmDeadline > block.timestamp ? block.timestamp : _farmDeadline;
        for (uint256 index = 0; index < _userPools.length; index++) {
            _totalRewards += _getUserRewards(user, _userPools[index], currentBlock);
        }
    }

    /// @notice calculate user rewards at the call time ( between launchtime to deadline) in a certain pool 
    /// @param _user user address
    /// @param _token pool token address
    /// @return _totalRewards number of rewards
    function userPoolReward(address _user,address _token) external view returns (uint256 _totalRewards) {
         uint256 currentBlock = _farmDeadline > block.timestamp ? block.timestamp : _farmDeadline;
             return _getUserRewards(_user, _token, currentBlock);
        
    }
    function _calcReward(
        uint256 amount,
        uint256 shareAPR,
        uint256 baseAPR,
        uint256 rewardBlocks
    ) public pure returns (uint256) {
        // get the rate e.g. who much points for x amount stake in y pool
        uint256 rate = amount * (shareAPR.divideDecimal(baseAPR * 100));
        // multiply in duration to get the reward now since the the staking time
        return rate.multiplyDecimal(rewardBlocks);
    }

    function _userPoolDetails(address user, address token)
        internal
        view
        returns (
            uint256 amount,
            uint256 lastRewardBlock,
            uint256 stakeTime
        )
    {
        amount = userPools[user][token].amount;
        lastRewardBlock = userPools[user][token].lastRewardBlock;
        stakeTime = userPools[user][token].stakeTime;

        // (amount, stakeTime, lastRewardBlock) = userPools[user][token];
    }

 

    function _getUserRewards(
        address _user,
        address _token,
        uint256 currentBlock
    ) private view returns (uint256 userReward) {
        uint256 lastRewardBlock = userPools[_user][_token].lastRewardBlock;

        uint256 amount = userPools[_user][_token].amount;
        if (currentBlock > lastRewardBlock) {
            uint256 rewardBlocks = currentBlock - lastRewardBlock;
            userReward = _calcReward(amount, _pools[_token].shareAPR, _pools[_token].shareAPRBase, rewardBlocks);
        }
    }

    function _getUserPools(address user) internal view returns (address[] memory currentUserPools) {
        return _userToPools[user].values();
    }

    function _stake(
        address _user,
        address _token,
        uint256 _amount
    ) internal canStake(_user, _token, _amount) returns (bool) {
        uint256 _totalshare = _pools[_token].totalSupply + _amount;
        require(_totalshare <= _pools[_token].cap, 'Stake: Pool Cap exceeded');
        uint256 stakeAmount = _amount;
        if (_userToPools[_user].contains(_token)) {
            stakeAmount = userPools[_user][_token].amount + _amount;
        } else {
            _userToPools[_user].add(_token);
        }
        _pools[_token].totalSupply = _totalshare;
        userPools[_user][_token] = userPool(stakeAmount, block.timestamp, _launchTime);

        // emit event here
        emit Stake(_user, _token, _amount, block.timestamp);
        return IERC20(_token).transferFrom(_user, address(this), _amount);
    }

    function _unstake(address _user, address _token) internal canUnstake returns (bool) {
        _redeemPoint(_user, _token);
        uint256 amount = userPools[_user][_token].amount;
        userPools[_user][_token].amount = 0;
        emit Unstake(_user, _token, amount, block.timestamp);

        return IERC20(_token).transfer(_user, amount);
    }

    function _unstakeEarly(address _user, address _token) internal canUnStakeEarly returns (bool) {
        uint256 amount = userPools[_user][_token].amount;
        require(amount <= _pools[_token].totalSupply, 'Invalid unstake operation');
        _pools[_token].totalSupply -= amount;
        userPools[_user][_token].amount = 0;
        emit Unstake(_user, _token, amount, block.timestamp);

        return IERC20(_token).transfer(_user, amount);
    }

    function _redeemPoint(address _user, address _token) internal returns (bool) {
        require(_userToPools[_user].contains(_token), 'Non exist');
        uint256 lastRewardBlock = userPools[_user][_token].lastRewardBlock;
        require(lastRewardBlock < _farmDeadline, 'All Points are redeemed');
        uint256 currentBlock = _farmDeadline > block.timestamp ? block.timestamp : _farmDeadline;
        uint256 userTotalRewards = _getUserRewards(_user, _token, currentBlock);
        if (userTotalRewards > 0) {
            userPools[_user][_token].lastRewardBlock = block.timestamp;
            emit Redeem(_user, _token, userTotalRewards, block.timestamp);

            _mint(_user, userTotalRewards);
        }

        // emit event here

        return true;
    }

    function testBlock(address _user, address _token)
        public
        view
        returns (
            uint256 lastRewardBlock,
            uint256 currentBlock,
            uint256 rewardBlocks
        )
    {
        lastRewardBlock = userPools[_user][_token].lastRewardBlock;
        currentBlock = _farmDeadline > block.timestamp ? block.timestamp : _farmDeadline;

        rewardBlocks = currentBlock - lastRewardBlock;
    }

    function _claimReward(uint256 key, address _user) internal virtual override returns (bool) {
        uint256 minimumStakeRequired = rewardTokens[key].minimumStakeRequired;
        if (minimumStakeRequired > 0) {
            require(minimumStakeRequired >= userPools[_user][rewardTokens[key].tokenLinked].amount);
        }

        return super._claimReward(key, _user);
    }
}
