import fs from "fs"
import path from "path"
import { hrtime } from "process"

import { with_github_raw_url_proxy } from "./sources"
import type { ISource } from "./sources"
import type { TEPGSource } from "./epgs/utils"

export const getContent = async (src: ISource | TEPGSource) => {
    const now = hrtime.bigint()
    const url = /^https:\/\/raw.githubusercontent.com\//.test(src.url)
        ? with_github_raw_url_proxy(src.url)
        : src.url

    const res = await fetch(url)
    return [res.status, await res.text(), now]
}

export const writeM3u = (name: string, m3u: string) => {
    if (!fs.existsSync(path.join(path.resolve(), "m3u"))) {
        fs.mkdirSync(path.join(path.resolve(), "m3u"))
    }

    fs.writeFileSync(path.join(path.resolve(), "m3u", `${name}.m3u`), m3u)
}

export const writeSources = (
    name: string,
    f_name: string,
    sources: Map<string, string[]>
) => {
    let srcs = {}
    for (const [k, v] of sources) {
        srcs[k] = v
    }

    if (!fs.existsSync(path.join(path.resolve(), "m3u", "sources"))) {
        fs.mkdirSync(path.join(path.resolve(), "m3u", "sources"))
    }

    fs.writeFileSync(
        path.join(path.resolve(), "m3u", "sources", `${f_name}.json`),
        JSON.stringify({
            name,
            sources: srcs,
        })
    )
}

export const writeM3uToTxt = (name: string, f_name: string, m3u: string) => {
    const m3uArray = m3u.split("\n")
    let groups = new Map<string, string>()
    const channelRegExp = /\#EXTINF:-1([^,]*),(.*)/
    const groupRegExp = /group-title="([^"]*)"/

    for (let i = 1; i < m3uArray.length; i += 2) {
        const reg = channelRegExp.exec(m3uArray[i]) as RegExpExecArray
        const group = groupRegExp.exec(reg[1].trim())
        let g = ""

        if (!group) {
            g = "Undefined"
        } else {
            g = group[1].trim()
        }

        if (groups.has(g)) {
            groups.set(
                g,
                `${groups.get(g)}${reg[2].trim()},${m3uArray[i + 1]}\n`
            )
        } else {
            groups.set(g, `${reg[2].trim()},${m3uArray[i + 1]}\n`)
        }
    }

    let txt = ""

    groups.forEach((v, k) => {
        txt += `${k},#genre#\n${v}\n`
    })

    txt = txt.substring(0, txt.length - 2)

    if (!fs.existsSync(path.join(path.resolve(), "m3u", "txt"))) {
        fs.mkdirSync(path.join(path.resolve(), "m3u", "txt"))
    }

    fs.writeFileSync(
        path.join(path.resolve(), "m3u", "txt", `${f_name}.txt`),
        txt
    )
}

export const mergeTxts = () => {
    const txts_p = path.resolve("m3u", "txt")

    const files = fs.readdirSync(txts_p)

    const txts = files
        .map((d) => fs.readFileSync(path.join(txts_p, d).toString()))
        .join("\n")

    fs.writeFileSync(path.join(txts_p, "channels.txt"), txts)
}

export const writeEpgXML = (f_name: string, xml: string) => {
    if (!fs.existsSync(path.join(path.resolve(), "m3u", "epg"))) {
        fs.mkdirSync(path.join(path.resolve(), "m3u", "epg"))
    }

    fs.writeFileSync(path.resolve("m3u", "epg", `${f_name}.xml`), xml)
}

const cleanDir = (p: string) => {
    if (fs.existsSync(p)) {
        fs.readdirSync(p).forEach((file) => {
            const isDir = fs.statSync(path.join(p, file)).isDirectory()
            if (isDir) {
                cleanDir(path.join(p, file))
            } else {
                fs.unlinkSync(path.join(p, file))
            }
        })
    }
}

export const cleanFiles = () => cleanDir(path.join(path.resolve(), "m3u"))
