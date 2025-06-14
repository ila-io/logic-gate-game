import { useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import Canvas from "./components/Canvas";
import GatePalette from "./components/GatePalette";
import InputSection from "./components/InputSection";
import OutputSection from "./components/OutputSection";
import PuzzleEditor from "./components/PuzzleEditor"; // ✅ Import the editor

export default function App() {
  const [gates, setGates] = useState([]);
  const [inputs, setInputs] = useState([]);
  const [outputs, setOutputs] = useState([]);
  const [wiring, setWiring] = useState(null);
  const [connections, setConnections] = useState([]);
  const [showPuzzleEditor, setShowPuzzleEditor] = useState(false); // ✅ Add this

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-gray-900 flex flex-col select-none">
        {/* Main content area */}
        <div className="flex-1 flex">
          <InputSection 
            inputs={inputs}
            setInputs={setInputs}
            wiring={wiring}
            setWiring={setWiring}
            connections={connections}
            setConnections={setConnections}
          />

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

        {/* Bottom - Gate Palette + Instructions */}
        <div className="bg-gray-800 p-4 border-t border-gray-700 relative">
          <GatePalette togglePuzzleEditor={() => setShowPuzzleEditor(prev => !prev)} />
          <div className="absolute bottom-10 left-4 text-gray-300 text-sm">
            <p>
              Drag gates into the canvas above to build a circuit.<br />
              Double click on gates and wires or their nodes to delete them.<br />
              Click and drag from any node to connect them — input nodes (left) or output nodes (right).
            </p>
          </div>
        </div>

        {/* Floating Puzzle Editor */}
        {showPuzzleEditor && (
          <PuzzleEditor onClose={() => setShowPuzzleEditor(false)} />
        )}
      </div>
    </DndProvider>
  );
}
