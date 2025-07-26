import { FaTimes } from "react-icons/fa";
import React from "react";

interface RouteButtonsProps {
  onStart: () => void;
  onClear: () => void;
  onUseLocation: () => void;
}

export default function RouteButtons({
  onStart,
  onClear,
  onUseLocation,
}: RouteButtonsProps) {
  return (
    <div
      className="flex flex-wrap justify-center md:justify-start gap-2"
    >
      <button
        onClick={onUseLocation}
        className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-3 py-1 rounded"
        type="button"
      >
        Use My Location
      </button>
      <button
        onClick={onStart}
        className="bg-pink-500 hover:bg-pink-600 text-white text-xs px-3 py-1 rounded"
        type="button"
      >
        Start
      </button>
      <button
        aria-label="Clear"
        onClick={onClear}
        className="bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs p-2 rounded-full flex items-center justify-center"
        type="button"
      >
        <FaTimes />
      </button>
    </div>
  );
}
