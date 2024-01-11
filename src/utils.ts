import "dotenv/config"

export const get_custom_url = () => process.env.CUSTOM_URL || ""

export const get_rollback_urls = () => {
    if (!process.env.ROLLBACK_URLS) {
        return ["https://m3u.ibert.me"]
    }

    return process.env.ROLLBACK_URLS.split(",")
        .map((url) => url.trim())
        .concat("https://m3u.ibert.me")
}
