import { FaLocationArrow } from "react-icons/fa";
import React from "react";

interface RouteInfoProps {
  distance: string;
  duration: string;
  onRecenter: () => void;
}

export default function RouteInfo({ distance, duration, onRecenter }: RouteInfoProps) {
  return (
    <div
      className="flex flex-col md:flex-row justify-between md:items-center mt-4 space-y-2 md:space-y-0 md:space-x-4"
    >
      <span className="text-sm">Distance: {distance}</span>
      <span className="text-sm">Duration: {duration}</span>
      <button
        aria-label="Recenter"
        onClick={onRecenter}
        className="rounded-full p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center text-sm"
        type="button"
      >
        <FaLocationArrow />
      </button>
    </div>
  );
}
