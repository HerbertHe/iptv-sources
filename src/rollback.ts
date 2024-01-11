import { hrtime } from "process"

import { ISource, filter } from "./sources"
import { get_rollback_urls } from "./utils"

export const updateByRollback = async (
    sr: ISource,
    sr_filter?: (raw: string) => [string, number],
    idx: number = 0
): Promise<[string, number] | undefined> => {
    const rollback_urls = get_rollback_urls()
    try {
        const now = hrtime.bigint()
        const res = await fetch(`${rollback_urls[idx]}/${sr.f_name}.m3u`)
        const status = res.status
        if (/^[2]/.test(status.toString())) {
            console.log(
                `Fetch m3u from ${sr.name} with ROLLBACK from ${
                    rollback_urls[idx]
                } finished, cost ${
                    (parseInt(hrtime.bigint().toString()) -
                        parseInt(now.toString())) /
                    10e6
                } ms`
            )
            const text = await res.text()
            return !!sr_filter
                ? sr_filter(text as string)
                : filter(text as string)
        }

        console.log(`Fetch Rollback from ${rollback_urls[idx]} FAILED, try next...`)
        if (++idx < rollback_urls.length) {
            return updateByRollback(sr, sr_filter, idx)
        }

        console.log(`All failed, give up ${sr.name}!`)
        return undefined
    } catch (e) {
        console.log(`Fetch Rollback from ${rollback_urls[idx]} FAILED, try next...`)
        if (++idx < rollback_urls.length) {
            return updateByRollback(sr, sr_filter, idx)
        }

        console.log(`All failed, give up ${sr.name}!`)
        return undefined
    }
}
