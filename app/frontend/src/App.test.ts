import { run_add_newlines_to_markdown_tests } from "./sharedf/rich_text/add_newlines_to_markdown"
import { run_get_plain_calculation_object_from_str_tests } from "./calculations/rich_text/get_plain_calculation_object_from_str"
import { run_parse_calculation_equations_tests } from "./calculations/rich_text/parse_calculation_equations.test"
import { run_replace_calculations_with_results_tests } from "./calculations/rich_text/replace_calculations_with_results.test"
import { run_get_rich_text_tests } from "./sharedf/rich_text/get_rich_text.test"
import { run_replace_normal_ids_tests, test_get_ids_from_text } from "./sharedf/rich_text/replace_normal_ids.test"
import { run_perform_calculations_test } from "./calculations/perform_calculations.test"
import { run_normalise_calculation_ids_tests } from "./calculations/normalise_calculation_ids.test"
import { run_normalise_calculation_numbers_tests } from "./calculations/normalise_calculation_numbers.test"
import { run_number_to_string_test } from "./shared/format_number_to_string.test"
import { run_convert_percentages_tests } from "./calculations/convert_percentages.test"
import { run_number_to_significant_figures_test } from "./shared/format_number_to_significant_figures.test"
import { test_get_calculation_strs_from_text } from "./calculations/rich_text/get_calculation_strs_from_text"
import { test_calculate_new_zoom_xy } from "./canvas/zoom_utils"
import { test_get_angle } from "./canvas/connections/angles"
import { test_correct_datetime_for_local_time_zone } from "./form/datetime_utils.test"
import { test_handle_on_blur } from "./form/EditableCustomDateTime"
import { test_calc_ids_to_move_and_conflicts_functions } from "./knowledge_view/change_base/calc_ids_to_move_and_conflicts"
import { test_cloneable_generator_factory } from "./utils/generators"
import { test_get_actions_parent_ids } from "./priorities/utils/get_actions_parent_ids"
import { test_graph_related_functions } from "./shared/utils/graph"
import { test_get_tense_of_uncertain_datetime } from "./shared/utils_datetime/get_tense_of_uncertain_datetime"
import { test_partition_sorted_items_by_datetimes, test_sort_by_uncertain_event_datetimes } from "./shared/utils_datetime/partition_by_uncertain_datetime"
import { test_partition_items_by_created_at_datetime } from "./shared/utils_datetime/utils_datetime"
import { test_calc_new_counterfactual_state } from "./sharedf/prediction_badge/calc_new_counterfactual_state"
import { test_calc_if_wcomponent_should_exclude_because_label_or_type } from "./state/derived/knowledge_views/calc_if_wcomponent_should_exclude_because_label_or_type"
import { run_get_composed_wc_id_maps_object_tests } from "./state/derived/knowledge_views/get_composed_wc_id_maps_object.test"
import { test_merge_routing_state } from "./state/routing/merge_routing_state"
import { test_routing_state_to_string } from "./state/routing/routing"
import { test_merge_knowledge_views } from "./state/sync/merge/merge_knowledge_views"
import { test_merge_wcomponent } from "./state/sync/merge/merge_wcomponents"
import { test_refresh_bases_for_current_user } from "./state/user_info/refresh_bases_for_current_user.test"
import { test_array_functions } from "./utils/array"
import { test_binary_search_functions } from "./utils/binary_search"
import { test_csv_to_array } from "./utils/csv_parser"
import { test_prepare_new_VAP_set } from "./wcomponent/CRUD_helpers/prepare_new_VAP_set"
import { test_update_VAPSets_with_possibilities } from "./wcomponent/CRUD_helpers/update_VAPSets_with_possibilities"
import { test_default_possible_values } from "./wcomponent/value_possibilities/default_possible_values"
import { test_get_possibilities_from_VAP_sets } from "./wcomponent/value_possibilities/get_possibilities_from_VAP_sets"
import { test_get_wcomponent_state_value_and_probabilities } from "./wcomponent_derived/get_wcomponent_state_value_and_probabilities.test"
import { run_currency_symbol_functions_tests } from "./calculations/hide_currency_symbols.test"
import { test_get_wcomponent_state_UI_value } from "./wcomponent_derived/get_wcomponent_state_UI_value.test"
import { test_tidy_wcomponent } from "./state/specialised_objects/wcomponents/tidy_wcomponent.test"
import { test_get_composed_wcomponents_by_id } from "./state/derived/composed_wcomponents_by_id.test"
import { run_remove_rich_text_tests } from "./sharedf/rich_text/remove_rich_text.test"
import { run_apply_units_from_component_tests } from "./calculations/apply_units_from_component.test"
import { run_get_valid_calculation_name_id_tests } from "./wcomponent_form/calculations/get_valid_calculation_name_id.test"
import { run_make_calculation_safe_for_rich_text_tests } from "./wcomponent_form/calculations/make_calculation_safe_for_rich_text.test"
import { run_get_wcomponent_VAPs_represent_tests } from "./wcomponent/get_wcomponent_VAPs_represent.test"
import { run_specialised_objects_accessors_tests } from "./state/specialised_objects/accessors.test"
import { run_EditableCalculationRow_tests } from "./wcomponent_form/calculations/EditableCalculationRow.test"
import { run_list_function_tests } from "./utils/list.test"
import { run_get_default_formatting_function_tests } from "./wcomponent_form/calculations/get_default_formatting.test"
import { run_get_wcomponent_status_in_knowledge_view_tests } from "./wcomponent_form/wcomponent_knowledge_view_form/get_wcomponent_status_in_knowledge_view.test"
import { run_parse_value_tests } from "./wcomponent/value/parse_value.test"
import { test_partition_and_prune_items_by_datetimes_and_versions } from "./wcomponent_derived/value_and_prediction/partition_and_prune_items_by_datetimes_and_versions"



function run_all_tests ()
{
    run_get_rich_text_tests()
    run_remove_rich_text_tests()
    run_replace_calculations_with_results_tests()
    run_replace_normal_ids_tests()
    test_get_ids_from_text()
    run_get_plain_calculation_object_from_str_tests()
    run_add_newlines_to_markdown_tests()
    run_parse_calculation_equations_tests()
    run_normalise_calculation_numbers_tests()
    run_normalise_calculation_ids_tests()
    run_apply_units_from_component_tests()
    run_perform_calculations_test()
    run_number_to_significant_figures_test()
    run_number_to_string_test()
    run_convert_percentages_tests()
    run_currency_symbol_functions_tests()
    run_get_valid_calculation_name_id_tests()
    run_make_calculation_safe_for_rich_text_tests()
    run_get_wcomponent_VAPs_represent_tests()
    run_specialised_objects_accessors_tests()
    run_EditableCalculationRow_tests()
    run_list_function_tests()
    run_get_default_formatting_function_tests()
    run_get_composed_wc_id_maps_object_tests()
    run_get_wcomponent_status_in_knowledge_view_tests()
    run_parse_value_tests()

    test_get_calculation_strs_from_text()
    test_calculate_new_zoom_xy()
    test_get_angle()
    test_correct_datetime_for_local_time_zone()
    test_handle_on_blur()
    test_calc_ids_to_move_and_conflicts_functions()
    test_cloneable_generator_factory()
    test_get_actions_parent_ids()
    test_graph_related_functions()
    test_get_tense_of_uncertain_datetime()
    test_partition_sorted_items_by_datetimes()
    test_sort_by_uncertain_event_datetimes()
    test_partition_items_by_created_at_datetime()
    test_partition_and_prune_items_by_datetimes_and_versions()
    test_calc_new_counterfactual_state()
    test_calc_if_wcomponent_should_exclude_because_label_or_type()
    test_merge_routing_state()
    test_routing_state_to_string()
    test_tidy_wcomponent()
    test_merge_knowledge_views()
    test_merge_wcomponent()
    test_refresh_bases_for_current_user()
    test_array_functions()
    test_binary_search_functions()
    test_csv_to_array()
    test_prepare_new_VAP_set()
    test_update_VAPSets_with_possibilities()
    test_default_possible_values()
    test_get_possibilities_from_VAP_sets()
    test_get_wcomponent_state_value_and_probabilities()
    test_get_wcomponent_state_UI_value()
    test_get_composed_wcomponents_by_id()
}


export function setup_tests_for_browser ()
{
    (window as any).run_tests = run_all_tests
}
