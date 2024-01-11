import { hrtime } from "process"

import { ISource, filter } from "./sources"

// TODO 支持多渠道回滚，进行闭包递归调用
export const updateByRollback = async (
    sr: ISource,
    sr_filter?: (raw: string) => [string, number]
): Promise<[string, number] | undefined> => {
    const now = hrtime.bigint()
    const res = await fetch(`https://m3u.ibert.me/${sr.f_name}.m3u`)
    const status = res.status
    if (/^[2]/.test(status.toString())) {
        console.log(
            `Fetch m3u from ${
                sr.name
            } with ROLLBACK from https://m3u.ibert.me finished, cost ${
                (parseInt(hrtime.bigint().toString()) -
                    parseInt(now.toString())) /
                10e6
            } ms`
        )
        const text = await res.text()
        return !!sr_filter ? sr_filter(text as string) : filter(text as string)
    } else {
        return undefined
    }
}
