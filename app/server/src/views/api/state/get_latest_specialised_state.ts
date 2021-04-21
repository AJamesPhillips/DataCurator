import { readFileSync, readdirSync } from "fs"
import { SpecialisedObjectsFromToServer } from "../../../shared/models/SpecialisedObjects"



export function get_latest_specialised_state (): SpecialisedObjectsFromToServer
{
    const wcomponents = get_wcomponents()
    const perceptions = get_perceptions()
    const knowledge_views = get_knowledge_views()

    return {
        wcomponents,
        perceptions,
        knowledge_views,
    }
}



const wcomponents_directory = `./state_backup/wcomponents/`
function get_wcomponents ()
{
    return get_files(wcomponents_directory)
}



const perceptions_directory = `./state_backup/perceptions/`
function get_perceptions ()
{
    return get_files(perceptions_directory)
}



const knowledge_views_directory = `./state_backup/knowledge_views/`
function get_knowledge_views ()
{
    return get_files(knowledge_views_directory)
}



function get_files (directory: string)
{
    const file_names = readdirSync(directory)

    return file_names.filter(file_name => file_name.endsWith(".json"))
    .map(file_name =>
        {
            const file_path = directory + file_name
            const file_contents = readFileSync(file_path).toString()

            return JSON.parse(file_contents)
        })
}
