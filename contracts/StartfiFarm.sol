// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;
import './UserPools.sol';

/// @title Startfi farm contract where users stake their tokens and get NFT as rewards

contract StartfiFarm is UserPools {
    constructor(
        uint256 launchTime_,
        uint256 deadline_,
        uint256 timeToRelease_
    ) FarmPools(launchTime_, deadline_, timeToRelease_) {}

 

    /// @param user user address
    ///  @return  currentUserPools user's pool addresses

    function getUserPools(address user) external view returns (address[] memory currentUserPools) {
        currentUserPools= _getUserPools(user);
    }

    /// @notice get pool details related to certain user
    /// @param user user address
    /// @param token pool token address

    /// @return amount user stakes in this pool
    /// @return lastRewardBlock last redeeming time
    /// @return stakeTime  time of staking
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

    // // ony before launch time
    // /// @notice let user to stake tokens in a certain pool
    // /// @dev ony before launch time
    // /// @param _token pool token address
    // /// @param _amount user stakes to be added to this pool

    // function stake(address _token, uint256 _amount) external {
    //     require(_stake(_msgSender(), _token, _amount), 'Invalid stake operation');
    // }

    // ony before launch time
    /// @notice let user to stake in maltible pools in a single transaction
    /// @dev ony before launch time,
    /// @dev both function arguments length must be identical
    /// @param _amounts array of values to be staked for each pool
    /// @param _tokens array of pool tokens address
    function stakeBatch(address[] calldata _tokens, uint256[] calldata _amounts) external {
        require(_tokens.length == _amounts.length, 'Mismatch array length');
        for (uint256 index = 0; index < _tokens.length; index++) {
            require(_stake(_msgSender(), _tokens[index], _amounts[index]), 'Invalid stake operation');
        }
    }

    /// @notice user can redeem nft at any time as long as his balance of Rstfi >= the required price " points"
    // we should check if this nft has conditions to apply
    /// @dev only staker can call it

    /// @param key nft id
    function claim(uint256 key) external {
        require(_claimReward(key, _msgSender()), 'Invalid claim operation');
    }

    /// @notice if user wants to claim the nft reward and the user's rewards balance of group of pools is more than or equal the required points for that nft, user can call this function rather than redeem -> claim scenario where user has to send many transaction to get the nft
    /// @dev only staker can call it

    /// @param _tokens array of pool tokens address
    /// @param key nft id

    function redeemAndClaim(address[] calldata _tokens, uint256 key) external {
        for (uint256 index = 0; index < _tokens.length; index++) {
            require(_redeemPoint(_msgSender(), _tokens[index]), 'Invalid redeem operation');
        }
        require(_claimReward(key, _msgSender()), 'Invalid claim operation');
    }

    /// @notice Let user redeem token from many pools at once
    /// @dev only staker can call it

    /// @param _tokens array of pool tokens address

    function redeemBatch(address[] calldata _tokens) external {
        for (uint256 index = 0; index < _tokens.length; index++) {
            require(_redeemPoint(_msgSender(), _tokens[index]), 'Invalid redeem operation');
        }
    }

    // /// @notice users call this functions any time to redeem points for their pool stakes
    // /// @dev : calling this function mints point for the caller based on the reward algorithm applied
    // /// @dev only staker can call it

    // /// @param _token pool token address

    // function redeem(address _token) external {
    //     require(_redeemPoint(_msgSender(), _token), 'Invalid redeem operation');
    // }

    //
    // /// @notice When the fram ends, users can set their stakes free by calling this function
    // /// @dev only after deadline
    // /// @dev only staker can call it

    // /// @param _token pool token address

    // function unstake(address _token) external {
    //     require(_unstake(_msgSender(), _token), 'Invalid unstake operation');
    // }

    /// @notice Let user unstake token from many pools at once
    /// @dev only staker can call it

    /// @param _tokens array of pool tokens address
    function unstakeBatch(address[] calldata _tokens) external {
        for (uint256 index = 0; index < _tokens.length; index++) {
            require(_unstake(_msgSender(), _tokens[index]), 'Invalid unstake operation');
        }
    }

    // /// @notice before the farm starts, users can set their stakes free by calling this function
    // /// @dev only before launchtime
    // /// @dev only staker can call it

    // /// @param _token pool token address
    // function unStakeEarly(address _token) external {
    //     require(_unstakeEarly(_msgSender(), _token), 'Invalid stake operation');
    // }

    /// @notice before the farm starts, Let user unstake token from many pools at once
    /// @dev only before launchtime
    /// @dev only staker can call it
    /// @param _tokens array of pool tokens address
    function unStakeEarlyBatch(address[] calldata _tokens) external {
        for (uint256 index = 0; index < _tokens.length; index++) {
            require(_unstakeEarly(_msgSender(), _tokens[index]), 'Invalid stake operation');
        }
    }

    /// @notice create new pool
    /// @dev only owner can call it
    /// @param _token erc20 token address
    /// @param _shareAPR perenage numerator of the pool APR generated
    /// @param  _shareAPRBase perenage denominator of the pool APR generated
    /// @param  _minimumStake minimum amount user should stake in order to participatin in this pool
    /// @param  cap_ the maxmum amount of token to be staked in this pool
    /// @param  _totalShare perenage numerator of pool share of the farm overall points
    /// @param  _totalShareBase perenage denominator of pool share of the farm overall points
    function addPool(
        address _token,
        uint256 _shareAPR,
        uint256 _shareAPRBase,
        uint256 _minimumStake,
        uint256 cap_,
        uint256 _totalShare,
        uint256 _totalShareBase
    ) external {
        _addPool(_token, _shareAPR, _shareAPRBase, _minimumStake, cap_, _totalShare, _totalShareBase);
    }

    /// @notice add the nft rewards that users will claim
    /// @dev only owner can call it
    /// @dev nft point increase the RSFTI cap
    /// @param  _tokenId nft token id
    /// @param  _priceInPoint how many point required to calim it
    /// @param  _minimumStakeRequired optional, for projects the would enforce user to stake their token in order to calim their rewards
    /// @param  _nftAddress nft contract address
    /// @param  owner_ the owner of this nft , this is used as well to return the nft back if no one calim it with no points left in the farm
    /// @param  _tokenLinked optinal , pool token address, only if `_minimumStakeRequired` is used to check if the staker is participating in the pool

    function addTokenReward(
        uint256 _tokenId,
        uint256 _priceInPoint,
        uint256 _minimumStakeRequired,
        address _nftAddress,
        address owner_,
        address _tokenLinked
    ) external {
      
        _addTokenReward(_tokenId, _priceInPoint, _minimumStakeRequired, _nftAddress, owner_, _tokenLinked);
    }

    /// @notice to protect nfts from being locked in the contract , owner can call it after the time to release and return it back to the original owner as long as minted point is less than the reward `_priceInPoint`
    /// @dev only  owner can call it
    /// @dev called only after the `_timeToRelease`

    function releaseNFT(uint256 key) external {
        _releaseNFT(key);
    }
}
