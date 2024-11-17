import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { Clock, PlayCircle, StopCircle, AlertCircle } from "lucide-react";
import ABI from "../artifacts/contracts/Voting.sol/Voting.json";
import { useEthersSigner } from "../components/useClientSigner";

const contractAddress = import.meta.env.VITE_APP_CONTRACT_ADDRESS;
const contractABI = ABI.abi;

const StartVoting = () => {
  const signerPromise = useEthersSigner();
  const [status, setStatus] = useState("");
  const [votingStarted, setVotingStarted] = useState(false);
  const [votingEndTime, setVotingEndTime] = useState(null);
  const [timeLeft, setTimeLeft] = useState("");
  const [votingDays, setVotingDays] = useState(0);
  const [showConfirm, setShowConfirm] = useState(false);

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
      if (voteStatus) {
        const endTime = await contract.getVotingEndTime();
        setVotingEndTime(endTime);
      }
    } catch (error) {
      console.error("Error fetching voting status:", error);
    }
  };

  const startVoting = async () => {
    try {
      const signer = await signerPromise;
      const contract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );
      const tx = await contract.endRegistrationAndStartVoting(votingDays);
      await tx.wait();
      setStatus("Voting has been started successfully.");
      fetchStatus();
    } catch (error) {
      setStatus("Failed to start voting: " + error.message);
    }
  };

  const endVoting = async () => {
    try {
      const signer = await signerPromise;
      const contract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );
      // const gasLimit = await contract.estimateGas
      //   .endVoting()
      //   .catch(() => 1000000);
      const tx = await contract.endVoting();
      await tx.wait();
      setStatus("Voting has been ended successfully.");
      fetchStatus();
    } catch (error) {
      setStatus("Failed to end voting: " + error.message);
    }
  };

  const calculateTimeLeft = (endTime) => {
    const now = Math.floor(Date.now() / 1000);
    const endTimeNumber = Number(endTime);
    const timeLeft = endTimeNumber - now;

    if (timeLeft <= 0) return "Voting has ended.";

    const days = Math.floor(timeLeft / (24 * 60 * 60));
    const hours = Math.floor((timeLeft % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((timeLeft % (60 * 60)) / 60);
    const seconds = timeLeft % 60;

    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(() => {
      if (votingEndTime) {
        setTimeLeft(calculateTimeLeft(votingEndTime));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [votingEndTime]);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-xl rounded-lg overflow-hidden  mt-5">
          {/* Header */}
          <div className="border-b border-gray-200 p-6 text-center">
            <h1 className="text-3xl font-bold text-gray-900">
              Voting Management Dashboard
            </h1>
          </div>

          <div className="p-6">
            {/* Timer Card */}
            {votingStarted && (
              <div className="mb-8 bg-gradient-to-r from-cyan-500 to-cyan-950 rounded-lg p-6 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Clock className="h-8 w-8" />
                    <h2 className="text-2xl font-bold">Time Remaining</h2>
                  </div>
                  <div className="text-4xl font-mono font-bold tracking-wider">
                    {timeLeft}
                  </div>
                </div>
              </div>
            )}

            {/* Status Section */}
            <div className="mb-8">
              <div className="flex items-center justify-center space-x-2">
                <div
                  className={`h-3 w-3 rounded-full ${
                    votingStarted ? "bg-green-500" : "bg-red-500"
                  } animate-pulse`}
                ></div>
                <span className="text-lg font-medium text-gray-700">
                  Status: {votingStarted ? "Voting Active" : "Voting Inactive"}
                </span>
              </div>
            </div>

            {/* Controls Section */}
            <div className="space-y-6">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  startVoting();
                }}
                className="space-y-4"
              >
                <div className="flex flex-col space-y-2">
                  <label
                    htmlFor="votingDays"
                    className="text-sm font-medium text-gray-700"
                  >
                    Voting Duration (days)
                  </label>
                  <input
                    id="votingDays"
                    type="number"
                    value={votingDays}
                    onChange={(e) => setVotingDays(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                    min="1"
                  />
                </div>
                <div className="flex space-x-4">
                  <button
                    type="submit"
                    disabled={votingStarted}
                    className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md text-white transition-colors ${
                      votingStarted
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700"
                    }`}
                  >
                    <PlayCircle className="h-5 w-5" />
                    <span>Start Voting</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowConfirm(true)}
                    disabled={!votingStarted}
                    className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md text-white transition-colors ${
                      !votingStarted
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-red-600 hover:bg-red-700"
                    }`}
                  >
                    <StopCircle className="h-5 w-5" />
                    <span>End Voting</span>
                  </button>
                </div>
              </form>

              {/* Status Messages */}
              {status && (
                <div
                  className={`p-4 rounded-md ${
                    status.includes("successfully")
                      ? "bg-green-50 text-green-800 border border-green-200"
                      : "bg-red-50 text-red-800 border border-red-200"
                  }`}
                >
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 mr-2" />
                    <p>{status}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              End Voting Confirmation
            </h3>
            <p className="text-gray-500 mb-6">
              Are you sure you want to end the current voting session? This
              action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  endVoting();
                  setShowConfirm(false);
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md"
              >
                End Voting
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StartVoting;
