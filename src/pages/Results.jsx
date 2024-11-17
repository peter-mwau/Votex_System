import React, { useState } from "react";
import { useCandidates } from "../contexts/candidateContext";

const ResultsPage = () => {
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);
  const { candidates, loading } = useCandidates();

  const groupCandidatesByPosition = (candidates) => {
    const grouped = candidates.reduce((acc, candidate) => {
      const position = candidate[6];
      if (!acc[position]) {
        acc[position] = [];
      }
      acc[position].push(candidate);
      return acc;
    }, {});

    // Sort candidates by votes in descending order, converting BigInt to Number
    Object.keys(grouped).forEach((position) => {
      grouped[position].sort((a, b) => Number(b[4]) - Number(a[4]));
    });

    return grouped;
  };

  const groupedCandidates = groupCandidatesByPosition(candidates);

  if (loading) return <div className="text-center mt-10">Loading...</div>;
  if (error)
    return <div className="text-center mt-10 text-red-500">Error: {error}</div>;

  return (
    <div className="container mx-auto p-4 pt-[100px]">
      <h1 className="text-2xl font-bold mb-4">Election Results</h1>
      {Object.keys(groupedCandidates).length === 0 ? (
        <p className="text-center text-gray-500">No candidates available</p>
      ) : (
        Object.keys(groupedCandidates).map((position) => (
          <div key={position}>
            <hr className="my-4 border-t-2 border-gray-300" />
            <h2 className="text-2xl font-bold mb-4 text-cyan-950">
              {position} Position
            </h2>

            {groupedCandidates[position].length === 0 ? (
              <p className="text-center text-gray-500">
                No candidates for this position
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                  <thead>
                    <tr>
                      <th className="py-2 px-4 border-b">Name</th>
                      <th className="py-2 px-4 border-b">Age</th>
                      <th className="py-2 px-4 border-b">ID</th>
                      <th className="py-2 px-4 border-b">Party</th>
                      <th className="py-2 px-4 border-b">Votes</th>
                      <th className="py-2 px-4 border-b">Verified</th>
                      <th className="py-2 px-4 border-b">Position</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupedCandidates[position].map((candidate, index) => {
                      const candidateIndex = candidates.findIndex(
                        (c) => c[2] === candidate[2]
                      );
                      return (
                        <tr
                          key={candidateIndex}
                          className={`${
                            index === 0 ? "bg-yellow-100" : "bg-white"
                          }`}
                        >
                          <td className="py-2 px-4 border-b">{candidate[0]}</td>
                          <td className="py-2 px-4 border-b">
                            {parseInt(candidate[1], 10)}
                          </td>
                          <td className="py-2 px-4 border-b">{candidate[2]}</td>
                          <td className="py-2 px-4 border-b">{candidate[3]}</td>
                          <td className="py-2 px-4 border-b font-semibold">
                            {Number(candidate[4])}
                          </td>
                          <td className="py-2 px-4 border-b">
                            <span
                              className={`font-semibold ${
                                candidate[5] ? "text-green-500" : "text-red-500"
                              }`}
                            >
                              {candidate[5] ? "True" : "False"}
                            </span>
                          </td>
                          <td className="py-2 px-4 border-b">{candidate[6]}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default ResultsPage;
