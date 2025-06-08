import DraggableGateOnCanvas from "./DraggableGateOnCanvas";
import TrashCan from "./TrashCan";
import { useDrop } from "react-dnd";

export default function Canvas({ gates, setGates, wiring, setWiring, connections, setConnections }) {
  const [, dropRef] = useDrop(() => ({
    accept: "GATE",
    drop: (item, monitor) => {
      const offset = monitor.getClientOffset();
      const canvas = document.getElementById("canvas-area");
      const rect = canvas.getBoundingClientRect();

      setGates((prev) => [
        ...prev,
        {
          type: item.gateType,
          x: offset.x - rect.left,
          y: offset.y - rect.top,
        },
      ]);
    },
  }));

  // Calculate node absolute positions for connections
  // Helper function:
  const getNodePosition = (gate, node) => {
    const left = gate.x - 64;
    const top = gate.y - 64;
    switch (node) {
      case "output":
        return { x: left + 128, y: top + 55 };
      case "input1":
        return { x: left, y: top + (gate.type === "NOT" ? 55 : 37) };
      case "input2":
        return { x: left, y: top + 75 };
      default:
        return { x: gate.x, y: gate.y };
    }
  };

  return (
    <div
      id="canvas-area"
      ref={dropRef}
      className="flex-1 relative bg-gray-900 overflow-hidden"
    >
      <svg className="absolute w-full h-full pointer-events-none z-0">
        {connections.map((conn, idx) => {
          const fromGate = gates[conn.from.index];
          const toGate = gates[conn.to.index];
          if (!fromGate || !toGate) return null;

          const fromPos = getNodePosition(fromGate, conn.from.node);
          const toPos = getNodePosition(toGate, conn.to.node);

          return (
            <line
              key={idx}
              x1={fromPos.x}
              y1={fromPos.y}
              x2={toPos.x}
              y2={toPos.y}
              stroke="white"
              strokeWidth="4" // thicker line
              strokeLinecap="round"
            />
          );
        })}

        {wiring && (
          <line
            x1={wiring.startX}
            y1={wiring.startY}
            x2={wiring.mouseX}
            y2={wiring.mouseY}
            stroke="white"
            strokeWidth="4"
            strokeLinecap="round"
          />
        )}
      </svg>

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
        />
      ))}

      {/* Trash Can in bottom right */}
      <div className="absolute bottom-4 right-4 z-10">
        <TrashCan
          onDropGate={(index) =>
            setGates((prev) => prev.filter((_, i) => i !== index))
          }
        />
      </div>
    </div>
  );
}
