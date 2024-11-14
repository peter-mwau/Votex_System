import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useAccount } from "wagmi";
import { useEthersSigner } from "../components/useClientSigner";
import ABI from "../artifacts/contracts/Voting.sol/Voting.json";
import { upload } from "../providers/fileStorageConfig";
import { usePositions } from "../contexts/positionsContext";

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
  const [position, setPosition] = useState("");
  const {
    positions,
    loading: positionsLoading,
    error: positionsError,
  } = usePositions();

  console.log("Positions: ", positions);
  console.log("Positions Loading: ", positionsLoading);
  console.log("Positions Error: ", positionsError);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
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

        console.log("Form Data: ", {
          officialNames: formData.officialNames,
          idNumber: formData.idNumber,
          age: formData.age,
          votes: formData.votes,
          verified: formData.verified,
          party: formData.party,
          position: formData.position,
        });

        console.log("Data Types: ", {
          officialNames: typeof formData.officialNames,
          idNumber: typeof formData.idNumber,
          age: typeof formData.age,
          votes: typeof formData.votes,
          verified: typeof formData.verified,
          party: typeof formData.party,
          position: typeof formData.position,
        });

        // Input validation
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

        // Only proceed with storage if transaction was successful
        if (receipt.status === 1) {
          // Prepare the data for storage
          const jsonString = JSON.stringify(formData);
          const blob = new Blob([jsonString], { type: "application/json" });
          const file = new File([blob], `${formData.idNumber}.json`, {
            type: "application/json",
          });

          // Create a DataTransfer object and add the file
          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(file);

          // Create a temporary file input element with the DataTransfer
          const tempFileInput = document.createElement("input");
          tempFileInput.type = "file";
          tempFileInput.files = dataTransfer.files;

          // Upload to SKALE storage only after successful transaction
          await upload({ target: tempFileInput }, "candidate_data");

          setSuccess("Candidate Registered Successfully!");
          resetFormFields();

          // Listen for the VoterRegistrationSuccess event
          contract.on(
            "CandidateRegistrationSuccess",
            (names, age, idNumber, party) => {
              console.log("Candidate Registration Event:", {
                names,
                age,
                idNumber,
                party,
              });
            }
          );
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
      <div className=" max-w-lg bg-white shadow-md rounded-lg p-6 w-[90%] items-center lg:items-start lg:justify-start lg:mx-0 justify-center mx-auto">
        {voterDetails ? (
          <div className="">
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
                  0
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
              <div className="flex flex-row w-full gap-4">
                <div className="items-start">
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
                <div className="mb-4 w-full items-end">
                  <label
                    className="block text-gray-600 font-medium mb-2"
                    htmlFor="position"
                  >
                    Position:
                  </label>
                  <select
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    id="position"
                    name="position"
                    value={position}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select a position</option>
                    {positionsLoading ? (
                      <option>Loading positions...</option>
                    ) : (
                      positions.map((position, index) => (
                        <option key={index} value={position}>
                          {position}
                        </option>
                      ))
                    )}
                  </select>
                </div>
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
