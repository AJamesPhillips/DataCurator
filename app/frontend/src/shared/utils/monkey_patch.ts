
// https://stackoverflow.com/a/64522938/539490
export{}
declare global {
    interface Array<T> {
        first (): T | undefined
        last (): T | undefined
        find_last (predicate: (t: T) => boolean): T | undefined
    }

    interface String {
        // replaceAll: (search: string, replace: string) => string
        // matchAll: (search: RegExp) => string[]
    }
}



if (!Array.prototype.first) {
    Object.defineProperty(Array.prototype, "first", {
        enumerable: false,
        writable: false,
        configurable: false,
        value: function first<T> (this: T[]): T | undefined {
            return this[0]
        }
    })
}



if (!Array.prototype.last) {
    Object.defineProperty(Array.prototype, "last", {
        enumerable: false,
        writable: false,
        configurable: false,
        value: function last<T> (this: T[]): T | undefined {
            return this[this.length - 1]
        }
    })
}



if (!Array.prototype.find_last) {
    Object.defineProperty(Array.prototype, "find_last", {
        enumerable: false,
        writable: false,
        configurable: false,
        value: function find_last<T> (this: T[], predicate: (t: T) => boolean): T | undefined {
            for (let index = this.length - 1; index >= 0; --index) {
                if (predicate(this[index]!)) return this[index]
            }
            return undefined
        }
    })
}



// if (!String.prototype.replaceAll) {
//     Object.defineProperty(String.prototype, "replaceAll", {
//         enumerable: false,
//         writable: false,
//         configurable: false,
//         value: function replaceAll (this: string, search: string, replace: string): string {
//             return this.split(search).join(replace)
//         }
//     })
// }



// if (!String.prototype.matchAll) {
//     Object.defineProperty(String.prototype, "matchAll", {
//         enumerable: false,
//         writable: false,
//         configurable: false,
//         value: function matchAll (pattern: string, string: string): string[] {
//             const regex = new RegExp(pattern, "g")
//             let match
//             const matches = []

//             while (match = regex.exec(string))
//             {
//                 // add all matched groups
//                 matches.push(...match.slice(1))
//             }

//             return matches
//         }
//     })
// }
