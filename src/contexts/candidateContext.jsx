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
        const plainCandidates = candidates.map((candidate) => {
          const relatedObject = candidate[7];
          return {
            ...candidate,
            age: candidate.age.toString(),
            votes: candidate.votes.toString(),
            relatedObject: {
              ...relatedObject,
              property1: relatedObject[0],
              property2: relatedObject[1],
              property3: relatedObject[2],
              property4: relatedObject[3],
            },
          };
        });

        setCandidates(plainCandidates);
        console.log("PLain Candidates: ", plainCandidates);
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
