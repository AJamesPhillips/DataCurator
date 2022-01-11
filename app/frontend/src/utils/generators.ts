import { test } from "../shared/utils/test"



// Copied from https://stackoverflow.com/a/70668536/539490
interface CloneableGenerator <A, B, C> extends Generator<A, B, C>
{
    clone: () => CloneableGenerator <A, B, C>
}

export function cloneable_generator_factory <R, A, B, C> (args: R, generator_factory: (args: R) => Generator<A, B, C>, next_calls: ([] | [C])[] = []): CloneableGenerator<A, B, C>
{
    let generator = generator_factory(args)

    const cloneable_generator: CloneableGenerator<A, B, C> = {
        next: (...args: [] | [C]) =>
        {
            next_calls.push(args)
            return generator.next(...args)
        },
        throw: e => generator.throw(e),
        return: e => generator.return(e),
        [Symbol.iterator]: () => cloneable_generator,
        clone: () =>
        {
            // todo, use structuredClone when supported
            const partial_deep_cloned_next_args: ([] | [C])[] = [...next_calls].map(args => [...args])
            return cloneable_generator_factory(args, generator_factory, partial_deep_cloned_next_args)
        },
    }

    // Call `generator` not `cloneable_generator`
    next_calls.forEach(args => generator.next(...args))

    return cloneable_generator
}



function run_tests ()
{
    function* jumpable_sequence (args: {start: number}): Generator<number, number, number | undefined> {
        let i = args.start
        while (true)
        {
            let jump = yield ++i
            if (jump !== undefined) i += jump
        }
    }

    let iter = cloneable_generator_factory({ start: 10 }, jumpable_sequence)

    test(iter.next().value, 11, "should increment")
    test(iter.next(3).value, 11 + 1 + 3, "should use jump")

    let saved = iter.clone()

    test(iter.next().value, 16, "should increment again")
    test(iter.next(10).value, 16 + 1 + 10, "should jump again")


    test(saved.next().value, 16, "should have been reset")
    test(saved.next().value, 17, "should not use previous jump")
    test(saved.next(-10).value, 17 + 1 - 10, "should jump on second branch")


    test(iter.next().value, 28, "should jump a third time on first branch")
}

// run_tests()
