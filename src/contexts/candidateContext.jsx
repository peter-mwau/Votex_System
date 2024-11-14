import React, { createContext, useContext, useState, useEffect } from "react";
import { ethers } from "ethers";
import ABI from "../artifacts/contracts/Voting.sol/Voting.json";
import { useEthersSigner } from "../components/useClientSigner";

const contractAddress = import.meta.env.VITE_APP_CONTRACT_ADDRESS;
const contractABI = ABI.abi;

const CandidateContext = createContext();

export const useCandidates = () => {
  return useContext(CandidateContext);
};

export const CandidateProvider = ({ children }) => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const signerPromise = useEthersSigner();

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        setLoading(true);
        setError(null);

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

        const candidates = await contract.getCandidates();
        console.log("Fetched candidates:", candidates);
        const plainCandidates = candidates.map((candidate) => ({
          ...candidate,
          age: candidate.age.toString(),
          votes: candidate.votes.toString(),
        }));
        setCandidates(plainCandidates);
      } catch (error) {
        console.error("Error fetching candidates:", error);
        setError("Failed to fetch candidates.");
      } finally {
        setLoading(false);
      }
    };

    fetchCandidates();
  }, [signerPromise, contractAddress, contractABI]);

  return (
    <CandidateContext.Provider value={{ candidates, loading, error }}>
      {children}
    </CandidateContext.Provider>
  );
};
