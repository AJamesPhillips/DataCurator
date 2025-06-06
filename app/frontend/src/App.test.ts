/* eslint-disable @typescript-eslint/await-thenable */
// Explored https://github.com/kvendrik/jest-lite to run the tests but this
// doesn't look like it is being maintained any more.

import { run_all_tests as run_all_core_tests } from "datacurator-core/tests"

import { tests_stats } from "datacurator-core/utils/test"
import { test_apply_units_from_component } from "./calculations/apply_units_from_component.test"
import { test_convert_percentages } from "./calculations/convert_percentages.test"
import { test_currency_symbol_functions } from "./calculations/hide_currency_symbols.test"
import { test_normalise_calculation_ids } from "./calculations/normalise_calculation_ids.test"
import { test_normalise_calculation_numbers } from "./calculations/normalise_calculation_numbers.test"
import { test_error_is_units_error, test_perform_calculations } from "./calculations/perform_calculations.test"
import { test_extract_units, test_suggest_missing_units } from "./calculations/suggest_missing_units.test"
import { test_get_angle } from "./canvas/connections/angles"
import { test_derive_connection_coords } from "./canvas/connections/derive_coords.test"
import { test_calculate_new_zoom_xy } from "./canvas/zoom_utils"
import { test_handle_on_blur } from "./form/EditableCustomDateTime"
import { test_calc_ids_to_move_and_conflicts_functions } from "./knowledge_view/change_base/calc_ids_to_move_and_conflicts"
import { test_number_to_significant_figures } from "./shared/format_number_to_significant_figures.test"
import { test_number_to_string } from "./shared/format_number_to_string.test"
import { test_graph_related_functions } from "./shared/utils/graph.test"
import { test_stable_stringify } from "./shared/utils/stable_stringify.test"
import { test_async_test, test_sync_test } from "./shared/utils/test.test"
import { test_get_tense_of_uncertain_datetime } from "./shared/utils_datetime/get_tense_of_uncertain_datetime"
import {
    test_partition_sorted_items_by_datetimes,
    test_sort_by_uncertain_event_datetimes,
} from "./shared/utils_datetime/partition_by_uncertain_datetime"
import { test_partition_items_by_created_at_datetime } from "./shared/utils_datetime/utils_datetime"
import { test_calc_new_counterfactual_state } from "./sharedf/prediction_badge/calc_new_counterfactual_state"
import { test_add_newlines_to_markdown } from "./sharedf/rich_text/add_newlines_to_markdown"
import { test_get_rich_text } from "./sharedf/rich_text/get_rich_text.test"
import { test_remove_rich_text } from "./sharedf/rich_text/remove_rich_text.test"
import {
    test_replace_normal_ids,
} from "./sharedf/rich_text/replace_normal_ids.test"
import { test_derived_composed_wcomponents_by_id_reducer } from "./state/derived/derived_composed_wcomponents_by_id_reducer.test"
import { test_get_composed_wcomponents_by_id } from "./state/derived/get_composed_wcomponents_by_id.test"
import { test_calc_if_wcomponent_should_exclude_because_label_or_type } from "./state/derived/knowledge_views/calc_if_wcomponent_should_exclude_because_label_or_type.test"
import { test_get_composed_wc_id_maps_object } from "./state/derived/knowledge_views/get_composed_wc_id_maps_object.test"
import { test_knowledge_views_derived_reducer } from "./state/derived/knowledge_views/knowledge_views_derived_reducer.test"
import { test_merge_routing_state } from "./state/routing/merge_routing_state"
import { test_routing_state_to_string } from "./state/routing/routing"
import { test_specialised_objects_accessors } from "./state/specialised_objects/accessors.test"
import { test_tidy_wcomponent } from "./state/specialised_objects/wcomponents/tidy_wcomponent.test"
import { test_merge_knowledge_views } from "./state/sync/merge/merge_knowledge_views"
import { test_merge_wcomponent } from "./state/sync/merge/merge_wcomponents"
import { test_supabase_get_items } from "./state/sync/supabase/get_items.test"
import { test_supabase_item_to_app } from "./state/sync/supabase/item_convertion.test"
import { test_wcomponent_supabase_to_app } from "./state/sync/supabase/wcomponent.test"
import { test_refresh_bases_for_current_user } from "./state/user_info/refresh_bases_for_current_user.test"
import { test_array_functions } from "./utils/array"
import { test_binary_search_functions } from "./utils/binary_search"
import { test_csv_to_array } from "./utils/csv_parser"
import { test_cloneable_generator_factory } from "./utils/generators"
import { test_list_function } from "./utils/list.test"
import { test_prepare_new_VAP_set } from "./wcomponent/CRUD_helpers/prepare_new_VAP_set"
import { test_update_VAPSets_with_possibilities } from "./wcomponent/CRUD_helpers/update_VAPSets_with_possibilities"
import { test_get_wcomponent_VAPs_represent } from "./wcomponent/get_wcomponent_VAPs_represent.test"
import { test_parse_value } from "./wcomponent/value/parse_value.test"
import { test_default_possible_values } from "./wcomponent/value_possibilities/default_possible_values"
import { test_get_possibilities_from_VAP_sets } from "./wcomponent/value_possibilities/get_possibilities_from_VAP_sets"
import { test_calc_connection_wcomponent_should_display } from "./wcomponent_canvas/calc_should_display.test"
import { test_get_wcomponent_state_UI_value } from "./wcomponent_derived/get_wcomponent_state_UI_value.test"
import { test_get_wcomponent_state_value_and_probabilities } from "./wcomponent_derived/get_wcomponent_state_value_and_probabilities.test"
import { test_partition_and_prune_items_by_datetimes_and_versions } from "./wcomponent_derived/value_and_prediction/partition_and_prune_items_by_datetimes_and_versions"
import { test_EditableCalculationRow } from "./wcomponent_form/calculations/EditableCalculationRow.test"
import { test_get_default_formatting_function } from "./wcomponent_form/calculations/get_default_formatting.test"
import { test_get_valid_calculation_name_id } from "./wcomponent_form/calculations/get_valid_calculation_name_id.test"
import { test_make_calculation_safe_for_rich_text } from "./wcomponent_form/calculations/make_calculation_safe_for_rich_text.test"
import { test_get_wcomponent_status_in_knowledge_view } from "./wcomponent_form/wcomponent_knowledge_view_form/get_wcomponent_status_in_knowledge_view.test"



async function run_all_tests ()
{
    tests_stats.reset()

    ;(await run_all_core_tests)()

    ;(await test_sync_test)()
    ;await ((await test_async_test)())

    ;(await test_apply_units_from_component)()
    ;(await test_convert_percentages)()
    ;(await test_currency_symbol_functions)()
    ;(await test_normalise_calculation_ids)()
    ;(await test_normalise_calculation_numbers)()
    ;(await test_perform_calculations)()
    ;(await test_error_is_units_error)()
    ;(await test_get_angle)()
    ;(await test_derive_connection_coords)()
    ;(await test_calculate_new_zoom_xy)()
    ;(await test_handle_on_blur)()
    ;(await test_calc_ids_to_move_and_conflicts_functions)()
    ;(await test_number_to_significant_figures)()
    ;(await test_number_to_string)()
    ;(await test_graph_related_functions)()
    ;(await test_stable_stringify)()
    ;(await test_get_tense_of_uncertain_datetime)()
    ;(await test_partition_sorted_items_by_datetimes)()
    ;(await test_sort_by_uncertain_event_datetimes)()
    ;(await test_partition_items_by_created_at_datetime)()
    ;(await test_calc_new_counterfactual_state)()
    ;(await test_add_newlines_to_markdown)()
    ;(await test_get_rich_text)()
    ;(await test_remove_rich_text)()
    ;(await test_replace_normal_ids)()
    ;(await test_derived_composed_wcomponents_by_id_reducer)()
    ;(await test_get_composed_wcomponents_by_id)()
    ;(await test_calc_if_wcomponent_should_exclude_because_label_or_type)()
    ;(await test_get_composed_wc_id_maps_object)()
    ;(await test_knowledge_views_derived_reducer)()
    ;(await test_merge_routing_state)()
    ;(await test_routing_state_to_string)()
    ;(await test_specialised_objects_accessors)()
    ;(await test_tidy_wcomponent)()
    ;(await test_merge_knowledge_views)()
    ;(await test_merge_wcomponent)()
    ;(await test_supabase_get_items)()
    ;(await test_supabase_item_to_app)()
    ;(await test_wcomponent_supabase_to_app)()
    ;(await test_refresh_bases_for_current_user)()
    ;(await test_array_functions)()
    ;(await test_binary_search_functions)()
    ;(await test_csv_to_array)()
    ;(await test_cloneable_generator_factory)()
    ;(await test_list_function)()
    ;(await test_prepare_new_VAP_set)()
    ;(await test_update_VAPSets_with_possibilities)()
    ;(await test_get_wcomponent_VAPs_represent)()
    ;(await test_parse_value)()
    ;(await test_default_possible_values)()
    ;(await test_get_possibilities_from_VAP_sets)()
    ;(await test_calc_connection_wcomponent_should_display)()
    ;(await test_get_wcomponent_state_UI_value)()
    ;(await test_get_wcomponent_state_value_and_probabilities)()
    ;(await test_partition_and_prune_items_by_datetimes_and_versions)()
    ;(await test_EditableCalculationRow)()
    ;(await test_get_default_formatting_function)()
    ;(await test_get_valid_calculation_name_id)()
    ;(await test_make_calculation_safe_for_rich_text)()
    ;(await test_get_wcomponent_status_in_knowledge_view)()
    ;(await test_extract_units())
    ;(await test_suggest_missing_units())

    tests_stats.print()
}


export function setup_tests_for_browser ()
{
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    (window as any).run_tests = run_all_tests
}
