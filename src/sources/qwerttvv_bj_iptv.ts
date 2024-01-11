import { handle_m3u, type TSources } from "./utils"

export const qwerttvv_bj_iptv_filter = (raw: string): [string, number] => {
    const rawArray = handle_m3u(raw)

    let result = rawArray.filter(r => !/^#\s+/.test(r))

    return [result.join("\n"), (result.length - 1) / 2]
}

export const qwerttvv_bj_iptv_sources: TSources = [
    {
        name: "qwerttvv/Beijing-IPTV IPTV Unicom",
        f_name: "q_bj_iptv_unicom",
        url: "https://raw.githubusercontent.com/qwerttvv/Beijing-IPTV/master/IPTV-Unicom.m3u",
        filter: qwerttvv_bj_iptv_filter,
    },
    {
        name: "qwerttvv/Beijing-IPTV IPTV Unicom Multicast",
        f_name: "q_bj_iptv_unicom_m",
        url: "https://raw.githubusercontent.com/qwerttvv/Beijing-IPTV/master/IPTV-Unicom-Multicast.m3u",
        filter: qwerttvv_bj_iptv_filter,
    },
    {
        name: "qwerttvv/Beijing-IPTV IPTV Mobile",
        f_name: "q_bj_iptv_mobile",
        url: "https://raw.githubusercontent.com/qwerttvv/Beijing-IPTV/master/IPTV-Mobile.m3u",
        filter: qwerttvv_bj_iptv_filter,
    },
    {
        name: "qwerttvv/Beijing-IPTV IPTV Mobile Multicast",
        f_name: "q_bj_iptv_mobile_m",
        url: "https://raw.githubusercontent.com/qwerttvv/Beijing-IPTV/master/IPTV-Mobile-Multicast.m3u",
        filter: qwerttvv_bj_iptv_filter,
    },
]
