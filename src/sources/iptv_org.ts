import { is_filted_channels } from "../utils"
import { converter, handle_m3u } from "./utils"
import type { TSources } from "./utils"

export const iptv_org_filter = (raw: string): [string, number] => {
    const rawArray = handle_m3u(raw)
    const regExp = /\#EXTINF:-1\s+tvg\-id\=\"([^"]*)\"/
    const invalidExp = /\#EXTVLCOPT:/

    let i = 1
    let sourced: string[] = []
    let result = [rawArray[0]]

    while (i < rawArray.length) {
        const reg = regExp.exec(rawArray[i]) as RegExpExecArray
        const invalid = invalidExp.test(rawArray[i + 1])

        if (!!reg && !invalid) {
            if (is_filted_channels(reg[1].trim())) {
                i += 2
                continue
            } else if (!sourced.includes(reg[1]) || !reg[1]) {
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

export const iptv_org_stream_filter = (raw: string): [string, number] => {
    const rawArray = raw.split("\n")
    const regExp = /\#EXTINF:-1\s+tvg\-id\=\"([^"]*)\",(.*)/
    const invalidExp = /\#EXTVLCOPT:/

    let i = 1
    let sourced: string[] = []
    let commented: string[] = []
    let result = [rawArray[0]]

    while (i < rawArray.length) {
        const reg = regExp.exec(rawArray[i]) as RegExpExecArray
        const invalid = invalidExp.test(rawArray[i + 1])

        if (!!reg && !invalid) {
            if (!reg[1]) {
                // 没有 tvg-id
                // 处理台标重复
                if (!commented.includes(reg[2])) {
                    const comment = reg[2].trim()
                    commented.push(comment)

                    result.push(
                        rawArray[i]
                            .replace(/\@\@[0-9]*/g, "")
                            .replace(/\[([\s\S]*)\]/g, "")
                            .trim()
                    )
                    result.push(rawArray[i + 1])
                }
            } else if (is_filted_channels(reg[1].trim())) {
                i += 2
                continue
            } else if (!sourced.includes(reg[1])) {
                sourced.push(reg[1])
                result.push(
                    rawArray[i]
                        .replace(/\@\@[0-9]*/g, "")
                        .replace(/\[([\s\S]*)\]/g, "")
                        .trim()
                )
                result.push(rawArray[i + 1])
            }
        }

        i += 2
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
        filter: iptv_org_stream_filter,
    },
    {
        name: "iptv.org stream China 112114",
        f_name: "o_s_cn_112114",
        url: "https://raw.githubusercontent.com/iptv-org/iptv/master/streams/cn_112114.m3u",
        filter: iptv_org_stream_filter,
    },
    {
        name: "iptv.org stream China CCTV",
        f_name: "o_s_cn_cctv",
        url: "https://raw.githubusercontent.com/iptv-org/iptv/master/streams/cn_cctv.m3u",
        filter: iptv_org_stream_filter,
    },
    {
        name: "iptv.org stream China CGTN",
        f_name: "o_s_cn_cgtn",
        url: "https://raw.githubusercontent.com/iptv-org/iptv/master/streams/cn_cgtn.m3u",
        filter: iptv_org_stream_filter,
    },
]
