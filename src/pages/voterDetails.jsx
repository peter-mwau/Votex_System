// VoterDetails.jsx
import React, { useEffect, useState } from "react";
import { useEthersSigner } from "../components/useClientSigner";
import { ethers } from "ethers";
import { usePublicClient, useWalletClient } from "wagmi";
import ABI from "../artifacts/contracts/Voting.sol/Voting.json";

const VoterDetails = () => {
  const [voters, setVoters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const signerPromise = useEthersSigner();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const contractAddress = import.meta.env.VITE_APP_CONTRACT_ADDRESS;
  const contractABI = ABI.abi;

  async function getVotersFromContract(signer) {
    try {
      if (!signer) {
        throw new Error("Signer is required to access the contract.");
      }

      const contract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );

      // Fetch the list of voters at once
      const voters = await contract.getVoters();
      return voters.map((voter) => ({
        names: voter.names,
        age: Number(voter.age),
        idNumber: voter.idNumber,
        voted: Boolean(voter.voted),
      }));
    } catch (error) {
      console.error("Detailed error in getVotersFromContract:", error);
      throw new Error(`Contract error: ${error.message}`);
    }
  }

  useEffect(() => {
    const fetchVoterDetails = async () => {
      try {
        setLoading(true);
        setError("");

        const signer = await signerPromise;
        if (!signer) {
          throw new Error("Please connect your wallet");
        }

        // Fetch all voters at once
        const voters = await getVotersFromContract(signer);

        // Update state with the fetched voters
        setVoters(voters);
        console.log("Voters: ", voters);
      } catch (error) {
        console.error("Detailed error in fetchVoterDetails:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchVoterDetails();
  }, [signerPromise, walletClient]);

  return (
    <div className="w-full max-w-4xl mx-auto p-4 pt-[100px]">
      <h2 className="text-2xl font-bold mb-4">Registered Voters</h2>

      {loading && (
        <div className="text-center py-4">
          <p className="text-blue-400">Loading voter details...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && voters.length === 0 && (
        <div className="text-center py-4">
          <p className="text-gray-500">No registered voters found</p>
        </div>
      )}

      {voters.length > 0 && (
        <div className="grid gap-4">
          {voters.map((voter, index) => (
            <div key={index} className="bg-white shadow rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Official Names</p>
                  <p className="font-semibold">{voter.names}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">ID Number</p>
                  <p className="font-semibold">{voter.idNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Age</p>
                  <p className="font-semibold">{voter.age}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Voted Status</p>
                  <p className="font-semibold">
                    {voter.voted ? (
                      <span className="text-green-500 font-semibold">True</span>
                    ) : (
                      <span className="text-red-500 font-semibold">False</span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VoterDetails;
