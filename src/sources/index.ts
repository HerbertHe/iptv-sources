export * from "./epg_pw"
export * from "./iptv_org"
export * from "./utils"

import { epg_pw_sources, iptv_org_sources, iptv_org_stream_sources } from "."
import { yuechan_live_sources } from "./yuechan_live"

export const sources = [
    ...epg_pw_sources,
    ...yuechan_live_sources,
    ...iptv_org_sources,
    ...iptv_org_stream_sources,
]
