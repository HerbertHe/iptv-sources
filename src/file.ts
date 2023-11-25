import fs from "fs"
import path from "path"
import fetch from "node-fetch"

import type { ISource } from "./sources"

export const getM3u = async (src: ISource) => {
    const res = await fetch(src.url)
    return res.text()
}

export const writeM3u = (name: string, m3u: string) => {
    if (!fs.existsSync(path.join(path.resolve(), "m3u"))) {
        fs.mkdirSync(path.join(path.resolve(), "m3u"))
    }

    fs.writeFileSync(path.join(path.resolve(), "m3u" ,`${name}.m3u`), m3u)
}