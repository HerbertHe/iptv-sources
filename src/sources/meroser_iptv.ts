import { collectM3uSource } from "../utils"
import { handle_m3u, type TSources, converter, ISource } from "./utils"

export const meroser_iptv_filter: ISource["filter"] = (
    raw,
    caller,
    collectFn
): [string, number] => {
    const rawArray = handle_m3u(raw).filter((r) => !/#[^E]/.test(r))

    if (caller === "normal" && collectFn) {
        for (let i = 1; i < rawArray.length; i += 2) {
            collectM3uSource(rawArray[i], rawArray[i + 1], collectFn)
        }
    }

    return [converter(rawArray.join("\n")), (rawArray.length - 1) / 2]
}

export const meroser_iptv_sources: TSources = [
    {
        name: "~~Meroser/IPTV IPTV~~(Removed)",
        f_name: "m_iptv",
        url: "https://raw.githubusercontent.com/Meroser/IPTV/main/IPTV.m3u",
        filter: meroser_iptv_filter,
    },
]
