// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;
import './UserPools.sol';

contract StartfiFarm is UserPools {
    constructor(uint256 launchTime_, uint256 deadline_) UserPools(launchTime_, deadline_) {}

    function userRewards(address user) external view returns (uint256) {
        return _userRewards(user);
    }

    function getUserPools(address user) external view returns (address[] memory currentUserPools) {
        return _getUserPools(user);
    }

    function userPoolDetails(address user, address token)
        external
        view
        returns (
            uint256 amount,
            uint256 lastRewardBlock,
            uint256 stakeTime
        )
    {
        return _userPoolDetails(user, token);
    }

    // ony before launch time
    function stake(address _token, uint256 _amount) external {
        require(_stake(_msgSender(), _token, _amount), 'Invalid stake operation');
    }

    // permit

    // permit
    function stakeBatch(address[] calldata _tokens, uint256[] calldata _amounts) external {
        require(_tokens.length == _amounts.length, 'Mismatch array length');
        for (uint256 index = 0; index < _tokens.length; index++) {
            require(_stake(_msgSender(), _tokens[index], _amounts[index]), 'Invalid stake operation');
        }
    }

    // user can redeem nft at any time as long as his balance of Rstfi >= the required price " points"
    // we should check if this nft has conditions to apply
    function claim(uint256 key) external {
        require(_claimReward(key, _msgSender()), 'Invalid claim operation');
    }

    function redeemAndClaim(address[] calldata _tokens, uint256 key) external {
        for (uint256 index = 0; index < _tokens.length; index++) {
            require(_redeemPoint(_msgSender(), _tokens[index]), 'Invalid redeem operation');
        }
        require(_claimReward(key, _msgSender()), 'Invalid claim operation');
    }

    function redeemBatch(address[] calldata _tokens) external {
        for (uint256 index = 0; index < _tokens.length; index++) {
            require(_redeemPoint(_msgSender(), _tokens[index]), 'Invalid redeem operation');
        }
    }

    function redeem(address _token) external {
        require(_redeemPoint(_msgSender(), _token), 'Invalid redeem operation');
    }

    // only after deadline
    function unstake(address _token) external {
        require(_unstake(_msgSender(), _token), 'Invalid unstake operation');
    }

    function unstakeBatch(address[] calldata _tokens) external {
        for (uint256 index = 0; index < _tokens.length; index++) {
            require(_unstake(_msgSender(), _tokens[index]), 'Invalid unstake operation');
        }
    }

    function unStakeEarlyBatch(address[] calldata _tokens) external {
        for (uint256 index = 0; index < _tokens.length; index++) {
            require(_unstakeEarly(_msgSender(), _tokens[index]), 'Invalid stake operation');
        }
    }

    function unStakeEarly(address _token) external {
        require(_unstakeEarly(_msgSender(), _token), 'Invalid stake operation');
    }

    function addPool(
        address _token,
        uint256 _shareAPR,
        uint256 _shareAPRBase,
        uint256 _minimumStake,
        uint256 _cap,
        uint256 _totalShare,
        uint256 _totalShareBase
    ) external {
        _addPool(_token, _shareAPR, _shareAPRBase, _minimumStake, _cap, _totalShare, _totalShareBase);
    }

    function addTokenReward(
        address _nftAddress,
        address _owner,
        uint256 _tokenId,
        uint256 _priceInPoint,
        uint256 _minimumStakeRequired,
        address _tokenLinked
    ) internal {
        _addTokenReward(_nftAddress, _owner, _tokenId, _priceInPoint, _minimumStakeRequired, _tokenLinked);
    }

    function releaseNFT(uint256 key) external {
        _releaseNFT(key);
    }
}
