import fs from "fs"
import path from "path"

import type { ICustom } from "./define"
import { config_path, m3u_path, write_custom_path } from "../const"
import { m3u2txt, trimAny } from "../../utils"

const loadConfigCustom = (): ICustom | undefined => {
    if (!fs.existsSync(config_path)) {
        return void 0
    }

    if (fs.readdirSync(config_path).length === 0) {
        return void 0
    }

    const cfg = JSON.parse(
        fs.readFileSync(path.join(config_path, "custom.json"), "utf-8")
    ) as ICustom

    // 去除不必要的空格
    cfg.rules = trimAny(cfg.rules)

    return cfg
}

const getFilenames = () => {
    return fs
        .readdirSync(path.join(m3u_path, "txt"))
        .map((f) => f.replace(".txt", ""))
        .filter((f) => f !== "channels")
}

export const runCustomTask = () => {
    const cfg = loadConfigCustom()

    if (!cfg) return

    if (!cfg.rules || cfg.rules.length === 0) return

    if (!fs.existsSync(write_custom_path)) {
        fs.mkdirSync(write_custom_path)
    }

    const files = getFilenames()

    const rules = cfg.rules.filter((r) => files.includes(r.upstream.trim()))

    const ruled = rules.map((r) => r.upstream)

    files.forEach((f) => {
        if (!ruled.includes(f)) return

        const r = rules.filter((ru) => ru.upstream === f)

        if (r.length === 0) return

        console.log(`Customize Source ${f}`)

        const arr = fs
            .readFileSync(path.join(m3u_path, `${f}.m3u`), "utf-8")
            .split("\n")
        let res = [arr[0]]

        r.forEach((rr) => {
            for (let i = 1; i < arr.length; i += 2) {
                const regExp = /\#EXTINF:-1([^,]*),(.*)/

                const name = regExp.exec(arr[i])![2].trim()

                // include 的优先级高于 exclude
                if (!!rr.include && Array.isArray(rr.include)) {
                    if (rr.include.includes(name)) {
                        res.push(arr[i])
                        res.push(arr[i + 1])
                    }
                } else if (!!rr.exclude && Array.isArray(rr.exclude)) {
                    if (!rr.exclude.includes(name)) {
                        res.push(arr[i])
                        res.push(arr[i + 1])
                    }
                } else {
                    res.push(arr[i])
                    res.push(arr[i + 1])
                }
            }

            if (!!rr.append && Array.isArray(rr.append)) {
                rr.append.forEach(({ name, url, extinf }) => {
                    if (!!extinf) {
                        res.push(extinf)
                    } else {
                        let _name = name.trim()
                        res.push(
                            `#EXTINF:-1 tvg-name="${_name}" tvg-id="${_name}" group-title="Custom",${_name}`
                        )
                    }

                    res.push(url)
                })
            }
        })

        fs.writeFileSync(
            path.join(write_custom_path, `${f}.m3u`),
            res.join("\n")
        )

        fs.writeFileSync(path.join(write_custom_path, `${f}.txt`), m3u2txt(res))
    })
}
