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
