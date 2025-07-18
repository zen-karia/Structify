import React from 'react';

export default function Home({ onGetStarted }) {
  return (
    <div className="w-[350px] h-[100px] flex-col bg-black shadow items-center">
      <h1 className="text-xl text-white font-bold mb-2">Welcome to Structify!</h1>
      <p className="text-gray-400 text-base mb-4 text-center">
        AI-powered tab management, just a click away.
      </p>
      <button className="bg-orange-600 text-base text-white px-4 py-2 rounded active:opacity-70 transition duration-100 cursor-pointer mb-2" onClick={onGetStarted}>
        Get Started
      </button>
    </div>
  );
}