import { useState, useEffect } from "react";
import { X, Plus } from "lucide-react";
import { evaluateCircuit } from "./utils/LogicEvaluator";

export default function OutputSection({ 
  outputs, 
  setOutputs, 
  wiring, 
  setWiring, 
  connections, 
  setConnections,
  gates,
  inputs
}) {
  const outputLabels = ['1', '2', '3', '4', '5', '6', '7', '8'];
  
  // Calculate output values using circuit evaluation
  const { outputValues } = evaluateCircuit(gates || [], inputs || [], outputs || [], connections || []);
  
  // Auto-reassign labels whenever outputs change
  useEffect(() => {
    setOutputs(prevOutputs => 
      prevOutputs.map((output, index) => ({
        ...output,
        label: outputLabels[index]
      }))
    );
  }, [outputs.length]); 


  useEffect(() => {
    setOutputs(prevOutputs => 
      prevOutputs.map(output => ({
        ...output,
        value: outputValues[output.id] || 0
      }))
    );
  }, [outputValues, setOutputs]);
  
  const addOutput = () => {
    if (outputs.length < 8) {
      const newOutput = {
        id: Date.now(),
        label: outputLabels[outputs.length], // This will be corrected by useEffect
        value: 0
      };
      setOutputs([...outputs, newOutput]);
    }
  };

  const removeOutput = (outputId) => {
    setOutputs(outputs.filter(output => output.id !== outputId));
    
    setConnections(prev => 
      prev.filter(conn => 
        !(conn.to.type === 'output' && conn.to.id === outputId)
      )
    );
  };

  // Handle incoming wire connections
  const handleConnection = (e, outputId) => {
    e.stopPropagation();
    if (!wiring) return;

    const existing = connections.find(
      (conn) =>
        conn.to.type === 'output' &&
        conn.to.id === outputId
    );
    if (existing) return;

    setConnections((prev) => [
      ...prev,
      {
        from: wiring.from,
        to: { type: 'output', id: outputId },
      },
    ]);
    setWiring(null);
  };

  // Handle double-click on output node to delete connection
  const handleOutputNodeDoubleClick = (e, outputId) => {
    e.stopPropagation();
    setConnections(prev => 
      prev.filter(conn => 
        !(conn.to.type === 'output' && conn.to.id === outputId)
      )
    );
  };

  return (
    <div className="w-48 bg-gray-800 p-4 flex flex-col gap-3">
      <h3 className="text-white font-semibold text-lg mb-2">Outputs</h3>
      
      {/* Output boxes */}
      {outputs.map((output, index) => (
        <div key={output.id} className="relative">
          {/* Main output box */}
          <div className="bg-gray-700 rounded-lg p-3 border-2 border-gray-600 hover:border-gray-500 transition-colors">
            {/* Label */}
            <div className="text-xs text-gray-300 mb-1">Output {output.label}</div>
            
            {/* Value (read-only, shows computed result) */}
            <div className="text-center">
              <span className={`text-2xl font-bold ${
                output.value === 1 ? 'text-green-400' : 'text-red-400'
              }`}>
                {output.value}
              </span>
            </div>
            
            {/* Delete button */}
            <button
              className="absolute top-1 right-1 w-5 h-5 bg-red-600 hover:bg-red-500 rounded-full flex items-center justify-center transition-colors"
              onClick={() => removeOutput(output.id)}
            >
              <X size={12} className="text-white" />
            </button>
          </div>
          
          {/* Wire node (input side - left side of output box) */}
          <div
            className={`absolute left-0 top-1/2 transform -translate-x-2 -translate-y-1/2 w-6 h-6 rounded-full cursor-crosshair transition-colors z-10 flex items-center justify-center text-xs font-bold ${
              output.value === 1 
                ? 'bg-green-500 text-white ring-2 ring-green-400' 
                : 'bg-red-500 text-white ring-2 ring-red-400'
            }`}
            onMouseUp={(e) => handleConnection(e, output.id)}
            onDoubleClick={(e) => handleOutputNodeDoubleClick(e, output.id)}
          >
            {output.value}
          </div>
          
          {/* Wire line extending from canvas */}
          <div 
            className="absolute left-0 top-1/2 transform -translate-y-0.5 w-2 h-1 bg-white"
            style={{ left: '-8px' }}
          />
        </div>
      ))}
      
      {/* Add output button */}
      {outputs.length < 8 && (
        <button
          onClick={addOutput}
          className="flex items-center justify-center gap-2 p-3 bg-green-600 hover:bg-green-500 rounded-lg text-white font-medium transition-colors"
        >
          <Plus size={16} />
          Add Output
        </button>
      )}
      
      {outputs.length === 0 && (
        <div className="text-gray-400 text-sm text-center py-4">
          Click "Add Output" to capture circuit results
        </div>
      )}
    </div>
  );
}