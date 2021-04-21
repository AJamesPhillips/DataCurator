
export function factory_scaled_weibull (args: { lambda: number, k: number, scale: number })
{
    const { lambda, k, scale } = args
    return (x: number) => (k/lambda) * ((x/lambda)**(k-1)) * Math.exp(-((x/lambda)**k)) * scale
}
