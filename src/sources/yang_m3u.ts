import type { TSources } from "./utils"

export const yang_m3u_filter = (raw: string): [string, number] => {
    const rawArray = raw
        .trim()
        .split("\n")
        .filter((r) => !!r)
    // const regExp = /\#EXTINF:-1(.*)/

    return [raw.trim(), (rawArray.length - 1) / 2]
}

export const yang_m3u_sources: TSources = [
    {
        name: "YanG_1989 Gather",
        f_name: "y_g",
        url: "https://fastly.jsdelivr.net/gh/YanG-1989/m3u@main/Gather.m3u",
        filter: yang_m3u_filter,
    },
]
