import { useEffect, useState } from "react";
import { ethers } from "ethers";
import Filestorage from "@skalenetwork/filestorage.js"; // Skale Storage library
import { useEthersSigner } from "../components/useClientSigner"; // Adjust this import if needed

const VoterDetails = () => {
  const signerPromise = useEthersSigner();
  const [voters, setVoters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Create the ethers provider
  const provider = new ethers.JsonRpcProvider(import.meta.env.VITE_APP_RPC_URL);

  // Initialize Filestorage with the ethers provider
  const filestorage = new Filestorage(provider);

  // Skale account details from environment variables
  const account = import.meta.env.VITE_APP_PUBLIC_KEY;

  // Function to fetch registered voters from Skale Storage
  const fetchVoters = async () => {
    try {
      setLoading(true);
      setError("");

      // Define the path where voter data is stored in Skale Storage
      const storagePath = "voter_data"; // Path where voters' files are stored

      // Fetch the list of files (each representing a registered voter)
      const files = await filestorage.listDirectory(storagePath);

      // Process each file and fetch voter details
      const voterDetails = await Promise.all(
        files.map(async (file) => {
          // Get file content from Skale Storage
          const fileContent = await filestorage.getFile(account, file.path);

          // Parse the content of the file (assuming it's JSON)
          const voterData = JSON.parse(fileContent.toString());

          return { fileName: file.name, ...voterData }; // Return voter details with filename (or add more if needed)
        })
      );

      console.log("V_Details: ", voterDetails);

      // Update the state with the fetched voter details
      setVoters(voterDetails);
    } catch (error) {
      setError("Error fetching voter details: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch voters when the component is mounted
  useEffect(() => {
    fetchVoters();
  }, []);

  return (
    <div className="flex justify-center items-center flex-col pt-20 container">
      <h1 className="text-2xl font-bold mb-6">Registered Voters</h1>

      {loading && <p>Loading voter details...</p>}
      {error && <p className="text-red-600">{error}</p>}

      <div className="w-full">
        <ul>
          {voters.length > 0 ? (
            voters.map((voter, index) => (
              <li key={index} className="border-b py-2">
                <p>
                  <strong>Voter Name:</strong> {voter.officialNames}
                </p>
                <p>
                  <strong>Voter ID:</strong> {voter.idNumber}
                </p>
                <p>
                  <strong>Voter Age:</strong> {voter.age}
                </p>
                {/* Display any additional voter details if present */}
              </li>
            ))
          ) : (
            <p>No registered voters found.</p>
          )}
        </ul>
      </div>
    </div>
  );
};

export default VoterDetails;
