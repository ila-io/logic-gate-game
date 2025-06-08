import { useState } from "react";
import Canvas from "./components/Canvas";
import GatePalette from "./components/GatePalette";

export default function App() {
  const [gates, setGates] = useState([]);
  const [wiring, setWiring] = useState(null); // { fromGateIndex, fromNodeType, startX, startY, mouseX, mouseY }
  const [connections, setConnections] = useState([]); // Array of { from: { index, node }, to: { index, node } }

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      <div className="flex flex-1">
        <div className="w-32 bg-gray-800 border-r border-gray-700 p-2">
          <h2 className="text-sm font-bold mb-2">Inputs</h2>
          {/* You can add input components here later */}
        </div>

        <Canvas
          gates={gates}
          setGates={setGates}
          wiring={wiring}
          setWiring={setWiring}
          connections={connections}
          setConnections={setConnections}
        />

        <div className="w-32 bg-gray-800 border-l border-gray-700 p-2">
          <h2 className="text-sm font-bold mb-2">Output</h2>
          {/* You can add output components here later */}
        </div>
      </div>

      <div className="bg-gray-800 border-t border-gray-700 p-2 relative">
        <GatePalette />
      </div>
    </div>
  );
}
