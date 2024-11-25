import { Link } from "react-router-dom";
import { useDisconnect, useAccount, useBalance } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import ABI from "../artifacts/contracts/Voting.sol/Voting.json";
import { useNavigate } from "react-router-dom";
import { useEthersSigner } from "../components/useClientSigner";
import { IoMdWallet } from "react-icons/io";
import { MdOutlineLightMode } from "react-icons/md";
import { MdDarkMode } from "react-icons/md";

const contractAddress = import.meta.env.VITE_APP_CONTRACT_ADDRESS;
const contractABI = ABI.abi;

const Navbar = () => {
  const logo = "/vite.svg";
  const { isConnected, address } = useAccount();
  const { disconnect } = useDisconnect();
  const signerPromise = useEthersSigner();
  const [verificationResult, setVerificationResult] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const { data: balanceData } = useBalance({
    address,
  });
  const [tokenBalance, setTokenBalance] = useState("");
  const [tokenSymbol, setTokenSymbol] = useState("");

  const fetchTokenBalance = async () => {
    if (isConnected && address) {
      try {
        const signer = await signerPromise;
        const contract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        const tokenBalanceRaw = await contract.balanceOf(address);
        const tokenDecimalsRaw = await contract.decimals();
        const tokenSymbol = await contract.symbol();

        const tokenDecimals = Number(tokenDecimalsRaw);
        const formattedTokenBalance =
          Number(tokenBalanceRaw) / 10 ** tokenDecimals;

        setTokenBalance(formattedTokenBalance);
        setTokenSymbol(tokenSymbol);

        console.log("Token Balance: ", formattedTokenBalance);
        console.log("Token Symbol: ", tokenSymbol);
      } catch (error) {
        console.error("Error fetching token balance:", error);
      }
    }
  };

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
  }, [darkMode]);

  useEffect(() => {
    if (dropdownVisible) {
      fetchTokenBalance();
    }
  }, [dropdownVisible, isConnected, address]);

  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
  };

  const signIn = async () => {
    if (!isConnected) {
      setVerificationResult("Connect your wallet first");
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

      // Sign the message hash
      const signature = await signer.signMessage(ethers.getBytes(messageHash));

      // Verify the signature using the contract
      const isVerified = await contract.verifySignature(messageHash, signature);

      if (isVerified) {
        // setVerificationResult("Login successful! Redirecting...");
        setIsLoggedIn(true);
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("userAddress", userAddress);

        setTimeout(() => {
          navigate("/home");
        }, 1500);
      } else {
        setVerificationResult("Login failed - signature verification error");
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.error("Error during login:", error);
      if (error.code === "CALL_EXCEPTION") {
        console.error("Transaction data:", error.transaction);
        console.error("Revert reason:", error.reason);
      }
      setVerificationResult("Error during verification");
    }
  };

  useEffect(() => {
    console.log("LoggedIn ", isLoggedIn);
  }, [isLoggedIn]);

  const signOut = async () => {
    try {
      disconnect();
      setIsLoggedIn(false);
      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="fixed w-full h-auto bg-gray-100 shadow-md p-4 dark:bg-gray-900 dark:text-gray-50 transition-all duration-1000">
      <div className="flex justify-around items-center">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <img src={logo} alt="logo" className="w-10 h-10" />
          <h1 className="text-lg font-bold text-gray-700 dark:text-white">
            Votex System
          </h1>
        </div>

        <div
          id="weglot-language-selector"
          className="flex items-center space-x-2 absolute pt-10 hover:cursor-pointer hover:shadow-lg"
        ></div>

        {/* Navigation Links */}
        <div className="flex gap-6">
          <Link
            to="/home"
            className="text-lg font-semibold text-gray-600 hover:text-gray-800 dark:text-gray-200"
          >
            Home
          </Link>
          {/* <Link
            to="/about"
            className="text-lg font-semibold text-gray-600 hover:text-gray-800 dark:text-gray-200"
          >
            About
          </Link>
          <Link
            to="/contact"
            className="text-lg font-semibold text-gray-600 hover:text-gray-800 dark:text-gray-200"
          >
            Contact
          </Link> */}
          <Link
            to="/help"
            className="text-lg font-semibold text-gray-600 hover:text-gray-800 dark:text-gray-200"
          >
            Help
          </Link>
        </div>

        {/* Connect Button and Sign-In */}
        <div className="flex items-center gap-4">
          {isConnected ? (
            <>
              {isLoggedIn ? (
                <button
                  onClick={signOut}
                  className="bg-red-600 text-white font-semibold rounded-lg px-4 py-2"
                >
                  Sign Out
                </button>
              ) : (
                <button
                  onClick={signIn}
                  className="bg-cyan-600 text-white font-semibold rounded-lg px-4 py-2"
                >
                  Sign In
                </button>
              )}
            </>
          ) : (
            <ConnectButton />
          )}
          <button className="mx-10">
            {darkMode ? (
              <MdOutlineLightMode
                className="w-6 h-6 text-gray-800 dark:text-white"
                onClick={() => setDarkMode(!darkMode)}
              />
            ) : (
              <MdDarkMode
                className="w-6 h-6 text-gray-800 dark:text-white"
                onClick={() => setDarkMode(!darkMode)}
              />
            )}
          </button>
        </div>
        {isConnected ? (
          <IoMdWallet
            onClick={toggleDropdown}
            className="w-[40px] h-[40px] rounded-full p-2 hover:cursor-pointer border-2 border-green-500"
          />
        ) : (
          <IoMdWallet
            onClick={toggleDropdown}
            className="w-[40px] h-[40px] rounded-full p-2 hover:cursor-pointer border-2 border-gray-400"
          />
        )}
        {dropdownVisible && (
          <div className="absolute right-[120px] mt-[330px] w-[350px] bg-white border border-gray-300 rounded-lg shadow-lg">
            <div className="p-4">
              <p className="font-semibold text-lg mb-2">Wallet Details</p>
              <p className="mb-2">
                Status:{" "}
                <span
                  className={
                    isConnected
                      ? "text-green-500 font-semibold"
                      : "text-red-500"
                  }
                >
                  {isConnected ? "Connected" : "Disconnected"}
                </span>
              </p>
              <p className="mb-2">
                Address:{" "}
                <span className="block w-full break-words bg-gray-100 p-2 rounded-md">
                  {address}
                </span>
              </p>
              <p className="mb-2">
                Balance:{" "}
                <span className="font-semibold">
                  {balanceData?.formatted} {balanceData?.symbol}
                </span>
              </p>
              <p className="mb-2">
                Token Balance:{" "}
                <span className="font-semibold">
                  {tokenBalance} {tokenSymbol}
                </span>
              </p>
              <p
                onClick={signOut}
                className="mb-2 text-red-500 hover:text-red-600 hover:underline hover:cursor-pointer"
              >
                Sign Out
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Verification Result */}
      {verificationResult && (
        <div
          className={`text-end mt-4 text-md font-normal ${
            verificationResult.includes("successful")
              ? "text-green-600"
              : "text-red-600"
          }`}
        >
          {verificationResult}
        </div>
      )}
    </div>
  );
};

export default Navbar;
