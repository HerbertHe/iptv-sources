import type { TEPGSource } from "./utils"

export const epgs_sources: TEPGSource[] = [
    {
        name: "112114.xyz",
        f_name: "112114_xyz",
        url: "https://epg.112114.xyz/pp.xml",
    },
    {
        name: "fanmingming/live",
        f_name: "fmml",
        url: "https://fastly.jsdelivr.net/gh/fanmingming/live@main/e.xml"
    }
]

