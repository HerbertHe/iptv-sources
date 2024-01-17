import "dotenv/config"

import * as OpenCC from "opencc-js"
import { get_github_raw_proxy_url } from "../utils"

export interface ISource {
    name: string
    f_name: string
    url: string
    filter?: (raw: string) => [string, number]
}

export type TSources = ISource[]

export const converter = OpenCC.Converter({ from: "hk", to: "cn" })

export const handle_m3u = (r: string) => {
    return r
        .trim()
        .replace(/\r/g, "")
        .split("\n")
        .filter((r) => !!r)
}

export const with_github_raw_url_proxy = (u: string) => {
    return process.env.CLOSE_SOURCE_PROXY?.trim() === "true"
        ? u
        : `${get_github_raw_proxy_url()}/${u}`
}

export const get_source_id = (desc: string, lower: boolean = false): string => {
    const regExp = /#EXTINF:-1\s+([^,]*),([^,]+)/
    const tvgIDExp = /tvg-id="([^"]+)"/
    const tvgNameExp = /tvg-name="([^"]+)"/

    const [, rawTvg, rawName] = regExp.exec(desc) as RegExpExecArray
    if (!!rawTvg && tvgIDExp.test(rawTvg)) {
        const id = tvgIDExp.exec(rawTvg)![1]
        return lower ? id.toLowerCase() : id
    }

    if (!!rawTvg && tvgNameExp.test(rawTvg)) {
        const name = tvgNameExp.exec(rawTvg)![1]
        return lower ? name.toLowerCase() : name
    }

    const name = rawName
        .replace(/\[([^\]]+)\]/g, "")
        .replace(/\(([^\)]+)\)/g, "")
        .replace(/「([^」]+)」/g, "")
        .replace(/\-/g, "")
        .replace(/ +/g, "")

    return lower ? name.toLowerCase() : name
}
