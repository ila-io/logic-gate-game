export default function NotGate({input}){
    const output = !input;
    return(
        <div className="flex flex-col items-center text-center p-4">
            <div className="text-2xl mb-1">⛔</div>
            <div className="text-sm font-semibold">NOT</div>
            <div className="w-20 h-20 border-4 border-white rounded-full flex items-center justify-center text-xl font-bold">
                {output ? "1" : "0"}
          </div>
        </div>        
    );
}