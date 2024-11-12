import React, { useState } from "react";
import { ethers } from "ethers";
import ABI from "../artifacts/contracts/Voting.sol/Voting.json";
import { useDisconnect, useAccount } from "wagmi";
import { useEthersSigner } from "../components/useClientSigner";
import { upload } from "../providers/fileStorageConfig";

const contractAddress = import.meta.env.VITE_APP_CONTRACT_ADDRESS;
const contractABI = ABI.abi;

const AddVoterForm = ({ onClose }) => {
  const { isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const signerPromise = useEthersSigner();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [officialNames, setOfficialNames] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [age, setAge] = useState("");
  const [voted, setIsVoted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const resetFormFields = () => {
    setOfficialNames("");
    setIdNumber("");
    setAge("");
    setIsVoted(null);
  };

  const formData = {
    officialNames,
    idNumber,
    age,
    voted,
  };

  const registerVoter = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      // Input validation
      if (!officialNames || !idNumber || !age) {
        setError("Please fill in all required fields");
        return;
      }

      if (parseInt(age) < 18) {
        setError("Voter must be at least 18 years old");
        return;
      }

      // Get the signer
      const signer = await signerPromise;
      if (!signer) {
        setError("No signer available. Please connect your wallet.");
        return;
      }

      // Create contract instance
      const contract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );

      // Convert age to number for contract interaction
      const ageNumber = parseInt(age);

      // First execute the blockchain transaction
      const tx = await contract.registerVoter(
        officialNames,
        ageNumber,
        idNumber
      );

      // Wait for transaction confirmation
      const receipt = await tx.wait();

      // Only proceed with storage if transaction was successful
      if (receipt.status === 1) {
        // Prepare the data for storage
        const jsonString = JSON.stringify(formData);
        const blob = new Blob([jsonString], { type: "application/json" });
        const file = new File([blob], `${idNumber}.json`, {
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
        await upload({ target: tempFileInput }, "voter_data");

        setSuccess("Voter registered successfully!");
        resetFormFields();

        // Listen for the VoterRegistrationSuccess event
        contract.on("VoterRegistrationSuccess", (names, age, idNumber) => {
          console.log("Voter Registration Event:", { names, age, idNumber });
        });
      } else {
        setError("Transaction failed. Please try again.");
      }
    } catch (err) {
      console.error("Registration error:", err);
      if (err.reason) {
        setError(err.reason);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError("Failed to register voter. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="container mx-auto h-auto ">
        <div className="flex justify-center items-center pt-[100px]">
          <div className="w-full max-w-md">
            <form className="bg-white dark:bg-gray-900 shadow-md rounded px-8 pt-6 pb-8 mb-4 dark:shadow-white">
              <h2 className="text-center uppercase font-semibold text-cyan-950 dark:text-white pb-5 text-2xl">
                Voter Form
              </h2>
              {success ? (
                <p className="text-center text-green-500 pb-2">{success}</p>
              ) : (
                <p className="text-red-600 text-sm mb-4">{error}</p>
              )}
              <div className="flex flex-row gap-5 w-full">
                {/* Official Names */}
                <div className="mb-4 w-[50%]">
                  <label
                    className="block text-gray-900 dark:text-white text-sm font-bold mb-2"
                    htmlFor="officialNames"
                  >
                    Official Names:
                  </label>
                  <input
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    id="officialNames"
                    type="text"
                    placeholder="e.g John Doe"
                    value={officialNames}
                    onChange={(e) => setOfficialNames(e.target.value)}
                    required
                  />
                </div>

                {/* ID Number */}
                <div className="mb-4 w-[50%]">
                  <label
                    className="block text-gray-900 dark:text-white text-sm font-bold mb-2"
                    htmlFor="idNumber"
                  >
                    ID Number:
                  </label>
                  <input
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    id="idNumber"
                    type="text"
                    placeholder="ID Number"
                    value={idNumber}
                    onChange={(e) => setIdNumber(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="flex flex-row gap-5 w-full">
                {/* Voted */}
                <div className="mb-4 w-[50%]">
                  <label
                    className="block text-gray-900 dark:text-white text-sm font-bold mb-2"
                    htmlFor="text"
                  >
                    Voted:
                  </label>
                  <input
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    id="voted"
                    type="text"
                    placeholder="Voting Status"
                    value={voted}
                    onChange={(e) => setIsVoted(e.target.value)}
                    required
                  />
                </div>

                {/* Age */}
                <div className="mb-4 w-[50%]">
                  <label
                    className="block text-gray-900 dark:text-white text-sm font-bold mb-2"
                    htmlFor="age"
                  >
                    Age:
                  </label>
                  <input
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    id="age"
                    type="number"
                    placeholder="Age"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    min="18"
                    required
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={registerVoter}
                  className={`bg-cyan-950 text-white font-semibold w-auto m-2 rounded-lg dark:bg-yellow-500 p-2  focus:outline-none focus:shadow-outline ${
                    loading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  disabled={loading}
                >
                  {loading ? "Registering..." : "Register Voter"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddVoterForm;
