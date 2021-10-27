
export interface CanvasPoint
{
    left: number
    top: number
}
export interface ContentCoordinate extends CanvasPoint
{
    zoom: number
}


export interface NodePositionAndDimensions extends CanvasPoint
{
    width?: number
    height?: number
}


export interface Position
{
    x: number
    y: number
}
export interface PositionAndZoom extends Partial<Position>
{
    zoom?: number
}



// \/ \/ \/ \/ \/ \/ \/ TODO remove everything below this line \/ \/ \/ \/ \/ \/ \/

export interface NodeField
{
    name: string
    value: string
}

interface NodeProps extends Position
{
    width: number
    height: number

    display: boolean
}

interface TextNodeProps extends NodeProps
{
    title: string
    fields: NodeField[]
}


export interface ProjectPriorityNodeProps extends TextNodeProps
{
    effort: number
    id: string
}

export interface DailyActionNodeProps extends NodeProps {
    action_ids: string[]
}

