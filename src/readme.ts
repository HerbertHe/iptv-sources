import fs from "fs"
import path from "path"

export interface IREADMESource {
    name: string
    f_name: string
}

export type TREADMESources = IREADMESource[]

export const updateReadme = (sources: TREADMESources) => {
    const readme_temp_p = path.join(path.resolve(), "README.temp.md")

    const readme = fs.readFileSync(readme_temp_p, "utf8").toString()

    const after = readme.replace(
        "<!-- channels_here -->",
        `${sources
            .map(
                (s) => `| ${s.name} | <https://m3u.ibert.me/${s.f_name}.m3u> |`
            )
            .join("\n")}`
    )

    fs.writeFileSync(path.join(path.resolve(), "m3u", "README.md"), after)
}
