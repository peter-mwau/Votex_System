import React, { useState, useEffect } from "react";
import { useCandidates } from "../contexts/candidateContext";
import {
  User,
  FileText,
  Award,
  Calendar,
  CheckCircle2,
  MoreVertical,
  ArrowDown,
  ArrowUp,
  XCircle,
} from "lucide-react";
import { ethers } from "ethers";
import ABI from "../artifacts/contracts/Voting.sol/Voting.json";
import { useEthersSigner } from "../components/useClientSigner";
import { useAccount } from "wagmi";
import { GoogleGenerativeAI } from "@google/generative-ai";

const contractAddress = import.meta.env.VITE_APP_CONTRACT_ADDRESS;
const contractABI = ABI.abi;

const CandidateCard = ({
  candidate,
  candidateIndex,
  isAdmin,
  handleApprove,
  handleReject,
  handleVote,
  hasVotedForPosition,
}) => {
  const [isProfileExpanded, setIsProfileExpanded] = useState(false);
  const [factCheckResult, setFactCheckResult] = useState(null);
  const [isFactCheckPopupOpen, setIsFactCheckPopupOpen] = useState(false);
  const position = candidate[6];

  const handleFactCheck = async () => {
    try {
      const genAI = new GoogleGenerativeAI(
        import.meta.env.VITE_APP_GOOGLE_API_KEY
      );
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const info = {
        name: candidate[0],
        education: candidate["relatedObject"][0],
        experience: candidate["relatedObject"][1],
        advocacy: candidate["relatedObject"][2],
        achievements: candidate["relatedObject"][3],
      };

      const prompt = `Carefully analyze the following candidate information and provide a detailed fact-check. For each piece of information, assess its accuracy and provide a brief explanation. At the end, give an overall truthfulness score from 0 to 1, where 1 is completely true and 0 is completely false. 

      Candidate Information:
      ${JSON.stringify(info, null, 2)}

      Please return a JSON response in this format:
      {
        "educationCheck": {
          "isTrue": true/false,
          "explanation": "brief explanation"
        },
        "experienceCheck": {
          "isTrue": true/false,
          "explanation": "brief explanation"
        },
        "advocacyCheck": {
          "isTrue": true/false,
          "explanation": "brief explanation"
        },
        "achievementsCheck": {
          "isTrue": true/false,
          "explanation": "brief explanation"
        },
        "overallTruthScore": 0-1
      }`;

      const result = await model.generateContent(prompt);
      const resultText = result.response.text();

      // Remove any markdown code block formatting
      const jsonMatch = resultText.match(/```json\n([\s\S]*)\n```/);
      const jsonString = jsonMatch ? jsonMatch[1] : resultText;

      const parsedResult = JSON.parse(jsonString);
      setFactCheckResult(parsedResult);
      setIsFactCheckPopupOpen(true);
    } catch (err) {
      console.error("Fact-checking failed:", err);
      setFactCheckResult(null);
    }
  };

  return (
    <div className="relative">
      <div className="bg-gradient-to-b from-gray-50 to-gray-200 shadow-lg rounded-lg p-6 hover:shadow-2xl transition duration-300 transform hover:-translate-y-1">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-cyan-900 flex items-center">
            <User className="mr-2 text-cyan-800" />
            {candidate[0]}
          </h2>
          <button
            onClick={() => setIsProfileExpanded(!isProfileExpanded)}
            className="text-cyan-800 hover:bg-gray-200 rounded-full p-1"
          >
            {isProfileExpanded ? <ArrowUp /> : <MoreVertical />}
          </button>
        </div>

        <div className="border-t border-gray-300 my-4"></div>

        <div className="grid grid-cols-2 gap-4">
          <p className="text-gray-700 flex items-center">
            <Calendar className="mr-2 text-cyan-800" />
            Age:{" "}
            <span className="ml-1 font-medium">
              {parseInt(candidate[1], 10)}
            </span>
          </p>
          <p className="text-gray-700 flex items-center">
            <FileText className="mr-2 text-cyan-800" />
            ID: <span className="ml-1 font-medium">{candidate[2]}</span>
          </p>
          <p className="text-gray-700 flex items-center">
            <Award className="mr-2 text-cyan-800" />
            Party: <span className="ml-1 font-medium">{candidate[3]}</span>
          </p>
          <p className="text-gray-700 flex items-center">
            <Award className="mr-2 text-cyan-800" />
            Votes:{" "}
            <span className="ml-1 font-medium">
              {parseInt(candidate[4], 10)}
            </span>
          </p>
          <p className="text-gray-700 flex items-center">
            <CheckCircle2 className="mr-2 text-cyan-800" />
            Verified:
            <span
              className={`ml-1 font-semibold ${
                candidate[5] ? "text-green-500" : "text-red-500"
              }`}
            >
              {candidate[5] ? "True" : "False"}
            </span>
          </p>
          <p className="text-gray-700 flex items-center">
            <User className="mr-2 text-cyan-800" />
            Position: <span className="ml-1 font-medium">{candidate[6]}</span>
          </p>
        </div>

        {!candidate[5] && isAdmin && (
          <div className="mt-4 flex justify-between">
            <button
              onClick={() => handleApprove(candidate[2])}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Approve
            </button>
            <button
              onClick={() => handleReject(candidate[2])}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Reject
            </button>
          </div>
        )}

        {candidate[5] && (
          <div className="mt-4">
            {!hasVotedForPosition[position] ? (
              <button
                onClick={() => handleVote(position, candidateIndex)}
                className="bg-cyan-950 font-semibold hover:cursor-pointer hover:bg-yellow-500 text-white px-3 py-2 rounded"
              >
                Vote
              </button>
            ) : (
              <button
                className="bg-cyan-950 bg-opacity-50 hover:cursor-not-allowed font-semibold hover:bg-yellow-500 text-white px-3 py-2 rounded"
                disabled
              >
                Vote
              </button>
            )}
          </div>
        )}
      </div>

      {isProfileExpanded && candidate["relatedObject"] && (
        <div className="absolute z-10 w-[600px] bg-white shadow-2xl rounded-b-lg p-6 -mt-2 border-t border-gray-200 transition-all duration-1000 mb-10">
          <div className="grid grid-cols-1 gap-4 mb-5">
            <div className="candidate-details space-y-3 w-full flex flex-row gap-5">
              <div className="flex flex-col w-[50%] gap-4">
                <p className="text-sm text-gray-700 flex flex-col">
                  <span className="font-bold text-cyan-900 mr-2 min-w-[100px]">
                    Education:
                  </span>
                  <span>{candidate["relatedObject"][0]}</span>
                </p>
                <p className="text-sm text-gray-700 flex  flex-col">
                  <span className="font-bold text-cyan-900 mr-2 min-w-[100px]">
                    Experience:
                  </span>
                  <ul className="list-disc list-inside">
                    {candidate["relatedObject"][1]
                      .split(".")
                      .filter((item) => item.trim())
                      .map((item, index) => (
                        <li key={index} className="mb-1">
                          {item.trim()}.
                        </li>
                      ))}
                  </ul>
                </p>
              </div>
              <div className="flex flex-col w-[50%] gap-4">
                <p className="text-sm text-gray-700 flex flex-col">
                  <span className="font-bold text-cyan-900 mr-2 min-w-[100px]">
                    Advocacy:
                  </span>
                  <ul className="list-disc list-inside">
                    {candidate["relatedObject"][2]
                      .split(".")
                      .filter((item) => item.trim())
                      .map((item, index) => (
                        <li key={index} className="mb-1">
                          {item.trim()}.
                        </li>
                      ))}
                  </ul>
                </p>
                <p className="text-sm text-gray-700 flex flex-col">
                  <span className="font-bold text-cyan-900 mr-2 min-w-[100px]">
                    Achievements:
                  </span>
                  <ul className="list-disc list-inside">
                    {candidate["relatedObject"][3]
                      .split(".")
                      .filter((item) => item.trim())
                      .map((item, index) => (
                        <li key={index} className="mb-1">
                          {item.trim()}.
                        </li>
                      ))}
                  </ul>
                </p>
              </div>
            </div>
          </div>
          <div className="mt-4 flex justify-center">
            <button
              onClick={handleFactCheck}
              className="bg-cyan-950 text-white px-4 py-2 rounded hover:bg-cyan-900 flex items-center"
            >
              <CheckCircle2 className="mr-2" /> Fact Check
            </button>
          </div>
        </div>
      )}

      {/* Fact Check Popup */}
      {isFactCheckPopupOpen && factCheckResult && (
        <div className="absolute z-20 top-full left-0 mt-2 w-[600px] bg-white shadow-2xl rounded-lg p-6 border border-gray-200">
          <h3 className="text-xl font-bold mb-4 text-cyan-900">
            Fact Check Results
          </h3>

          <div className="space-y-3 flex flex-row w-full gap-5">
            <div className="flex flex-col w-[50%] gap-4">
              <div>
                <p className="font-semibold">
                  Education:
                  <span
                    className={`ml-2 ${
                      factCheckResult.educationCheck.isTrue
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {factCheckResult.educationCheck.isTrue ? "True" : "False"}
                  </span>
                </p>
                <p className="text-sm text-gray-700">
                  {factCheckResult.educationCheck.explanation}
                </p>
              </div>

              <div>
                <p className="font-semibold">
                  Experience:
                  <span
                    className={`ml-2 ${
                      factCheckResult.experienceCheck.isTrue
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {factCheckResult.experienceCheck.isTrue ? "True" : "False"}
                  </span>
                </p>
                <p className="text-sm text-gray-700">
                  {factCheckResult.experienceCheck.explanation}
                </p>
              </div>
            </div>

            <div className="flex flex-col w-[50%] gap-4">
              <div>
                <p className="font-semibold">
                  Advocacy:
                  <span
                    className={`ml-2 ${
                      factCheckResult.advocacyCheck.isTrue
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {factCheckResult.advocacyCheck.isTrue ? "True" : "False"}
                  </span>
                </p>
                <p className="text-sm text-gray-700">
                  {factCheckResult.advocacyCheck.explanation}
                </p>
              </div>

              <div>
                <p className="font-semibold">
                  Achievements:
                  <span
                    className={`ml-2 ${
                      factCheckResult.achievementsCheck.isTrue
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {factCheckResult.achievementsCheck.isTrue
                      ? "True"
                      : "False"}
                  </span>
                </p>
                <p className="text-sm text-gray-700">
                  {factCheckResult.achievementsCheck.explanation}
                </p>
              </div>
            </div>
          </div>
          <div className="mt-6 mx-auto items-center justify-center flex">
            <div className="flex items-center bg-gray-100 px-4 py-2 rounded-full">
              {factCheckResult.overallTruthScore > 0.5 ? (
                <CheckCircle2 className="mr-2 text-green-700" />
              ) : (
                <XCircle className="mr-2 text-red-700" />
              )}
              <p className="font-bold text-lg text-cyan-950">
                Overall Truthfulness:
                <span
                  className={`ml-2 ${
                    factCheckResult.overallTruthScore > 0.5
                      ? "text-green-700"
                      : "text-red-700"
                  }`}
                >
                  {(factCheckResult.overallTruthScore * 100).toFixed(0)}%
                </span>
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsFactCheckPopupOpen(false)}
            className="mt-4 bg-cyan-950 text-white px-4 py-2 rounded hover:bg-cyan-900 w-full"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};

const VotingPage = () => {
  const { candidates, loading } = useCandidates();
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const signerPromise = useEthersSigner();
  const { address } = useAccount();
  const [refresh, setRefresh] = useState(false);
  const [hasVotedForPosition, setHasVotedForPosition] = useState({});

  useEffect(() => {
    const checkIfAdmin = async () => {
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
        const ownerAddress = await contract.owner();
        setIsAdmin(ownerAddress.toLowerCase() === address?.toLowerCase());
      } catch (error) {
        console.error("Error fetching owner from contract:", error);
        setError("Error checking admin status");
      }
    };

    if (address) {
      checkIfAdmin();
    }
  }, [address, signerPromise, contractAddress, contractABI]);

  useEffect(() => {
    const checkHasVoted = async () => {
      try {
        const signer = await signerPromise;
        const contract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        const positions = [
          ...new Set(candidates.map((candidate) => candidate[6])),
        ];
        const hasVotedPromises = positions.map(async (position) => {
          const hasVoted = await contract.hasVoted(address, position);
          return { position, hasVoted };
        });

        const results = await Promise.all(hasVotedPromises);
        const hasVotedForPosition = results.reduce(
          (acc, { position, hasVoted }) => {
            acc[position] = hasVoted;
            return acc;
          },
          {}
        );

        setHasVotedForPosition(hasVotedForPosition);
      } catch (error) {
        console.error("Error checking vote status:", error);
      }
    };

    if (address && candidates.length > 0) {
      checkHasVoted();
    }
  }, [address, candidates, signerPromise, contractAddress, contractABI]);

  if (loading) return <p className="text-center text-gray-500">Loading...</p>;
  if (error) return <p className="text-center text-red-500">Error: {error}</p>;

  const handleApprove = async (idNumber) => {
    try {
      const signer = await signerPromise;
      const contract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );
      const tx = await contract.verifyCandidate(idNumber);
      await tx.wait();
      setSuccess("Candidate approved successfully");
    } catch (error) {
      console.error("Error approving candidate:", error);
    }
  };

  const handleReject = async (candidateId) => {
    try {
      const signer = await signerPromise;
      const contract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );

      const tx = await contract.rejectCandidate(candidateId);
      await tx.wait();
      setSuccess("Candidate rejected successfully");
      setRefresh(!refresh);
    } catch (error) {
      console.error("Error rejecting candidate:", error);
      setError("Error rejecting candidate:", error);
    }
  };

  const handleVote = async (position, candidateIndex) => {
    try {
      const signer = await signerPromise;
      const contract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );

      console.log("Voting for candidate index:", candidateIndex);
      console.log("Contract address:", contractAddress);
      console.log("Contract ABI:", contractABI);
      console.log("Voting for candidate index:", candidateIndex);

      // Ensure the candidate index is valid
      if (candidateIndex < 0 || candidateIndex >= candidates.length) {
        throw new Error("Invalid candidate index.");
      }

      // Check if the vote function exists on the contract
      if (typeof contract.vote !== "function") {
        console.error("The vote function does not exist on the contract.");
        console.error(
          "Contract methods available:",
          Object.keys(contract.functions)
        );
        throw new Error("The vote function does not exist on the contract.");
      }

      // Estimate gas to check if the transaction is likely to succeed
      // const gasEstimate = await contract.estimateGas.vote(
      //   position,
      //   candidateIndex
      // );
      // console.log("Gas estimate:", gasEstimate.toString());

      const tx = await contract.vote(position, candidateIndex);
      await tx.wait();
      console.log(
        `Voted for candidate at index ${candidateIndex} for position ${position}`
      );
      setSuccess(
        `Voted for candidate at index ${candidateIndex} for position ${position}`
      );
      setHasVotedForPosition((prev) => ({
        ...prev,
        [position]: true,
      }));
    } catch (error) {
      console.error("Full error object:", error);
      if (error && error.message) {
        console.error("Error message:", error.message);
      }
      if (error && error.stack) {
        console.error("Error stack:", error.stack);
      }
    }
  };

  const groupCandidatesByPosition = (candidates) => {
    return candidates.reduce((acc, candidate) => {
      const position = candidate[6];
      if (!acc[position]) {
        acc[position] = [];
      }
      acc[position].push(candidate);
      return acc;
    }, {});
  };

  const groupedCandidates = groupCandidatesByPosition(candidates);

  return (
    <div className="container mx-auto p-4 pt-[80px]">
      <h1 className="text-3xl font-bold mb-6 text-center text-cyan-950 flex justify-center items-center">
        <Award className="mr-3 text-cyan-800" /> Candidates
      </h1>
      {success && <p className="text-center text-green-500 pb-2">{success}</p>}
      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      {Object.keys(groupedCandidates).length === 0 ? (
        <p className="text-center text-gray-500">No candidates available</p>
      ) : (
        Object.keys(groupedCandidates).map((position) => (
          <div key={position} className="mb-8">
            <hr className="my-4 border-t-2 border-gray-300" />
            <h2 className="text-2xl font-bold mb-4 text-cyan-950 flex items-center">
              <User className="mr-2 text-cyan-800" /> {position} Position
            </h2>

            {groupedCandidates[position].length === 0 ? (
              <p className="text-center text-gray-500">
                No candidates for this position
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative">
                {groupedCandidates[position].map((candidate) => {
                  const candidateIndex = candidates.findIndex(
                    (c) => c[2] === candidate[2]
                  );
                  return (
                    <CandidateCard
                      key={candidateIndex}
                      candidate={candidate}
                      candidateIndex={candidateIndex}
                      isAdmin={isAdmin}
                      handleApprove={handleApprove}
                      handleReject={handleReject}
                      handleVote={handleVote}
                      hasVotedForPosition={hasVotedForPosition}
                    />
                  );
                })}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default VotingPage;
