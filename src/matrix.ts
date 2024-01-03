import fs from "fs"
import path from "path"

import type { IChannelsResult } from "./channels"

// 仅支持 GitHub Action 进行镜像站测试，降低镜像站负载压力

const matrixGen = (
    m: string
) => `| HTTP Protocol | URL | Auto-update Frequence | Latest Updated | IDC | Provider |
| ------------- | --- | --------------------- | --- | --- | -------- |
${m}
`

interface IREADMEMirrorSite {
    protocol: "http" | "https"
    url: string
    frequence: string
    idc: string
    provider: string
}

type TREADMEMirrorSitesMatrix = IREADMEMirrorSite[]

const matrix: TREADMEMirrorSitesMatrix = [
    {
        protocol: "https",
        url: "https://iptv.b2og.com",
        frequence: "per 2h",
        idc: "腾讯云",
        provider: "[GrandDuke1106](https://github.com/GrandDuke1106)",
    },
    {
        protocol: "https",
        url: "https://m3u.002397.xyz",
        frequence: "per 2h",
        idc: "CloudFlare Tunnel",
        provider: "[Eternal-Future](https://github.com/Eternal-Future)",
    }
]

const requestMirrorSite = (url: string): Promise<string> => {
    return new Promise(async (resolve, reject) => {
        try {
            const res = await fetch(`${url}/channels.json`)
            if (/^[2]/.test(res.status.toString())) {
                const channles = JSON.parse(await res.text()) as IChannelsResult
                resolve(new Date(channles.updated_at).toString())
            } else {
                reject(`Get Updated Failed: **${res.statusText}**`)
            }
        } catch (err) {
            reject(`Get Update Failed: **${err.toString()}**`)
        }
    })
}

const updateMatrix = async () => {
    const readme_p = path.resolve("m3u", "README.md")

    const m = await Promise.allSettled(
        matrix?.map(async (m) => {
            let test = ""
            try {
                test = await requestMirrorSite(m.url)
            } catch (err) {
                test = err
            } finally {
                return `| ${m.protocol} | ${m.url} | ${m.frequence} | ${test} | ${m.idc} | ${m.provider} |`
            }
        })
    )

    const back = matrixGen(
        (<any>m)
            .map((mm) => {
                return mm.value
            })
            .join("\n")
    )

    const readme = fs.readFileSync(readme_p, "utf8").toString()
    fs.writeFileSync(readme_p, readme.replace("<!-- matrix_here -->", back))
}

updateMatrix()
