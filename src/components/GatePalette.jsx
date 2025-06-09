import { useDrag } from "react-dnd";
import andGate from "../assets/and-gate.png";
import orGate from "../assets/or-gate.png";
import xorGate from "../assets/xor-gate.png";
import notGate from "../assets/not-gate.png";
import nandGate from "../assets/nand-gate.png";
import norGate from "../assets/nor-gate.png";

// Map gate names to images
const gateImages = {
  AND: andGate,
  OR: orGate,
  XOR: xorGate,
  NOT: notGate,
  NAND: nandGate,
  NOR: norGate,
};

const gates = Object.keys(gateImages);

function DraggableGate({ gate }) {
  const [{ isDragging }, dragRef] = useDrag(() => ({
    type: "GATE",
    item: { gateType: gate },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={dragRef}
      className={`w-20 h-24 m-2 rounded-lg bg-gray-700 hover:bg-gray-600 cursor-move flex flex-col items-center justify-center text-white ${
        isDragging ? "opacity-50" : "opacity-100"
      }`}
    >
      <img
        src={gateImages[gate]}
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
