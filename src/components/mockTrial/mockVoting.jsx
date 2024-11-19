import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import candidatesData from "./candidates.json";
import {
  CheckCircle,
  LogIn,
  User,
  Vote,
  ArrowRight,
  X,
  Clock,
} from "lucide-react";

const EnhancedMockVoting = () => {
  const [step, setStep] = useState(1);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState("");
  const [voterRegistered, setVoterRegistered] = useState(false);
  const [registrationOpen, setRegistrationOpen] = useState(true);
  const [votingOpen, setVotingOpen] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentConsequenceImage, setCurrentConsequenceImage] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState({
    registration: 60, // Extended time for demonstration
    voting: 100, // Extended time for demonstration
  });

  useEffect(() => {
    // Countdown timer for registration and voting
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        const newTime = { ...prev };

        if (newTime.registration > 0) {
          newTime.registration -= 1;
          if (newTime.registration === 0) {
            setRegistrationOpen(false);
          }
        }

        if (newTime.voting > 0) {
          newTime.voting -= 1;
          if (newTime.voting === 0) {
            setVotingOpen(true);
          }
        }

        return newTime;
      });
    }, 1000);

    // Simulate loading time
    const loaderTimer = setTimeout(() => setLoading(false), 3000);

    // Cleanup timers
    return () => {
      clearInterval(timer);
      clearTimeout(loaderTimer);
    };
  }, []);

  useEffect(() => {
    // Image cycling for consequences
    if (hasVoted && selectedCandidate) {
      const imageTimer = setInterval(() => {
        setCurrentConsequenceImage(
          (prev) => (prev + 1) % selectedCandidate.consequences.length
        );
      }, 3000);

      return () => clearInterval(imageTimer);
    }
  }, [hasVoted, selectedCandidate]);

  const handleLogin = () => {
    if (currentUser.trim() === "") {
      alert("Please enter a valid username.");
      return;
    }
    setIsLoggedIn(true);
    setStep(2); // Move to registration step
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setStep(1);
    setCurrentUser("");
    setVoterRegistered(false);
    setHasVoted(false);
  };

  const handleRegister = () => {
    if (!registrationOpen) {
      alert("Registration period is closed.");
      return;
    }
    setVoterRegistered(true);
    setStep(2);
  };

  const handleVote = (candidate) => {
    if (!votingOpen) {
      alert("Voting period is not open.");
      return;
    }
    if (hasVoted) {
      alert("You have already voted.");
      return;
    }
    setSelectedCandidate(candidate);
    setHasVoted(true);
    setStep(3);
  };

  return (
    <div className=" bg-white pt-[100px] flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300 }}
        className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden"
      >
        {isLoggedIn && (
          <div className="bg-cyan-100 p-2 text-center">
            <p className="flex items-center justify-center space-x-4">
              <span className="flex items-center space-x-2">
                <Clock
                  className={`mr-1 ${
                    timeRemaining.registration > 0
                      ? "animate-pulse text-green-500"
                      : "text-red-500"
                  }`}
                />
                <div
                  className={`h-3 w-3 rounded-full ${
                    timeRemaining.registration > 0
                      ? "bg-green-500"
                      : "bg-red-500"
                  } animate-pulse`}
                ></div>
                <span>
                  Registration Closes In: {timeRemaining.registration}s
                </span>
              </span>
              <span className="flex items-center space-x-2">
                <Clock className="mr-1 text-red-500" />
                <div className="h-3 w-3 rounded-full bg-red-500 animate-pulse"></div>
                <span>Voting Opens In: {timeRemaining.voting}s</span>
              </span>
            </p>
          </div>
        )}

        {!isLoggedIn ? (
          <div className="p-8 space-y-6">
            <h1 className="text-4xl font-extrabold text-cyan-900 text-center">
              Voting Platform
            </h1>
            <div className="space-y-4">
              <input
                type="text"
                className="w-full p-3 border-2 border-cyan-600 rounded-lg"
                placeholder="Enter your username"
                value={currentUser}
                onChange={(e) => setCurrentUser(e.target.value)}
              />
              <button
                className="w-full bg-cyan-900 text-white py-3 rounded-lg"
                onClick={handleLogin}
              >
                Login
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6">
            {/* Registration Step */}
            {step === 2 && registrationOpen && (
              <div>
                <h2 className="text-2xl font-bold text-cyan-900 mb-4">
                  Voter Registration
                </h2>
                <button
                  className="bg-cyan-900 text-white px-4 py-2 rounded"
                  onClick={handleRegister}
                >
                  Register to Vote
                </button>
              </div>
            )}

            {/* Candidate Selection Step */}
            {step === 2 && voterRegistered && !hasVoted && (
              <div>
                <h2 className="text-2xl font-bold text-cyan-900 mb-4">
                  Select Your Candidate
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {candidatesData.map((candidate) => (
                    <div
                      key={candidate.id}
                      className="border-2 border-cyan-600 rounded-xl p-6"
                    >
                      <div className="mb-4">
                        <h3 className="text-xl font-bold">{candidate.name}</h3>
                        <p>Reputation: {candidate.reputation}</p>
                      </div>
                      <div className="text-sm">
                        <p>Age: {candidate.profile.age}</p>
                        <p>Education: {candidate.profile.education}</p>

                        <div className="mt-2">
                          <strong>Experience:</strong>
                          <ul className="list-disc pl-5">
                            {candidate.profile.experience.map((exp, idx) => (
                              <li key={idx}>{exp}</li>
                            ))}
                          </ul>
                        </div>

                        <div className="mt-2">
                          <strong>Policies:</strong>
                          <ul className="list-disc pl-5">
                            {candidate.profile.policies.map((policy, idx) => (
                              <li key={idx}>{policy}</li>
                            ))}
                          </ul>
                        </div>

                        <div className="mt-2">
                          <strong>Achievements:</strong>
                          <ul className="list-disc pl-5">
                            {candidate.profile.achievements.map(
                              (achievement, idx) => (
                                <li key={idx}>{achievement}</li>
                              )
                            )}
                          </ul>
                        </div>
                      </div>
                      <button
                        className="mt-4 w-full bg-cyan-900 text-white py-2 rounded"
                        onClick={() => handleVote(candidate)}
                      >
                        Vote for {candidate.name}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Voting Consequences Step */}
            {step === 3 && hasVoted && selectedCandidate && (
              <div className="text-center">
                <h2 className="text-2xl font-bold text-cyan-900 mb-4">
                  Voting Consequences
                </h2>
                <p className="mb-4">
                  You voted for <strong>{selectedCandidate.name}</strong>
                </p>
                <div className="max-w-xl mx-auto">
                  <motion.img
                    key={currentConsequenceImage}
                    initial={{ x: -100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 100, opacity: 0 }}
                    transition={{ duration: 1, ease: "easeInOut" }}
                    src={
                      selectedCandidate.consequences[currentConsequenceImage]
                    }
                    alt={`Consequence ${currentConsequenceImage + 1}`}
                    className="w-full h-auto rounded-xl shadow-lg"
                  />
                  <p className="mt-4 text-sm text-gray-600 flex flex-col">
                    Consequence {currentConsequenceImage + 1} of{" "}
                    {selectedCandidate.consequences.length}
                    <span className="text-xl italic font-semibold text-yellow-500">
                      {selectedCandidate.consequences[
                        currentConsequenceImage
                      ].replace(".jpg", "")}
                    </span>
                  </p>
                </div>
              </div>
            )}

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="w-full bg-red-500 text-white py-3 rounded-lg mt-6"
            >
              Logout
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default EnhancedMockVoting;
