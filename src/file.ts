import fs from "fs"
import path from "path"

import type { ISource } from "./sources"
import type { TEPGSource } from "./epgs/utils"

export const getContent = async (src: ISource | TEPGSource) => {
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
    let channels: string = ""

    for (let i = 1; i < m3uArray.length; i += 2) {
        const reg = channelRegExp.exec(m3uArray[i]) as RegExpExecArray
        channels += `${reg[2].trim()},${m3uArray[i + 1]}\n`
    }

    const txt = `${title}\n${channels}`

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
