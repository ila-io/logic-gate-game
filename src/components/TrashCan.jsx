import { useDrop } from "react-dnd"; 
import { Trash2 } from "lucide-react"; 

export default function TrashCan({ onDropGate }){
    const [{ isOver }, dropRef] = useDrop (() => ({
        accept: "PLACED_GATE",
        drop: (item) => {
            if (onDropGate) onDropGate(item.index);
        },
        collect: (monitor) => ({
            isOver: monitor.isOver(),
        }),
    }));


    return(
        <div
            ref = {dropRef}
            className = {`absolute bottom-2 right-2 w-20 h-20 flex items-center justify-center rounded-full transition-colors border border-gray-600 ${
                isOver ? "bg-red-600" : "bg-gray-700"
            }`}
        >
            <Trash2 size={32}/>
        </div>
    );
}
