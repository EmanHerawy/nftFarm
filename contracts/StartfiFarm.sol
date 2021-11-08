// SPDX-License-Identifier: MIT
pragma solidity 0.8.7;
import './UserPools.sol';

contract StartfiFarm is UserPools {
    constructor(uint256 launchTime_, uint256 deadline_) UserPools(launchTime_, deadline_) {}

    // ony before launch time
    function stake(address _token, uint256 _amount) external {
        require(_stake(_msgSender(), _token, _amount), 'Invalid stake operation');
    }

    function stakeBatch(address[] calldata _tokens, uint256[] calldata _amounts) external {
        require(_tokens.length == _amounts.length, 'Mismatch array length');
        for (uint256 index = 0; index < _tokens.length; index++) {
            require(_stake(_msgSender(), _tokens[index], _amounts[index]), 'Invalid stake operation');
        }
    }

    // user can redeem nft at any time as long as his balance of Rstfi >= the required price " points"
    // we should check if this nft has conditions to apply
    function redeem(uint256 itemId) external {}

    // only after deadline
    function unstake(address _token) external {
        require(_unstake(_msgSender(), _token), 'Invalid unstake operation');
    }

    function unstakeBatch(address[] calldata _tokens) external {
        for (uint256 index = 0; index < _tokens.length; index++) {
            require(_unstake(_msgSender(), _tokens[index]), 'Invalid unstake operation');
        }
    }
}
