

// https://stackoverflow.com/questions/67372485/more-useful-typescript-dictionary-type-warn-accessed-item-could-be-undefined/67372636?noredirect=1#comment119087058_67372636
export const is_defined = <T>(val: T | undefined): val is T => val !== undefined
