# DataCurator frontend

## Available Scripts

### npm start

Runs the app in the development mode.
Open http://localhost:5173 to view it in the browser.

The page will reload if you make edits.
You will also see any lint errors in the console.

Note: occasionally, and invariabily with MUI packages, the dependencies are not loaded correctly.  This seems to be solved with `npm start --force` that [uses `vite --force` to clear the vite cache](https://stackoverflow.com/a/74916125/539490).

### ~~npm test~~

~~Launches the test runner in the interactive watch mode.~~
~~See the section about running tests for more information.~~
Note: this does not currently work.  Instead:

1. [open the browser app](http://localhost:5173/app)
2. open the console
3. call the function `run_tests()`

### Build and deploy

Ensure you are in `app/frontend` then run `npm run build` which builds the app for production to the `app/frontend/dist/` folder.

rm -rf ../../../data-curator-build/app/* ../../../data-curator-build/assets/*
cp -r dist/* ../../../data-curator-build/


# Dev

## Visual Studio Code

Install the following extensions:
- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)

## Performance

MUI has had some performance issues.  See [this issue](https://github.com/AJamesPhillips/DataCurator/issues/214).

The general strategy is to move as much logic as possible into the derived state
reducer(s) and make them properly memoized.  Secondly, for other actions of the
components, then use functions which access the state directly, rather than
passing the state as props: aiming to only pass the state to the components
which they need to render / allow the user to perform actions.

# History

Bootstrapped with Create Snowpack App (CSA).
