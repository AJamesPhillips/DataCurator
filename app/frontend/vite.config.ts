
import preact from "@preact/preset-vite"
import { defineConfig } from "vite"


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [preact()],
  build: {
    rollupOptions: {
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
