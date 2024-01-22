import { collectM3uSource } from "../utils"
import { converter, handle_m3u } from "./utils"
import type { ISource, TSources } from "./utils"

export const epg_pw_filter: ISource["filter"] = (
    raw,
    caller,
    collectFn
): [string, number] => {
    const rawArray = handle_m3u(raw)
    const regExp = /\#EXTINF:-1\s+tvg\-name\=\"([^"]+)\"/

    let i = 1
    let sourced: string[] = []
    let result = [rawArray[0]]

    while (i < rawArray.length) {
        const reg = regExp.exec(rawArray[i]) as RegExpExecArray

        if (!!reg) {
            if (caller === "normal" && collectFn) {
                collectM3uSource(rawArray[i], rawArray[i + 1], collectFn)
            }

            if (!sourced.includes(reg[1])) {
                sourced.push(reg[1])
                result.push(
                    rawArray[i]
                        .replace(/\@\@[0-9]*/g, "")
                        .replace(/\[geo\-blocked\]/, "")
                        .replace(/\[Geo\-blocked\]/, "")
                        .trim()
                )
                result.push(rawArray[i + 1])
            }
        }

        i += 2
    }

    return [converter(result.join("\n")), (result.length - 1) / 2]
}

export const epg_pw_sources: TSources = [
    {
        name: "epg.pw China",
        f_name: "cn",
        url: "https://epg.pw/test_channels_china.m3u",
        filter: epg_pw_filter,
    },
    {
        name: "epg.pw China National",
        f_name: "cn_n",
        url: "https://epg.pw/test_channels_china_national.m3u",
        filter: epg_pw_filter,
    },
    {
        name: "epg.pw China Country",
        f_name: "cn_c",
        url: "https://epg.pw/test_channels_china_country.m3u",
        filter: epg_pw_filter,
    },
    {
        name: "epg.pw China Province",
        f_name: "cn_p",
        url: "https://epg.pw/test_channels_china_province.m3u",
        filter: epg_pw_filter,
    },
    {
        name: "epg.pw All",
        f_name: "all",
        url: "https://epg.pw/test_channels_all.m3u",
        filter: epg_pw_filter,
    },
]
