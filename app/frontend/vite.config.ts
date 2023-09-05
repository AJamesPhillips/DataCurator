import { defineConfig } from "vite"
import preact from "@preact/preset-vite"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [preact({
    babel: {
      plugins: [
        // Adding this seems to silence a material-ui error about:
        // `Following component has two or more children with the same key attribute: "1633093980000"`
        // ["@babel/plugin-transform-react-jsx-source"]
      ]
    }
  })],
})
