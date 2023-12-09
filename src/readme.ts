import fs from "fs"
import path from "path"

export interface IREADMESource {
    name: string
    f_name: string
    count?: number | undefined
}

export type TREADMESources = IREADMESource[]

export const updateReadme = (
    sources: TREADMESources,
    counts: Array<number | undefined>
) => {
    const readme_temp_p = path.join(path.resolve(), "README.temp.md")
    const readme = fs.readFileSync(readme_temp_p, "utf8").toString()

    const after = readme.replace(
        "<!-- channels_here -->",
        `${sources
            .map(
                (s, idx) =>
                    `| ${s.name} | <https://m3u.ibert.me/${s.f_name}.m3u> | ${
                        counts[idx] === undefined ? "update failed" : counts[idx]
                    } |`
            )
            .join("\n")}`
    )

    if (!fs.existsSync(path.join(path.resolve(), "m3u"))) {
        fs.mkdirSync(path.join(path.resolve(), "m3u"))
    }

    fs.writeFileSync(path.join(path.resolve(), "m3u", "README.md"), after)
}
