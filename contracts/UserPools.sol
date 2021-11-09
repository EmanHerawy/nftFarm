// SPDX-License-Identifier: MIT
pragma solidity 0.8.7;
import './FarmPools.sol';
import './lib/SafeDecimalMath.sol';
import '@openzeppelin/contracts/utils/structs/EnumerableSet.sol';
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';

contract UserPools is FarmPools {
    using SafeDecimalMath for uint256;
    using EnumerableSet for EnumerableSet.AddressSet;

    struct userPool {
        // address token;
        uint256 amount;
        uint256 stakeTime;
        uint256 lastRewardBlock;
    }
    // user address to token address to stake details
    mapping(address => mapping(address => userPool)) userPools;
    mapping(address => EnumerableSet.AddressSet) internal _userToPools;

    constructor(uint256 poolEndTime_, uint256 deadline_) FarmPools(poolEndTime_, deadline_) {}

    function userPoolDetails(address user, address token)
        public
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

    function userRewards(address user) external view returns (uint256 totalRewards) {
        address[] memory _userPools = _userToPools[user].values();
        for (uint256 index = 0; index < _userPools.length; index++) {
            uint256 lastRewardBlock = userPools[user][_userPools[index]].lastRewardBlock;
            uint256 amount = userPools[user][_userPools[index]].amount;
            uint256 rewardBlocks = block.timestamp - lastRewardBlock;
            totalRewards += _calcReward(
                amount,
                _pools[_userPools[index]].shareAPR,
                _pools[_userPools[index]].shareAPRBase,
                rewardBlocks
            );
        }
    }

    function _calcReward(
        uint256 amount,
        uint256 shareAPR,
        uint256 baseAPR,
        uint256 rewardBlocks
    ) public pure returns (uint256) {
        // get the rate e.g. who much points for x amount stake in y pool
        uint256 rate = amount.multiplyDecimalRound((shareAPR.divideDecimal(baseAPR * 100)));
        // multiply in duration to get the reward now since the the staking time
        return rate * rewardBlocks;
    }

    function getUserPools(address user) external view returns (address[] memory currentUserPools) {
        return _userToPools[user].values();
    }

    function _stake(
        address _user,
        address _token,
        uint256 _amount
    ) internal canStake(_user, _token, _amount) returns (bool) {
        uint256 stakeAmount = _amount;
        if (_userToPools[_user].contains(_token)) {
            stakeAmount = userPools[_user][_token].amount + _amount;
        } else {
            _userToPools[_user].add(_token);
        }
        userPools[_user][_token] = userPool(stakeAmount, block.timestamp, _launchTime);
        // emit event here
        return IERC20(_token).transferFrom(_user, address(this), _amount);
    }

    function _unstake(address _user, address _token) internal canUnstake returns (bool) {
        _redeemPoint(_user, _token);
        uint256 amount = userPools[_user][_token].amount;
        userPools[_user][_token].amount = 0;

        return IERC20(_token).transfer(_user, amount);
    }

    function _unstakeEarly(address _user, address _token) internal canUnStakeEarly returns (bool) {
        uint256 amount = userPools[_user][_token].amount;
        userPools[_user][_token].amount = 0;

        return IERC20(_token).transfer(_user, amount);
    }

    function _redeemPoint(address _user, address _token) internal returns (bool) {
        require(_userToPools[_user].contains(_token), 'Non exist');

        uint256 lastRewardBlock = userPools[_user][_token].lastRewardBlock;
        uint256 amount = userPools[_user][_token].amount;
        uint256 rewardBlocks = block.timestamp - lastRewardBlock;
        uint256 totalRewards = _calcReward(amount, _pools[_token].shareAPR, _pools[_token].shareAPRBase, rewardBlocks);
        // emit event here
        userPools[_user][_token].lastRewardBlock = block.timestamp;
        _mint(_user, totalRewards);
        return true;
    }

    function _claimReward(uint256 key, address _user) internal virtual override returns (bool) {
        uint256 minimumStakeRequired = rewardTokens[key].minimumStakeRequired;
        if (minimumStakeRequired > 0) {
            require(minimumStakeRequired >= userPools[_user][rewardTokens[key].tokenLinked].amount);
        }

        return super._claimReward(key, _user);
    }
}
