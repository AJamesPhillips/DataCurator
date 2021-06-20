


export function throttle <A extends any[]> (func: (...args: A) => void, delay: number)
{
    let timeout: NodeJS.Timeout | undefined = undefined


    const cancel = () =>
    {
        if (timeout) clearTimeout(timeout)
    }


    const throttled = (...args: A) =>
    {
        cancel()

        timeout = setTimeout(() => func(...args), delay)
    }

    return { throttled, cancel }
}
