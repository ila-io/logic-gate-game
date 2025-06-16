import { useRef, useState, useEffect } from "react";

export default function PuzzleEditor({ onClose }) {
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const dragRef = useRef(null);
  const offset = useRef({ x: 0, y: 0 });

  const [inputLabels, setInputLabels] = useState(["A", "B", "C"]);
  const [cases, setCases] = useState([
    { input: [0, 1, 0], output: [1] },
    { input: [1, 1, 0], output: [0] },
    { input: [0, 0, 1], output: [1] }
  ]);

  const maxInputs = 8;
  const maxCases = 8;

  // ───── Draggable behavior ─────
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
    el?.addEventListener("mousedown", handleMouseDown);
    return () => el?.removeEventListener("mousedown", handleMouseDown);
  }, []);

  // ───── Logic handlers ─────
  const addInput = () => {
    if(inputLabels.length >= maxInputs) return;
    const nextLabel = String.fromCharCode(65 + inputLabels.length); 
    setInputLabels([...inputLabels, nextLabel]);
    setCases(prev =>
      prev.map(c => ({
        input: [...c.input, 0],
        output: c.output,
      }))
    );
  };

  const addCase = () => {
    if(cases.length >= maxCases) return;
    setCases(prev => [
      ...prev,
      {
        input: Array(inputLabels.length).fill(0),
        output: [0],
      },
    ]);
  };

  // handle toggling inputs
  const toggleInput = (rowIdx, colIdx) => {
    setCases(prev => 
      prev.map((c, i) => 
      i === colIdx ? { 
          ...c,
          input: c.input.map((v, j) => 
            j === rowIdx ? ( v === 1 ? 0 : 1) : v
          )
        }
        :c
      )
    );
  };

  // handle toggling output 
  const toggleOutput = (colIdx) => {
    setCases(prev => 
      prev.map((c, i) => 
      i === colIdx ? { ...c, output: [c.output[0] === 1 ? 0 : 1] }
        :c
      )
    );
  };

  const loadCase = (index) => {
    console.log("Loading case", index, cases[index]);
    // Hook into input loader logic if available
  };

  // JSX 
  return (
    <div
      className="fixed z-50 w-[550px] bg-gray-800 text-white border border-gray-600 rounded-lg shadow-lg"
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

      <div className="p-4 overflow-auto max-h-[80vh]">
        <table className="text-sm text-white border-collapse mb-4">
          <thead>
            <tr>
              <th className="px-2 py-1 border-b border-gray-600">Input</th>
              {cases.map((_, i) => (
                <th
                  key={i}
                  className="px-2 py-1 border-b border-gray-600 cursor-pointer hover:text-blue-400"
                  onClick={() => loadCase(i)}
                >
                  {i + 1}
                </th>
              ))}
              {cases.length < maxCases && (
                <th className="px-2 py-1">
                  <button
                    onClick={addCase}
                    className="text-green-400 text-xs hover:underline"
                  >
                    + case
                  </button>
                </th>
              )}
            </tr>
          </thead>

          <tbody>
            {inputLabels.map((label, rowIdx) => (
              <tr key={label}>
                <td className="px-2 py-1 border-r border-gray-600">{label}</td>
                {cases.map((c, colIdx) => (
                  <td
                    key={colIdx}
                    className="px-2 py-1 text-center cursor-pointer hover:bg-gray-600"
                    onClick={() => toggleInput(rowIdx, colIdx)}
                  >
                    {c.input[rowIdx]}
                  </td>
                ))}
                {cases.length < maxCases && <td></td>}
              </tr>
            ))}

            {/* Desired Output Row */}
            <tr>
              <td className="px-2 py-1 border-r border-gray-600 text-yellow-300">
                Desired Output
              </td>
              {cases.map((c, colIdx) => (
                <td
                  key={colIdx}
                  className="px-2 py-1 text-center cursor-pointer hover:bg-gray-600 text-yellow-300"
                  onClick={() => toggleOutput(colIdx)}
                >
                  {c.output[0]}
                </td>
              ))}
              {cases.length < maxCases && <td></td>}
            </tr>

            {/* Add Input Button */}
            {inputLabels.length < maxInputs && (
              <tr>
                <td colSpan={cases.length + 2} className="pt-2">
                  <button
                    onClick={addInput}
                    className="text-green-400 text-xs hover:underline"
                  >
                    + add input
                  </button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
