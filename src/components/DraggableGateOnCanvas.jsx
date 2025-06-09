import { useRef, useEffect, useState } from "react";
import { useDrag } from "react-dnd";

export default function DraggableGateOnCanvas({
  gate,
  index,
  setGates,
  wiring,
  setWiring,
  connections,
  setConnections,
  outputValue = 0,
  input1Value = 0,
  input2Value = 0,
}) {
  const containerRef = useRef(null);
  const imgRef = useRef(null);

  const [hoveredNode, setHoveredNode] = useState(null);
  const gateDragBlockedRef = useRef(false);

  /* ───────────────────────── 1. Gate-drag (native) with boundaries ───────────────────────── */
  useEffect(() => {
    const handleMouseDown = (e) => {
      if (
        gateDragBlockedRef.current ||
        e.button !== 0 ||
        e.target.closest(".wire-node")
      ) return;
      e.preventDefault();

      const startX = e.clientX;
      const startY = e.clientY;
      const startGate = { ...gate };

      // Get canvas boundaries
      const canvas = document.getElementById("canvas-area");
      if (!canvas) return;

      const handleMove = (ev) => {
        const dx = ev.clientX - startX;
        const dy = ev.clientY - startY;

        // Calculate new position
        let newX = startGate.x + dx;
        let newY = startGate.y + dy;

        // Get canvas dimensions
        const canvasRect = canvas.getBoundingClientRect();
        const canvasWidth = canvasRect.width;
        const canvasHeight = canvasRect.height;

        // Gate dimensions (each gate is 128x128 pixels, positioned from center)
        const gateHalfWidth = 64;
        const gateHalfHeight = 64;

        // Apply boundary constraints
        // Left boundary
        if (newX - gateHalfWidth < 0) {
          newX = gateHalfWidth;
        }
        // Right boundary
        if (newX + gateHalfWidth > canvasWidth) {
          newX = canvasWidth - gateHalfWidth;
        }
        // Top boundary
        if (newY - gateHalfHeight < 0) {
          newY = gateHalfHeight;
        }
        // Bottom boundary
        if (newY + gateHalfHeight > canvasHeight) {
          newY = canvasHeight - gateHalfHeight;
        }

        // Update gate position with bounded coordinates
        setGates((prev) =>
          prev.map((g, i) =>
            i === index ? { ...g, x: newX, y: newY } : g
          )
        );
      };

      const handleUp = () => {
        window.removeEventListener("mousemove", handleMove);
        window.removeEventListener("mouseup", handleUp);
      };

      window.addEventListener("mousemove", handleMove);
      window.addEventListener("mouseup", handleUp);
    };

    const el = containerRef.current;
    el?.addEventListener("mousedown", handleMouseDown);
    return () => el?.removeEventListener("mousedown", handleMouseDown);
  }, [gate, index, setGates]);

  /* ───────────────────────── 2. Double-click to delete ───────────────────────── */
  useEffect(() => {
    const handleDoubleClick = (e) => {
      if (e.target.closest(".wire-node")) return;
      
      setGates((prev) => prev.filter((_, i) => i !== index));
      
      setConnections((prev) => 
        prev.filter((conn) => 
          conn.from.index !== index && conn.to.index !== index
        ).map((conn) => ({
          from: {
            ...conn.from,
            index: conn.from.index > index ? conn.from.index - 1 : conn.from.index
          },
          to: {
            ...conn.to,
            index: conn.to.index > index ? conn.to.index - 1 : conn.to.index
          }
        }))
      );
    };

    const el = containerRef.current;
    el?.addEventListener("dblclick", handleDoubleClick);
    return () => el?.removeEventListener("dblclick", handleDoubleClick);
  }, [index, setGates, setConnections]);

  /* ───────────────────── 3. React-DnD (attach only to image) ─────────────── */
  useDrag(
    () => ({ type: "PLACED_GATE", item: { index } }),
    [],
    (drag) => drag(imgRef)
  );

  /* ─────────────────────── 4. Wiring helpers ─────────────────────────────── */
  const beginWire = (e, node) => {
    e.stopPropagation();
    gateDragBlockedRef.current = true;

    const rect = e.currentTarget.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    setWiring({
      from: { type: 'gate', index, node },
      startX: cx,
      startY: cy,
      mouseX: cx,
      mouseY: cy,
    });

    const move = (mv) =>
      setWiring((w) => (w ? { ...w, mouseX: mv.clientX, mouseY: mv.clientY } : null));

    const up = () => {
      setWiring(null);
      gateDragBlockedRef.current = false;
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };

    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  };

  // Helper function to handle input connections
  const handleInputConnection = (e, inputNode) => {
    e.stopPropagation();
    if (!wiring) return;

    const existing = connections.find(
      (conn) =>
        conn.to.index === index &&
        conn.to.node === inputNode
    );
    if (existing) return;

    setConnections((prev) => [
      ...prev,
      {
        from: wiring.from,
        to: { index, node: inputNode },
      },
    ]);
    setWiring(null);
  };

  // Handle double-click on input nodes to delete connections
  const handleInputNodeDoubleClick = (e, inputNode) => {
    e.stopPropagation();
    setConnections(prev => 
      prev.filter(conn => 
        !(conn.to.index === index && conn.to.node === inputNode)
      )
    );
  };

  // Handle double-click on output node to delete connections
  const handleOutputNodeDoubleClick = (e) => {
    e.stopPropagation();
    setConnections(prev => 
      prev.filter(conn => 
        !(conn.from.type === 'gate' && conn.from.index === index && conn.from.node === 'output')
      )
    );
  };

  const getNodeClasses = (id, isOutput = false) => {
    const baseClasses = "absolute w-6 h-6 rounded-full transition duration-150 cursor-crosshair flex items-center justify-center text-xs font-bold";
    const colorClasses = hoveredNode === id ? "bg-white text-black" : "bg-gray-600 text-white border-2 border-gray-400";
    const logicClasses = isOutput ? 
      (outputValue === 1 ? "ring-2 ring-green-400" : "ring-2 ring-red-400") :
      "";
    
    return `${baseClasses} ${colorClasses} ${logicClasses}`;
  };

  return (
    <div
      ref={containerRef}
      className="absolute flex flex-col items-center select-none"
      style={{ left: gate.x - 64, top: gate.y - 64 }}
    >
      {/* Gate icon */}
      <img
        ref={imgRef}
        src={`/assets/${gate.type.toLowerCase()}-gate.png`}
        alt={gate.type}
        className="w-32 h-32 cursor-move"
      />
      <span className="text-xs mt-1 text-white">{gate.type}</span>

      {/* ─────── Output Node ─────── */}
      <div
        className={`${getNodeClasses("output", true)} wire-node`}
        style={{ top: "43%", right: "-0.5rem", transform: "translateY(-50%)" }}
        onMouseEnter={() => setHoveredNode("output")}
        onMouseLeave={() => setHoveredNode(null)}
        onMouseDown={(e) => beginWire(e, "output")}
        onDoubleClick={handleOutputNodeDoubleClick}
      >
        {outputValue}
      </div>

      {/* ─────── Input Node(s) ─────── */}
      {gate.type === "NOT" ? (
        <div
          className={`${getNodeClasses("input1")} wire-node`}
          style={{ top: "43%", left: "-0.5rem", transform: "translateY(-50%)" }}
          onMouseEnter={() => setHoveredNode("input1")}
          onMouseLeave={() => setHoveredNode(null)}
          onMouseUp={(e) => handleInputConnection(e, "input1")}
          onDoubleClick={(e) => handleInputNodeDoubleClick(e, "input1")}
        >
          {input1Value}
        </div>
      ) : (
        <>
          <div
            className={`${getNodeClasses("input1")} wire-node`}
            style={{ top: "29%", left: "-0.5rem", transform: "translateY(-50%)" }}
            onMouseEnter={() => setHoveredNode("input1")}
            onMouseLeave={() => setHoveredNode(null)}
            onMouseUp={(e) => handleInputConnection(e, "input1")}
            onDoubleClick={(e) => handleInputNodeDoubleClick(e, "input1")}
          >
            {input1Value}
          </div>
          <div
            className={`${getNodeClasses("input2")} wire-node`}
            style={{ top: "58%", left: "-0.5rem", transform: "translateY(-50%)" }}
            onMouseEnter={() => setHoveredNode("input2")}
            onMouseLeave={() => setHoveredNode(null)}
            onMouseUp={(e) => handleInputConnection(e, "input2")}
            onDoubleClick={(e) => handleInputNodeDoubleClick(e, "input2")}
          >
            {input2Value}
          </div>
        </>
      )}
    </div>
  );
}