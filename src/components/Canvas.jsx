import DraggableGateOnCanvas from "./DraggableGateOnCanvas";
import { useDrop } from "react-dnd";
import { evaluateCircuit } from "./utils/LogicEvaluator";


export default function Canvas({ 
  gates, 
  setGates, 
  inputs,
  outputs,
  wiring, 
  setWiring, 
  connections, 
  setConnections 
}) {
  const [, dropRef] = useDrop(() => ({
    accept: "GATE",
    drop: (item, monitor) => {
      const offset = monitor.getClientOffset();
      const canvas = document.getElementById("canvas-area");
      const rect = canvas.getBoundingClientRect();

      // Calculate drop position relative to canvas
      let x = offset.x - rect.left;
      let y = offset.y - rect.top;

      // Gate dimensions (128x128 pixels, positioned from center)
      const gateHalfWidth = 64;
      const gateHalfHeight = 64;

      // Apply boundary constraints for initial drop
      if (x - gateHalfWidth < 0) {
        x = gateHalfWidth;
      }
      if (x + gateHalfWidth > rect.width) {
        x = rect.width - gateHalfWidth;
      }
      if (y - gateHalfHeight < 0) {
        y = gateHalfHeight;
      }
      if (y + gateHalfHeight > rect.height) {
        y = rect.height - gateHalfHeight;
      }

      setGates((prev) => [
        ...prev,
        {
          type: item.gateType,
          x: x,
          y: y,
        },
      ]);
    },
  }));

  // Evaluate circuit to get current logic states
  const { gateOutputs } = evaluateCircuit(gates, inputs, outputs, connections);

  // Calculate node absolute positions for connections
  const getNodePosition = (gate, node) => {
    const left = gate.x - 64;
    const top = gate.y - 64;
    switch (node) {
      case "output":
        return { x: left + 125, y: top + 55 };
      case "input1":
        return { x: left + 3, y: top + (gate.type === "NOT" ? 55 : 30) };
      case "input2":
        return { x: left + 3, y: top + 75 };
      default:
        return { x: gate.x, y: gate.y };
    }
  };

  // Get input position (for connections from InputSection)
  const getInputPosition = (inputId) => {
    const inputIndex = inputs.findIndex(input => input.id === inputId);
    if (inputIndex === -1) return { x: 0, y: 0 };

    const inputHeight = 92.1; // approximate height of each input + gap
    const startY = 80; // offset for header

    return {
      x: 0, // Right edge of InputSection (48 * 4 = 192px width)
      y: startY + (inputIndex * inputHeight) + 24 // Center of input box
    };
  };

  // Get output position (for connections to OutputSection)
    const getOutputPosition = (outputId) => {
    const outputIndex = outputs.findIndex(output => output.id === outputId);
    if (outputIndex === -1) return { x: 0, y: 0 };

    const outputHeight = 92.1; // approximate height of each output + gap
    const startY = 80; // offset for header
    
    const canvas = document.getElementById("canvas-area");
    const canvasWidth = canvas ? canvas.offsetWidth : window.innerWidth - 384; // fallback

    return {
      x: canvasWidth, // Left edge of OutputSection (canvas width)
      y: startY + (outputIndex * outputHeight) + 24 // Center of output box
    };
  };

  // Get the signal value for a wire connection
  const getWireSignalValue = (conn) => {
    if (conn.from.type === 'input') {
      // Wire from input source
      const input = inputs.find(i => i.id === conn.from.id);
      return input ? input.value : 0;
    } else {
      // Wire from gate output
      const sourceKey = `${conn.from.index}-${conn.from.node}`;
      return gateOutputs[sourceKey] ? 1 : 0;
    }
  };

  // Get wire color based on signal value
  const getWireColor = (signalValue) => {
    return signalValue === 1 ? "#10b981" : "#ef4444"; // green-500 : red-500
  };

  // Handle wire deletion
  const handleWireDoubleClick = (connectionIndex, e) => {
    e.stopPropagation();
    setConnections(prev => prev.filter((_, idx) => idx !== connectionIndex));
  };

    // Get the logical value for a node
  const getNodeValue = (gateIndex, node) => {
    const key = `${gateIndex}-${node}`;
    return gateOutputs[key] ? 1 : 0;
  };

  // Get input node value from connections
  const getInputNodeValue = (gateIndex, inputNode) => {
    const conn = connections.find(c => 
      c.to.index === gateIndex && c.to.node === inputNode
    );
    
    if (!conn) return 0;
    
    if (conn.from.type === 'input') {
      const input = inputs.find(i => i.id === conn.from.id);
      return input ? input.value : 0;
    } else {
      // From another gate's output
      const sourceKey = `${conn.from.index}-${conn.from.node}`;
      return gateOutputs[sourceKey] ? 1 : 0;
    }
  };

  return (
    <div
      id="canvas-area"
      ref={dropRef}
      className="flex-1 relative bg-gray-900 overflow-hidden"
    >
      <svg className="absolute w-full h-full pointer-events-auto z-0">
        {/* Render connections with colored wires */}
        {connections.map((conn, idx) => {
          let fromPos, toPos;

          // Handle connections FROM inputs
          if (conn.from.type === 'input') {
            fromPos = getInputPosition(conn.from.id);
          } else {
            // Handle connections FROM gates
            const fromGate = gates[conn.from.index];
            if (!fromGate) return null;
            fromPos = getNodePosition(fromGate, conn.from.node);
          }

          if (conn.to.type === 'output') {
            // Connection to output section
            toPos = getOutputPosition(conn.to.id);
          } else {
            const toGate = gates[conn.to.index];
            if (!toGate) return null;
            toPos = getNodePosition(toGate, conn.to.node);
          }

          // Get the signal value and corresponding color
          const signalValue = getWireSignalValue(conn);
          const wireColor = getWireColor(signalValue);

          return (
            <line
              key={idx}
              x1={fromPos.x}
              y1={fromPos.y + (conn.from.type === 'input' ? 0 : 8)}
              x2={toPos.x}
              y2={toPos.y + (conn.to.type === 'output' ? 0 : 12)}
              stroke={wireColor}
              strokeWidth="4"
              strokeLinecap="round"
              className="cursor-pointer hover:opacity-75 transition-opacity"
              onDoubleClick={(e) => handleWireDoubleClick(idx, e)}
            />
          );
        })}

        {/* Render temporary wiring line (white while dragging) */}
        {wiring && (
          <line
            x1={wiring.startX - (wiring.from.type === 'input' ? 0 : 191)}
            y1={wiring.startY}
            x2={wiring.mouseX - (wiring.from.type === 'input' ? 192 : 192)}
            y2={wiring.mouseY}
            stroke="white"
            strokeWidth="4"
            strokeLinecap="round"
          />
        )}      
      </svg>

      {/* Render gates */}
      {gates.map((gate, idx) => (
        <DraggableGateOnCanvas
          key={idx}
          index={idx}
          gate={gate}
          setGates={setGates}
          wiring={wiring}
          setWiring={setWiring}
          connections={connections}
          setConnections={setConnections}
          // Pass logic state values
          outputValue={getNodeValue(idx, 'output')}
          input1Value={getInputNodeValue(idx, 'input1')}
          input2Value={getInputNodeValue(idx, 'input2')}
        />
      ))}
    </div>
  );
}