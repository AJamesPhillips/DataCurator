


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
                consumers_initial_demand: "af4290c5-75c5-4716-88da-43c7d99b7f9f",
                consumers_demand_increase_delay_days: "73ac5288-da5d-49a9-b859-f0e58dca4de7",
                consumers_increased_demand: "994983bc-5a16-49f9-bba3-c7eca7e54847",

                retailer_initial_price: "a853ddc2-14ed-432f-9093-217bb4fbda3c",
                retailer_initial_balance: "dbe718aa-6591-4417-ac84-300105662b2c",
                retailer_initial_stock: "a349eb23-6b0c-4ad5-8908-655ce465a898",
                retailer_storage: "99842a46-a7a2-443d-b8f6-9821d350ab5e",

                wholesaler_initial_price: "4f0b8a29-8423-42b9-b124-edd3af00fd6b",

                distributor_initial_price: "ac7aad82-f16d-4e9c-9997-8d4381da6673",

                manufacturer_initial_price: "44bc6ef5-438f-4522-9972-b27a5908f5bc",
                manufacturing_delay_in_days: "54e9e4a5-35a5-4d49-81be-85cbe399e867",

                demand_signal_multiplier: "0e05530e-aef4-4e86-8feb-0a67073e9b51",
                days_between_stock_take: "10061767-0f73-486c-86da-411a05232edf",
                transport_time_in_days: "25aaa820-a4b6-4ba5-988e-9d74a05bea08",
            }
        }
    ]
}
