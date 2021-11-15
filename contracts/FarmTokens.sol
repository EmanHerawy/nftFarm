// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;
import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol';
import '@openzeppelin/contracts/token/ERC721/IERC721.sol';
import '@openzeppelin/contracts/security/ReentrancyGuard.sol';

contract FarmTokens is Ownable, ERC20, ERC721Holder, ReentrancyGuard {
    uint256 private _cap;
    uint256 private _mintedPoints;
    uint256 private _tokenCount;
    struct tokenDetails {
        address nftAddress;
        address owner;
        uint256 tokenId;
        uint256 priceInPoint;
        // some nft might have restiction that users should stake a certain token to redeem it
        uint256 minimumStakeRequired;
        address tokenLinked;
    }
    mapping(uint256 => tokenDetails) internal rewardTokens;

    event RewardReleased(address indexed owner, address indexed token, uint256 key, uint256 tokenId, uint256 timestamp);
    event RewardClaimed(
        address indexed claimer,
        address indexed token,
        uint256 key,
        uint256 tokenId,
        uint256 timestamp
    );
    event RewardAdded(
        address indexed owner,
        address indexed nftAddress,
        address tokenLinked,
        uint256 tokenId,
        uint256 priceInPoint,
        uint256 minimumStakeRequired,
        uint256 timestamp
    );

    constructor() ERC20('Startfi Reward Token', 'RSTFI') {}

    function mintedPoints() external view returns (uint256) {
        return _mintedPoints;
    }

    function cap() external view returns (uint256) {
        return _cap;
    }

    function rewardCount() external view returns (uint256) {
        return _tokenCount;
    }

    /// @notice Only woner can call it

    function _addTokenReward(
        uint256 _tokenId,
        uint256 _priceInPoint,
        uint256 _minimumStakeRequired,
        address _nftAddress,
        address _owner,
        address _tokenLinked
    ) internal onlyOwner {
        require(_priceInPoint != 0 && _nftAddress != address(0) && _owner != address(0), 'Zero values not allowed');
        require(
            IERC721(_nftAddress).getApproved(_tokenId) == address(this) ||
                IERC721(_nftAddress).isApprovedForAll(_owner, address(this)),
            'Not approved'
        );
        rewardTokens[_tokenCount] = tokenDetails(
            _nftAddress,
            _owner,
            _tokenId,
            _priceInPoint,
            _minimumStakeRequired,
            _tokenLinked
        );
        _cap += _priceInPoint;
        _tokenCount++;
        emit RewardAdded(
            _owner,
            _nftAddress,
            _tokenLinked,
            _tokenId,
            _priceInPoint,
            _minimumStakeRequired,
            block.timestamp
        );

        _transferNFT(_nftAddress, _tokenId, _owner, address(this));
    }

    function _transferNFT(
        address _nftAddress,
        uint256 tokenId,
        address from,
        address to
    ) internal nonReentrant returns (bool) {
        IERC721(_nftAddress).safeTransferFrom(from, to, tokenId);
        return true;
    }

    // TODO: add time check condition
    function _releaseNFT(uint256 key) internal virtual returns (bool) {
        require(ERC20.totalSupply() >= rewardTokens[key].priceInPoint, 'Can not release, users can sell it');
        address nftAddress = rewardTokens[key].nftAddress;
        address _owner = rewardTokens[key].owner;
        uint256 tokenId = rewardTokens[key].tokenId;
        require(IERC721(nftAddress).ownerOf(tokenId) == address(this), 'UnAuthorized');
        emit RewardReleased(_owner, nftAddress, key, tokenId, block.timestamp);
        _transferNFT(nftAddress, tokenId, address(this), _owner);
        return true;
    }

    function _claimReward(uint256 key, address _user) internal virtual returns (bool) {
        uint256 price = rewardTokens[key].priceInPoint;
        require(balanceOf(_user) >= price, 'Insufficient fund');
        // burn decrease the total supply which might be vulnarabity when we try to enforce cap
        _burn(_user, price);
        address nftAddress = rewardTokens[key].nftAddress;
        uint256 tokenId = rewardTokens[key].tokenId;
        require(IERC721(nftAddress).ownerOf(tokenId) == address(this), 'UnAuthorized');
        emit RewardClaimed(_user, nftAddress, key, tokenId, block.timestamp);

        _transferNFT(nftAddress, tokenId, address(this), _user);
        return true;
    }

    function _mint(address account, uint256 amount) internal virtual override {
        // require(ERC20.totalSupply() + amount <= _cap, 'cap exceeded');
        require(_mintedPoints + amount <= _cap, 'cap exceeded');
        _mintedPoints += amount;
        super._mint(account, amount);
    }
}
