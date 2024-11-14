import "dotenv/config"

interface IREADMEMirrorSite {
    protocol: "http" | "https"
    url: string
    frequence: string
    idc: string
    provider: string
}

type TREADMEMirrorSitesMatrix = IREADMEMirrorSite[]

export const sites_matrix: TREADMEMirrorSitesMatrix = [
    {
        protocol: "https",
        url: "https://iptv.b2og.com",
        frequence: "per 2h",
        idc: "腾讯云",
        provider: "[GrandDuke1106](https://github.com/GrandDuke1106)",
    },
    {
        protocol: "https",
        url: "https://iptv.helima.net",
        frequence: "per 2.5h",
        idc: "Oracle",
        provider: "[DobySAMA](https://github.com/DobySAMA)",
    },
    {
        protocol: "https",
        url: "https://m3u.002397.xyz",
        frequence: "per 2h",
        idc: "CloudFlare Tunnel",
        provider: "[Eternal-Future](https://github.com/Eternal-Future)",
    },
    {
        protocol: "https",
        url: "https://iptv.002397.xyz",
        frequence: "per 2h",
        idc: "Amazon",
        provider: "[Eternal-Future](https://github.com/Eternal-Future)",
    },
]
export const get_custom_url = () =>
    !!process.env.CUSTOM_URL ? process.env.CUSTOM_URL : "https://m3u.ibert.me"

export const get_rollback_urls = () => {
    const matrix_url = sites_matrix.map((m) => m.url)

    if (!process.env.ROLLBACK_URLS) {
        return ["https://m3u.ibert.me", ...matrix_url]
    }

    return process.env.ROLLBACK_URLS.split(",")
        .map((url) => url.trim())
        .concat(["https://m3u.ibert.me", ...matrix_url])
}

export const get_github_raw_proxy_url = () => {
    const custom = process.env.CUSTOM_GITHUB_RAW_SOURCE_PROXY_URL
    return !!custom ? custom : `https://ghp.ci`
}

export const replace_github_raw_proxy_url = (s: string) => {
    const proxy_url = get_github_raw_proxy_url()
    return s.replace(
        /tvg\-logo="https:\/\/raw\.githubusercontent\.com\//g,
        `tvg-logo="${proxy_url}/https://raw.githubusercontent.com/`
    )
}

export const is_filted_channels = (s: string) => {
    if (s.includes("ABN")) {
        return true
    }
    
    if (s.includes("NTD")) {
        return true
    }

    return false
}