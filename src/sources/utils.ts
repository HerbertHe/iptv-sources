import * as OpenCC from "opencc-js"

import "dotenv/config"

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
    console.log(
        Boolean(process.env.CLOSE_SOURCE_PROXY) ? u : `https://ghproxy.net/${u}`
    )
    return Boolean(process.env.CLOSE_SOURCE_PROXY)
        ? u
        : `https://ghproxy.net/${u}`
}
