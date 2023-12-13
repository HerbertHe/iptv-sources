export interface ISource {
    name: string
    f_name: string
    url: string
    filter?: (raw: string) => [string, number]
}

export type TSources = ISource[]

export const filter = (raw: string): [string, number] => {
    const rawArray = raw.split("\n")
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
                )
                result.push(rawArray[i + 1])
            }
        }

        i += 2
    }

    return [result.join("\n"), result.length - 1]
}

export const iptv_org_filter = (raw: string): [string, number] => {
    const rawArray = raw.split("\n")
    const regExp = /\#EXTINF:-1\s+tvg\-id\=\"([^"]*)\"/
    const invalidExp = /\#EXTVLCOPT:/

    let i = 1
    let sourced: string[] = []
    let result = [rawArray[0]]

    while (i < rawArray.length) {
        const reg = regExp.exec(rawArray[i]) as RegExpExecArray
        const invalid = invalidExp.test(rawArray[i + 1])

        if (!!reg && !invalid) {
            if (!sourced.includes(reg[1]) || !reg[1]) {
                sourced.push(reg[1])
                result.push(
                    rawArray[i]
                        .replace(/\@\@[0-9]*/g, "")
                        .replace(/\[geo\-blocked\]/, "")
                )
                result.push(rawArray[i + 1])
            }
        }

        i += 2
    }

    return [result.join("\n"), result.length - 1]
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

    return [result.join("\n"), result.length - 1]
}

const epg_pw_sources: TSources = [
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

const iptv_org_sources: TSources = [
    {
        name: "iptv.org All",
        f_name: "o_all",
        url: "https://iptv-org.github.io/iptv/index.m3u",
        filter: iptv_org_filter,
    },
    {
        name: "iptv.org China",
        f_name: "o_cn",
        url: "https://iptv-org.github.io/iptv/countries/cn.m3u",
        filter: iptv_org_filter,
    },
]

const iptv_org_stream_sources: TSources = [
    {
        name: "iptv.org stream China",
        f_name: "o_s_cn",
        url: "https://fastly.jsdelivr.net/gh/iptv-org/iptv@master/streams/cn.m3u",
        filter: iptv_org_stream_filter,
    },
    {
        name: "iptv.org stream China 112114",
        f_name: "o_s_cn_112114",
        url: "https://fastly.jsdelivr.net/gh/iptv-org/iptv@master/streams/cn_112114.m3u",
        filter: iptv_org_stream_filter,
    },
    {
        name: "iptv.org stream China CCTV",
        f_name: "o_s_cn_cctv",
        url: "https://fastly.jsdelivr.net/gh/iptv-org/iptv@master/streams/cn_cctv.m3u",
        filter: iptv_org_stream_filter,
    },
    {
        name: "iptv.org stream China CGTN",
        f_name: "o_s_cn_cgtn",
        url: "https://fastly.jsdelivr.net/gh/iptv-org/iptv@master/streams/cn_cgtn.m3u",
        filter: iptv_org_stream_filter,
    },
]

export const sources = [
    ...epg_pw_sources,
    ...iptv_org_sources,
    ...iptv_org_stream_sources,
]
