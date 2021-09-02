


export function throttle <A extends any[]> (func: (...args: A) => void, delay: number)
{
    let timeout: NodeJS.Timeout | undefined = undefined


    const cancel = () =>
    {
        if (timeout) clearTimeout(timeout)
    }


    let pending_args: A | undefined = undefined
    const throttled = (...args: A) =>
    {
        cancel()
        pending_args = args

        timeout = setTimeout(() =>
        {
            func(...args)
            pending_args = undefined
        }, delay)
    }


    const flush = () =>
    {
        cancel()

        if (pending_args)
        {
            func(...pending_args)
            pending_args = undefined
        }
    }


    return { throttled, cancel, flush }
}



export function min_throttle <A extends any[], B extends any> (func: (...args: A) => B | undefined, delay: number)
{
    let timeout: NodeJS.Timeout | undefined = undefined


    const cancel = () =>
    {
        if (timeout)
        {
            clearTimeout(timeout)
            timeout = undefined
        }
    }


    let pending_args: { args: A | undefined } = { args: undefined }
    let next_call_at_ms: number | undefined = undefined
    const throttled = (...args: A) =>
    {

        pending_args.args = args
        if (!timeout)
        {
            timeout = setTimeout(() =>
            {
                func(...pending_args.args!)
                pending_args.args = undefined
                timeout = undefined
            }, delay)

            next_call_at_ms = performance.now() + delay
        }

        return next_call_at_ms!
    }


    let will_flush: Promise<B | undefined> | undefined = undefined
    const flush = () =>
    {
        if (!will_flush)
        {
            will_flush = new Promise(resolve =>
            {

                setTimeout(() =>
                {
                    cancel()

                    if (pending_args.args)
                    {
                        const args = pending_args.args
                        pending_args.args = undefined
                        resolve(func(...args))
                    }

                    resolve(undefined)
                }, 0)

            })
        }

        return will_flush
    }


    return { throttled, cancel, flush }
}
