


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
