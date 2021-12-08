import type { WComponentMultidimensionalState, WComponentMultidimensionalStateData } from "../wcomponent/interfaces/state"

type uuid = string


interface Space
{
    id: uuid
    // title_en can be deprecated later and replace with a localized type object called `title`
    title_en: string
    // description_en can be deprecated later and replace with a localized type object called `description`
    description_en: string
}



// interface DataItem // WComponentNodeStateV2?
// {
//     id: uuid
//     // title can be deprecated later and replace with a localized type object called `title`
//     title: string
//     // description_en can be deprecated later and replace with a localized type object called `description`
//     description_en: string
//     created_at: Date

//     time?: Date
//     time_start?: Date
//     time_end?: Date
//     space_id?: uuid // Foreign key -> Spaces.id

//     sources: string // can use description
//     platform_author_id: uuid // Foreign key -> Users.id
// }




const MA_covid_vaccinations_4th_march_2021: WComponentMultidimensionalState = {
    id: "123_ma_vac_4th",
    type: "multidimensional_state",
    base_id: -1,
    title: "MA vaccinations 4th March 2021",
    description: "MA vaccinations 4th March 2021\n\n## Sources \n https://www.mass.gov/info-details/massachusetts-covid-19-vaccination-data-and-updates",
    created_at: new Date(),
}
const MA_covid_vaccinations_4th_march_2021_version_1: WComponentMultidimensionalStateData = {
    id: "123_ma_vac_4th",
    data_type: "other",
    author_id: "abc",
    schema_version: 1,
    schema_description: "Initial version.  Percentage population is string to cope with values of * and >95%",
    schema: {
        // attributes: [
        //     { name: "population_by_group", title: "Population by age group", type: "number" },
        //     { name: "percent_1_vaccine_by_group", title: "% of age group with 1+ vaccinations", type: "string" },
        // ],
        dimensions: [
            { name: "town", title: "Town", type: "space" },
            { name: "age_groups", title: "Age groups", type: "string" },
        ]
    },
    dimension_data: {
        town: ["Chelsea", "Rivere"],
        age_groups: ["0-12", "13+"],
    },
    data: [],
}
const MA_covid_vaccinations_4th_march_2021_version_2: WComponentMultidimensionalStateData = {
    id: "123_ma_vac_4th",
    data_type: "number",
    author_id: "abc",
    schema_version: 2,
    // schema_description: "Replace percentage vaccinated with number of vaccinated",
    schema_description: "Replace percentage vaccinated with number of vaccinated.\n New schema here: <123_ma_vac>",
    schema: {
        // attributes: [
        //     { name: "population_by_group", title: "Population by age group", type: "number" },
        //     { name: "population_1_vaccine_by_group", title: "Individuals of age group with 1+ vaccinations", type: "number" },
        // ],
        dimensions: [
            { name: "town", title: "Town", type: "space" },
            { name: "age_groups", title: "Age groups", type: "string" },
        ]
    },
    dimension_data: {
        town: ["Chelsea", "Rivere"],
        age_groups: ["0-12", "13+"],
    },
    data: [],
}

const MA_covid_vaccinations: WComponentMultidimensionalState = {
    id: "123_ma_covid_vacs",
    type: "multidimensional_state",
    base_id: -1,
    title: "MA vaccinations by town, time and age group",
    description: "MA vaccinations from 4th March 2021 to present (2021-12-05)\n\n## Sources \n https://www.mass.gov/info-details/massachusetts-covid-19-vaccination-data-and-updates",
    created_at: new Date(),
}
const MA_covid_vaccinations_version_1: WComponentMultidimensionalStateData = {
    id: "123_ma_covid_vacs",
    data_type: "number",
    author_id: "abc",
    schema_version: 1,
    schema_description: "Initial schema",
    schema: {
        dimensions: [
            { name: "town", title: "Town", type: "space" },
            { name: "age_groups", title: "Age groups", type: "string" },
            { name: "date", title: "Date", type: "date" },
        ],
    },
    dimension_data: {
        town: ["Chelsea", "Rivere"],
        age_groups: ["0-12", "13+"],
    },
    data: [],
}
