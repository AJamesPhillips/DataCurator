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
    '@prefresh/snowpack',
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
    clean: true,
    out: "../../build",
  },
  routes: [
    {
      match: "routes",
      src: ".*",
      dest: "/index.html",
    },
  ],
  alias: {
    "react": "preact/compat",
    "react-dom": "preact/compat"
  },
};
