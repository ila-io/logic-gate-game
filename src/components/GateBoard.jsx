import { useDrop } from "react-dnd";

export default function GateBoard() {
  const [{ isOver }, dropRef] = useDrop(() => ({
    accept: "GATE",
    drop: (item, monitor) => {
      alert(`Dropped a ${item.gateType} gate!`);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  return (
    <div
      ref={dropRef}
      className={`flex-1 rounded-lg border-4 border-dashed ${
        isOver ? "border-green-400" : "border-gray-500"
      } bg-gray-800 flex items-center justify-center text-gray-400`}
    >
      Drop gates here
    </div>
  );
}
