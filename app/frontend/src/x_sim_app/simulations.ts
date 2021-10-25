


export interface Simulation
{
    base_knowledge_view_id: string
    scenario_knowledge_view_ids: string[]
    attribute_to_wc_id_map: {[attribute: string]: string} // to wc_id
}


export async function get_simulations(): Promise<Simulation[]>
{
    return [
        {
            base_knowledge_view_id: "01ee3824-9445-4059-8714-912a011962bf",
            scenario_knowledge_view_ids: [
                "fa166715-c167-4efc-bc25-12fad9f531f1", // initial situation
                "2b56dbff-d82a-4fab-9082-68237b5cf6b3", // 3x storage
                "219fdd22-4175-4aad-bb06-3fca7ad4d206", // Perfect information sharing
            ],
            attribute_to_wc_id_map: {
                "retailer_initial_stock": "a349eb23-6b0c-4ad5-8908-655ce465a898",
                "retailer_storage": "99842a46-a7a2-443d-b8f6-9821d350ab5e",
            }
        }
    ]
}
