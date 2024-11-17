import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import ABI from "../artifacts/contracts/Voting.sol/Voting.json";
import { useDisconnect, useAccount } from "wagmi";
import { useEthersSigner } from "../components/useClientSigner";
import { upload } from "../providers/fileStorageConfig";

const contractAddress = import.meta.env.VITE_APP_CONTRACT_ADDRESS;
const contractABI = ABI.abi;

const AddVoterForm = ({ onClose }) => {
  const { isConnected, address } = useAccount();
  const { disconnect } = useDisconnect();
  const signerPromise = useEthersSigner();
  const [isRegistered, setIsRegistered] = useState(false);

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
    setIsVoted(false);
  };

  const checkVoterRegistration = async () => {
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
      const isRegistered = await contract.isVoterRegistered(address);
      setIsRegistered(isRegistered);
    } catch (err) {
      setError("Failed to check voter registration. Please try again.");
    }
  };

  useEffect(() => {
    if (isConnected && address) {
      checkVoterRegistration();
    }
  }, [isConnected, address]);

  const registerVoter = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      if (!officialNames || !idNumber || !age || parseInt(age) < 18) {
        setError("All fields are required. Age must be 18 or above.");
        return;
      }

      const signer = await signerPromise;
      const contract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );
      const tx = await contract.registerVoter(
        officialNames,
        parseInt(age),
        idNumber
      );
      await tx.wait();

      const voterData = JSON.stringify({ officialNames, idNumber, age, voted });
      const blob = new Blob([voterData], { type: "application/json" });
      const file = new File([blob], `${idNumber}.json`);
      await upload({ target: { files: [file] } }, "voter_data");

      setSuccess("Voter registered successfully!");
      resetFormFields();
    } catch (err) {
      setError("Failed to register voter. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto h-auto p-6 pt-[100px]">
      <div className="flex justify-center items-center">
        <div className="w-full max-w-md bg-white dark:bg-gray-900 shadow-md rounded px-8 py-6">
          <h2 className="text-2xl font-bold text-center text-cyan-950 dark:text-yellow-500 mb-6">
            {isRegistered ? "Voter Already Registered" : "Register as a Voter"}
          </h2>
          {error && <p className="text-red-500 text-center mb-4">{error}</p>}
          {success && (
            <p className="text-green-500 text-center mb-4">{success}</p>
          )}

          {!isRegistered && (
            <form>
              <fieldset className="space-y-4">
                <legend className="sr-only">Voter Registration Form</legend>
                <div>
                  <label
                    htmlFor="officialNames"
                    className="block text-gray-900 dark:text-white font-medium"
                  >
                    Official Names
                  </label>
                  <input
                    type="text"
                    id="officialNames"
                    placeholder="e.g., John Doe"
                    value={officialNames}
                    onChange={(e) => setOfficialNames(e.target.value)}
                    className="w-full px-4 py-2 border rounded-md focus:ring focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label
                    htmlFor="idNumber"
                    className="block text-gray-900 dark:text-white font-medium"
                  >
                    ID Number
                  </label>
                  <input
                    type="text"
                    id="idNumber"
                    placeholder="Enter your ID number"
                    value={idNumber}
                    onChange={(e) => setIdNumber(e.target.value)}
                    className="w-full px-4 py-2 border rounded-md focus:ring focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label
                    htmlFor="age"
                    className="block text-gray-900 dark:text-white font-medium"
                  >
                    Age
                  </label>
                  <input
                    type="number"
                    id="age"
                    placeholder="Enter your age"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full px-4 py-2 border rounded-md focus:ring focus:ring-cyan-500"
                  />
                </div>
              </fieldset>
              <button
                type="button"
                onClick={registerVoter}
                className={`mt-6 w-full py-2 px-4 bg-cyan-950 text-white font-bold rounded-lg shadow-md dark:bg-yellow-500 ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={loading}
              >
                {loading ? "Registering..." : "Register Voter"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddVoterForm;
