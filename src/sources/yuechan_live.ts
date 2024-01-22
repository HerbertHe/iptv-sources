import { replace_github_raw_proxy_url, collectM3uSource } from "../utils"
import { handle_m3u, ISource, type TSources } from "./utils"

export const yuechan_live_filter: ISource["filter"] = (
    raw,
    caller,
    collectFn
): [string, number] => {
    const rawArray = handle_m3u(replace_github_raw_proxy_url(raw))

    if (caller === "normal" && collectFn) {
        for (let i = 1; i < rawArray.length; i += 2) {
            collectM3uSource(rawArray[i], rawArray[i + 1], collectFn)
        }
    }

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
