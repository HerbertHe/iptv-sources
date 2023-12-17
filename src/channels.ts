import path from "path"
import fs from "fs"

export interface IChannelSource {
    name: string
    f_name: string
}

export type TChannelsSources = IChannelSource[]

export interface IChannel {
    name: string
    m3u: string
    count: number | undefined
}

export interface IChannelsResult {
    channels: IChannel[]
    updated_at: number
}

export const updateChannelsJson = (
    sources: TChannelsSources,
    res: Array<[string, number | undefined]>
) => {
    const json_p = path.resolve("m3u", "channels.json")

    const result: IChannelsResult = {
        channels: sources.map((source, idx) => ({
            name: source.name,
            m3u: `https://m3u.ibert.me/${source.f_name}.m3u`,
            count: res[idx][1],
        })),
        updated_at: new Date().getTime(),
    }

    if (!fs.existsSync(path.resolve("m3u"))) {
        fs.mkdirSync(path.resolve("m3u"))
    }

    fs.writeFileSync(json_p, JSON.stringify(result))
}
