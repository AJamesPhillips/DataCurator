# New Project

> ✨ Bootstrapped with Create Snowpack App (CSA).

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

### npm run build

Builds the app for production to the `build/` folder.
It correctly bundles Preact in production mode and optimizes the build for the best performance.
