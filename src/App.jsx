import { useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import Canvas from "./components/Canvas";
import GatePalette from "./components/GatePalette";
import InputSection from "./components/InputSection";
import OutputSection from "./components/OutputSection";

export default function App() {
  const [gates, setGates] = useState([]);
  const [inputs, setInputs] = useState([]);
  const [outputs, setOutputs] = useState([]);
  const [wiring, setWiring] = useState(null);
  const [connections, setConnections] = useState([]);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-gray-900 flex flex-col select-none">
        {/* Main content area */}
        <div className="flex-1 flex">
          {/* Left panel - Inputs */}
          <InputSection 
            inputs={inputs}
            setInputs={setInputs}
            wiring={wiring}
            setWiring={setWiring}
            connections={connections}
            setConnections={setConnections}
          />

          {/* Center - Canvas */}
          <Canvas
            gates={gates}
            setGates={setGates}
            inputs={inputs}
            outputs={outputs}
            wiring={wiring}
            setWiring={setWiring}
            connections={connections}
            setConnections={setConnections}
          />

          {/* Right panel - Outputs */}
          <OutputSection 
            outputs={outputs}
            setOutputs={setOutputs}
            wiring={wiring}
            setWiring={setWiring}
            connections={connections}
            setConnections={setConnections}
            gates={gates}
            inputs={inputs}
          />
        </div>

        {/* Bottom - Gate Palette */}
        <div className="bg-gray-800 p-4 border-t border-gray-700">
          <GatePalette />
        </div>
      </div>
    </DndProvider>
  );
}