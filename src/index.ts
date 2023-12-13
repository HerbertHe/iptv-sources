import { cleanFiles, getM3u, writeM3u } from "./file"
import { updateChannelList, updateReadme } from "./readme"
import { sources, filter } from "./sources"

cleanFiles()

// 执行脚本
Promise.allSettled(
    sources.map(async (sr) => {
        const [status, text] = await getM3u(sr)

        if (/^[2]/.test(status.toString()) && !!text) {
            let [m3u, count] = !!sr.filter
                ? sr.filter(text as string)
                : filter(text as string)
            writeM3u(sr.f_name, m3u)
            updateChannelList(sr.name, sr.f_name, m3u)
            return count
        } else {
            return undefined
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
