import { useRef, useEffect, useState } from "react";
import { useDrag } from "react-dnd";

export default function DraggableGateOnCanvas({ gate, index, setGates }) {
  const ref = useRef();
  const [hoveredNode, setHoveredNode] = useState(null);

  // Handle dragging of the gate box (your working code)
  useEffect(() => {
    const handleMouseDown = (e) => {
      const el = ref.current;
      if (!el || e.button !== 0) return;
      e.preventDefault();
      const startX = e.clientX;
      const startY = e.clientY;
      const startGate = { ...gate };

      const handleMouseMove = (moveEvent) => {
        const deltaX = moveEvent.clientX - startX;
        const deltaY = moveEvent.clientY - startY;

        setGates((prev) =>
          prev.map((g, i) =>
            i === index
              ? {
                  ...g,
                  x: startGate.x + deltaX,
                  y: startGate.y + deltaY,
                }
              : g
          )
        );
      };

      const handleMouseUp = () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };

      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    };

    const el = ref.current;
    if (el) el.addEventListener("mousedown", handleMouseDown);
    return () => el?.removeEventListener("mousedown", handleMouseDown);
  }, [gate, index, setGates]);

  const [, dragRef] = useDrag(() => ({
    type: "PLACED_GATE",
    item: { index },
  }));

  const combinedRef = (el) => {
    dragRef(el);
    ref.current = el;
  };

  const handleDoubleClick = () => {
    setGates((prev) => prev.filter((_, i) => i !== index));
  };

  // Dummy node handlers
  const handleNodeMouseEnter = (nodeId) => setHoveredNode(nodeId);
  const handleNodeMouseLeave = () => setHoveredNode(null);

  return (
    <div
      ref={combinedRef}
      onDoubleClick={handleDoubleClick}
      className="absolute flex flex-col items-center cursor-move select-none"
      style={{
        left: gate.x - 64,
        top: gate.y - 64,
      }}
    >
      <img
        src={`/assets/${gate.type.toLowerCase()}-gate.png`}
        alt={gate.type}
        className="w-32 h-32 pointer-events-none"
      />
      <span className="text-xs mt-1 text-white">{gate.type}</span>

      {/* OUTPUT NODE (right side) */}
      <div
        className={`absolute w-4 h-4 rounded-full ${
          hoveredNode === "output" ? "bg-white" : "bg-gray-500"
        } transition duration-150`}
        style={{ top: "43%", right: "-0.20rem", transform: "translateY(-50%)" }}
        onMouseEnter={() => handleNodeMouseEnter("output")}
        onMouseLeave={handleNodeMouseLeave}
        onMouseDown={(e) => {
          // TODO: Start wire drag from output node
          e.stopPropagation();
          console.log("Start wire from output");
        }}
      />

    {/* INPUT NODE(s) */}
    {gate.type === "NOT" ? (
      // NOT gate has a single input node — uniquely positioned
      <div
        className={`absolute w-4 h-4 rounded-full ${
          hoveredNode === "input1" ? "bg-white" : "bg-gray-500"
        } transition duration-150`}
        style={{
          top: "43%", // 🔧 Adjust vertical position
          left: "-0.2rem", // 🔧 Adjust horizontal offset
          transform: "translateY(-50%)",
        }}
        onMouseEnter={() => handleNodeMouseEnter("input1")}
        onMouseLeave={handleNodeMouseLeave}
        onMouseUp={(e) => {
          e.stopPropagation();
          console.log("Wire dropped on NOT input");
        }}
      />
    ) : (
      <>
        {/* INPUT NODE 1 (top-left) */}
        <div
          className={`absolute w-4 h-4 rounded-full ${
            hoveredNode === "input1" ? "bg-white" : "bg-gray-500"
          } transition duration-150`}
          style={{
            top: "29%", 
            left: "-0.2rem",
            transform: "translateY(-50%)",
          }}
          onMouseEnter={() => handleNodeMouseEnter("input1")}
          onMouseLeave={handleNodeMouseLeave}
          onMouseUp={(e) => {
            e.stopPropagation();
            console.log("Wire dropped on input 1");
          }}
        />

        {/* INPUT NODE 2 (bottom-left) */}
        <div
          className={`absolute w-4 h-4 rounded-full ${
            hoveredNode === "input2" ? "bg-white" : "bg-gray-500"
          } transition duration-150`}
          style={{
            top: "58%",
            left: "-0.2rem",
            transform: "translateY(-50%)",
          }}
          onMouseEnter={() => handleNodeMouseEnter("input2")}
          onMouseLeave={handleNodeMouseLeave}
          onMouseUp={(e) => {
            e.stopPropagation();
            console.log("Wire dropped on input 2");
          }}
        />
      </>
    )}

    </div>
  );
}
