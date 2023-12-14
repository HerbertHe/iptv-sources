import fs from "fs"
import path from "path"

import { getM3u } from "./file"
import { sources, filter } from "./sources"

interface IVercelJson {
    version: number
    rewrites: {
        source: string
        destination: string
    }[]
    outputDirectory: string
    buildCommand: string
}

const updateVercelJson = (domains: string[]) => {
    const vercel_p = path.join(path.resolve(), "vercel.json")
    const vercel: IVercelJson = {
        version: 2,
        rewrites: [],
        outputDirectory: ".",
        buildCommand: "npm run build:vercel",
    }

    const rewrites = domains.map((d) => {
        const [protocol, domain] = d.split("/")
        return {
            source: `/proxy/${domain}/:url*`,
            destination: `${protocol}://${domain}/:url*`,
        }
    })

    vercel.rewrites = [...rewrites]

    fs.writeFileSync(vercel_p, JSON.stringify(vercel))
}

Promise.allSettled(
    sources.map(async (sr) => {
        if (sr.f_name.includes("all")) {
            return undefined
        }

        const [status, text] = await getM3u(sr)

        if (/^[2]/.test(status.toString()) && !!text) {
            let [m3u] = !!sr.filter
                ? sr.filter(text as string)
                : filter(text as string)

            const linkRegExp = /([a-z]+):\/\/([^\/]+)\/?/
            const m3uArray = m3u.split("\n")
            let i = 2
            let domains: string[] = []

            while (i < m3uArray.length) {
                const [, protocol, domain] = linkRegExp.exec(
                    m3uArray[i]
                ) as RegExpExecArray

                if (!domains.includes(`${protocol}/${domain}`)) {
                    domains.push(`${protocol}/${domain}`)
                }
                i += 2
            }

            return domains
        } else {
            // console.log(sr.name)
            return undefined
        }
    })
)
    .then((domains) => {
        const domainsArray = [
            ...new Set(domains.map((d) => (<any>d).value).flat(Infinity)),
        ].filter((d) => !!d)

        return domainsArray
    })
    .then((domains) => {
        updateVercelJson(domains)
    })
    .catch((err) => {
        console.log(err)
    })
