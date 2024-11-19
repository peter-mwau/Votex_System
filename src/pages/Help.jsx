import React, { useState } from "react";
import {
  Shield,
  UserCheck,
  Vote,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Target,
  Users,
  Award,
  Settings,
  CheckCircle2,
} from "lucide-react";
import { Alert, AlertTitle } from "@mui/material";
import AlertDescription from "../components/ui/AlertDescription";

const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-gray-200 rounded-lg p-4 transition-all duration-300 hover:shadow-md">
      <div
        className="flex justify-between items-center cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-yellow-500" />
          <h3 className="text-lg font-medium text-gray-800">{question}</h3>
        </div>
        {isOpen ? (
          <ChevronUp className="text-gray-500 h-5 w-5" />
        ) : (
          <ChevronDown className="text-gray-500 h-5 w-5" />
        )}
      </div>
      {isOpen && (
        <div className="mt-4 pl-7 text-gray-600 animate-fadeIn">{answer}</div>
      )}
    </div>
  );
};

const ProcessStep = ({ icon: Icon, title, description }) => (
  <div className="flex items-start gap-4 p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
    <div className="p-3 bg-blue-50 rounded-lg">
      <Icon className="h-6 w-6 text-yellow-600" />
    </div>
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-2">{title}</h2>
      <p className="text-gray-600">{description}</p>
    </div>
  </div>
);

const RoleCard = ({ title, items, icon: Icon }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
    <div className="flex items-center gap-3 mb-4">
      <div className="p-2 bg-blue-50 rounded-lg">
        <Icon className="h-6 w-6 text-yellow-600" />
      </div>
      <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
    </div>
    <ul className="space-y-3">
      {items.map((item, index) => (
        <li key={index} className="flex items-center gap-2 text-gray-600">
          <CheckCircle2 className="h-4 w-4 text-cyan-950" />
          {item}
        </li>
      ))}
    </ul>
  </div>
);

const Help = () => {
  return (
    <div className="bg-gray-50 min-h-screen p-6 pt-[100px]">
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-800">
            Votex System Guide
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Your comprehensive guide to understanding and using the Votex
            platform effectively
          </p>
        </div>

        <Alert className="bg-blue-50 border-blue-200">
          <Target className="h-4 w-4 text-yellow-600" />
          <AlertTitle>New to Votex?</AlertTitle>
          <AlertDescription>
            Follow this step-by-step guide to understand how our voting system
            works and how to participate effectively.
          </AlertDescription>
        </Alert>

        <div className="grid md:grid-cols-2 gap-6">
          <ProcessStep
            icon={Shield}
            title="1. Open Voter Registration"
            description="The admin opens the voter registration period, allowing people to sign up as voters."
          />
          <ProcessStep
            icon={Settings}
            title="2. Set Up Candidate Positions"
            description="The admin defines positions (e.g., Mayor, Council Member) that candidates can apply for."
          />
          <ProcessStep
            icon={UserCheck}
            title="3. Candidate Registration"
            description="Only registered voters can apply to become candidates. They register for available positions."
          />
          <ProcessStep
            icon={Shield}
            title="4. Candidate Approval"
            description="The admin reviews all candidate applications and can approve or reject them."
          />
          <ProcessStep
            icon={Vote}
            title="5. Start Voting Period"
            description="Once candidates are approved, the admin initiates the voting period, closing the registration phase."
          />
          <ProcessStep
            icon={MessageCircle}
            title="6. Votex ChatApp"
            description="Registered voters can communicate with each other and organize events within the Votex ChatApp."
          />
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <RoleCard
            title="Admin Responsibilities"
            icon={Shield}
            items={[
              "Manage registration and voting periods",
              "Define candidate positions",
              "Approve or reject candidate registrations",
              "Monitor voting activity and maintain system integrity",
            ]}
          />
          <RoleCard
            title="Voter Responsibilities"
            icon={Users}
            items={[
              "Register to vote during the open registration period",
              "Vote for approved candidates during the voting period",
              "Engage with other voters through the Votex ChatApp",
              "Participate in community discussions",
            ]}
          />
        </div>

        <div className="bg-white rounded-xl p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <Award className="h-6 w-6 text-yellow-600" />
            <h2 className="text-2xl font-semibold text-gray-800">
              Benefits of Votex
            </h2>
          </div>
          <p className="text-gray-600 leading-relaxed">
            Votex is designed to make voting fair and secure. It also promotes
            active participation by rewarding users with VTKN tokens.
            <span className="font-medium"> Voters</span> earn tokens for
            registering and casting their votes, while
            <span className="font-medium"> admins</span> gain tokens for
            reviewing candidates and managing the system responsibly.
          </p>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
            <HelpCircle className="h-6 w-6 text-yellow-600" />
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default Help;
