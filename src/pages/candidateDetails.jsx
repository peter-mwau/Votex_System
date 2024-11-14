import React, { useState, useEffect } from "react";
import { useCandidates } from "../contexts/candidateContext";
import {
  FaUser,
  FaIdBadge,
  FaVoteYea,
  FaCheckCircle,
  FaCalendarAlt,
} from "react-icons/fa";
import { ethers } from "ethers";
import ABI from "../artifacts/contracts/Voting.sol/Voting.json";
import { useEthersSigner } from "../components/useClientSigner";
import { useAccount } from "wagmi";

const contractAddress = import.meta.env.VITE_APP_CONTRACT_ADDRESS;
const contractABI = ABI.abi;

const CandidateViewPage = () => {
  const { candidates, loading } = useCandidates();
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const signerPromise = useEthersSigner();
  const { address } = useAccount();
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    const checkIfAdmin = async () => {
      try {
        const signer = await signerPromise;
        if (!signer) {
          setError("No signer available. Please connect your wallet.");
          return;
        }
        const contract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );
        const ownerAddress = await contract.owner();
        console.log("Owner Address:", ownerAddress);
        console.log("User Address:", address);
        setIsAdmin(ownerAddress.toLowerCase() === address?.toLowerCase());
        console.log("isAdmin: ", isAdmin);
      } catch (error) {
        console.error("Error fetching owner from contract:", error);
        setError("Error checking admin status");
      }
    };

    if (address) {
      checkIfAdmin();
    }
  }, [address, signerPromise, contractAddress, contractABI]);

  if (loading) return <p className="text-center text-gray-500">Loading...</p>;
  if (error) return <p className="text-center text-red-500">Error: {error}</p>;

  const handleApprove = async (idNumber) => {
    try {
      const signer = await signerPromise;
      const contract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );
      const tx = await contract.verifyCandidate(idNumber);
      await tx.wait();
      console.log(`Approved candidate with ID: ${idNumber}`);
      setSuccess("Candidate approved successfully");
    } catch (error) {
      console.error("Error approving candidate:", error);
    }
  };

  const handleReject = async (candidateId) => {
    try {
      // Connect to the Ethereum network
      const signer = await signerPromise;
      const contract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );

      const tx = await contract.rejectCandidate(candidateId);
      await tx.wait();
      console.log("Candidate rejected successfully");
      console.log(`Rejected candidate with ID: ${candidateId}`);
      setSuccess("Candidate rejected successfully");
      setRefresh(!refresh);
    } catch (error) {
      console.error("Error rejecting candidate:", error);
      setError("Error rejecting candidate:", error);
    }
  };

  const handleVote = (candidateId) => {
    console.log(`Voted for candidate with ID: ${candidateId}`);
  };

  return (
    <div className="container mx-auto p-4 pt-[80px]">
      <h1 className="text-3xl font-bold mb-6 text-center text-cyan-950">
        Candidates
      </h1>
      {success ? (
        <p className="text-center text-green-500 pb-2">{success}</p>
      ) : (
        <p className="text-red-600 text-sm mb-4">{error}</p>
      )}
      {candidates.length === 0 ? (
        <p className="text-center text-gray-500">No candidates available</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {candidates.map((candidate, index) => (
            <div
              key={index}
              className="bg-gradient-to-b from-gray-50 to-gray-200 shadow-lg rounded-lg p-6 hover:shadow-2xl transition duration-300 transform hover:-translate-y-1"
            >
              <h2 className="text-2xl font-semibold text-cyan-900 mb-4 flex items-center">
                <FaUser className="mr-2 text-cyan-800" />
                {candidate[0]}
              </h2>
              <div className="border-t border-gray-300 my-4"></div>
              <div className="grid grid-cols-2 gap-4">
                <p className="text-gray-700 flex items-center">
                  <FaCalendarAlt className="mr-2 text-cyan-800" />
                  Age:{" "}
                  <span className="ml-1 font-medium">
                    {parseInt(candidate[1], 10)}
                  </span>
                </p>
                <p className="text-gray-700 flex items-center">
                  <FaIdBadge className="mr-2 text-cyan-800" />
                  ID: <span className="ml-1 font-medium">{candidate[2]}</span>
                </p>
                <p className="text-gray-700 flex items-center">
                  <FaVoteYea className="mr-2 text-cyan-800" />
                  Party:{" "}
                  <span className="ml-1 font-medium">{candidate[3]}</span>
                </p>
                <p className="text-gray-700 flex items-center">
                  <FaVoteYea className="mr-2 text-cyan-800" />
                  Votes:{" "}
                  <span className="ml-1 font-medium">
                    {parseInt(candidate[4], 10)}
                  </span>
                </p>
                <p className="text-gray-700 flex items-center">
                  <FaCheckCircle className="mr-2 text-cyan-800" />
                  Verified:{" "}
                  <span
                    className={`ml-1 font-semibold ${
                      candidate[5] ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {candidate[5] ? "True" : "False"}
                  </span>
                </p>
                <p className="text-gray-700 flex items-center">
                  <FaUser className="mr-2 text-cyan-800" />
                  Pos: <span className="ml-1 font-medium">{candidate[6]}</span>
                </p>
              </div>
              {!candidate[5] && isAdmin && (
                <div className="mt-4 flex justify-between">
                  <button
                    onClick={() => handleApprove(candidate[2])}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(candidate[2])}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                  >
                    Reject
                  </button>
                </div>
              )}
              {candidate[5] && (
                <div className="mt-4">
                  <button
                    onClick={() => handleVote(candidate[2])}
                    className="bg-cyan-950 font-semibold hover:cursor-pointer hover:bg-yellow-500 text-white px-3 py-2 rounded"
                  >
                    Vote
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CandidateViewPage;
