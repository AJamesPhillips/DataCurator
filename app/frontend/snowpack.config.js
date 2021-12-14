/** @type {import("snowpack").SnowpackUserConfig } */
module.exports = {
  mount: {
    public: {url: '/', static: true},
    src: {url: '/dist'},
  },
  plugins: [
    '@snowpack/plugin-dotenv',
	['@snowpack/plugin-sass', { style: 'compressed'}],
    '@snowpack/plugin-typescript',
    // Disabled this for now
    // Firstly it was only intermittently working properly, perhaps due to introducing material-ui
    // Secondly as of 2021-11-30, I noticed when trying to navigate to the "Views" view it would
    // throw an exception of `_s is not defined` inside the `factory_get_kv_details` function.
    // Where _s was coming from calling `$RefreshSig$` and
    // `$RefreshSig$` was being declared in ConnectionEng.js as the default `() => {}`
    // '@prefresh/snowpack',
    ["@snowpack/plugin-webpack"],
  ],
  packageOptions: {
    installTypes: true,
    knownEntrypoints: [
      /* ... */
    ],
  },
  devOptions: {
    /* ... */
  },
  buildOptions: {
    clean: false,
    out: "../../../data-curator-build",
    metaUrlPath: "snowpack",
  },
  routes: [
    {
      match: "routes",
      src: "/production_landing_page/?",
      dest: "/index_landing_page.html",
    },
    {
      match: "routes",
      src: ".*",
      dest: "/index_application.html",
    },
  ],
  alias: {
    "react": "preact/compat",
    "react-dom": "preact/compat"
  },
};
