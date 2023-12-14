import type { TSources } from "./utils"

// TODO 修复不同来源的图标
export const yuechan_live_filter = (raw: string): [string, number] => {
    return [
        raw.replace(
            /https\:\/\/raw\.githubusercontent\.com\/drangjchen\/IPTV\/main/g,
            "https://fastly.jsdelivr.net/gh/drangjchen/IPTV@main"
        ),
        raw.split("\n").length / 2 - 1,
    ]
}

export const yuechan_live_sources: TSources = [
    {
        name: "YueChan_Live IPTV",
        f_name: "ycl_iptv",
        url: "https://fastly.jsdelivr.net/gh/YueChan/Live@main/IPTV.m3u",
        filter: yuechan_live_filter,
    },
]
