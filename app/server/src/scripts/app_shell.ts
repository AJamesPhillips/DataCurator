console.log("Script loads useful models for manual interaction in shell.");
console.log("REMEMBER to continue to first debugger statement.");
// Otherwise you'll end up here: https://stackoverflow.com/questions/44602325
// Looper inspired from here:
// https://medium.com/@ap1/anyone-successfully-used-this-with-libraries-that-use-promises-6b56029e08e3

// force importing
const Models = require("../models");
const Usr = Models.UserDb;


function looper() {
    // tslint:disable
    var Tmp = {Usr};

    debugger;
    setTimeout(looper, 100);
}

looper();
