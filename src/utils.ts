import "dotenv/config"

export const get_custom_url = () => process.env.CUSTOM_URL || ""

export const get_rollback_urls = () => {
    if (!process.env.ROLLBACK_URLS) {
        return [
            "https://m3u.ibert.me",
            "https://iptv.b2og.com",
            "https://m3u.002397.xyz",
            "https://iptv.helima.net",
        ]
    }

    return process.env.ROLLBACK_URLS.split(",")
        .map((url) => url.trim())
        .concat([
            "https://m3u.ibert.me",
            "https://iptv.b2og.com",
            "https://m3u.002397.xyz",
            "https://iptv.helima.net",
        ])
}
