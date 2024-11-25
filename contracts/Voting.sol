// SPDX-License-Identifier: MIT

pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract Voting is ERC20 {
    uint256 public constant MAX_SUPPLY = 1000000 * 10 ** 18;
    uint256 public constant REGISTER_AS_VOTER = 5 * 10 ** 18;
    uint256 public constant VERIFY_CANDIDATE = 10 * 10 ** 18;

    using ECDSA for bytes32;
    using Strings for uint256;

    address public owner;
    uint256 public votingEndTime;

    struct Voter {
        string names;
        uint256 age;
        string idNumber;
        bool voted;
    }

    struct Candidate {
        string names;
        uint256 age;
        string idNumber;
        string party;
        uint256 votes;
        bool verified;
        string position;
        Profile profile;
    }

    struct Position {
        string pName;
        Candidate[] candidates;
    }

    struct Profile {
        string education;
        string achievements;
        string experience;
        string policies;
    }

    Voter[] public listOfVoters;
    Candidate[] public listOfCandidates;
    Position[] public listOfPositions;

    mapping(string => Voter) public voterObject;
    mapping(string => Candidate) public candidateObject;
    mapping(string => Position) public positions;
    mapping(address => Voter) public voters;
    mapping(string => bool) private positionExists;
    mapping(address => mapping(string => bool)) public hasVotedForPosition;

    bool public registrationStarted = false;
    bool public votingStarted = false;

    event VoterRegistrationSuccess(string indexed _names, uint256 _age, string indexed _idNumber);
    event CandidateRegistrationSuccess(string indexed _names, uint256 _age, string indexed _idNumber, string _party, string _position);
    event VerifyCandidateSuccess(string indexed _names, string indexed _idNumber);
    event RejectCandidateSuccess(string indexed _idNumber);
    event MintSuccess(address _to, uint256 _amount);
    event VotedSuccess(address indexed voter, string _idNumber, string position, uint256 candidateIndex);
    event RegistrationStarted();
    event RegistrationEnded();
    event VotingStarted();
    event VotingEnded();
    event PositionAdded(string positionName);
    event Debug(string message, address voter, string position, bool hasVoted);

    modifier onlyDuringRegistration() {
        require(registrationStarted, "Registration period has not started.");
        require(!votingStarted, "Cannot register during voting period.");
        _;
    }

    modifier onlyDuringVoting() {
        require(!registrationStarted, "Registration period is still active.");
        require(votingStarted, "Voting has not started yet.");
        _;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "You are not the owner!");
        _;
    }

    constructor() ERC20("Votex", "VTKN") {
        owner = msg.sender;
    }

    // Internal mint function
    function mintToken(address _to, uint256 _amount) internal returns (bool) {
        require(_amount + totalSupply() <= MAX_SUPPLY, "Token limit exceeded!");
        _mint(_to, _amount);

        emit MintSuccess(_to, _amount);
        return true;
    }

    // Register as a voter
    function registerVoter(string memory _names, uint256 _age, string memory _idNumber) external onlyDuringRegistration returns (bool) {
        require(bytes(voterObject[_idNumber].names).length == 0, "Voter already exists!");
        require(voters[msg.sender].age == 0, "Account already registered as voter");

        Voter memory newVoter = Voter(_names, _age, _idNumber, false); // `voted` set to `false`
        listOfVoters.push(newVoter);
        voterObject[_idNumber] = newVoter;
        voters[msg.sender] = newVoter;

        mintToken(msg.sender, REGISTER_AS_VOTER);

        emit VoterRegistrationSuccess(_names, _age, _idNumber);
        return true;
    }

    // Register as a candidate
    function registerCandidate(string memory _names, uint256 _age, string memory _idNumber, string memory _party, string memory _position, string memory _education, string memory _achievements, string memory _experience, string memory _policies) external onlyDuringRegistration {
        require(bytes(candidateObject[_idNumber].names).length == 0, "Candidate already exists!");
        require(bytes(voterObject[_idNumber].names).length != 0, "You must be a registered voter!");

        Candidate memory newCandidate = Candidate(_names, _age, _idNumber, _party, 0, false, _position, Profile(_education, _achievements, _experience, _policies)); // `votes` set to `0` and `verified` to `false`
        listOfCandidates.push(newCandidate);
        candidateObject[_idNumber] = newCandidate;

        require(positions[_position].candidates.length >= 0, "Position does not exist!");

        positions[_position].candidates.push(newCandidate);

        emit CandidateRegistrationSuccess(_names, _age, _idNumber, _party, _position);
    }

    // Verify a candidate
    function verifyCandidate(string memory _idNumber) external onlyOwner {
        require(!candidateObject[_idNumber].verified, "Candidate already verified!");
        candidateObject[_idNumber].verified = true;

        // Find the candidate in the listOfCandidates array and update
        for (uint i = 0; i < listOfCandidates.length; i++) {
            if (keccak256(abi.encodePacked(listOfCandidates[i].idNumber)) == keccak256(abi.encodePacked(_idNumber))) {
                listOfCandidates[i].verified = true;
                break;
            }
        }

        mintToken(msg.sender, VERIFY_CANDIDATE);

        emit VerifyCandidateSuccess(candidateObject[_idNumber].names, _idNumber);
    }

    // Reject a candidate
    function rejectCandidate(string memory _idNumber) external onlyOwner {
        require(bytes(candidateObject[_idNumber].names).length != 0, "Candidate does not exist!");

        // Remove the candidate from the list
        for (uint i = 0; i < listOfCandidates.length; i++) {
            if (keccak256(abi.encodePacked(listOfCandidates[i].idNumber)) == keccak256(abi.encodePacked(_idNumber))) {
                // Shift elements down to remove the candidate from the array
                for (uint j = i; j < listOfCandidates.length - 1; j++) {
                    listOfCandidates[j] = listOfCandidates[j + 1];
                }
                listOfCandidates.pop(); // Remove the last element
                delete candidateObject[_idNumber]; // Remove from mapping

                emit RejectCandidateSuccess(_idNumber);
                break;
            }
        }
    }

    // Voting function
    function vote(string memory position, uint candidateIndex) public onlyDuringVoting {
    Voter storage voter = voters[msg.sender];
    emit Debug("Checking position validity", msg.sender, position, false);
    require(positions[position].candidates.length > 0, "Invalid position.");
    emit Debug("Checking candidate index validity", msg.sender, position, false);
    require(candidateIndex < positions[position].candidates.length, "Invalid candidate index.");
    emit Debug("Checking if already voted for position", msg.sender, position, hasVotedForPosition[msg.sender][position]);
    require(!hasVotedForPosition[msg.sender][position], "You have already voted for this position.");

    // Increment the votes in the positions mapping
    positions[position].candidates[candidateIndex].votes += 1;

    // Find the candidate ID number
    string memory candidateIdNumber = positions[position].candidates[candidateIndex].idNumber;

    // Increment the votes in the listOfCandidates array
    for (uint i = 0; i < listOfCandidates.length; i++) {
        if (keccak256(abi.encodePacked(listOfCandidates[i].idNumber)) == keccak256(abi.encodePacked(candidateIdNumber))) {
            listOfCandidates[i].votes += 1;
            break;
        }
    }

    // Increment the votes in the candidateObject mapping
    candidateObject[candidateIdNumber].votes += 1;

    // Mark as voted for the position
    hasVotedForPosition[msg.sender][position] = true;

    emit VotedSuccess(msg.sender, voter.idNumber, position, candidateIndex);
    emit Debug("Vote successful", msg.sender, position, true);
}


    // Function to check if a voter has voted for a specific position
    function hasVoted(address voter, string memory position) public view returns (bool) {
        return hasVotedForPosition[voter][position];
    }

    // Start the registration process
    function startRegistration() public onlyOwner {
        require(!registrationStarted, "Registration has already started.");
        require(!votingStarted, "Cannot start registration after voting has begun.");
        registrationStarted = true;

        emit RegistrationStarted();
    }

    // End the registration and start the voting process
    function endRegistrationAndStartVoting(uint256 votingDays) public onlyOwner {
        require(registrationStarted, "Registration period has not started.");
        require(!votingStarted, "Voting has already started.");

        registrationStarted = false;
        votingStarted = true;
        votingEndTime = block.timestamp + (votingDays * 1 days);

        emit RegistrationEnded();
        emit VotingStarted();
    }

    // Check if the voting period has ended
    function hasVotingEnded() public view returns (bool) {
        return votingStarted && block.timestamp >= votingEndTime;
    }

    // Fetch the voting end time
    function getVotingEndTime() public view returns (uint256) {
        return votingEndTime;
    }

    // End the voting process manually
    function endVoting() public onlyOwner {
        require(votingStarted, "Voting has not started.");
        require(block.timestamp < votingEndTime, "Voting period has not ended.");

        votingStarted = false;
        votingEndTime = 0;
        registrationStarted = true;

        emit VotingEnded();
    }

    // Add one or multiple positions
    function addPositions(string[] memory _pNames) external onlyOwner onlyDuringRegistration {
        for (uint i = 0; i < _pNames.length; i++) {
            require(!positionExists[_pNames[i]], "Position already exists!");
            Position storage newPosition = positions[_pNames[i]];
            newPosition.pName = _pNames[i];
            listOfPositions.push(newPosition);

            positionExists[_pNames[i]] = true;

            emit PositionAdded(_pNames[i]);
        }
    }

    function getPositionCount() public view returns (uint256) {
        return listOfPositions.length;
    }

    function getAllPositions() public view returns (Position[] memory) {
        return listOfPositions;
    }

    function getVoters() public view returns (Voter[] memory) {
        return listOfVoters;
    }

    function getCandidates() public view returns (Candidate[] memory) {
        return listOfCandidates;
    }

    function isVoterRegistered(address _account) public view returns (bool) {
    return bytes(voters[_account].names).length != 0;
    }

    function getCandidateProfile(string memory _idNumber) public view returns (Profile memory) {
        return candidateObject[_idNumber].profile;
    }

    function isCandidateRegistered(string memory _idNumber) public view returns (bool) {
    return bytes(candidateObject[_idNumber].names).length > 0;
    }


    function createMessageHash(
    address userAddress,
    string memory domain,
    string memory statement,
    string memory uri,
    uint256 chainId,
    uint256 nonce
  ) public pure returns (bytes32) {
    return keccak256(
      abi.encodePacked(
        "\x19Ethereum Signed Message:\n",
        "Domain: ", domain, "\n",
        "Address: ", Strings.toHexString(uint256(uint160(userAddress)), 20), "\n",
        "Statement: ", statement, "\n",
        "URI: ", uri, "\n",
        "Version: 1\n",
        "Chain ID: ", chainId.toString(), "\n",
        "Nonce: ", nonce.toString()
      )
    );
  }

  function verifySignature(bytes32 hash, bytes memory signature) external view returns (bool) {
    bytes32 signedHash = keccak256(
            abi.encodePacked("\x19Ethereum Signed Message:\n32", hash)
        );
    address recovered = ECDSA.recover(signedHash, signature);
    
    return recovered == msg.sender;
  }
}
       
