import fs, { read } from "fs"
import path from "path"

export interface IREADMESource {
    name: string
    f_name: string
}

export type TREADMESources = IREADMESource[]

export const updateReadme = (sources: TREADMESources) => {
    const readme_temp_p = path.join(path.resolve(), "README.temp.md")
    const readme_p = path.join(path.resolve(), "README.md")
    
    if (fs.existsSync(readme_p)) {
        fs.unlinkSync(readme_p)
    }

    const readme = fs.readFileSync(readme_temp_p, "utf8").toString()

    const after = readme.replace(
        "<!-- channels_here -->",
        `${sources
            .map((s) => `| ${s.name} | <https://m3u.ibert.me/${s.f_name}.m3u> |`)
            .join("\n")}`
    )

    fs.writeFileSync(readme_p, after)
}
