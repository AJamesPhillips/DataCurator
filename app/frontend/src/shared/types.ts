import { str_enum } from "./utils/str_enum"



export const NUMBER_DISPLAY_TYPES = str_enum([
    "bare", // only the number so that numbers like 2023 do not have a comma
    "simple", // includes commas in numbers like 2,023
    "scaled",
    "percentage",
    "abbreviated_scaled",
    "scientific",
])
export type NumberDisplayType = keyof typeof NUMBER_DISPLAY_TYPES
