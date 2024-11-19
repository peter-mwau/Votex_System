import React, { useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle } from "lucide-react";

const VotingQuiz = () => {
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const questions = [
    {
      question: "What is the primary reason for voting?",
      choices: [
        "To express my opinion",
        "To support a candidate I like",
        "To participate in the democratic process",
      ],
      correctAnswer: "To participate in the democratic process",
    },
    {
      question: "Why is it important to elect good leaders?",
      choices: [
        "To ensure the government's accountability",
        "To increase the number of jobs",
        "To get more vacation days",
      ],
      correctAnswer: "To ensure the government's accountability",
    },
    {
      question: "What is the role of the rule of law in elections?",
      choices: [
        "To ensure fair voting",
        "To decide who wins the election",
        "To stop people from voting",
      ],
      correctAnswer: "To ensure fair voting",
    },
    {
      question: "How often are presidential elections held?",
      choices: ["Every 2 years", "Every 4 years", "Every 6 years"],
      correctAnswer: "Every 4 years",
    },
    {
      question: "Who can vote in elections?",
      choices: [
        "Only government officials",
        "All citizens of legal voting age",
        "Only people with a job",
      ],
      correctAnswer: "All citizens of legal voting age",
    },
    {
      question: "What is a ballot?",
      choices: [
        "A list of candidates and issues to vote on",
        "A type of voting machine",
        "A place where votes are counted",
      ],
      correctAnswer: "A list of candidates and issues to vote on",
    },
    {
      question: "What is the purpose of a voter registration?",
      choices: [
        "To keep track of who has voted",
        "To ensure only eligible voters can vote",
        "To count the number of voters",
      ],
      correctAnswer: "To ensure only eligible voters can vote",
    },
  ];

  const handleAnswerChange = (selectedAnswer) => {
    setAnswers({
      ...answers,
      [currentQuestionIndex]: selectedAnswer,
    });
  };

  const checkAnswers = () => {
    const score = questions.reduce((score, question, index) => {
      if (answers[index] === question.correctAnswer) {
        return score + 1;
      }
      return score;
    }, 0);
    setResult(`You got ${score} out of ${questions.length} correct!`);
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-bold mb-4">Voting Quiz</h1>
      <p className="text-lg mb-4">
        Here voters can answer a few questions about voting and elections.
      </p>

      <form>
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">
            {questions[currentQuestionIndex].question}
          </h2>
          <div className="space-y-2">
            {questions[currentQuestionIndex].choices.map((choice, i) => (
              <label key={i} className="flex items-center">
                <input
                  type="radio"
                  name={`question-${currentQuestionIndex}`}
                  value={choice}
                  checked={answers[currentQuestionIndex] === choice}
                  onChange={() => handleAnswerChange(choice)}
                  className="mr-2"
                />
                {choice}
              </label>
            ))}
          </div>
        </div>
      </form>

      <div className="flex justify-between mt-4">
        <button
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
          className={`flex items-center bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-all ${
            currentQuestionIndex === 0 ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Previous
        </button>
        {currentQuestionIndex === questions.length - 1 ? (
          <button
            onClick={checkAnswers}
            className="flex items-center bg-cyan-900 text-white py-2 px-6 rounded-lg hover:bg-yellow-500 transition-all"
          >
            <CheckCircle className="w-5 h-5 mr-2" />
            Submit Answers
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="flex items-center bg-cyan-900 text-white py-2 px-4 rounded-lg hover:bg-yellow-500 transition-all"
          >
            Next
            <ArrowRight className="w-5 h-5 ml-2" />
          </button>
        )}
      </div>

      {result && (
        <div className="mt-6 text-xl font-semibold text-green-600">
          {result}
        </div>
      )}
    </div>
  );
};

export default VotingQuiz;
