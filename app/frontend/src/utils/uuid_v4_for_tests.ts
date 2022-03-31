


export function uuid_v4_for_tests (id: number)
{
    if (!Number.isInteger(id)) throw new Error("uuid_v4_for_tests id must be an integer")
    if (id < 0 || id > 10) throw new Error("uuid_v4_for_tests id must be 0-9 inclusive")

    return `${id}0000000-0000-4000-a000-000000000000`
}
