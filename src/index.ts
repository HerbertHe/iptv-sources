import { cleanFiles, getM3u, writeM3u } from "./file"
import { updateReadme } from "./readme"
import { sources, filter } from "./sources"

cleanFiles()

// 执行脚本
Promise.allSettled(
    sources.map(async (sr) => {
        const text = await getM3u(sr)
        if (!!text) {
            if (!!sr.filter) {
                let [m3u, count] = sr.filter(text)
                writeM3u(sr.f_name, m3u)
                return count
            } else {
                let [m3u, count] = filter(text)
                writeM3u(sr.f_name, m3u)
                return count
            }
        }
    })
)
    .then((counts) => {
        const cs = (<any>counts).map(({ value }) => value)
        updateReadme(sources, cs)
    })
    .catch((err) => {
        console.error(err)
    })
