export * from "./epg_pw"
export * from "./iptv_org"
export * from "./yang_m3u"
export * from "./yuechan_live"
export * from "./fanmingming_live"
export * from "./utils"

import {
    epg_pw_sources,
    iptv_org_sources,
    iptv_org_stream_sources,
    yang_m3u_sources,
    yuechan_live_sources,
    fanmingming_live_sources,
} from "."

export const sources = [
    ...fanmingming_live_sources,
    ...iptv_org_sources,
    ...iptv_org_stream_sources,
    ...epg_pw_sources,
    ...yuechan_live_sources,
    ...yang_m3u_sources,
]
