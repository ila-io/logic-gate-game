import { useDrag } from "react-dnd";

// These are the gate types you support
const gates = ["AND", "OR", "XOR", "NOT", "NAND", "NOR"];


function DraggableGate({ gate }) {
  const [{ isDragging }, dragRef] = useDrag(() => ({
    type: "GATE",
    item: { gateType: gate },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const imagePath = `/assets/${gate.toLowerCase()}-gate.png`;
  
  return (
    <div
      ref={dragRef}
      className={`w-20 h-24 m-2 rounded-lg bg-gray-700 hover:bg-gray-600 cursor-move flex flex-col items-center justify-center text-white ${
        isDragging ? "opacity-50" : "opacity-100"
      }`}
    >
      <img
        src={imagePath}
        alt={`${gate} gate`}
        className="w-10 h-10 object-contain mb-1"
      />
      <div className="text-xs">{gate}</div>
    </div>
  );
}

export default function GatePalette() {
  return (
    <div className="flex justify-center gap-4 overflow-x-auto">
      {gates.map((gate) => (
        <DraggableGate key={gate} gate={gate} />
      ))}
    </div>
  );
}