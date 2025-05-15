import { resolve } from "path"

import preact from "@preact/preset-vite"
import { defineConfig } from "vite"


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [preact()],
  resolve: {
    alias: {
      "datacurator-core": resolve(__dirname, "lib/datacurator-core/src"),
    }
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        // This option allows us to specify where the entry point is for the
        // application, so that when the app is built it is not configured to
        // look for the assets at
        // `https://datacurator.org/app/assets/index-4f26b23b.js` but rather at
        // `../assets/index-4f26b23b.js` i.e.
        // `https://datacurator.org/assets/index-4f26b23b.js` so that it will
        // reuse the assets from the landing page app.
        app: resolve(__dirname, "app/index.html"),
        // We don't configure for the sim app because in the build.sh script we
        // just copy the app/index.html file over to the sim directory
        // i.e. sim/index.html
        // sim: resolve(__dirname, "app/index.html"),
      },
      output: {
        manualChunks: {
          "common_libraries": [
            "preact",
            "preact/hooks",
            "react-redux",
            "redux",
            "simulation",
            "@supabase/supabase-js",
            "flexsearch",
            "fuzzysort",
          ],
          "common_style_libraries": [
            "@emotion/react",
            "@emotion/styled",
            "@mui/icons-material",
            "@mui/lab",
            "@mui/material",
            "@mui/styles",
          ]
        }
      }
    }
  }
})
