import React, { useState } from "react";
import {
  CheckCircle,
  Users,
  Scale,
  Globe,
  BookOpen,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const CivicEducation = () => {
  const [isGoodLeadersOpen, setIsGoodLeadersOpen] = useState(false);
  const [isBadLeadersOpen, setIsBadLeadersOpen] = useState(false);

  const toggleGoodLeaders = () => setIsGoodLeadersOpen(!isGoodLeadersOpen);
  const toggleBadLeaders = () => setIsBadLeadersOpen(!isBadLeadersOpen);

  return (
    <div className="p-8 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-lg transition-all duration-1000 ease-in-out hover:shadow-2xl">
      <h1 className="text-3xl font-bold text-cyan-950 mb-6 text-center animate-fade-in">
        The Power of Your Vote
      </h1>
      <div className="space-y-8">
        <div className="flex items-start space-x-6 transform hover:scale-105 transition-all duration-1000">
          <CheckCircle className="w-8 h-8 text-green-600" />
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">
              Importance of Voting
            </h2>
            <p className="text-gray-700">
              Voting empowers you to influence the direction of your community
              and country. It is the cornerstone of democracy, ensuring that
              every citizen's voice is heard and counted.
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-6 transform hover:scale-105  transition-all duration-1000">
          <Users className="w-8 h-8 text-blue-600" />
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">
              Electing Good Leaders
            </h2>
            <p className="text-gray-700">
              Leaders shape policies and decisions that affect your life.
              Choosing leaders with integrity, vision, and compassion ensures
              that the government serves the people and addresses their needs
              fairly.
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-6 transform hover:scale-105  transition-all duration-1000">
          <Scale className="w-8 h-8 text-yellow-500" />
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">
              The Rule of Law
            </h2>
            <p className="text-gray-700">
              The rule of law safeguards democracy by ensuring that everyone is
              equal under the law. It protects your rights, maintains order, and
              holds leaders accountable to their promises and actions.
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-6 transform hover:scale-105  transition-all duration-1000">
          <Globe className="w-8 h-8 text-purple-600" />
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">
              Global Citizenship
            </h2>
            <p className="text-gray-700">
              Voting is not just about personal interest; it’s about collective
              progress. Your vote contributes to decisions that affect global
              issues such as climate change, peace, and security.
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-6 transform hover:scale-105  transition-all duration-1000">
          <BookOpen className="w-8 h-8 text-indigo-600" />
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">
              Educate Yourself
            </h2>
            <p className="text-gray-700">
              An informed voter makes better choices. Understand the policies,
              track records, and visions of candidates. Use credible sources to
              research ballot measures and avoid misinformation.
            </p>
          </div>
        </div>

        <div className="mt-6">
          <button
            className="flex items-center text-blue-600 font-semibold"
            onClick={toggleGoodLeaders}
          >
            <ChevronDown
              className={`w-5 h-5 ${
                isGoodLeadersOpen ? "rotate-180" : ""
              } transition-all`}
            />
            <span className="ml-2">
              Expected Results from Choosing Good Leaders
            </span>
          </button>
          {isGoodLeadersOpen && (
            <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
              <h3 className="font-semibold text-lg">Example: A Good Leader</h3>
              <p className="text-gray-700 mt-2">
                A good leader listens to the people and makes decisions that are
                fair and just for all citizens. Example: A country where
                healthcare, education, and infrastructure are prioritized,
                ensuring equal access to services for all citizens.
              </p>
              <p className="text-gray-700 mt-2">
                A good leader works to reduce corruption, fosters economic
                growth, and promotes peace and security.
              </p>
            </div>
          )}
        </div>

        {/* Dropdown for Bad Leaders Example */}
        <div className="mt-6">
          <button
            className="flex items-center text-red-600 font-semibold"
            onClick={toggleBadLeaders}
          >
            <ChevronDown
              className={`w-5 h-5 ${
                isBadLeadersOpen ? "rotate-180" : ""
              } transition-all`}
            />
            <span className="ml-2">
              Expected Results from Choosing Bad Leaders
            </span>
          </button>
          {isBadLeadersOpen && (
            <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
              <h3 className="font-semibold text-lg">Example: A Bad Leader</h3>
              <p className="text-gray-700 mt-2">
                A bad leader ignores the needs of the people, focusing only on
                personal gain. Example: A country where wealth is concentrated
                in the hands of a few, healthcare is inadequate, and basic
                services are neglected.
              </p>
              <p className="text-gray-700 mt-2">
                A bad leader allows corruption to thrive, leading to a breakdown
                in social order and economic decline.
              </p>
            </div>
          )}
        </div>

        {/* Interactive Question Section */}
        <div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-lg">
          <h3 className="text-lg font-semibold">Food for Thought</h3>
          <p className="text-gray-700 mt-2">
            What qualities do you believe are essential in a good leader, and
            how can voters ensure their leaders are working for the common good?
            Discuss!
          </p>
        </div>
      </div>
    </div>
  );
};

export default CivicEducation;
