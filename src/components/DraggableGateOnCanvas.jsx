import { useRef, useEffect, useState } from "react";

export default function DraggableGateOnCanvas({ gate, index, setGates, wiring, setWiring, connections, setConnections }) {
  const ref = useRef();
  const [hoveredNode, setHoveredNode] = useState(null);
  const [draggingNode, setDraggingNode] = useState(null); // null or "output" or "input1"/"input2"

  // Gate dragging: disable if dragging a node (wire start)
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleMouseDown = (e) => {
      if (e.button !== 0) return;
      if (draggingNode) return; // disable gate drag when wiring
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

    el.addEventListener("mousedown", handleMouseDown);
    return () => el.removeEventListener("mousedown", handleMouseDown);
  }, [gate, index, setGates, draggingNode]);

  const handleDoubleClick = () => {
    setGates((prev) => prev.filter((_, i) => i !== index));
    // Also remove any connections to/from this gate:
    setConnections((prev) =>
      prev.filter(
        (conn) => conn.from.index !== index && conn.to.index !== index
      )
    );
  };

  const handleNodeMouseEnter = (nodeId) => setHoveredNode(nodeId);
  const handleNodeMouseLeave = () => setHoveredNode(null);

  // Calculate absolute node positions for wiring
  // Gate top-left corner:
  const gateLeft = gate.x - 64;
  const gateTop = gate.y - 64;

  // Positions relative to gate div (w-32 h-32 means 128px x 128px)
  // Using the positions you gave:
  const outputNodePos = {
    x: gateLeft + 128 - 3, // right edge minus half circle size (4/2=2px, use 3 for alignment)
    y: gateTop + 55, // 43% of 128px = 55 px approx
  };

  const input1NodePos = {
    x: gateLeft + 0 - 1, // left edge minus half circle size (4/2=2 px)
    y: gateTop + (gate.type === "NOT" ? 55 : 37), // NOT: 43% (55px), else 29% (37 px)
  };

  const input2NodePos = {
    x: gateLeft + 0 - 1, // same as input1 x
    y: gateTop + 75, // 58% of 128 = 74.2 approx
  };

  // Start wiring drag from output node
  const onOutputMouseDown = (e) => {
    e.stopPropagation();
    setDraggingNode("output");
    setWiring({
      fromGateIndex: index,
      fromNodeType: "output",
      startX: outputNodePos.x + 2, // center of node circle
      startY: outputNodePos.y + 2,
      mouseX: outputNodePos.x + 2,
      mouseY: outputNodePos.y + 2,
    });
  };

  // Finish wiring drag on input node
  const onInputMouseUp = (inputNodeId, e) => {
    e.stopPropagation();
    if (!wiring) return;

    // Prevent multiple connections to the same input if max reached
    // Count connections targeting this gate/input
    const targetInputs = connections.filter(
      (conn) =>
        conn.to.index === index && conn.to.node === inputNodeId
    );
    const maxInputs = gate.type === "NOT" ? 1 : 2;
    if (targetInputs.length >= maxInputs) {
      // Do nothing, already max inputs connected
      setDraggingNode(null);
      setWiring(null);
      return;
    }

    // Add connection from wiring.fromGateIndex/output to this gate/input
    if (wiring.fromGateIndex !== index || wiring.fromNodeType !== inputNodeId) {
      setConnections((prev) => [
        ...prev,
        {
          from: { index: wiring.fromGateIndex, node: wiring.fromNodeType },
          to: { index, node: inputNodeId },
        },
      ]);
    }

    setDraggingNode(null);
    setWiring(null);
  };

  // Update wiring mouse move globally
  useEffect(() => {
    if (!draggingNode) return;

    const onMouseMove = (e) => {
      setWiring((prev) =>
        prev
          ? {
              ...prev,
              mouseX: e.clientX,
              mouseY: e.clientY,
            }
          : null
      );
    };

    const onMouseUp = (e) => {
      setDraggingNode(null);
      setWiring(null);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [draggingNode, setWiring]);

  return (
    <div
      ref={ref}
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
        draggable={false}
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
        onMouseDown={onOutputMouseDown}
      />

      {/* INPUT NODE(s) */}
      {gate.type === "NOT" ? (
        <div
          className={`absolute w-4 h-4 rounded-full ${
            hoveredNode === "input1" ? "bg-white" : "bg-gray-500"
          } transition duration-150`}
          style={{
            top: "43%",
            left: "-0.2rem",
            transform: "translateY(-50%)",
          }}
          onMouseEnter={() => handleNodeMouseEnter("input1")}
          onMouseLeave={handleNodeMouseLeave}
          onMouseUp={(e) => onInputMouseUp("input1", e)}
        />
      ) : (
        <>
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
            onMouseUp={(e) => onInputMouseUp("input1", e)}
          />

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
            onMouseUp={(e) => onInputMouseUp("input2", e)}
          />
        </>
      )}
    </div>
  );
}
