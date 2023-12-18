import { updateChannelsJson } from "./channels"
import {
    cleanFiles,
    getContent,
    mergeTxts,
    writeEpgXML,
    writeM3u,
    writeM3uToTxt,
} from "./file"
import { updateChannelList, updateReadme } from "./readme"
import { sources, filter } from "./sources"
import { updateByRollback } from "./rollback"
import { epgs_sources } from "./epgs"

cleanFiles()

// 执行脚本
Promise.allSettled(
    sources.map(async (sr) => {
        const [status, text] = await getContent(sr)

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
    .then(async (result) => {
        const epgs = await Promise.allSettled(
            epgs_sources.map(async (epg_sr) => {
                const [status, text] = await getContent(epg_sr)
                if (/^[2]/.test(status.toString()) && !!text) {
                    writeEpgXML(epg_sr.f_name, text as string)
                    return ["normal"]
                } else {
                    // rollback
                    const [status, text] = await getContent(epg_sr)
                    if (/^[2]/.test(status.toString()) && !!text) {
                        writeEpgXML(epg_sr.f_name, text as string)
                        return ["rollback"]
                    } else {
                        // rollback failed
                        return [undefined]
                    }
                }
            })
        )

        return {
            sources: result,
            epgs: epgs,
        }
    })
    .then((result) => {
        const sources_res = result.sources.map((r) => (<any>r).value)
        const epgs_res = result.epgs.map((r) => (<any>r).value)
        mergeTxts()
        updateChannelsJson(sources, sources_res, epgs_sources)
        updateReadme(sources, sources_res,epgs_sources, epgs_res)
    })
    .catch((err) => {
        console.error(err)
    })
