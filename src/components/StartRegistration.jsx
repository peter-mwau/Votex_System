import { useEffect, useState } from "react";
import { ethers } from "ethers";
import ABI from "../artifacts/contracts/Voting.sol/Voting.json";
import { useEthersSigner } from "../components/useClientSigner";

const contractAddress = import.meta.env.VITE_APP_CONTRACT_ADDRESS;
const contractABI = ABI.abi;

const StartRegistration = () => {
  const signerPromise = useEthersSigner();
  const [error, setError] = useState(null);
  const [registrationStarted, setRegistrationStarted] = useState(false);

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

  //   console.log("Reg: ", registrationStarted);

  return (
    <div className="flex justify-center items-center flex-col pt-20 container">
      <h1 className="text-2xl font-bold mb-6">Start Registration Phase</h1>

      <button
        onClick={startRegistration}
        className={`bg-cyan-950 text-white px-4 py-2 rounded transition duration-300 ease-in-out ${
          registrationStarted
            ? "opacity-50 cursor-not-allowed"
            : "hover:bg-yellow-500"
        }`}
        disabled={registrationStarted}
      >
        Start Registration
      </button>

      {error && <p className="mt-4 text-red-600">{error}</p>}

      <div className="text-gray-800 py-4">
        <p>
          Registration Started:{" "}
          <span className="font-semibold">
            {registrationStarted ? (
              <span className="text-green-500 font-semibold">True</span>
            ) : (
              <span className="text-red-500 font-semibold"></span>
            )}
          </span>
        </p>
      </div>
    </div>
  );
};

export default StartRegistration;
