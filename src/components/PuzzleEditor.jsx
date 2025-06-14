import { useRef, useState, useEffect } from "react";

export default function PuzzleEditor({ onClose }) {
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const dragRef = useRef(null);
  const offset = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseDown = (e) => {
      if (!dragRef.current) return;

      const rect = dragRef.current.getBoundingClientRect();
      offset.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };

      const handleMouseMove = (ev) => {
        setPosition({
          x: ev.clientX - offset.current.x,
          y: ev.clientY - offset.current.y,
        });
      };

      const handleMouseUp = () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };

      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    };

    const el = dragRef.current;
    if (el) el.addEventListener("mousedown", handleMouseDown);

    return () => el?.removeEventListener("mousedown", handleMouseDown);
  }, []);

  return (
    <div
      className="fixed z-50 w-[500px] bg-gray-800 text-white border border-gray-600 rounded-lg shadow-lg"
      style={{ left: position.x, top: position.y }}
    >
      <div
        ref={dragRef}
        className="cursor-move bg-gray-700 p-2 rounded-t font-bold text-sm select-none flex justify-between"
      >
        <span>Puzzle Editor</span>
        <button
          className="text-white bg-red-600 hover:bg-red-500 px-2 rounded"
          onClick={onClose}
        >
          ✕
        </button>
      </div>

      <div className="p-4 text-sm text-gray-300">
        This is your draggable puzzle editor window. Puzzle content will go here.
      </div>
    </div>
  );
}
