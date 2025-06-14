import { useState, useEffect } from "react";
import { X, Plus } from "lucide-react";

export default function InputSection({ 
  inputs, 
  setInputs, 
  wiring, 
  setWiring, 
  connections, 
  setConnections 
}) {
  const inputLabels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  
  // Auto-reassign labels whenever inputs change
  useEffect(() => {
    setInputs(prevInputs => 
      prevInputs.map((input, index) => ({
        ...input,
        label: inputLabels[index]
      }))
    );
  }, [inputs.length]); // Only trigger when length changes to avoid infinite loops
  
  const addInput = () => {
    if (inputs.length < 8) {
      const newInput = {
        id: Date.now(), // unique id
        label: inputLabels[inputs.length], // This will be corrected by useEffect
        value: 0
      };
      setInputs([...inputs, newInput]);
    }
  };

  const removeInput = (inputId) => {
    const inputIndex = inputs.findIndex(input => input.id === inputId);
    
    // Remove the input
    setInputs(inputs.filter(input => input.id !== inputId));
    
    // Remove any connections from this input
    setConnections(prev => 
      prev.filter(conn => 
        !(conn.from.type === 'input' && conn.from.id === inputId)
      )
    );
  };

  const toggleInput = (inputId) => {
    setInputs(inputs.map(input => 
      input.id === inputId 
        ? { ...input, value: input.value === 0 ? 1 : 0 }
        : input
    ));
  };

  const beginWire = (e, inputId) => {
    e.stopPropagation();
    
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    setWiring({
      from: { type: 'input', id: inputId },
      startX: cx-178,
      startY: cy,
      mouseX: cx-64,
      mouseY: cy,
    });

    const move = (mv) =>
      setWiring((w) => (w ? { ...w, mouseX: mv.clientX, mouseY: mv.clientY } : null));

    const up = () => {
      setWiring(null);
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };

    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  };

  return (
    <div className="w-48 bg-gray-800 p-4 flex flex-col gap-3">
      <h3 className="text-white font-semibold text-lg mb-2">Inputs</h3>
      
      {/* Input boxes */}
      {inputs.map((input, index) => (
        <div key={input.id} className="relative">
          {/* Main input box */}
          <div className="bg-gray-700 rounded-lg p-3 border-2 border-gray-600 hover:border-gray-500 transition-colors">
            {/* Label */}
            <div className="text-xs text-gray-300 mb-1">Input {input.label}</div>
            
            {/* Value (clickable) */}
            <div 
              className="text-center cursor-pointer select-none"
              onClick={() => toggleInput(input.id)}
            >
              <span className={`text-2xl font-bold ${
                input.value === 1 ? 'text-green-400' : 'text-red-400'
              }`}>
                {input.value}
              </span>
            </div>
            
            {/* Delete button */}
            <button
              className="absolute top-1 right-1 w-5 h-5 bg-red-400 hover:bg-red-300 rounded-full flex items-center justify-center transition-colors"
              onClick={() => removeInput(input.id)}
            >
              <X size={12} className="text-white" />
            </button>
          </div>
          
          {/* Wire node */}
          <div
            className="absolute right-0 top-1/2 transform translate-x-2 -translate-y-1/2 w-4 h-4 bg-gray-500 hover:bg-white rounded-full cursor-crosshair transition-colors z-10"
            onMouseDown={(e) => beginWire(e, input.id)}
          />
          
          {/* Wire line extending to canvas */}
          <div 
            className="absolute right-0 top-1/2 transform -translate-y-0.5 w-2 h-1 bg-white"
            style={{ right: '-8px' }}
          />
        </div>
      ))}
      
      {/* Add input button */}
      {inputs.length < 8 && (
        <button
          onClick={addInput}
          className="flex items-center justify-center gap-2 p-3 bg-blue-600 hover:bg-blue-500 rounded-lg text-white font-medium transition-colors"
        >
          <Plus size={16} />
          Add Input
        </button>
      )}
      
      {inputs.length === 0 && (
        <div className="text-gray-400 text-sm text-center py-4">
          Click "Add Input" to start building your circuit
        </div>
      )}
    </div>
  );
}