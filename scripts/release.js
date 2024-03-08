import readline from "readline/promises"
import fs from "fs"
import path from "path"
import { execSync } from "child_process"

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
})

const updatePackageJson = (version) => {
    const fp = path.resolve("package.json")
    const content = fs.readFileSync(fp, "utf-8")
    fs.writeFileSync(
        fp,
        content.replace(/"version": ".*"/, `"version": "${version}"`),
        "utf-8"
    )
}

const commitVersion = (version) => {
    execSync("git add .")
    execSync(`git commit -m :bookmark:v${version}`)
}

rl.question("input the release version? ex: 1.0.0\n")
    .then((version) => {
        if (!version) {
            console.error("[ERROR] Invalid version")
            return
        }
        const ver = version.trim()

        updatePackageJson(ver)
        commitVersion(ver)
    })
    .finally(() => {
        rl.close()
    })
