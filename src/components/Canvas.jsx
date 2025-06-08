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

  return (
    <div id="canvas-area" ref={dropRef} className="flex-1 relative bg-gray-900 overflow-hidden">
      <svg className="absolute w-full h-full pointer-events-none z-0">
        {connections.map((conn, idx) => {
          const fromGate = gates[conn.from.index];
          const toGate = gates[conn.to.index];
          if (!fromGate || !toGate) return null;

          const fromX = fromGate.x + 64; // Center of image + offset
          const fromY = fromGate.y;
          const toX = toGate.x;
          const toY = toGate.y;

          return (
            <line
              key={idx}
              x1={fromX}
              y1={fromY}
              x2={toX}
              y2={toY}
              stroke="white"
              strokeWidth="3"
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
            strokeWidth="3"
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
