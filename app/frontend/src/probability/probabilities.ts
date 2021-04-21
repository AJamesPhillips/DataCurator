
interface ProbabilityOption
{
    text: string
    min: number
    max: number
    mean: number
    // TODO remove lambda, k, and reverse
    lambda: number
    k: number
    reverse: boolean
}
// Adapted from PHIA probability yardstick
// https://www.app.college.police.uk/app-content/intelligence-management/analysis/delivering-effective-analysis/
// https://assets.publishing.service.gov.uk/government/uploads/system/uploads/attachment_data/file/955239/NERVTAG_paper_on_variant_of_concern__VOC__B.1.1.7.pdf
// https://www.reddit.com/r/coolguides/comments/ethzeg/the_phia_probability_yardstick_used_by_the_uk/
// https://www.reddit.com/r/coolguides/comments/etcbqz/perceptions_of_probability/
export const probabilities: ProbabilityOption[] = [
    { min: 0,  max: 0,    lambda: 0.2, k: 0.4, reverse: false, text: "No chance" },
    { min: 0,  max: 5,    lambda: 0.2, k: 0.4, reverse: false, text: "Remote chance" },
    { min: 5,  max: 20,   lambda: 0.5, k: 2.8, reverse: false, text: "Highly unlikely" },
    { min: 20, max: 35,   lambda: 1.5, k: 1.9, reverse: false, text: "Unlikely" },
    { min: 35, max: 50,   lambda: 1.8, k: 3.3, reverse: false, text: "Realistic probability" },
    { min: 50, max: 75,   lambda: 1.8, k: 2.6, reverse: true,  text: "Likely or probable" },
    { min: 75, max: 95,   lambda: 1.1, k: 1.6, reverse: true,  text: "Highly likely" },
    { min: 95, max: 100,  lambda: 0.2, k: 0.4, reverse: true,  text: "Almost certain" },
    { min: 100, max: 100, lambda: 0.2, k: 0.4, reverse: true,  text: "Certain" },
]
.map(e => ({ ...e, mean: Math.round((e.max + e.min) / 2) }))
.map(o => Object.freeze(o))


export const probabilities_plus_anchors = probabilities
    .map(({ mean }) => mean)
    .concat([25, 50, 75])
    .sort((a, b) => a < b ? -1 : 1)


export function probability_is_in_range (args: { min: number, max: number, probability: number })
{
    const { min, max, probability } = args
    return min <= probability && (probability < max || (probability === 0 && max === 0) || (probability === 100 && min === 100))
}


export function get_probability_option (probability: number): ProbabilityOption | undefined
{
    return probabilities.find(({ min, max }) => probability_is_in_range({ min, max, probability }))
}
