import { useEffect, useState } from "react";
import { ethers } from "ethers";
import ABI from "../artifacts/contracts/Voting.sol/Voting.json";
import { useEthersSigner } from "../components/useClientSigner";

const contractAddress = import.meta.env.VITE_APP_CONTRACT_ADDRESS;
const contractABI = ABI.abi;

const StartVoting = () => {
  const signerPromise = useEthersSigner();
  const [status, setStatus] = useState("");
  const [votingStarted, setVotingStarted] = useState(false);

  // Function to fetch the current registration and voting status
  const fetchStatus = async () => {
    try {
      const signer = await signerPromise;
      const contract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );

      const voteStatus = await contract.votingStarted();
      setVotingStarted(voteStatus);
    } catch (error) {
      console.error("Error fetching voting status:", error);
    }
  };

  // Function to start the voting process
  const startVoting = async () => {
    try {
      const signer = await signerPromise;
      const contract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );

      const tx = await contract.endRegistrationAndStartVoting();
      await tx.wait();
      setStatus("Voting has been started successfully.");
      fetchStatus(); // Refresh the voting status after starting
    } catch (error) {
      setStatus("Failed to start voting: " + error.message);
      console.error(error);
    }
  };

  // Fetch voting status on component mount
  useEffect(() => {
    fetchStatus();
  }, []);

  return (
    <div className="flex justify-center items-center flex-col pt-20 container">
      <h1 className="text-2xl font-bold mb-6">Start Voting Phase</h1>

      <button
        onClick={startVoting}
        className="bg-cyan-950 hover:bg-yellow-500 text-white px-4 py-2 rounded transition duration-300 ease-in-out"
        disabled={votingStarted} // Disable the button if voting has already started
      >
        Start Voting
      </button>

      {status && (
        <p
          className={`mt-4 text-lg font-semibold ${
            status.includes("successfully") ? "text-green-500" : "text-red-600"
          }`}
        >
          {status}
        </p>
      )}

      {/* Display the current voting status */}
      <p className="mt-4 text-gray-700">
        Voting Started:{" "}
        <span
          className={
            votingStarted
              ? "text-green-500 font-semibold"
              : "text-red-600 font-semibold"
          }
        >
          {votingStarted ? "True" : "False"}
        </span>
      </p>
    </div>
  );
};

export default StartVoting;
