import React, { useState } from "react";
import {
  FaUserShield,
  FaUserCheck,
  FaVoteYea,
  FaComments,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";

const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-300 py-4">
      <div
        className="flex justify-between items-center cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h3 className="text-lg font-semibold text-gray-800">{question}</h3>
        {isOpen ? (
          <FaChevronUp className="text-gray-500" />
        ) : (
          <FaChevronDown className="text-gray-500" />
        )}
      </div>
      {isOpen && <p className="mt-2 text-gray-700">{answer}</p>}
    </div>
  );
};

const Help = () => {
  return (
    <div className="bg-gray-50 min-h-screen flex items-center justify-center p-6 pt-[100px]">
      <div className="w-full max-w-4xl bg-white shadow-lg rounded-lg p-8 space-y-10">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Votex System Guide
        </h1>

        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-700 flex items-center">
            <FaUserShield className="mr-2 text-cyan-950" /> 1. Open Voter
            Registration
          </h2>
          <p className="text-gray-700">
            The admin opens the voter registration period, allowing people to
            sign up as voters.
          </p>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-700 flex items-center">
            <FaUserCheck className="mr-2 text-cyan-950" /> 2. Set Up Candidate
            Positions
          </h2>
          <p className="text-gray-700">
            The admin defines positions (e.g., Mayor, Council Member) that
            candidates can apply for.
          </p>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-700 flex items-center">
            <FaUserCheck className="mr-2 text-cyan-950" /> 3. Candidate
            Registration
          </h2>
          <p className="text-gray-700">
            Only registered voters can apply to become candidates. They register
            for available positions.
          </p>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-700 flex items-center">
            <FaUserShield className="mr-2 text-cyan-950" /> 4. Candidate
            Approval
          </h2>
          <p className="text-gray-700">
            The admin reviews all candidate applications and can approve or
            reject them.
          </p>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-700 flex items-center">
            <FaVoteYea className="mr-2 text-cyan-950" /> 5. Start Voting Period
          </h2>
          <p className="text-gray-700">
            Once candidates are approved, the admin initiates the voting period,
            closing the registration phase.
          </p>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-700 flex items-center">
            <FaVoteYea className="mr-2 text-cyan-950" /> 6. Voting
          </h2>
          <p className="text-gray-700">
            Voters cast their votes for the candidates of their choice during
            the voting period.
          </p>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-700 flex items-center">
            <FaComments className="mr-2 text-cyan-950" /> 7. Votex ChatApp
          </h2>
          <p className="text-gray-700">
            Registered voters can communicate with each other and organize
            events within the Votex ChatApp.
          </p>
        </section>

        <section className="space-y-8">
          <h2 className="text-2xl font-semibold text-gray-700">
            Roles and Responsibilities
          </h2>
          <div>
            <h3 className="text-xl font-semibold text-gray-700">Admin</h3>
            <ul className="list-disc list-inside text-gray-700">
              <li>Manage registration and voting periods.</li>
              <li>Define candidate positions.</li>
              <li>Approve or reject candidate registrations.</li>
              <li>Monitor voting activity and maintain system integrity.</li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-700">Voters</h3>
            <ul className="list-disc list-inside text-gray-700">
              <li>Register to vote during the open registration period.</li>
              <li>Vote for approved candidates during the voting period.</li>
              <li>Engage with other voters through the Votex ChatApp.</li>
            </ul>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-700">
            Benefits of Votex
          </h2>
          <p className="text-gray-600">
            Votex is designed to make voting fair and secure. It also promotes
            active participation by rewarding users with VTKN tokens.
            <span className="font-medium">Voters</span> earn tokens for
            registering and casting their votes, while
            <span className="font-medium">admins</span> gain tokens for
            reviewing candidates and managing the system responsibly.
          </p>
        </section>

        <section className="space-y-4 transition-all duration-1000">
          <h2 className="text-2xl font-semibold text-gray-700">
            Frequently Asked Questions (FAQs)
          </h2>
          <FAQItem
            question="How do I register as a voter?"
            answer="Once the registration period begins, you can sign up as a voter directly through the Votex platform."
          />
          <FAQItem
            question="What are VTKN tokens?"
            answer="VTKN tokens are rewards for participating in Votex. Voters receive tokens for registering and voting, while admins earn them for managing the platform and verifying candidates."
          />
          <FAQItem
            question="How can I become a candidate?"
            answer="To apply as a candidate, you must first register as a voter. Afterward, you can apply for candidacy during the candidate registration period."
          />
        </section>
      </div>
    </div>
  );
};

export default Help;
