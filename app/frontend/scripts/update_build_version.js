const fs = require("fs")
const path = require("path")

console.log("Current directory:", process.cwd())


function get_AboutSidePanel_file_path()
{
    console.log("Getting AboutSidePanel.tsx file path...")

    const file_path = path.join(__dirname, "../src/about/AboutSidePanel.tsx")

    if (!fs.existsSync(file_path))
    {
      console.error(`File not found: ${file_path}`)
      process.exit(1)
    }

    return file_path
}


function get_AboutSidePanel_file_contents()
{
    console.log("Reading AboutSidePanel.tsx file contents...")

    const file_path = get_AboutSidePanel_file_path()
    const file_content = fs.readFileSync(file_path, "utf8")

    return file_content
}


function parse_file_contents(file_contents)
{
    console.log("Parsing file contents...")

    const BUILD_VERSION_MATCH = /(?<pre>.*const BUILD_VERSION = ")(?<version>[^"]+)(?<post>".*)$/gsmi
    const matches = file_contents.matchAll(BUILD_VERSION_MATCH)
    const groups = Array.from(matches, m => m.groups)[0]
    if (!groups)
    {
        console.error(`Build version line matching "${BUILD_VERSION_MATCH}" not found in the file.`)
        process.exit(1)
    }

    return groups
}


function calc_build_version(groups)
{
    console.log("Calculating new build version...")

    let new_build_version = new Date().toISOString().split("T")[0]
    const expected_parts = new_build_version.split("-")

    const version = groups.version
    console.log(`    Current build version: ${version}`)
    const parts = version.split("-")
    if (parts.length >= 3)
    {
        if (parts[0] === expected_parts[0] && parts[1] === expected_parts[1] && parts[2] === expected_parts[2])
        {
            const sub_version = parts[3] || "a"
            console.log(`    Same date "${new_build_version}", incrementing sub-version "${sub_version}"...`)

            const char_code = sub_version.charCodeAt(0)
            if (char_code >= 122) // 'z'
            {
                console.error("Sub-version has reached 'z', cannot increment further.")
                process.exit(1)
            }
            const new_char_code = char_code + 1
            new_build_version += `-${String.fromCharCode(new_char_code)}`
        }
    }

    console.log(`    New build version: ${new_build_version}`)

    return new_build_version
}


function update_file_contents(groups, new_build_version)
{
    console.log("Updating file contents...")

    const file_path = get_AboutSidePanel_file_path()

    // Replace the build version in the file content
    const new_file_content = groups.pre + new_build_version + groups.post

    // Write the updated content back to the file
    fs.writeFileSync(file_path, new_file_content, "utf8")
    console.log(`Updated build version to: ${new_build_version}`)
}


function main()
{
    const file_contents = get_AboutSidePanel_file_contents()
    const groups = parse_file_contents(file_contents)
    const new_build_version = calc_build_version(groups)
    update_file_contents(groups, new_build_version)
}


main()
