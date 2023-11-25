import { getM3u, writeM3u } from "./file"
import { sources, filter } from "./sources"

// 执行脚本
sources.forEach(async (sr) => {
    const text = await getM3u(sr)
    if (!!text) {
        let m3u = ""
        if (!!sr.filter) {
            m3u = sr.filter(text)
        } else {
            m3u = filter(text)
        }

        writeM3u(sr.name, m3u)
    }
})
