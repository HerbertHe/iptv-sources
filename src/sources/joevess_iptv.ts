import { collectM3uSource } from "../utils"
import { handle_m3u, ISource, type TSources } from "./utils"

export const joevess_iptv_filter: ISource["filter"] = (
    raw,
    caller,
    collectFn
): [string, number] => {
    const rawArray = handle_m3u(raw)

    if (!/#EXTM3U/.test(rawArray[0])) {
        rawArray.unshift("#EXTM3U")
    }

    if (caller === "normal" && collectFn) {
        for (let i = 1; i < rawArray.length; i += 2) {
            collectM3uSource(rawArray[i], rawArray[i + 1], collectFn)
        }
    }

    return [rawArray.join("\n"), (rawArray.length - 1) / 2]
}

export const joevess_iptv_sources: TSources = [
    {
        name: "joevess/IPTV home",
        f_name: "j_home",
        url: "https://raw.githubusercontent.com/joevess/IPTV/main/home.m3u8",
        filter: joevess_iptv_filter,
    },
    {
        name: "joevess/IPTV iptv",
        f_name: "j_iptv",
        url: "https://raw.githubusercontent.com/joevess/IPTV/main/iptv.m3u8",
        filter: joevess_iptv_filter,
    },
]
