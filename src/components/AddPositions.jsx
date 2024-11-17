import React, { useState } from "react";
import { ethers } from "ethers";
import ABI from "../artifacts/contracts/Voting.sol/Voting.json";
import { useDisconnect, useAccount } from "wagmi";
import { useEthersSigner } from "../components/useClientSigner";
import { MdOutlineAddTask } from "react-icons/md";

const contractAddress = import.meta.env.VITE_APP_CONTRACT_ADDRESS;
const contractABI = ABI.abi;

const AddPositionsForm = ({ onClose }) => {
  const { isConnected, address } = useAccount();
  const { disconnect } = useDisconnect();
  const signerPromise = useEthersSigner();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [positions, setPositions] = useState([{ name: "" }]);

  const resetFormFields = () => {
    setPositions([{ name: "" }]);
  };

  const handlePositionChange = (index, event) => {
    const newPositions = positions.slice();
    newPositions[index].name = event.target.value.trimStart();
    setPositions(newPositions);
  };

  const addPositionField = () => {
    setPositions([...positions, { name: "" }]);
  };

  const addPositions = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      if (positions.some((position) => !position.name.trim())) {
        setError("Please fill in all required fields");
        return;
      }

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

      const tx = await contract.addPositions(
        positions.map((position) => position.name)
      );

      const receipt = await tx.wait();

      if (receipt.status === 1) {
        setSuccess("Positions added successfully!");
        resetFormFields();
      } else {
        setError("Transaction failed. Please try again.");
      }
    } catch (err) {
      console.error("Error adding positions:", err);
      setError(
        err.reason ||
          err.message ||
          "Failed to add positions. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-16 px-4">
      <div className="max-w-lg mx-auto">
        <div className="bg-white dark:bg-gray-900 shadow-md rounded-lg p-6">
          <h2 className="text-2xl font-bold text-center text-cyan-950 dark:text-white mb-4">
            Add Positions
          </h2>
          {success && (
            <p className="text-center text-green-500 mb-4">{success}</p>
          )}
          {error && <p className="text-center text-red-600 mb-4">{error}</p>}
          {positions.map((position, index) => (
            <div className="mb-4" key={index}>
              <label
                htmlFor={`position-${index}`}
                className="block text-sm font-semibold text-gray-900 dark:text-white mb-2"
              >
                Position {index + 1} Name:
              </label>
              <input
                id={`position-${index}`}
                type="text"
                placeholder="e.g. President"
                value={position.name}
                onChange={(e) => handlePositionChange(index, e)}
                required
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:bg-gray-800 dark:text-white"
              />
            </div>
          ))}
          <button
            type="button"
            onClick={addPositionField}
            className="flex items-center justify-center w-full px-4 py-2 mb-4 text-white bg-cyan-600 rounded-md hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <MdOutlineAddTask className="mr-2" />
            Add Another Position
          </button>
          <button
            type="button"
            onClick={addPositions}
            disabled={loading}
            className={`w-full px-4 py-2 text-white bg-cyan-950 rounded-md dark:bg-yellow-500 hover:bg-cyan-700 focus:outline-none focus:ring-2 ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Adding..." : "Add Positions"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddPositionsForm;
