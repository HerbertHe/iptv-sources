import { is_filted_channels, collectM3uSource, get_channel_id } from "../utils"
import { converter, handle_m3u } from "./utils"
import type { ISource, TSources } from "./utils"

export const iptv_org_filter: ISource["filter"] = (
    raw,
    caller,
    collectFn
): [string, number] => {
    const rawArray = handle_m3u(raw)
    const invalidExp = /\#EXTVLCOPT:/

    const arr = rawArray.filter((r) => !invalidExp.test(r))

    let sourced: string[] = []
    let result = [arr[0]]

    for (let i = 1; i < arr.length; i += 2) {
        const id = get_channel_id(arr[i])

        if (is_filted_channels(id.trim())) {
            continue
        }

        if (caller === "normal" && collectFn) {
            collectM3uSource(arr[i], arr[i + 1], collectFn)
        }

        if (!sourced.includes(id)) {
            sourced.push(id)
            result.push(
                arr[i]
                    .replace(/\@\@[0-9]*/g, "")
                    .replace(/\[geo\-blocked\]/, "")
                    .replace(/\[Geo\-blocked\]/, "")
                    .trim()
            )
            result.push(arr[i + 1])
        }
    }

    return [converter(result.join("\n")), (result.length - 1) / 2]
}

export const iptv_org_sources: TSources = [
    {
        name: "iptv.org All",
        f_name: "o_all",
        url: "https://raw.githubusercontent.com/iptv-org/iptv/gh-pages/index.m3u",
        filter: iptv_org_filter,
    },
    {
        name: "iptv.org China",
        f_name: "o_cn",
        url: "https://raw.githubusercontent.com/iptv-org/iptv/gh-pages/countries/cn.m3u",
        filter: iptv_org_filter,
    },
]

export const iptv_org_stream_sources: TSources = [
    {
        name: "iptv.org stream China",
        f_name: "o_s_cn",
        url: "https://raw.githubusercontent.com/iptv-org/iptv/master/streams/cn.m3u",
        filter: iptv_org_filter,
    },
    {
        name: "iptv.org stream China 112114",
        f_name: "o_s_cn_112114",
        url: "https://raw.githubusercontent.com/iptv-org/iptv/master/streams/cn_112114.m3u",
        filter: iptv_org_filter,
    },
    {
        name: "iptv.org stream China CCTV",
        f_name: "o_s_cn_cctv",
        url: "https://raw.githubusercontent.com/iptv-org/iptv/master/streams/cn_cctv.m3u",
        filter: iptv_org_filter,
    },
    {
        name: "iptv.org stream China CGTN",
        f_name: "o_s_cn_cgtn",
        url: "https://raw.githubusercontent.com/iptv-org/iptv/master/streams/cn_cgtn.m3u",
        filter: iptv_org_filter,
    },
]
