import * as OpenCC from "opencc-js"

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

export const replace_github_rawcontent = (url: string) => {
    return url.replace(
        "https://raw.githubusercontent.com/",
        "https://ghproxy.net/https://raw.githubusercontent.com/"
    )
}
