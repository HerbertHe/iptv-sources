import { handle_m3u, type TSources } from "./utils"

export const yang_m3u_filter = (raw: string): [string, number] => {
    const rawArray = handle_m3u(raw)
    
    return [rawArray.join("\n"), (rawArray.length - 1) / 2]
}

export const yang_m3u_sources: TSources = [
    {
        name: "YanG_1989 Gather",
        f_name: "y_g",
        url: "https://fastly.jsdelivr.net/gh/YanG-1989/m3u@main/Gather.m3u",
        filter: yang_m3u_filter,
    },
]
