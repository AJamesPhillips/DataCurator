import {distance_of_time_in_hms} from "../../../shared/utils/date_helpers";

describe("distance_of_time_in_hms", function () {

    const minutes = 60;
    const hours = 3600;
    const days = 3600 * 24;
    const months = (3600 * 24 * 365) / 12;
    const years = 3600 * 24 * 365;
    const tests: Array<[number, string]> = [
        [0, "0s"],
        [2, "2s"],
        [32, "30s"],
        [1 * minutes - 1, "1m"],
        [1 * minutes, "1m"],
        [1 * minutes + 3, "1m"],
        [1 * minutes + 5, "1m 10s"],
        [1 * hours - 1, "1h"],
        [2 * hours - 8 * minutes, "1h 45m"],
        [2 * hours - 1, "2h"],
        [2 * hours + 7 * minutes, "2h"],
        [2 * days + 7 * minutes, "2dy"],
        [2 * days + 7 * hours, "2dy 8h"],
        [20 * days + 10 * hours, "20dy"],
        [1 * months - 1, "1mth"],
        [1 * months, "1mth"],
        [2 * months - 1, "2mth"],
        [12 * months - 1, "1yr"],
        [12 * months, "1yr"],
        [1 * years, "1yr"],
        // Special
        [3600 * 24 * 30, "1mth"],
    ];

    tests.forEach((test) => {

        it(test[0].toString(), function () {

            expect(distance_of_time_in_hms(new Date(0), new Date(test[0] * 1000))).toEqual(test[1]);
        });
    });
});
