import { handle_m3u, type TSources } from "./utils"

export const fanmingming_live_filter = (raw: string): [string, number] => {
    const rawArray = handle_m3u(raw)

    return [rawArray.join("\n"), (rawArray.length - 1) / 2]
}

export const fanmingming_live_sources: TSources = [
    {
        name: "fanmingming/live domainv6",
        f_name: "fmml_dv6",
        url: "https://fastly.jsdelivr.net/gh/fanmingming/live@main/tv/m3u/domainv6.m3u",
        filter: fanmingming_live_filter,
    },
    {
        name: "fanmingming/live ipv6",
        f_name: "fmml_ipv6",
        url: "https://fastly.jsdelivr.net/gh/fanmingming/live@main/tv/m3u/ipv6.m3u",
        filter: fanmingming_live_filter,
    },
    {
        name: "fanmingming/live v6",
        f_name: "fmml_v6",
        url: "https://fastly.jsdelivr.net/gh/fanmingming/live@main/tv/m3u/v6.m3u",
        filter: fanmingming_live_filter,
    },
]
