import GatePalette from "./components/GatePalette";
import Canvas from "./components/Canvas";

export default function App() {
  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      {/* Top: Logic system layout */}
      <div className="flex flex-1">
        {/* Left column: Inputs */}
        <div className="w-32 bg-gray-800 border-r border-gray-700 p-2">
          <h2 className="text-sm font-bold mb-2">Inputs</h2>
          {/* You can add toggles or wires later */}
        </div>

        {/* Center: Freeform Canvas */}
        <Canvas />

        {/* Right column: Output */}
        <div className="w-32 bg-gray-800 border-l border-gray-700 p-2">
          <h2 className="text-sm font-bold mb-2">Output</h2>
        </div>
      </div>

      {/* Bottom row: Gate Palette */}
      <div className="bg-gray-800 border-t border-gray-700 p-2">
        <GatePalette />
      </div>
    </div>
  );
}
