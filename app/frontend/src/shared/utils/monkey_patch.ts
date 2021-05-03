
// https://stackoverflow.com/a/64522938/539490
export{}
declare global {
    interface Array<T>  {
        first (): T | undefined;
        last (): T | undefined;
        find_last (predicate: (t: T) => boolean): T | undefined;
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
