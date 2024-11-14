import { useState } from "react";
import { ethers } from "ethers";
import { useAccount } from "wagmi";
import { useNavigate } from "react-router-dom";
import ABI from "../artifacts/contracts/Voting.sol/Voting.json";
import { useEthersSigner } from "../components/useClientSigner";
import { useCandidates } from "../contexts/candidateContext";

const contractAddress = import.meta.env.VITE_APP_CONTRACT_ADDRESS;
const contractABI = ABI.abi;

const Home = () => {
  const { isConnected } = useAccount();
  const [message, setMessage] = useState("");
  const [signature, setSignature] = useState("");
  const [hashedMessage, setHashedMessage] = useState("");
  const [verificationStatus, setVerificationStatus] = useState(false);
  const signerPromise = useEthersSigner();
  const [verificationResult, setVerificationResult] = useState("");
  const navigate = useNavigate();
  const { candidates, loading, error } = useCandidates();

  console.log("candidates: ", candidates);

  const handleSignMessage = async () => {
    if (!isConnected) {
      setVerificationStatus("Connect your wallet first");
      return;
    }

    try {
      const signer = await signerPromise;
      if (!signer) {
        setVerificationResult("Signer not found");
        return;
      }
      // Fixed values for login
      const domain = "signature-wave.com";
      const statement = "Sign in to Signature Wave";
      const uri = "https://signature-wave.com";
      const nonce = Date.now();
      const chainId = await signer.provider
        .getNetwork()
        .then((network) => network.chainId);
      const userAddress = await signer.getAddress();

      // Connect to the contract
      const contract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );

      // Create message hash using contract's method
      const messageHash = await contract.createMessageHash(
        userAddress,
        domain,
        statement,
        uri,
        chainId,
        nonce
      );

      setHashedMessage(messageHash);

      // Sign the message hash
      const signature = await signer.signMessage(ethers.getBytes(messageHash));

      setSignature(signature);

      // Verify the signature using the contract
      const isVerified = await contract.verifySignature(messageHash, signature);

      if (isVerified) {
        setVerificationStatus(isVerified ? "True" : "False");
        setVerificationResult("Verification Successfull!!");
        setTimeout(() => {
          navigate("/home");
        }, 1500);
      } else {
        setVerificationResult("Login failed - signature verification error");
      }
    } catch (error) {
      console.error("Error signing message:", error);
      setVerificationStatus(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <>
      <div className="bg-white min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-lg bg-white shadow-md rounded-lg p-8 space-y-6">
          <h1 className="text-2xl font-semibold text-center text-gray-800">
            Sign and Verify Message
          </h1>

          {isConnected && (
            <>
              <div className="flex flex-col">
                <label className="text-sm text-gray-600">Message</label>
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="mt-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter message to sign"
                />
              </div>

              <button
                onClick={handleSignMessage}
                className="w-full py-2 px-4 bg-cyan-950 text-white font-semibold rounded-lg hover:bg-yellow-500 transition-colors"
              >
                Sign Message
              </button>

              {signature && (
                <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                  <div>
                    <span className="font-semibold">Original Message:</span>{" "}
                    <span className="break-words">{message}</span>
                  </div>
                  <div>
                    <span className="font-semibold">Hashed Message:</span>{" "}
                    <span className="break-words">{hashedMessage}</span>
                  </div>
                  <div>
                    <span className="font-semibold">Signature:</span>{" "}
                    <span className="break-words">{signature}</span>
                  </div>
                  <div>
                    <span className="font-semibold">Verification Status:</span>{" "}
                    <span className="italic text-green-500 font-semibold">
                      {verificationStatus}
                    </span>
                  </div>

                  <div>
                    <span className="font-semibold">Verification Result:</span>{" "}
                    <span className="text-yellow-500 italic">
                      {verificationResult}
                    </span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Home;
