import { collectM3uSource } from "../utils"
import { handle_m3u, ISource, type TSources } from "./utils"

export const fanmingming_live_filter: ISource["filter"] = (
    raw,
    caller,
    collectFn
): [string, number] => {
    const rawArray = handle_m3u(raw)

    if (caller === "normal" && collectFn) {
        for (let i = 1; i < rawArray.length; i += 2) {
            collectM3uSource(rawArray[i], rawArray[i + 1], collectFn)
        }
    }

    return [rawArray.join("\n"), (rawArray.length - 1) / 2]
}

export const fanmingming_live_sources: TSources = [
    {
        name: "fanmingming/live ipv6",
        f_name: "fmml_ipv6",
        url: "https://raw.githubusercontent.com/fanmingming/live/main/tv/m3u/ipv6.m3u",
        filter: fanmingming_live_filter,
    },
    {
        name: "fanmingming/live domainv6(Invalid)",
        f_name: "fmml_dv6",
        url: "https://raw.githubusercontent.com/fanmingming/live/main/tv/m3u/Invalid/domainv6.m3u",
        filter: fanmingming_live_filter,
    }
]
