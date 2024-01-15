import { hrtime } from "process"

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
import { updateByRollback, updateEPGByRollback } from "./rollback"
import { epgs_sources } from "./epgs"
import { writeTvBoxJson } from "./tvbox"

cleanFiles()

// 执行脚本
Promise.allSettled(
    sources.map(async (sr) => {
        const [status, text, now] = await getContent(sr)

        if (/^[2]/.test(status.toString()) && !!text) {
            console.log(
                `Fetch m3u from ${sr.name} finished, cost ${
                    (parseInt(hrtime.bigint().toString()) -
                        parseInt(now.toString())) /
                    10e6
                } ms`
            )

            let [m3u, count] = !!sr.filter
                ? sr.filter(text as string)
                : filter(text as string)
            writeM3u(sr.f_name, m3u)
            writeM3uToTxt(sr.name, sr.f_name, m3u)
            writeTvBoxJson(
                sr.f_name,
                [{ name: sr.name, f_name: sr.f_name }],
                sr.name
            )
            updateChannelList(sr.name, sr.f_name, m3u)
            return ["normal", count]
        } else {
            // rollback
            const res = await updateByRollback(sr, sr.filter)
            if (!!res) {
                const [m3u, count] = res
                writeM3u(sr.f_name, m3u)
                writeM3uToTxt(sr.name, sr.f_name, m3u)
                writeTvBoxJson(
                    sr.f_name,
                    [{ name: sr.name, f_name: sr.f_name }],
                    sr.name
                )
                updateChannelList(sr.name, sr.f_name, m3u, true)
                return ["rollback", count]
            } else {
                // rollback failed
                console.log(`[WARNING] m3u ${sr.name} get failed!`)
                return ["rollback", void 0]
            }
        }
    })
)
    .then(async (result) => {
        const epgs = await Promise.allSettled(
            epgs_sources.map(async (epg_sr) => {
                const [status, text, now] = await getContent(epg_sr)

                if (/^[2]/.test(status.toString()) && !!text) {
                    console.log(
                        `Fetch EPG from ${epg_sr.name} finished, cost ${
                            (parseInt(hrtime.bigint().toString()) -
                                parseInt(now.toString())) /
                            10e6
                        } ms`
                    )
                    writeEpgXML(epg_sr.f_name, text as string)
                    return ["normal"]
                } else {
                    // rollback
                    const text = await updateEPGByRollback(epg_sr)
                    if (/^[2]/.test(status.toString()) && !!text) {
                        writeEpgXML(epg_sr.f_name, text as string)
                        return ["rollback"]
                    } else {
                        // rollback failed
                        console.log(`[WARNING] EPG ${epg_sr.name} get failed!`)
                        return [void 0]
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
        writeTvBoxJson("tvbox", sources, "Channels")
        updateChannelsJson(sources, sources_res, epgs_sources)
        updateReadme(sources, sources_res, epgs_sources, epgs_res)
    })
    .catch((err) => {
        console.error(err)
    })
