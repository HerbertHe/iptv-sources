import fs from "fs"
import path from "path"
import { hrtime } from "process"

import { with_github_raw_url_proxy } from "./sources"
import { m3u2txt } from "./utils"
import type { ISource } from "./sources"
import type { TEPGSource } from "./epgs/utils"

export const getContent = async (src: ISource | TEPGSource) => {
    const now = hrtime.bigint()
    const url = /^https:\/\/raw.githubusercontent.com\//.test(src.url)
        ? with_github_raw_url_proxy(src.url)
        : src.url

    const res = await fetch(url)
    return [res.ok, await res.text(), now]
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

    if (!fs.existsSync(path.resolve("m3u", "sources"))) {
        fs.mkdirSync(path.resolve("m3u", "sources"))
    }

    fs.writeFileSync(
        path.resolve("m3u", "sources", `${f_name}.json`),
        JSON.stringify({
            name,
            sources: srcs,
        })
    )
}

export const writeM3uToTxt = (name: string, f_name: string, m3u: string) => {
    const m3uArray = m3u.split("\n")
    let txt = m3u2txt(m3uArray)

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

    fs.writeFileSync(path.join(txts_p, "merged.txt"), txts)
}

export const mergeSources = () => {
    const sources_p = path.resolve("m3u", "sources")

    const files = fs.readdirSync(sources_p)

    const res = {
        name: "Sources",
        sources: {},
    }

    files.forEach((f) => {
        const so = JSON.parse(
            fs.readFileSync(path.join(sources_p, f), "utf-8")
        ).sources

        Object.keys(so).forEach((k) => {
            if (!res.sources[k]) {
                res.sources[k] = so[k]
            } else {
                res.sources[k] = [...new Set([...res.sources[k], ...so[k]])]
            }
        })
    })

    fs.writeFileSync(path.join(sources_p, "sources.json"), JSON.stringify(res))
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
