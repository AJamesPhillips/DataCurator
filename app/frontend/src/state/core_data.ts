
let statement_id = 0
export const sid = () => "s" + (statement_id++).toString()
let pattern_id = 0
const pid = () => "p" + (pattern_id++).toString()
let object_id = 0
export const oid = () => "o" + (object_id++).toString()


export const STATEMENT_IDS = {
    sType: sid(),
    sTitle: sid(),
    sDOI: sid(),
    sURL: sid(),
    sYear: sid(),
    "sMonth of year": sid(),
    "sDay of month": sid(),
    "sHour of day": sid(),
    "sMinute of hour": sid(),
    "sSeconds of minute": sid(),
    "sNanoseconds": sid(),
    "sTimezone": sid(),
    "sAction status": sid(),
}


export const PATTERN_IDS = {
    pPerson: pid(),
    // Persons: pid(),
    pGroup: pid(),
    "pPerson(s) or Group(s)": pid(),
    pDatetime: pid(),
    "pDate": pid(),
    pDocument: pid(),
    pProject: pid(),
    pActionV1: pid(),
    "pReference statement": pid(),
}


const pattern_handles = new Set(Object.keys(PATTERN_IDS))
const conflicts = Object.keys(STATEMENT_IDS).filter(k => pattern_handles.has(k))
if (conflicts.length) throw new Error(`${conflicts.length} conflicting handles: ${conflicts.join(", ")}`)


export const CORE_IDS = {
    ...STATEMENT_IDS,
    ...PATTERN_IDS,
}
