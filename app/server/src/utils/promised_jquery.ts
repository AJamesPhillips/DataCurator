const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
import $Jquery = require("jquery");
type JQueryStatic = typeof $Jquery;

export function promise$ (): Promise<JQueryStatic> {

    return new Promise<JQueryStatic>((resolve, reject) => {

        // Based on http://stackoverflow.com/questions/8638820/jquery-ajax-in-node-js/8916217#8916217
        // $Jquery.support.cors = true;
        // $Jquery.ajaxSettings.xhr = function () {
        //     return new XMLHttpRequest();
        // };
        // resolve($Jquery);

        // tslint:disable-next-line
        require("jsdom").env("", function (err: any, window: any) {

            if (err) {

                console.error(err);
                reject(err);
                return;
            }

            // tslint:disable-next-line
            const $ = ($Jquery as any)(window);

            try {
                // Based on http://stackoverflow.com/questions/8638820/jquery-ajax-in-node-js/8916217#8916217
                $.support.cors = true;
                $.ajaxSettings.xhr = function () {
                    return new XMLHttpRequest();
                };
            }
            catch (e) {

                // Unfortunately console.trace() output is currently swallowed.

                throw new Error("\n\n#####################################\n\n" +
                    "If you see this error, it should be because jquery has attempted to be used during testing.\n" +
                    "For some reason this results in a failure where jquery is undefined / not required.\n" +
                    "In this case correct the test / app code to pass the server to the relevant function.\n" +
                    "This will allow them to inject a request into the server and avoid using an actual " +
                    "request / jquery." +
                    "\n\n#####################################\n\n");
            }

            resolve($);
        });
    });
}
