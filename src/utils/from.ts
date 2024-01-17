const from_infos = new Map([
    ["sn.chinamobile.com", "中国移动陕西"],
    ["sh.chinamobile.com", "中国移动上海"],
    ["hl.chinamobile.com", "中国移动黑龙江"],
    ["cztv.com", "浙江广播电视集团"],
    ["mobaibox.com", "中国移动江苏"],
    ["cgtn.com", "CGTN"],
    ["cctv.com", "CCTV"],
])

export const get_from_info = (url: string) => {
    for (const [k, v] of from_infos) {
        if (url.includes(k)) {
            return v
        }
    }

    const hostRegExp = /([^:]+):\/\/([^/]+)/

    return hostRegExp.exec(url)![2]
}
