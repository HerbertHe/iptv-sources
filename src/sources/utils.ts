import "dotenv/config"

import * as OpenCC from "opencc-js"
import { get_github_raw_proxy_url } from "../utils"

export interface ISource {
    name: string
    f_name: string
    url: string
    filter: (
        raw: string,
        caller: "normal" | "rollback",
        collectFn?: (k: string, v: string) => void,
    ) => [string, number]
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