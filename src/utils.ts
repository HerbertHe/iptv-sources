import "dotenv/config"

import { matrix } from "./matrix"

export const get_custom_url = () => process.env.CUSTOM_URL || ""

export const get_rollback_urls = () => {
    const matrix_url = matrix.map((m) => m.url)

    if (!process.env.ROLLBACK_URLS) {
        return ["https://m3u.ibert.me", ...matrix_url]
    }

    return process.env.ROLLBACK_URLS.split(",")
        .map((url) => url.trim())
        .concat(["https://m3u.ibert.me", ...matrix_url])
}
