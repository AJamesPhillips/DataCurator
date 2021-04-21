import type {
    Objekt,
    ObjectAttribute,
    PatternAttribute,
    Pattern,
    CoreObjectAttribute,
    CoreObject,
} from "../State"



export function convert_from_pattern_attributes (attributes: PatternAttribute[]): ObjectAttribute[]
{
    return attributes.map((a, pidx) => ({ pidx, value: "", pattern: a }))
}


export function merge_pattern_attributes (attributes: CoreObjectAttribute[], pattern: Pattern): ObjectAttribute[]
{
    return attributes.map(a => ({ ...a, pattern: pattern.attributes[a.pidx] }))
}


type MergePatternIntoCoreObjectArgs =
{
    object: CoreObject
    patterns: Pattern[]
} | {
    object: CoreObject
    pattern: Pattern
}
export function merge_pattern_into_core_object (args: MergePatternIntoCoreObjectArgs): Objekt
{
    const pattern: Pattern = args.hasOwnProperty("pattern")
        ? (args as any).pattern
        : find_pattern((args as any).patterns, args.object.pattern_id)

    return {
        ...args.object,
        pattern_id: pattern.id,
        pattern_name: pattern.name,
        content: pattern.content,
        attributes: merge_pattern_attributes(args.object.attributes, pattern)
    }
}

function find_pattern (patterns: Pattern[], pattern_id: string)
{
    const pattern = patterns.find(({ id }) => id === pattern_id)

    if (!pattern) throw new Error(`No pattern id: "${pattern_id}" in patterns`)

    return pattern
}
