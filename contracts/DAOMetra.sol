// SPDX-License-Identifier: MIT
// https://sepolia.etherscan.io/address/0x9247C769a73BCe6878a529d92FCf847d5933a775#code

pragma solidity ^0.8.0;

import "./DAOMetraToken.sol";

contract DAOMetra {
    DAOMetraToken public token;
    address public admin;
    uint256 public sharePrice;
    bool public saleActive;
    uint256 public totalShares;
    uint256 public constant VOTING_PERIOD = 1 weeks;
    uint256 public constant TIMELOCK_DELAY = 1 days;

    struct Proposal {
        string title;
        string description;
        uint256 yesVotes;
        uint256 noVotes;
        uint256 abstainVotes;
        bool executed;
        address payable recipient;
        uint256 tokenAmount;
        uint256 createdAt;
        uint256 executionTime;
        bool expired;
        bool queued;
    }

    Proposal[] public proposals;
    mapping(address => uint256) public shares;
    mapping(uint256 => mapping(address => bool)) public hasVoted;

    event SharesPurchased(address indexed buyer, uint256 amount);
    event ProposalCreated(uint256 indexed proposalId, string title, uint256 endTime);
    event VoteCast(address indexed voter, uint256 indexed proposalId, bool vote, uint256 weight);
    event ProposalQueued(uint256 indexed proposalId, uint256 executionTime);
    event ProposalExecuted(uint256 indexed proposalId);
    event ProposalExpired(uint256 indexed proposalId);
    event DAOPaused(address indexed pauser);
    event DAOUnpaused(address indexed unpauser);

    bool public isPaused;

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    modifier onlyMember() {
        require(shares[msg.sender] > 0, "Only DAO members can perform this action");
        _;
    }

    modifier whenNotPaused() {
        require(!isPaused, "DAO is paused");
        _;
    }

    constructor(address _token, uint256 _sharePrice) {
        admin = msg.sender;
        token = DAOMetraToken(_token);
        sharePrice = _sharePrice;
        saleActive = true;
    }

    function purchaseShares(uint256 amount) external {
    require(amount > 0, "Amount must be greater than 0");  // Aggiungiamo questo controllo
    require(saleActive, "Token sale is not active");
    uint256 cost = sharePrice * amount;
    require(token.transferFrom(msg.sender, address(this), cost), "Transfer failed");
    shares[msg.sender] += amount;
    totalShares += amount;
    emit SharesPurchased(msg.sender, amount);
}

    function disableSale() external onlyAdmin {
        saleActive = false;
    }

    function createProposal(string memory title, string memory description, address payable recipient, uint256 tokenAmount) external onlyMember {
        proposals.push(Proposal({
            title: title,
            description: description,
            yesVotes: 0,
            noVotes: 0,
            abstainVotes: 0,
            executed: false,
            recipient: recipient,
            tokenAmount: tokenAmount,
            createdAt: block.timestamp,
            executionTime: 0,
            expired: false,
            queued: false
        }));
        emit ProposalCreated(proposals.length - 1, title, block.timestamp + VOTING_PERIOD);
    }

    function vote(uint256 proposalId, bool support, bool abstain) external onlyMember {
        Proposal storage proposal = proposals[proposalId];
        require(!hasVoted[proposalId][msg.sender], "Already voted on this proposal");
        require(!proposal.executed && !proposal.expired, "Proposal cannot be voted on");
        require(block.timestamp <= proposal.createdAt + VOTING_PERIOD, "Voting period ended");

        hasVoted[proposalId][msg.sender] = true;
        uint256 weight = shares[msg.sender];

        if (abstain) {
            proposal.abstainVotes += weight;
        } else if (support) {
            proposal.yesVotes += weight;
        } else {
            proposal.noVotes += weight;
        }
        emit VoteCast(msg.sender, proposalId, support, weight);
    }

    function queueProposal(uint256 proposalId) external onlyMember {
        Proposal storage proposal = proposals[proposalId];
        require(!proposal.executed && !proposal.expired, "Proposal cannot be queued");
        require(block.timestamp > proposal.createdAt + VOTING_PERIOD, "Voting period not ended");
        require(proposal.yesVotes > proposal.noVotes, "Proposal did not pass");
        require(proposal.yesVotes * 100 / totalShares >= 51, "Quorum not met");
        require(!proposal.queued, "Proposal already queued");

        proposal.executionTime = block.timestamp + TIMELOCK_DELAY;
        proposal.queued = true;
        emit ProposalQueued(proposalId, proposal.executionTime);
    }

    function executeProposal(uint256 proposalId) external onlyMember whenNotPaused {
        Proposal storage proposal = proposals[proposalId];
        require(!proposal.executed && !proposal.expired, "Proposal cannot be executed");
        require(proposal.queued, "Proposal must be queued first");
        require(block.timestamp >= proposal.executionTime, "Timelock period not ended");

        proposal.executed = true;

        if (proposal.recipient != address(0) && proposal.tokenAmount > 0) {
            require(token.transfer(proposal.recipient, proposal.tokenAmount), "Token transfer failed");
        }
        emit ProposalExecuted(proposalId);
    }

    function getActiveProposals() external view returns (uint256[] memory) {
        uint256 activeCount = 0;
        for (uint256 i = 0; i < proposals.length; i++) {
            if (!proposals[i].executed && !proposals[i].expired) {
                activeCount++;
            }
        }
        
        uint256[] memory activeProposals = new uint256[](activeCount);
        uint256 currentIndex = 0;
        
        for (uint256 i = 0; i < proposals.length; i++) {
            if (!proposals[i].executed && !proposals[i].expired) {
                activeProposals[currentIndex] = i;
                currentIndex++;
            }
        }
        return activeProposals;
    }

    function getVotingPower(address member) external view returns (uint256) {
        return shares[member];
    }

    function pauseDAO() external onlyAdmin {
        require(!isPaused, "DAO is already paused");
        isPaused = true;
        emit DAOPaused(msg.sender);
    }

    function unpauseDAO() external onlyAdmin {
        require(isPaused, "DAO is not paused");
        isPaused = false;
        emit DAOUnpaused(msg.sender);
    }
}