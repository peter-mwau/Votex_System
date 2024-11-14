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
    }

    struct Position {
        string pName;
        Candidate[] candidates;
    }

    Voter[] public listOfVoters;
    Candidate[] public listOfCandidates;
    Position[] public listOfPositions;

    mapping(string => Voter) public voterObject;
    mapping(string => Candidate) public candidateObject;
    mapping(string => Position) public positions;
    mapping(address => Voter) public voters;
     mapping(string => bool) private positionExists;

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
    event PositionAdded(string positionName);

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
    function registerCandidate(string memory _names, uint256 _age, string memory _idNumber, string memory _party, string memory _position) external onlyDuringRegistration {
        require(bytes(candidateObject[_idNumber].names).length == 0, "Candidate already exists!");
        require(bytes(voterObject[_idNumber].names).length != 0, "You must be a registered voter!");

        Candidate memory newCandidate = Candidate(_names, _age, _idNumber, _party, 0, false, _position); // `votes` set to `0` and `verified` to `false`
        listOfCandidates.push(newCandidate);
        candidateObject[_idNumber] = newCandidate;

        emit CandidateRegistrationSuccess(_names, _age, _idNumber, _party, _position);
    }

    // Verify a candidate
    function verifyCandidate(string memory _idNumber) external onlyOwner {
        require(!candidateObject[_idNumber].verified, "Candidate already verified!");
        candidateObject[_idNumber].verified = true;

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
        require(!voter.voted, "You have already voted.");
        require(positions[position].candidates.length > 0, "Invalid position.");
        require(candidateIndex < positions[position].candidates.length, "Invalid candidate index.");

        positions[position].candidates[candidateIndex].votes += 1;
        voter.voted = true;

        emit VotedSuccess(msg.sender, voter.idNumber, position, candidateIndex);
    }

    // Start the registration process
    function startRegistration() public onlyOwner {
        require(!registrationStarted, "Registration has already started.");
        require(!votingStarted, "Cannot start registration after voting has begun.");
        registrationStarted = true;

        emit RegistrationStarted();
    }

    // End the registration and start the voting process
    function endRegistrationAndStartVoting() public onlyOwner {
        require(registrationStarted, "Registration period has not started.");
        require(!votingStarted, "Voting has already started.");

        registrationStarted = false;
        votingStarted = true;

        emit RegistrationEnded();
        emit VotingStarted();
    }

    // Add one or multiple positions
    function addPositions(string[] memory _pNames) external onlyOwner {
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
       
