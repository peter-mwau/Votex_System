import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAccount } from "wagmi";
import { ethers } from "ethers";
import ABI from "../artifacts/contracts/Voting.sol/Voting.json";
import { useEthersSigner } from "../components/useClientSigner";
import { FiMenu, FiX } from "react-icons/fi";
import { IoLogoWechat } from "react-icons/io5";
import { IoHome, IoPersonAdd, IoPerson, IoEye } from "react-icons/io5";

const contractAddress = import.meta.env.VITE_APP_CONTRACT_ADDRESS;
const contractABI = ABI.abi;

const Sidebar = () => {
  const { address } = useAccount();
  const signerPromise = useEthersSigner();
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState(null); // Add error state
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const checkIfAdmin = async () => {
      try {
        // Get the signer
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

        // Fetch the owner address from the contract
        const ownerAddress = await contract.owner();

        console.log("Owner: ", ownerAddress);

        // Compare the owner address with the connected address
        setIsAdmin(ownerAddress.toLowerCase() === address?.toLowerCase());
      } catch (error) {
        console.error("Error fetching owner from contract:", error);
        if (error.code === "CALL_EXCEPTION") {
          console.error("Transaction data:", error.transaction);
          console.error("Revert reason:", error.reason);
        }
        setError("Error checking admin status");
      }
    };

    if (address) {
      checkIfAdmin();
    }
  }, [address, signerPromise]);

  return (
    <>
      {/* Toggle Button */}
      <button
        className="text-2xl md:hidden fixed top-[105px] z-50 left-5 text-cyan-950"
        onClick={() => setOpen(!open)}
      >
        {open ? <FiX /> : <FiMenu />}
      </button>
      <div
        className={`${
          open ? "translate-x-0" : "-translate-x-full"
        } transition-all duration-1000 z-40 flex flex-col h-full bg-gray-100 text-white w-64 p-5 mt-[80px] rounded-tr-md fixed top-0 left-0 md:w-1/4 lg:w-1/6`}
      >
        {/* Logo */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-cyan-950">Voting DApp</h1>
        </div>

        {/* Show error if there is one */}
        {/* {error && <div className="text-red-500 mb-4 text-sm">{error}</div>} */}

        {/* Navigation Links */}
        <nav className="flex-1 space-y-4">
          {isAdmin ? (
            <>
              {/* Admin-only navigation */}
              <h2 className="text-lg font-semibold text-gray-700">
                Admin Actions
              </h2>
              <Link
                to="/home"
                className="block py-2 px-3 rounded text-gray-600 hover:bg-white"
              >
                Dashboard
              </Link>
              <Link
                to="/admin/start-registration"
                className="block py-2 px-3 rounded  text-gray-600 hover:bg-white"
              >
                Start/Stop Registration
              </Link>
              <Link
                to="/admin/start-voting"
                className="block py-2 px-3 rounded  text-gray-600 hover:bg-white"
              >
                Start/Stop Voting
              </Link>
              <Link
                to="/admin/add-positions"
                className="block py-2 px-3 rounded  text-gray-600 hover:bg-white"
              >
                Add Positions
              </Link>
              <Link
                to="/view-voterDetails"
                className="block py-2 px-3 text-gray-600 rounded hover:bg-white"
              >
                View Voters Details
              </Link>
              <Link
                to="/admin/view-candidates"
                className="block py-2 px-3 rounded  text-gray-600 hover:bg-white"
              >
                View Candidates
              </Link>
            </>
          ) : (
            <>
              {/* User-only navigation */}
              <h2 className="text-lg font-semibold text-gray-700">
                User Actions
              </h2>
              <Link
                to="/home"
                className="py-2 px-3 rounded text-gray-600 hover:bg-white flex items-center"
              >
                <IoHome className="mr-2" />
                <span>Dashboard</span>
              </Link>
              <Link
                to="/register-voter"
                className="py-2 px-3 rounded text-gray-600 hover:bg-white flex items-center"
              >
                <IoPersonAdd className="mr-2" />
                <span>Register as Voter</span>
              </Link>
              <Link
                to="/register-candidate"
                className="py-2 px-3 text-gray-600 rounded hover:bg-white flex items-center"
              >
                <IoPerson className="mr-2" />
                <span>Register as Candidate</span>
              </Link>
              <Link
                to="/admin/view-candidates"
                className="py-2 px-3 rounded text-gray-600 hover:bg-white flex items-center"
              >
                <IoEye className="mr-2" />
                <span>View Candidates</span>
              </Link>
              <Link
                to="/chatbot"
                className="py-2 px-3 rounded text-gray-600 hover:bg-white flex items-center"
              >
                <IoLogoWechat className="mr-2" />
                <span>Chatbot</span>
              </Link>
            </>
          )}
        </nav>

        {/* Footer for smaller screens */}
        <div className="text-center text-sm text-gray-400">
          &copy; 2024 Voting DApp
        </div>
      </div>
    </>
  );
};

export default Sidebar;
