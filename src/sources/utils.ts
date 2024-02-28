import "dotenv/config"

import * as OpenCC from "opencc-js"
import { get_github_raw_proxy_url } from "../utils"

export interface ISource {
    name: string
    f_name: string
    url: string
    filter: (
        raw: string,
        caller: "normal" | "skip" | "rollback",
        collectFn?: (k: string, v: string) => void
    ) => [string, number]
}

export type TSources = ISource[]

export const converter = OpenCC.Converter({ from: "hk", to: "cn" })

export const handle_m3u = (r: string) => {
    const raw = r
        .trim()
        .replace(/\r/g, "")
        .split("\n")
        .filter((r) => !!r)

    let result: string[] = []

    const extM3uRegExp = /#EXTM3U/
    const extinfRegExp = /#EXTINF:-1([^,]*),(.*)/
    const hostRegExp = /^([^:]+):\/\/([^/]+)/

    for (let i = 0; i < raw.length; i++) {
        if (extM3uRegExp.test(raw[i])) {
            result.push(raw[i])
            continue
        }

        if (extinfRegExp.test(raw[i]) && hostRegExp.test(raw[i + 1])) {
            result = result.concat([raw[i], raw[i + 1]])
            i++
            continue
        }
    }

    return result
}

export const with_github_raw_url_proxy = (u: string) => {
    return process.env.CLOSE_SOURCE_PROXY?.trim() === "true"
        ? u
        : `${get_github_raw_proxy_url()}/${u}`
}
