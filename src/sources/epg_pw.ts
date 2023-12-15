import { converter, handle_m3u } from "./utils"
import type { TSources } from "./utils"

export const filter = (raw: string): [string, number] => {
    const rawArray = handle_m3u(raw)
    const regExp = /\#EXTINF:-1\s+tvg\-name\=\"([^"]+)\"/

    let i = 1
    let sourced: string[] = []
    let result = [rawArray[0]]

    while (i < rawArray.length) {
        const reg = regExp.exec(rawArray[i]) as RegExpExecArray

        if (!!reg) {
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
        name: "China",
        f_name: "cn",
        url: "https://epg.pw/test_channels_china.m3u",
    },
    {
        name: "China National",
        f_name: "cn_n",
        url: "https://epg.pw/test_channels_china_national.m3u",
    },
    {
        name: "China Country",
        f_name: "cn_c",
        url: "https://epg.pw/test_channels_china_country.m3u",
    },
    {
        name: "China Province",
        f_name: "cn_p",
        url: "https://epg.pw/test_channels_china_province.m3u",
    },
    {
        name: "All",
        f_name: "all",
        url: "https://epg.pw/test_channels_all.m3u",
    },
]
