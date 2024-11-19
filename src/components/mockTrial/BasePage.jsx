import React, { useState } from "react";
import MockVoting from "./mockVoting";
import Questionnaire from "./votingQuiz";
import CivicEducation from "./civicEducation";
import { Vote, ClipboardList, BookOpen } from "lucide-react";

const BasePage = () => {
  const [activeTab, setActiveTab] = useState("mock-voting");

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div className="bg-white shadow-lg pt-[100px] min-h-screen lg:w-[60%] md:w-[80%] w-[90%] items-center justify-center mx-auto">
      {/* Tab Navigation */}
      <nav className="">
        <div className="container mx-auto px-4 py-3 flex justify-center space-x-4">
          <button
            className={`tab-button flex items-center space-x-2 px-4 py-2 rounded ${
              activeTab === "mock-voting"
                ? "bg-cyan-900 text-white"
                : "bg-white text-black"
            }`}
            onClick={() => handleTabClick("mock-voting")}
          >
            <Vote className="w-5 h-5" />
            <span>Mock Voting</span>
          </button>
          <button
            className={`tab-button flex items-center space-x-2 px-4 py-2 rounded ${
              activeTab === "questionnaire"
                ? "bg-cyan-900 text-white"
                : "bg-white text-black"
            }`}
            onClick={() => handleTabClick("questionnaire")}
          >
            <ClipboardList className="w-5 h-5" />
            <span>Voting Quiz</span>
          </button>
          <button
            className={`tab-button flex items-center space-x-2 px-4 py-2 rounded ${
              activeTab === "civic-education"
                ? "bg-cyan-900 text-white"
                : "bg-white text-black"
            }`}
            onClick={() => handleTabClick("civic-education")}
          >
            <BookOpen className="w-5 h-5" />
            <span>Civic Education</span>
          </button>
        </div>
      </nav>

      {/* Tab Content */}
      <div className="tab-content container mx-auto px-4 py-6 transition-all duration-500 ease-in-out">
        {activeTab === "mock-voting" && <MockVoting />}
        {activeTab === "questionnaire" && <Questionnaire />}
        {activeTab === "civic-education" && <CivicEducation />}
        {activeTab === "" && (
          <div>
            <h2>Welcome to the Base Page</h2>
            <p>Select a section from the navigation above.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BasePage;
