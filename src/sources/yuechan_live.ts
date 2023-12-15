import { handle_m3u, replace_github_rawcontent, type TSources } from "./utils"

export const yuechan_live_filter = (raw: string): [string, number] => {
    const rawArray = handle_m3u(raw)

    const regExp = /\#EXTINF:-1(.*)/

    const result = rawArray.map((r) => {
        if (regExp.test(r)) {
            return replace_github_rawcontent(r)
        } else {
            return r
        }
    })

    return [result.join("\n"), (result.length - 1) / 2]
}

export const yuechan_live_sources: TSources = [
    {
        name: "YueChan_Live IPTV",
        f_name: "ycl_iptv",
        url: "https://fastly.jsdelivr.net/gh/YueChan/Live@main/IPTV.m3u",
        filter: yuechan_live_filter,
    },
]
