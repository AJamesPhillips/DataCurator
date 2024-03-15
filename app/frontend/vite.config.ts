import { resolve } from "path"

import { defineConfig } from "vite"
import preact from "@preact/preset-vite"


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [preact()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        app: resolve(__dirname, "app/index.html"),
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
