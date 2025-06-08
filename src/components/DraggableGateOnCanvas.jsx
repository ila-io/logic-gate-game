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
}) {
  const containerRef = useRef(null);
  const imgRef       = useRef(null);

  const [hoveredNode, setHoveredNode] = useState(null);
  const gateDragBlockedRef            = useRef(false);   // ← block gate drag while wiring

  /* ───────────────────────── 1. Gate-drag (native) ───────────────────────── */
  useEffect(() => {
    const handleMouseDown = (e) => {
      if (
          gateDragBlockedRef.current ||
          e.button !== 0 ||
          e.target.closest(".wire-node") // <- NEW: clicked on a node
        ) return;
         // block while wiring
      e.preventDefault();

      const startX = e.clientX;
      const startY = e.clientY;
      const startGate = { ...gate };

      const handleMove = (ev) => {
        const dx = ev.clientX - startX;
        const dy = ev.clientY - startY;

        setGates((prev) =>
          prev.map((g, i) =>
            i === index ? { ...g, x: startGate.x + dx, y: startGate.y + dy } : g
          )
        );
      };

      const handleUp = () => {
        window.removeEventListener("mousemove", handleMove);
        window.removeEventListener("mouseup",    handleUp);
      };

      window.addEventListener("mousemove", handleMove);
      window.addEventListener("mouseup",    handleUp);
    };

    const el = containerRef.current;
    el?.addEventListener("mousedown", handleMouseDown);
    return () => el?.removeEventListener("mousedown", handleMouseDown);
  }, [gate, index, setGates]);

  /* ───────────────────── 2. React-DnD (attach only to image) ─────────────── */
  useDrag(
    ()      => ({ type: "PLACED_GATE", item: { index } }),
    [],
    (drag)  => drag(imgRef)           // attach dragRef **only** to <img>
  );

  /* ─────────────────────── 3. Wiring helpers ─────────────────────────────── */
  const beginWire = (e, node) => {
    e.stopPropagation();                         // don’t start gate drag
    gateDragBlockedRef.current = true;           // block until mouse-up

    const rect = e.currentTarget.getBoundingClientRect();
    const cx   = rect.left + rect.width  / 2;
    const cy   = rect.top  + rect.height / 2;

    setWiring({
      from:    { index, node },
      startX:  cx,
      startY:  cy,
      mouseX:  cx,
      mouseY:  cy,
    });

    const move = (mv) =>
      setWiring((w) => (w ? { ...w, mouseX: mv.clientX, mouseY: mv.clientY } : null));

    const up = () => {
      setWiring(null);
      gateDragBlockedRef.current = false;
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup",    up);
    };

    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup",    up);
  };

  const finishWire = (e, node) => {
    e.stopPropagation();
    if (!wiring) return;
    setConnections((prev) => [
      ...prev,
      { from: wiring.from, to: { index, node } },
    ]);
    setWiring(null);
  };

  const nodeClasses = (id) =>
    `absolute w-4 h-4 rounded-full transition duration-150 cursor-crosshair ${
      hoveredNode === id ? "bg-white" : "bg-gray-500"
    }`;

  return (
    <div
      ref={containerRef}
      className="absolute flex flex-col items-center select-none"
      style={{ left: gate.x - 64, top: gate.y - 64 }}
    >
      {/* Gate icon (ONLY this part is draggable via React-DnD) */}
      <img
        ref={imgRef}
        src={`/assets/${gate.type.toLowerCase()}-gate.png`}
        alt={gate.type}
        className="w-32 h-32 cursor-move"
      />
      <span className="text-xs mt-1 text-white">{gate.type}</span>

      {/* ─────── Output Node ─────── */}
      <div
        className={`${nodeClasses("output")} wire-node`}
        style={{ top: "43%", right: "-0.20rem", transform: "translateY(-50%)" }}
        onMouseEnter={() => setHoveredNode("output")}
        onMouseLeave={() => setHoveredNode(null)}
        onMouseDown={(e) => {
          e.stopPropagation();
          const rect = e.target.getBoundingClientRect();
          setWiring({
            from: { index, node: "output" },
            startX: rect.left + rect.width / 2,
            startY: rect.top + rect.height / 2,
            mouseX: rect.left + rect.width / 2,
            mouseY: rect.top + rect.height / 2,
          });
        }}
      />

      {/* ─────── Input Node(s) ─────── */}
      {gate.type === "NOT" ? (
        <div
          className={`${nodeClasses("input1")} wire-node`}
          style={{ top: "43%", left: "-0.2rem", transform: "translateY(-50%)" }}
          onMouseEnter={() => setHoveredNode("input1")}
          onMouseLeave={() => setHoveredNode(null)}
          onMouseUp={(e) => finishWire(e, "input1")}
        />
      ) : (
        <>
          <div
            className={`${nodeClasses("input1")} wire-node`}
            style={{ top: "29%", left: "-0.2rem", transform: "translateY(-50%)" }}
            onMouseEnter={() => setHoveredNode("input1")}
            onMouseLeave={() => setHoveredNode(null)}
            onMouseUp={(e) => finishWire(e, "input1")}
          />
          <div
            className={`${nodeClasses("input1")} wire-node`}
            style={{ top: "58%", left: "-0.2rem", transform: "translateY(-50%)" }}
            onMouseEnter={() => setHoveredNode("input2")}
            onMouseLeave={() => setHoveredNode(null)}
            onMouseUp={(e) => finishWire(e, "input2")}
          />
        </>
      )}
    </div>
  );
}
