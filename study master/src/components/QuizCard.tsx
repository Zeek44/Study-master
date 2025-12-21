// src/components/QuizCard.tsx
import React from "react";

interface QuizCardProps {
  title: string;
  questionsCount: number;
  onStart: () => void;
}

export default function QuizCard({ title, questionsCount, onStart }: QuizCardProps) {
  return (
    <div className="bg-white shadow-md rounded p-4 mb-4 w-80">
      <h2 className="text-xl font-bold mb-2">{title}</h2>
      <p className="text-gray-600 mb-4">{questionsCount} questions</p>
      <button
        onClick={onStart}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Start Quiz
      </button>
    </div>
  );
}
