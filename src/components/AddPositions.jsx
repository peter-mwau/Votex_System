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
    newPositions[index].name = event.target.value;
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

      // Input validation
      if (positions.some((position) => !position.name)) {
        setError("Please fill in all required fields");
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

      // Execute the blockchain transaction
      const tx = await contract.addPositions(
        positions.map((position) => position.name)
      );

      // Wait for transaction confirmation
      const receipt = await tx.wait();

      if (receipt.status === 1) {
        setSuccess("Positions added successfully!");
        resetFormFields();
      } else {
        setError("Transaction failed. Please try again.");
      }
    } catch (err) {
      console.error("Error adding positions:", err);
      if (err.reason) {
        setError(err.reason);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError("Failed to add positions. Please try again.");
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
                Add Positions
              </h2>
              {success ? (
                <p className="text-center text-green-500 pb-2">{success}</p>
              ) : (
                <p className="text-red-600 text-sm mb-4">{error}</p>
              )}
              {positions.map((position, index) => (
                <div className="mb-4" key={index}>
                  <label
                    className="block text-gray-900 dark:text-white text-sm font-bold mb-2"
                    htmlFor={`position-${index}`}
                  >
                    Position {index + 1} Name:
                  </label>
                  <input
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    id={`position-${index}`}
                    type="text"
                    placeholder="e.g President"
                    value={position.name}
                    onChange={(e) => handlePositionChange(index, e)}
                    required
                  />
                </div>
              ))}

              <button
                type="button"
                onClick={addPositionField}
                className="bg-cyan-600 text-white font-semibold w-auto m-2 rounded-lg p-2 focus:outline-none focus:shadow-outline flex items-center"
              >
                <MdOutlineAddTask className="mr-2" />
                Add Another Position
              </button>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={addPositions}
                  className={`bg-cyan-950 text-white font-semibold w-auto m-2 rounded-lg dark:bg-yellow-500 p-2  focus:outline-none focus:shadow-outline ${
                    loading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  disabled={loading}
                >
                  {loading ? "Adding..." : "Add Positions"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddPositionsForm;
