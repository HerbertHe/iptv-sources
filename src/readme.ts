import fs from "fs"
import path from "path"

import { handle_m3u } from "./sources"

export interface IREADMESource {
    name: string
    f_name: string
    count?: number | undefined
}

export type TREADMESources = IREADMESource[]

export const updateChannelList = (
    name: string,
    f_name: string,
    m3u: string,
    rollback: boolean = false
) => {
    const list_temp_p = path.join(path.resolve(), "LIST.temp.md")
    const list = fs.readFileSync(list_temp_p, "utf8").toString()

    const m3uArray = handle_m3u(m3u)
    const channelRegExp = /\#EXTINF:-1([^,]*),(.*)/
    let i = 1
    let channels: Array<string>[] = []
    while (i < m3uArray.length) {
        const reg = channelRegExp.exec(m3uArray[i]) as RegExpExecArray
        channels.push([reg[2].replace(/\|/g, "").trim(), m3uArray[i + 1]])
        i += 2
    }

    const after = list
        .replace(
            "<!-- list_title_here -->",
            `# List for **${name}**${
                rollback ? "(Rollback)" : ""
            }\n\n> M3U: <https://m3u.ibert.me/${f_name}.m3u>, TXT: <https://m3u.ibert.me/txt/${f_name}.txt>`
        )
        .replace(
            "<!-- channels_here -->",
            `${channels
                .map(
                    (c, idx) =>
                        `| ${idx + 1} | ${c[0].replace(
                            "|",
                            ""
                        )} | [${c[0].replace("|", "")}](${c[1]}) |`
                )
                .join("\n")}\n\nUpdated at **${new Date()}**`
        )

    const list_p = path.join(path.resolve(), "m3u", "list")

    if (!fs.existsSync(list_p)) {
        fs.mkdirSync(list_p)
    }

    fs.writeFileSync(path.join(list_p, `${f_name}.list.md`), after)
}

export const updateReadme = (
    sources: TREADMESources,
    res: Array<[string, number | undefined]>
) => {
    const readme_temp_p = path.join(path.resolve(), "README.temp.md")
    const readme = fs.readFileSync(readme_temp_p, "utf8").toString()

    const after = readme.replace(
        "<!-- channels_here -->",
        `${sources
            .map(
                (s, idx) =>
                    `| ${s.name} | <https://m3u.ibert.me/${
                        s.f_name
                    }.m3u> <br> <https://m3u.ibert.me/txt/${
                        s.f_name
                    }.txt> | [List for ${s.name}](https://m3u.ibert.me/list/${
                        s.f_name
                    }.list) | ${
                        res[idx][1] === undefined
                            ? "update failed"
                            : res[idx][1]
                    } | ${res[idx][0] === "rollback" ? "✅" : "-"} |`
            )
            .join("\n")}\n\nUpdated at **${new Date()}**`
    )

    if (!fs.existsSync(path.join(path.resolve(), "m3u"))) {
        fs.mkdirSync(path.join(path.resolve(), "m3u"))
    }

    fs.writeFileSync(path.join(path.resolve(), "m3u", "README.md"), after)
}
