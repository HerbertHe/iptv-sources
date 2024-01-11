import fs from "fs"
import path from "path"

import type { IChannelsResult } from "./channels"

import { sites_matrix } from "./utils"

// 仅支持 GitHub Action 进行镜像站测试，降低镜像站负载压力

const matrixGen = (
    m: string
) => `| HTTP Protocol | URL | Auto-update Frequence | Latest Updated | IDC | Provider |
| ------------- | --- | --------------------- | --- | --- | -------- |
${m}
`

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
            reject(`Get Updated Failed: **${err.toString()}**`)
        }
    })
}

const updateMatrix = async () => {
    const readme_p = path.resolve("m3u", "README.md")

    const m = await Promise.allSettled(
        sites_matrix?.map(async (m) => {
            let test = ""
            try {
                test = await requestMirrorSite(m.url)
            } catch (err) {
                test = err
            } finally {
                return `| ${m.protocol} | <${m.url}> | ${m.frequence} | ${test} | ${m.idc} | ${m.provider} |`
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
