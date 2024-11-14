import React, { createContext, useState, useEffect, useContext } from "react";
import { ethers } from "ethers";
import ABI from "../artifacts/contracts/Voting.sol/Voting.json";
import { useEthersSigner } from "../components/useClientSigner";

const PositionsContext = createContext();

export const usePositions = () => {
  return useContext(PositionsContext);
};

export const PositionsProvider = ({ children }) => {
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const signerPromise = useEthersSigner();
  const contractAddress = import.meta.env.VITE_APP_CONTRACT_ADDRESS;
  const contractABI = ABI.abi;

  useEffect(() => {
    const fetchPositions = async () => {
      try {
        setLoading(true);
        const signer = await signerPromise;
        if (!signer) {
          throw new Error("No signer available. Please connect your wallet.");
        }
        const contract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );
        const positions = await contract.getAllPositions();
        console.log("All Positions: ", positions);
        const plainPositions = JSON.parse(JSON.stringify(positions));
        setPositions(plainPositions);
        console.log("All2 Positions: ", plainPositions);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPositions();
  }, [signerPromise, contractAddress, contractABI]);

  return (
    <PositionsContext.Provider value={{ positions, loading, error }}>
      {children}
    </PositionsContext.Provider>
  );
};
