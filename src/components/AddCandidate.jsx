import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useAccount } from "wagmi";
import { useEthersSigner } from "../components/useClientSigner";
import ABI from "../artifacts/contracts/Voting.sol/Voting.json";
import { upload } from "../providers/fileStorageConfig";
import { usePositions } from "../contexts/positionsContext";
import { AlertCircle } from "lucide-react";

const contractAddress = import.meta.env.VITE_APP_CONTRACT_ADDRESS;
const contractABI = ABI.abi;

const CandidateRegistration = () => {
  const [voterDetails, setVoterDetails] = useState(null);
  const [party, setParty] = useState("");
  const [isCandidate, setIsCandidate] = useState(false);
  const { address, isConnected } = useAccount();
  const signerPromise = useEthersSigner();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [position, setPosition] = useState("");
  const {
    positions,
    loading: positionsLoading,
    error: positionsError,
  } = usePositions();

  const handleInputChange = (event) => {
    const { value } = event.target;
    setPosition(value);
  };

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

        // Check if the wallet is registered as a voter
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

          // Check if the wallet is already registered as a candidate
          const isCandidate = await contract.isCandidateRegistered(
            voter.idNumber
          );
          setIsCandidate(isCandidate); // Add a state for tracking candidate status
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
    setPosition("");
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

        const formData = {
          officialNames: voterDetails.names,
          idNumber: voterDetails.idNumber,
          age: Number(voterDetails.age),
          votes: 0,
          verified: false,
          party: party,
          position: position.replace(/,$/, "").trim(),
        };

        if (
          !formData.officialNames ||
          !formData.idNumber ||
          !formData.age ||
          !formData.party ||
          !formData.position
        ) {
          setError("Please fill in all required fields");
          return;
        }

        const tx = await contract.registerCandidate(
          formData.officialNames,
          formData.age,
          formData.idNumber,
          formData.party,
          formData.position
        );

        const receipt = await tx.wait();
        if (receipt.status === 1) {
          const jsonString = JSON.stringify(formData);
          const blob = new Blob([jsonString], { type: "application/json" });
          const file = new File([blob], `${formData.idNumber}.json`, {
            type: "application/json",
          });

          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(file);

          const tempFileInput = document.createElement("input");
          tempFileInput.type = "file";
          tempFileInput.files = dataTransfer.files;

          await upload({ target: tempFileInput }, "candidate_data");

          setSuccess("Candidate Registered Successfully!");
          resetFormFields();
        } else {
          setError("Transaction failed. Please try again.");
        }
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
      <div className="max-w-lg bg-white shadow-md rounded-lg p-6 w-[90%] items-center lg:items-start lg:justify-start lg:mx-0 justify-center mx-auto">
        {isCandidate ? (
          <p className="text-xl font-bold text-center text-cyan-950 dark:text-yellow-500 mb-6 flex flex-row gap-2 my-auto">
            <AlertCircle className="h-6 w-6 text-red-600" />
            You are already registered as a candidate.
          </p>
        ) : voterDetails ? (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Register as a Candidate
            </h2>
            {success && (
              <p className="text-center text-green-500 pb-2">{success}</p>
            )}
            {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-row w-full gap-4">
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
                <div>
                  <label className="block text-gray-600 font-medium mb-2">
                    Position:
                  </label>
                  <select
                    id="position"
                    name="position"
                    value={position}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
                  >
                    <option value="">Select a position</option>
                    {positionsLoading ? (
                      <option>Loading positions...</option>
                    ) : (
                      positions.map((pos, index) => (
                        <option key={index} value={pos}>
                          {pos}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className={`bg-cyan-950 text-white w-full rounded-md p-2 ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
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
