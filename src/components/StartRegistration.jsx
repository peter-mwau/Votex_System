import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { useNavigate } from "react-router-dom";
import { AlertCircle, CheckCircle, Play } from "lucide-react";
import ABI from "../artifacts/contracts/Voting.sol/Voting.json";
import { useEthersSigner } from "../components/useClientSigner";

const contractAddress = import.meta.env.VITE_APP_CONTRACT_ADDRESS;
const contractABI = ABI.abi;

const StartRegistration = () => {
  const signerPromise = useEthersSigner();
  const [error, setError] = useState(null);
  const [registrationStarted, setRegistrationStarted] = useState(false);
  const navigate = useNavigate();

  const fetchStatus = async () => {
    try {
      const signer = await signerPromise;
      const contract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );
      const regStatus = await contract.registrationStarted();
      setRegistrationStarted(regStatus);
    } catch (error) {
      console.error("Error fetching status:", error);
    }
  };

  const startRegistration = async () => {
    try {
      const signer = await signerPromise;
      const contract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );
      const tx = await contract.startRegistration();
      await tx.wait();
      fetchStatus(); // Refresh status after starting registration
    } catch (error) {
      setError("Failed to start registration: " + error.message);
      console.error(error);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Main Content Card */}
        <div className="bg-white shadow-xl rounded-lg overflow-hidden mt-10">
          {/* Header */}
          <div className="bg-gray-200 p-8 text-cyan-950">
            <h1 className="text-3xl font-bold text-center mb-4">
              Start Registration Phase
            </h1>
            <p className="text-center text-gray-600 italic">
              Begin the registration process for voters and candidates.
            </p>
          </div>

          {/* Status Section */}
          <div className="p-6">
            {/* Action Card */}
            <div className="mb-8 bg-gradient-to-r from-cyan-500 to-cyan-950 rounded-lg p-6 text-white shadow-lg">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Play className="h-8 w-8" />
                  <h2 className="text-2xl font-bold">Registration Status</h2>
                </div>
                <div className="text-lg font-semibold">
                  {registrationStarted ? (
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-6 w-6 text-white" />
                      <span>Registration is Active</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="h-6 w-6 text-red-500" />
                      <span>Registration Not Started</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Start Registration Button */}
            <div className="text-center">
              <button
                onClick={startRegistration}
                className={`bg-cyan-950 text-white px-6 py-3 rounded-lg font-bold transition duration-300 ease-in-out ${
                  registrationStarted
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-yellow-500"
                }`}
                disabled={registrationStarted}
              >
                {registrationStarted
                  ? "Registration Already Started"
                  : "Start Registration"}
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mt-6 bg-red-50 p-4 rounded-lg text-red-700 flex items-center">
                <AlertCircle className="h-5 w-5 mr-2" />
                <span>{error}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StartRegistration;
