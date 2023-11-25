export interface ISource {
    name: string
    url: string
    filter?: (raw: string) => string
}

export type TSources = ISource[]

export const filter = (raw: string) => {
    const rawArray = raw.split("\n")
    const regExp = /\#EXTINF:-1\s+tvg\-name\=\"([0-9a-zA-Z\u4e00-\u9fa5 ]+)\"/

    let i = 1
    let sourced: string[] = []
    let result = [rawArray[0]]

    while (i < rawArray.length) {
        const sr = rawArray[i]
        const reg = regExp.exec(sr) as RegExpExecArray
        if (!!reg) {
            if (!sourced.includes(reg[1])) {
                sourced.push(reg[1])
                result.push(rawArray[i])
                result.push(rawArray[i + 1])
            }
        }

        i += 2
    }

    return result.join("\n")
}

export const sources: TSources = [
    {
        name: "china",
        url: "https://epg.pw/test_channels_china.m3u",
        filter,
    },
]
