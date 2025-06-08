export default function InputNode({ label, value, onToggle }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="text-sm font-medium text-white">{label}</div>
      <button
        className={`w-24 h-12 rounded-md border-2 transition-colors duration-200 ${
          value
            ? "bg-green-500 border-green-400 text-white"
            : "bg-gray-700 border-gray-500 text-gray-300"
        }`}
        onClick={onToggle}
      >
        {value ? "ON" : "OFF"}
      </button>
    </div>
  );
}