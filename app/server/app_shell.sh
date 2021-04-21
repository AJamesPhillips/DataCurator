#!/bin/bash

set -a
if [[ $1 = "t" || $1 = "test" ]]; then
    # Note, only the $NODE_ENV, $DB_USERNAME and $DB_DATABASE values are used.
    source .env.test
elif [[ $1 = "d" || $1 = "dev" ]]; then
    # Note, only the $NODE_ENV, $DB_USERNAME and $DB_DATABASE values are used.
    source .env.development
else
    echo Unsupported environment: \"$1\"
    exit 1
fi
set +a


# python -mwebbrowser about:inspect
echo "Open about:inspect in Chrome"


# https://medium.com/@paul_irish/debugging-node-js-nightlies-with-chrome-devtools-7c4a1b95ae27
echo "Click the 'Open dedicated DevTools for Node' link AND REMEMBER to press continue to go to first debugger statement"
# Otherwise you'll end up here: https://stackoverflow.com/questions/44602325
node --inspect compiled_all/scripts/app_shell.js
