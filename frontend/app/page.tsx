// pages.tsx
'use client'

import { useState } from "react";
import { MapComponent } from "@/components/MapComponent";
import { MapProvider } from "@/provider/map_provider";
import Score from "@/components/score";
const Page = () => {
  // Default OSM ID can be any valid number; adjust as needed.
  const [osmId, setOsmId] = useState<number>(269636965);
  const [showConnected, setShowConnected] = useState<boolean>(true);
  const [showDistance, setShowDistance] = useState<boolean>(true);
  const [distances, setDistances] = useState<number[]>([]);
  return (
    <MapProvider>

    <div className="min-h-screen flex" style={{ backgroundColor: "#FDF6E3" }}>
      {/* Left: Map Component */}
      <div className="w-2/3 p-4">
        <MapComponent
          osmId={osmId}
          showDistance={showDistance}
          handleDistance={setDistances}
        />
      </div>
      {/* Right: Controls */}
      <div className="w-1/3 p-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">
            Controls
          </h2>
          {/* OSM ID Field */}
          <div className="mb-6">
            <label
              htmlFor="osmId"
              className="block text-gray-700 mb-2"
            >
              OSM ID
            </label>
            <input
              id="osmId"
              type="number"
              value={osmId}
              onChange={(e) => setOsmId(Number(e.target.value))}
              className="w-full px-4 py-2 border text-black rounded focus:outline-none focus:ring-2 focus:ring-pink-300"
            />
          </div>
          {/* Show Connected Toggle */}
          <div className="mb-6 flex items-center">
           
            
          </div>
          {/* Show Distance Toggle */}
          <div className="mb-6 flex items-center">
            <label
              htmlFor="showDistance"
              className="mr-3 text-gray-700"
            >
              Show Distance
            </label>
            <input
              id="showDistance"
              type="checkbox"
              checked={showDistance}
              onChange={(e) => setShowDistance(e.target.checked)}
              className="toggle toggle-accent"
            />
          </div>
            <span className="text-black d-block ml-2">
              <Score distances = {distances} />
            </span>
        </div>
      </div>
    </div>
    </MapProvider>
  );
};

export default Page;
