// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/utils/structs/EnumerableSet.sol';
import './FarmTokens.sol';
import './lib/SafeDecimalMath.sol';

contract FarmPools is FarmTokens {
    using SafeDecimalMath for uint256;

    using EnumerableSet for EnumerableSet.AddressSet;
    uint256 private immutable _farmDeadline;
    uint256 immutable _launchTime;
    uint256 private _RstfiMaxSupply;
    uint256 private totalShares;

    struct poolDetails {
        uint256 shareAPR;
        uint256 shareAPRBase;
        uint256 minimumStake;
        // how many token this pool can hold
        uint256 cap;
        // how many token supplied to this pool
        uint256 totalSupply;
        //pool total share  of RSTFI in the whole farm
        uint256 totalShare;
        uint256 totalShareBase;
    }
    EnumerableSet.AddressSet private _poolsSet;
    mapping(address => poolDetails) internal _pools;

    // modifiers

    modifier canStake(
        address _user,
        address _token,
        uint256 _amount
    ) {
        require(block.timestamp < _launchTime, 'Staking is locked');
        require(_poolsSet.contains(_token), 'non existe pool');
        require(_amount >= _pools[_token].minimumStake, 'less than the minimum amount');
        require(IERC20(_token).allowance(_user, address(this)) >= _amount, 'not allowed');

        _;
    }
    modifier canUnStakeEarly() {
        require(_launchTime > block.timestamp, 'Staking is locked');
        _;
    }
    modifier canUnstake() {
        require(block.timestamp < _farmDeadline, 'Staking is locked');
        _;
    }

    constructor(uint256 launchTime_, uint256 _deadline) {
        _farmDeadline = _deadline;
        _launchTime = launchTime_;
    }

    function getFarmDeadline() external view returns (uint256) {
        return _farmDeadline;
    }

    /// @notice Only Owner can call it

    function _addPool(
        address _token,
        uint256 _shareAPR,
        uint256 _shareAPRBase,
        uint256 _minimumStake,
        uint256 _cap,
        uint256 _totalShare,
        uint256 _totalShareBase
    ) internal onlyOwner {
        totalShares = totalShares + (_totalShare.divideDecimal(_totalShareBase));
        // every toen should have a share of the total rstfi and the math for APR and amount token staked should match that share so that the APR doesn't exceed it
        require(totalShares / 1 ether <= 100, 'exceed cap');
        require(
            _shareAPR != 0 &&
                _shareAPRBase != 0 &&
                _minimumStake != 0 &&
                _cap != 0 &&
                _totalShare != 0 &&
                _totalShareBase != 0 &&
                _token != address(0),
            'Zero values not allowed'
        );
        require(!_poolsSet.contains(_token), 'Duplicated value is not allowed');
        _poolsSet.add(_token);
        _pools[_token] = poolDetails(_shareAPR, _shareAPRBase, _minimumStake, _cap, 0, _totalShare, _totalShareBase);
    }

    function _releaseNFT(uint256 key) internal override onlyOwner returns (bool) {
        require(_farmDeadline < block.timestamp, 'Farm is running');
        return super._releaseNFT(key);
    }

    function getPoolByIndex(uint256 index) external view returns (address poolAddress) {
        return _poolsSet.at(index);
    }

    function getPoolDetails(address _token)
        external
        view
        returns (
            uint256 _shareAPR,
            uint256 _shareAPRBase,
            uint256 _minimumStake,
            uint256 _cap,
            uint256 _totalShare,
            uint256 _totalShareBase
        )
    {
        _shareAPR = _pools[_token].shareAPR;
        _shareAPRBase = _pools[_token].shareAPRBase;
        _minimumStake = _pools[_token].minimumStake;
        _cap = _pools[_token].cap;
        _totalShare = _pools[_token].totalShare;
        _totalShareBase = _pools[_token].totalShareBase;
    }

    function getPools() external view returns (address[] memory poolAddreses) {
        return _poolsSet.values();
    }
}
