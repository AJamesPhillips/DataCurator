const path = require("path")
console.log("Checking for version mismatches between root and core package.json files...")

const root = require(path.resolve(__dirname, "../package.json"))
const core = require(path.resolve(__dirname, "../lib/datacurator-core/package.json"))

function compareDeps(dep_type) {
  const root_deps = root[dep_type] || {}
  const core_deps = core[dep_type] || {}
  Object.keys(core_deps).forEach(dep => {
    if (root_deps[dep] && root_deps[dep] !== core_deps[dep]) {
      console.warn(
        `Version mismatch for "${dep}" in ${dep_type}: root has "${root_deps[dep]}", core has "${core_deps[dep]}"`
      )
    }
  })
}

["dependencies", "devDependencies"].forEach(compareDeps)
