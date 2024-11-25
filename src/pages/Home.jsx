import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useAccount } from "wagmi";
import { useNavigate } from "react-router-dom";
import {
  Clock,
  Users,
  Vote,
  AlertCircle,
  ArrowRightCircle,
} from "lucide-react";
import ABI from "../artifacts/contracts/Voting.sol/Voting.json";
import { useEthersSigner } from "../components/useClientSigner";
import { useCandidates } from "../contexts/candidateContext";

const contractAddress = import.meta.env.VITE_APP_CONTRACT_ADDRESS;
const contractABI = ABI.abi;

const Home = () => {
  const { isConnected } = useAccount();
  const [timeLeft, setTimeLeft] = useState("");
  const [votingStarted, setVotingStarted] = useState(false);
  const signerPromise = useEthersSigner();
  const navigate = useNavigate();
  const { candidates, loading, error } = useCandidates();
  const [totalVotes, setTotalVotes] = useState(0);

  const fetchVotingStatus = async () => {
    try {
      const signer = await signerPromise;
      const contract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );
      const status = await contract.votingStarted();
      const endTime = await contract.getVotingEndTime();
      setVotingStarted(status);
      // Calculate total votes
      const votes = candidates.reduce(
        (acc, curr) => acc + Number(curr.voteCount),
        0
      );
      // setTotalVotes(votes);
      return endTime;
    } catch (error) {
      console.error("Error fetching voting status:", error);
    }
  };

  const calculateTimeLeft = (endTime) => {
    const now = Math.floor(Date.now() / 1000);
    const endTimeNumber = Number(endTime);
    const difference = endTimeNumber - now;

    if (difference <= 0) return "Voting has ended";

    const days = Math.floor(difference / (24 * 60 * 60));
    const hours = Math.floor((difference % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((difference % (60 * 60)) / 60);
    const seconds = difference % 60;

    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  };

  const getTotalVotes = (candidates) => {
    const votes = candidates.reduce((acc, curr) => acc + Number(curr.votes), 0);
    setTotalVotes(votes);
    return votes;
  };

  useEffect(() => {
    console.log("totalVotes: ", getTotalVotes(candidates));
  }, [candidates]);

  useEffect(() => {
    const updateStatus = async () => {
      const endTime = await fetchVotingStatus();
      if (endTime) {
        const interval = setInterval(() => {
          setTimeLeft(calculateTimeLeft(endTime));
        }, 1000);
        return () => clearInterval(interval);
      }
    };
    updateStatus();
  }, [candidates]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 p-4 rounded-lg flex items-center text-red-700">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Main Content Card */}
        <div className="bg-white shadow-xl rounded-lg overflow-hidden mt-10">
          {/* Header */}
          <div className="bg-gray-200 p-8 text-cyan-950">
            <h1 className="text-3xl font-bold text-center mb-4">
              Votex System
            </h1>
            <p className="text-center text-gray-600 italic">
              Secure, transparent, and immutable voting platform
            </p>
          </div>

          {/* Status Section */}
          <div className="p-6">
            {/* Timer Card */}
            <div className="mb-8 bg-gradient-to-r from-cyan-500 to-cyan-950 rounded-lg p-6 text-white shadow-lg">
              <div className="flex flex-col md:flex-row lg:flex-row gap-4 items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Clock className="h-8 w-8" />
                  <h2 className="text-2xl font-bold">Time Remaining</h2>
                </div>
                <div className="text-4xl font-mono font-bold tracking-wider">
                  {timeLeft}
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Voting Status */}
              <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                <div className="flex items-center space-x-3 mb-2">
                  <Vote className="h-6 w-6 text-yellow-500" />
                  <h3 className="text-lg font-semibold text-gray-700">
                    Status
                  </h3>
                </div>
                <div className="flex items-center space-x-2">
                  <div
                    className={`h-3 w-3 rounded-full ${
                      votingStarted ? "bg-green-500" : "bg-red-500"
                    } animate-pulse`}
                  ></div>
                  <span className="text-lg font-medium">
                    {votingStarted ? "Voting Active" : "Voting Inactive"}
                  </span>
                </div>
              </div>

              {/* Total Candidates */}
              <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                <div className="flex items-center space-x-3 mb-2">
                  <Users className="h-6 w-6 text-yellow-500" />
                  <h3 className="text-lg font-semibold text-gray-700">
                    Candidates
                  </h3>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {candidates.length}
                </p>
              </div>

              {/* Total Votes */}
              <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                <div className="flex items-center space-x-3 mb-2">
                  <Vote className="h-6 w-6 text-yellow-500" />
                  <h3 className="text-lg font-semibold text-gray-700">
                    Total Votes
                  </h3>
                </div>
                <p className="text-2xl font-bold text-gray-900">{totalVotes}</p>
              </div>
            </div>

            {/* Connection Status */}
            <div className="text-center">
              {!isConnected && (
                <div className="inline-flex items-center px-4 py-2 rounded-md bg-yellow-50 text-yellow-800 border border-yellow-200">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  Please connect your wallet to participate
                </div>
              )}
            </div>

            {/* Navigation to Mock Trial */}
            <div className="text-center">
              <button
                onClick={() => navigate("/base-page")}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-cyan-500 to-cyan-950 rounded-lg text-white text-lg font-bold shadow-lg transform transition-transform hover:scale-105"
              >
                <span>Go to Mock Trial</span>
                <ArrowRightCircle className="h-6 w-6 ml-2" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
