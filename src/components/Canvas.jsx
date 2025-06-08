import { useDrop } from "react-dnd";
import { useState } from "react";

export default function Canvas(){
    const [gates, setGates] = useState([]);

    const [, dropRef] = useDrop(() => ({
    accept:"GATE",
        drop: (item, monitor) => {
            const offset = monitor.getClientOffset();
            const canvas = document.getElementById("canvas-area");
            const rect = canvas.getBoundingClientRect();

            setGates((prev) => [
                ...prev, 
                {
                    type: item.gateType,
                    x: offset.x - rect.left,
                    y: offset.y - rect.top,
                },


            ]);
        },
    }));

    return (
        <div
            id = "canvas-area"
            ref = {dropRef}
            className = "flex-1 relative bg-gray-800"
        >
            {gates.map((gate, idx) => (
                <img
                    key = {idx}
                    src = {`/assets/${gate.type.toLowerCase()}-gate.png`}
                    alt = {gate.type}
                    className = "w-16 h-16 absolute"
                    style = {{
                        left: gate.x - 32,
                        top: gate.y - 32,
                    }}
                />
            ))}
        </div>
    );
}
