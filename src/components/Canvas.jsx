import DraggableGateOnCanvas from "./DraggableGateOnCanvas";
import TrashCan from "./TrashCan";
import { useDrop } from "react-dnd";

export default function Canvas({ gates, setGates }) {
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
    <div
      id="canvas-area"
      ref={dropRef}
      className="flex-1 relative bg-gray-900 overflow-hidden"
    >
      {gates.map((gate, idx) => (
        <DraggableGateOnCanvas
          key={idx}
          index={idx}
          gate={gate}
          setGates={setGates}
        />
      ))}

      {/* Trash Can in bottom left */}
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
