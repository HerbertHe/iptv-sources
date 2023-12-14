import fs from "fs"
import path from "path"

import type { ISource } from "./sources"

export const getM3u = async (src: ISource) => {
    const res = await fetch(src.url)
    return [res.status, await res.text()]
}

export const writeM3u = (name: string, m3u: string) => {
    if (!fs.existsSync(path.join(path.resolve(), "m3u"))) {
        fs.mkdirSync(path.join(path.resolve(), "m3u"))
    }

    fs.writeFileSync(path.join(path.resolve(), "m3u", `${name}.m3u`), m3u)
}

export const writeM3uToTxt = (name: string, f_name: string, m3u: string) => {
    const title = `${name},#genre#`
    const m3uArray = m3u.split("\n")

    const channelRegExp = /\#EXTINF:-1([^,]*),(.*)/
    let i = 1
    let channels: Array<string>[] = []
    while (i < m3uArray.length) {
        const reg = channelRegExp.exec(m3uArray[i]) as RegExpExecArray
        channels.push([reg[2].trim(), m3uArray[i + 1]])
        i += 2
    }

    const txt = `${title}\n${channels
        .map(([name, url]) => `${name},${url}`)
        .join("\n")}\n`

    if (!fs.existsSync(path.join(path.resolve(), "m3u", "txt"))) {
        fs.mkdirSync(path.join(path.resolve(), "m3u", "txt"))
    }

    fs.writeFileSync(
        path.join(path.resolve(), "m3u", "txt", `${f_name}.txt`),
        txt
    )
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
