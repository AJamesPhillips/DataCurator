


export function pub_sub_factory <map extends Object> (middleware: { [K in keyof map]?: (message: map[K]) => ({ continue: boolean, message: map[K] }) } = {})
{
    const all_subscribers: { [K in keyof map]?: ((message: map[K]) => void)[] } = {}


    function pub <K extends keyof map> (topic: K, message: map[K])
    {
        const maybe_middleware_function = middleware[topic]
        if (maybe_middleware_function)
        {
            const result = maybe_middleware_function(message)
            if (!result.continue) return
            message = result.message
        }

        const maybe_subscribers: ((message: map[K]) => void)[] | undefined = all_subscribers[topic]
        const subscribers = maybe_subscribers === undefined ? [] : maybe_subscribers

        subscribers.forEach(subscriber =>
        {
            setTimeout(() => subscriber(message), 0)
        })
    }


    function sub <K extends keyof map> (topic: K, subscriber: (message: map[K]) => void)
    {
        const maybe_subscribers: ((message: map[K]) => void)[] | undefined = all_subscribers[topic]
        const subscribers = maybe_subscribers === undefined ? [] : maybe_subscribers

        subscribers.push(subscriber)

        all_subscribers[topic] = subscribers

        return unsubscribe_factory(topic, subscriber)
    }


    function unsubscribe_factory <K extends keyof map> (topic: K, subscriber: (message: map[K]) => void)
    {
        return () =>
        {
            const maybe_subscribers: ((message: map[K]) => void)[] | undefined = all_subscribers[topic]
            const subscribers = maybe_subscribers === undefined ? [] : maybe_subscribers

            const new_subscribers = subscribers.filter(s => s !== subscriber)
            all_subscribers[topic] = new_subscribers
        }
    }


    return { pub, sub }
}
