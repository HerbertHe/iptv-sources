import path from "path"
import fs from "fs"

import "dotenv/config"

/**
 * 检查文件是否可用
 * @param f
 * @returns
 */
export const canIUseM3uFile = (f: string) => {
    const m3u_p = path.resolve("m3u", f)
    return fs.existsSync(m3u_p)
}

/**
 * 检查 iptv-checker 环境
 * @returns
 */
export const canIUseIPTVChecker = async () => {
    const { ENABLE_IPTV_CHECKER, IPTV_CHECKER_URL } = process.env

    if (ENABLE_IPTV_CHECKER !== "true" || !IPTV_CHECKER_URL) return false

    try {
        const res = await fetch(IPTV_CHECKER_URL)
        if (/^[2]/.test(res.status.toString())) {
            return true
        } else {
            return false
        }
    } catch (err) {
        return false
    }
}
