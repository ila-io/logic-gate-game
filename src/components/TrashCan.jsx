import { useDrop } from "react-dnd";


export default function TrashCan({ onDropGate }) {
  const [{ isOver }, dropRef] = useDrop(() => ({
    accept: "PLACED_GATE",
    drop: (item) => {
      if (typeof item.index === "number") {
        onDropGate(item.index);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  return (
    <div
      ref={dropRef}
      className={`w-16 h-16 rounded-lg flex items-center justify-center transition-colors ${
        isOver ? "bg-red-600" : "bg-gray-700"
      }`}
    >
      🗑️
    </div>
  );
}
