export default function OutputNode({ value }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="text-sm font-medium text-white">Output</div>
      <div
        className={`w-24 h-12 rounded-md flex items-center justify-center text-sm font-bold border-2 transition-colors duration-200 ${
          value
            ? "bg-green-600 text-white border-green-400"
            : "bg-gray-600 text-gray-300 border-gray-500"
        }`}
      >
        {value ? "TRUE" : "FALSE"}
      </div>
    </div>
  );
}
