import * as _ from "lodash";

export function get_ajax_stub(options: {
        trigger_callback: false | "done" | "fail",
        // tslint:disable-next-line
        args?: any[],
    }) {

    const {trigger_callback, args} = options;

    let ajax_stub = {
        then: function (success_callback: Function, failure_callback: Function) {

            if (trigger_callback === "done") {

                _.defer(() => {
                    success_callback(...args!);
                    // options.____test_done();
                });
            }

            if (trigger_callback === "fail") {

                _.defer(() => {
                    failure_callback(...args!);
                });
            }
            // return ajax_stub;
        },
    };
    return ajax_stub;
}
