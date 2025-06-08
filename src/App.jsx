import { useState } from "react";
import Canvas from "./components/Canvas";
import GatePalette from "./components/GatePalette";

export default function App() {
  const [gates, setGates] = useState([]);
  // const [wiring, setWiring] = useState(null); // { fromGateIndex, fromNodeType }
  // const [connections, setConnections] = useState([]); // Array of { from, to }

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      <div className="flex flex-1">
        <div className="w-32 bg-gray-800 border-r border-gray-700 p-2">
          <h2 className="text-sm font-bold mb-2">Inputs</h2>
        </div>

        <Canvas gates={gates} setGates={setGates} />

        <div className="w-32 bg-gray-800 border-l border-gray-700 p-2">
          <h2 className="text-sm font-bold mb-2">Output</h2>
        </div>
      </div>

      <div className="bg-gray-800 border-t border-gray-700 p-2 relative">
        <GatePalette />
      </div>
    </div>
  );
}
