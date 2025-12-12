// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";

contract HashedVoice is AccessControl {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant ELECTION_ADMIN_ROLE = keccak256("ELECTION_ADMIN_ROLE");
    bytes32 public constant CANDIDATE_MANAGER_ROLE = keccak256("CANDIDATE_MANAGER_ROLE");

    struct Candidate {
        uint256 id;
        string name;
        uint256 votes;
    }

    struct VoterInfo {
        bool hasVoted;
        uint256 votedFor;
        string admission;
    }

    struct Election {
        uint256 id;
        string name;
        string description;
        bool votingOpen;
        string minAdmisson;
        string maxAdmisson;
        uint256 candidateCount;
        uint256 totalVotes;

        //mapping

        mapping(uint256 => Candidate) candidates;
        mapping(address => VoterInfo) voters;
    }

    uint256 public electionCount;
    mapping(uint256 => Election) public elections;

    // Events
    event ElectionCreated(uint256 indexed electionId, string name, string minAdmisson, string maxAdmisson);
    event CandidateAdded(uint256 indexed electionId, uint256 indexed candidateId, string name);
    event ElectionOpened(uint256 indexed electionId);
    event ElectionClosed(uint256 indexed electionId);
    event VoterVoted(uint256 indexed electionId, address indexed voter, uint256 indexed candidateId);

    //Modifiers for RoleVerification

    modifier onlyAdminRole() {
        require(hasRole(ADMIN_ROLE, msg.sender),"Requires ADMIN_ROLE");
        _;
    }

    modifier onlyElectionAdmin() {
        require(hasRole(ELECTION_ADMIN_ROLE, msg.sender) || hasRole(ADMIN_ROLE, msg.sender),"Requires ELECTION_ADMIN_ROLE");
        _;
    }

    modifier onlyCandidateManager() {
        require(hasRole(CANDIDATE_MANAGER_ROLE, msg.sender) || hasRole(ADMIN_ROLE, msg.sender),"Requires CANDIDATE_MANAGER_ROLE");
        _;
    }

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }

    //...............................................
    //Election Lifecycle
    //..............................................

    function createElection(string memory _name, string memory _description, string memory _minAdmisson, string memory _maxAdmisson) external onlyElectionAdmin returns (uint256) {
        require(bytes(_name).length > 0, "Election name required");
        require(_compareStrings(_minAdmisson, _maxAdmisson) <=0, "Invalid admission range");

        electionCount+=1;
        uint256 id = electionCount;

        Election storage e = elections[id];
        e.id = id;
        e.name = _name;
        e.description = _description;
        e.votingOpen = false;
        e.minAdmisson = _minAdmisson;
        e.maxAdmisson = _maxAdmisson;
        e.candidateCount = 0;
        e.totalVotes = 0;

        emit ElectionCreated(id, _name, _minAdmisson, _maxAdmisson);
        return id;
    }

    function addCandidate(uint256 _electionId, string memory _name) external onlyCandidateManager {
        Election storage e = _requireElectionExists(_electionId);
        require(!e.votingOpen, "Cannot add candidates while voting is open");
        require(bytes(_name).length > 0, "Candidate name required");

        e.candidateCount += 1;
        uint256 cid = e.candidateCount;
        e.candidates[cid] = Candidate(cid, _name, 0);

        emit CandidateAdded(_electionId, cid, _name);
    }

    function openElection(uint256 _electionId) external onlyElectionAdmin {
        Election storage e = _requireElectionExists(_electionId);
        require(!e.votingOpen, "Election already open");
        require(e.candidateCount > 0, "No candidates");
        e.votingOpen = true;
        emit ElectionOpened(_electionId);
    }

    function closeElection(uint256 _electionId) external onlyElectionAdmin {
        Election storage e = _requireElectionExists(_electionId);
        require(e.votingOpen, "Election already closed");
        e.votingOpen = false;
        emit ElectionClosed(_electionId);
    }

    //..............................................
    // voting
    //.............................................

    function vote(uint256 _electionId, uint256 _candidateId, string memory _admission) external {
        Election storage e = _requireElectionExists(_electionId);
        require(e.votingOpen, "Voting is closed");
        
        require(_compareStrings(_admission, e.minAdmisson) >=0 && _compareStrings(_admission, e.maxAdmisson) <=0, "Not allowed");

        VoterInfo storage v = e.voters[msg.sender];
        require(!v.hasVoted, "Already voted");
        require(_candidateId > 0 && _candidateId <= e.candidateCount, "Invalid candidate");

        v.hasVoted = true;
        v.votedFor = _candidateId;
        v.admission = _admission;

        e.candidates[_candidateId].votes += 1;
        e.totalVotes += 1;

        emit VoterVoted(_electionId, msg.sender, _candidateId);
    }

    //..............................................
    // Views
    //.............................................

    //Getting basic election matadata

    function getElectionMetadata(uint256 _electionId) external view returns (
        uint256 id,
        string memory name,
        string memory description,
        bool votingOpen,
        string memory minAdmisson,
        string memory maxAdmisson,
        uint256 candidateCount,
        uint256 totalVotes
    ) {
        Election storage e = _requireElectionExists(_electionId);
        return (
            e.id,
            e.name,
            e.description,
            e.votingOpen,
            e.minAdmisson,
            e.maxAdmisson,
            e.candidateCount,
            (e.votingOpen && !hasRole(ADMIN_ROLE, msg.sender)) ? 0 : e.totalVotes
        );
    }

    //Getting candidate details

    function getCandidate(uint256 _electionId, uint256 _candidateId) external view returns (uint256, string memory, uint256) {
        Election storage e = _requireElectionExists(_electionId);
        require(_candidateId > 0 && _candidateId <= e.candidateCount, "Invalid candidate");
        Candidate storage c = e.candidates[_candidateId];
        uint256 visibleVotes = (e.votingOpen && !hasRole(ADMIN_ROLE, msg.sender)) ? 0 : c.votes;
        return (c.id, c.name, visibleVotes);
    }

    function hasVoted(uint256 _electionId, address _voter) external view returns (bool) {
        Election storage e = _requireElectionExists(_electionId);
        return e.voters[_voter].hasVoted;
    }

    //Admin Only special access for monitoring

    function getCandidateRawVotes(uint256 _electionId, uint256 _candidateId) external view onlyAdminRole returns (uint256) {
        Election storage e = _requireElectionExists(_electionId);
        require(_candidateId > 0 && _candidateId <= e.candidateCount, "Invalid candidate");
        return e.candidates[_candidateId].votes;
    }

    //..............................................
    // Internal Helpers or utilities
    //.............................................

    function _requireElectionExists(uint256 _electionId) internal view returns (Election storage) {
        require(_electionId > 0 && _electionId <= electionCount, "Election does not exist");
        return elections[_electionId];
    }

    //Comparing two strings.

    function _compareStrings(string memory a, string memory b) internal pure returns (int) {
        bytes memory ba = bytes(a);
        bytes memory bb = bytes(b);
        uint minLength = ba.length;
        if (bb.length < minLength) minLength = bb.length;

        for (uint256 i = 0; i < minLength; i++) {
            if (ba[i] < bb[i]) return -1;
            if (ba[i] > bb[i]) return 1;
        }

        if (ba.length < bb.length) return -1;
        if (ba.length > bb.length) return 1;
        return 0; 
    }
}