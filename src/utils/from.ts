const from_infos = new Map([
    ["sn.chinamobile.com", "中国移动陕西"],
    ["sh.chinamobile.com", "中国移动上海"],
    ["hl.chinamobile.com", "中国移动黑龙江"],
    ["cztv.com", "浙江广播电视集团"],
    ["mobaibox.com", "中国移动江苏"],
    ["shaoxing.com.cn", "绍兴网"],
    ["jstv.com", "荔枝网"],
    ["live.yantaitv.cn", "烟台网络广播电视台"],
    ["cgtn.com", "CGTN"],
    ["cctv.com", "CCTV"],
    ["cnr.cn", "央广网"],
    ["cmvideo.cn", "咪咕"],
    ["douyucdn", "斗鱼"],
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
