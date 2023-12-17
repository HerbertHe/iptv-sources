import { updateChannelsJson } from "./channels"
import { cleanFiles, getM3u, writeM3u, writeM3uToTxt } from "./file"
import { updateChannelList, updateReadme } from "./readme"
import { sources, filter } from "./sources"
import { updateByRollback } from "./rollback"

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
            writeM3uToTxt(sr.name, sr.f_name, m3u)
            updateChannelList(sr.name, sr.f_name, m3u)
            return ["normal", count]
        } else {
            // rollback
            const res = await updateByRollback(sr.f_name, sr.filter)
            if (!!res) {
                const [m3u, count] = res
                writeM3u(sr.f_name, m3u)
                writeM3uToTxt(sr.name, sr.f_name, m3u)
                updateChannelList(sr.name, sr.f_name, m3u, true)
                return ["rollback", count]
            } else {
                // rollback failed
                return ["rollback", undefined]
            }
        }
    })
)
    .then((result) => {
        const res = (<any>result).map(({ value }) => value)

        updateChannelsJson(sources, res)
        updateReadme(sources, res)
    })
    .catch((err) => {
        console.error(err)
    })
