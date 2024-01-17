import path from "path"
import fs from "fs"

import { get_custom_url } from "./utils"

export interface IChannelSource {
    name: string
    f_name: string
}

export type TChannelsSources = IChannelSource[]

export type TChannelEpgs = TChannelsSources

export interface IChannel {
    name: string
    m3u: string
    count: number | undefined
}

export interface IEPG {
    name: string
    epg: string
}

export interface IChannelsResult {
    builderVersion?: number  // 构建版本标识符
    channels: IChannel[]
    epgs: IEPG[]
    updated_at: number
}

export const updateChannelsJson = (
    sources: TChannelsSources,
    sources_res: Array<[string, number | undefined]>,
    epgs: TChannelEpgs
) => {
    const json_p = path.resolve("m3u", "channels.json")
    const url = get_custom_url()

    const result: IChannelsResult = {
        builderVersion: 1,
        channels: sources?.map((source, idx) => ({
            name: source.name,
            m3u: `${url}/${source.f_name}.m3u`,
            count: sources_res?.[idx]?.[1],
        })),
        epgs: epgs?.map((epg) => ({
            name: epg.name,
            epg: `${url}/epg/${epg.f_name}.xml`,
        })),
        updated_at: new Date().getTime(),
    }

    if (!fs.existsSync(path.resolve("m3u"))) {
        fs.mkdirSync(path.resolve("m3u"))
    }

    fs.writeFileSync(json_p, JSON.stringify(result))
}
