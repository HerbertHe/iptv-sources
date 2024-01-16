import { replace_github_raw_proxy_url } from "../utils"
import { handle_m3u, type TSources } from "./utils"

export const yuechan_live_filter = (raw: string): [string, number] => {
    const rawArray = handle_m3u(replace_github_raw_proxy_url(raw))

    return [rawArray.join("\n"), (rawArray.length - 1) / 2]
}

export const yuechan_live_sources: TSources = [
    {
        name: "YueChan-Live IPTV",
        f_name: "ycl_iptv",
        url: "https://raw.githubusercontent.com/YueChan/Live/main/IPTV.m3u",
        filter: yuechan_live_filter,
    },
]
