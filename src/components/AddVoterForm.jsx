import React, { useContext, useState, useEffect } from "react";
import { ethers } from "ethers";
import ABI from "../artifacts/contracts/Voting.sol/Voting.json";
import { IoCloseCircleSharp } from "react-icons/io5";
import axios from "axios";
import { useDisconnect, useAccount } from "wagmi";
import { useEthersSigner } from "../components/useClientSigner";

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

  return (
    <>
      <div className="container mx-auto h-auto">
        <div className="flex justify-center items-center mt-[20px]">
          <IoCloseCircleSharp
            className="absolute w-10 h-10 text-red-600 bg-white hover:cursor-pointer items-end justify-end mx-auto flex text-end left-[85%] top-[50px] rounded-full"
            onClick={onClose}
          />
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
                  //   onClick={registerVoter}
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
