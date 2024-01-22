const from_infos = new Map([
    ["sn.chinamobile.com", "中国移动陕西"],
    ["sh.chinamobile.com", "中国移动上海"],
    ["hl.chinamobile.com", "中国移动黑龙江"],
    ["js.chinamobile.com", "中国移动江苏"],
    ["cztv.com", "浙江广播电视集团"],
    ["mobaibox.com", "中国移动江苏"],
    ["shaoxing.com.cn", "绍兴网"],
    ["cztvcloud.com", "新蓝云"],
    ["btzx.com.cn", "兵团在线网站"],
    ["hznet.tv", "菏泽网络电视台"],
    ["xntv.tv", "西宁网络电视台"],
    ["jlntv.cn", "吉林广播电视台"],
    ["ybtvyun.com", "延边广播电视台"],
    ["dxhmt.cn", "河南大象融媒体"],
    ["hebyun.com.cn", "冀云"],
    ["nntv.cn", "老友网"],
    ["sjzntv.cn", "燕赵名城网"],
    ["yjtvw.com", "阳江广播电视台"],
    ["amazonaws.com", "亚马逊AWS"],
    ["jstv.com", "荔枝网"],
    ["sgmsw.cn", "韶关民声网"],
    ["grtn.cn", "广东网络广播电视台"],
    ["nbs.cn", "南京广播电视台"],
    ["lsrmw.cn", "溧水融媒网"],
    ["zohi.tv", "福州明珠"],
    ["qingting.fm", "蜻蜓FM"],
    ["hhtv.cc", "云南红河发布"],
    ["wsrtv.com.cn", "文山州广播电视台"],
    ["xsbnrtv.cn", "西双版纳广播电视网"],
    ["live.yantaitv.cn", "烟台网络广播电视台"],
    ["cgtn.com", "CGTN"],
    ["cctv.com", "CCTV"],
    ["cctvplus.com", "CCTV+"],
    ["cnr.cn", "央广网"],
    ["cmvideo.cn", "咪咕"],
    ["douyucdn", "斗鱼"],
    ["cri.cn", "国际在线"],
    ["hndt.com", "河南广播网"],
    ["qxndt.com", "黔西南广播网"],
    ["olelive.com", "欧乐影院"],
    ["chinashadt.com", "千城云科"],
    ["aodianyun.com", "奥点云"],
    ["xiancity.cn", "西安网"],
    ["raw.githubusercontent.com", "Github Raw"],
])

export const get_from_info = (url: string) => {
    for (const [k, v] of from_infos) {
        if (url.includes(k)) {
            return v
        }
    }

    const hostRegExp = /([^:]+):\/\/([^/]+)/

    const host = hostRegExp.exec(url)![2]

    if (/^\[/.test(host)) {
        return "IPv6 直链"
    }

    if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}(:\d+)?$/.test(host)) {
        return "IPv4 直链"
    }

    return host
}
