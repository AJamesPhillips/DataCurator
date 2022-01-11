


export function random_int (max_length: number)
{
    return parseInt(`${Math.random()}`.slice(2, 2 + max_length), 10)
}
