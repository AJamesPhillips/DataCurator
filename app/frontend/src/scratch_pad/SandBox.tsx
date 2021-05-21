import { h } from "preact"

import "./SandBox.css"



export function SandBox ()
{

    return <div>
        <svg width="1000" height="1000" style={{ border: "thin solid black" }}>
            <g>
                <path className="background" d="M 100 100 C 50,297, 241,22, 200,200"></path>
                <path d="M 100 100 C 50,297, 241,22, 200,200"></path>
                {/* <path d="M 100 100 Q 50 297,241 22,55 134"></path> */}
            </g>
        </svg>
    </div>
}
