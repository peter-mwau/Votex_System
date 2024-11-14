import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useAccount } from "wagmi";
import { useEthersSigner } from "../components/useClientSigner";
import ABI from "../artifacts/contracts/Voting.sol/Voting.json";

const contractAddress = import.meta.env.VITE_APP_CONTRACT_ADDRESS;
const contractABI = ABI.abi;

const CandidateRegistration = () => {
  const [voterDetails, setVoterDetails] = useState(null);
  const [party, setParty] = useState("");
  const { address, isConnected } = useAccount();
  const signerPromise = useEthersSigner();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchVoterDetails = async () => {
    if (isConnected && address) {
      try {
        const signer = await signerPromise;
        if (!signer) {
          console.error("No signer available. Please connect your wallet.");
          return;
        }
        const contract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );
        const isRegistered = await contract.isVoterRegistered(address);
        if (isRegistered) {
          const voter = await contract.voters(address);
          const voterDetails = {
            names: voter.names,
            age: Number(voter.age),
            idNumber: voter.idNumber,
            votes: Number(voter.votes),
            verified: Boolean(voter.verified),
            voted: Boolean(voter.voted),
          };
          setVoterDetails(voterDetails);
        } else {
          setVoterDetails(null);
        }
      } catch (error) {
        console.error("Error fetching voter details:", error);
      }
    }
  };

  useEffect(() => {
    fetchVoterDetails();
  }, [isConnected, address]);

  const resetFormFields = () => {
    setParty("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    if (isConnected && address) {
      try {
        const signer = await signerPromise;
        const contract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );
        await contract.registerCandidate(
          voterDetails.names,
          voterDetails.age,
          voterDetails.idNumber,
          party
        );
        alert("Candidate registered successfully!");
        setSuccess("Candidate Registered Successfully!");
        resetFormFields();
      } catch (error) {
        console.error("Error registering candidate:", error);
        setError("Failed to register candidate. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="container mx-auto justify-center items-center pt-[100px] bg-white">
      <div className="w-4/5 max-w-lg bg-white shadow-md rounded-lg p-6">
        {voterDetails ? (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Register as a Candidate
            </h2>
            {success ? (
              <p className="text-center text-green-500 pb-2">{success}</p>
            ) : (
              <p className="text-red-600 text-sm mb-4">{error}</p>
            )}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="w-full">
                <h3 className="text-gray-600 font-medium">Name:</h3>
                <p className=" font-semibold shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                  {voterDetails.names}
                </p>
              </div>
              <div className="w-full">
                <h3 className="text-gray-600 font-medium">Age:</h3>
                <p className=" font-semibold shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                  {voterDetails.age}
                </p>
              </div>
              <div className="w-full">
                <h3 className="text-gray-600 font-medium">ID Number:</h3>
                <p className=" font-semibold shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                  {voterDetails.idNumber}
                </p>
              </div>
              <div className="w-full">
                <h3 className="text-gray-600 font-medium">Votes:</h3>
                <p className=" font-semibold shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                  {Number(voterDetails.votes)}
                </p>
              </div>
              <div className="w-full">
                <h3 className="text-gray-600 font-medium">Verified:</h3>
                <p className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                  {voterDetails.verified ? (
                    <span className="text-green-500 font-semibold">True</span>
                  ) : (
                    <span className="text-red-500 font-semibold">False</span>
                  )}
                </p>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-600 font-medium mb-2">
                  Party:
                </label>
                <input
                  type="text"
                  name="party"
                  value={party}
                  onChange={(e) => setParty(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
                />
              </div>
              <button
                type="submit"
                className={`bg-cyan-950 text-white font-semibold w-full items-center justify-center mx-auto flex m-2 rounded-md dark:bg-yellow-500 p-2  focus:outline-none focus:shadow-outline ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={loading}
              >
                {loading ? "Registering..." : "Register Candidate"}
              </button>
            </form>
          </div>
        ) : (
          <p className="text-center text-red-500">
            You need to register as a voter first.
          </p>
        )}
      </div>
    </div>
  );
};

export default CandidateRegistration;
