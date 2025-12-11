// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract HashedVoice{
    struct Candidate {
        uint256 id;
        string name;
        uint256 voteCount;
    }

    struct Voter {
        bool isAuthorized;
        bool hasVoted;
        uint256 votedFor;
        string admissionId;
    }

    address public admin;
    bool public votingOpen;

    uint256 public candidatesCount;
    mapping(uint256 => Candidate) public candidates;
    mapping(address => Voter) public voters;

    event CandidateRegistered(uint256 indexed id, string name);
    event VoterAuthorized(address indexed voter, string admissionId);
    event VoteCast(address indexed voter, uint256 indexed candidateId);
    event VotingOpened();
    event VotingClosed();

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action.");
        _;
    }

    modifier whenVotingOpen() {
        require(votingOpen, "Voting is Closed.");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    function addCandidate(string memory _name) external onlyAdmin {
        require(bytes(_name).length > 0, "Name is required.");
        candidatesCount+=1;
        candidates[candidatesCount] = Candidate(candidatesCount, _name, 0);
        emit CandidateRegistered(candidatesCount, _name);
    }

    function authorizeVoter(address _voter, string memory _admissionId) external onlyAdmin {
        require(_voter != address(0), "Invalid voter address.");
        voters[_voter].isAuthorized = true;
        voters[_voter].admissionId = _admissionId;
        emit VoterAuthorized(_voter, _admissionId);
    }

    function openVoting() external onlyAdmin {
        require(!votingOpen, "Voting is already open.");
        votingOpen = true;
        emit VotingOpened();
    }

    function closeVoting() external onlyAdmin {
        require(votingOpen, "Voting is already closed.");
        votingOpen = false;
        emit VotingClosed();
    }

    function vote(uint256 _candidateId) external whenVotingOpen {
        Voter storage sender = voters[msg.sender];
        require(sender.isAuthorized, "You are not authorized to vote.");
        require(!sender.hasVoted, "You have already voted.");
        require(_candidateId > 0 && _candidateId <= candidatesCount, "Invalid candidate ID.");

        sender.hasVoted = true;
        sender.votedFor = _candidateId;
        candidates[_candidateId].voteCount += 1;
        emit VoteCast(msg.sender, _candidateId);
    }

    function getCandidate(uint256 _id) external view returns (uint256, string memory, uint256) {
        Candidate memory c = candidates[_id];
        return (c.id, c.name, c.voteCount);
    }
}