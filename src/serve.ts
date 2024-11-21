import fs from "fs"
import path from "path"

import Koa from "koa"
import { default as Static } from "koa-static"
import Router from "koa-router"
import MarkdownIt from "markdown-it"

import { canIUseIPTVChecker, canIUseM3uFile } from "./checker"

const app = new Koa()
const router = new Router()
const md = new MarkdownIt({ html: true })

const markdownBody = (md_p: string, back_p: string) => {
    let markdown: string = ""
    if (!fs.existsSync(md_p)) {
        markdown = fs.readFileSync(back_p).toString()
    } else {
        markdown = fs.readFileSync(md_p).toString()
    }

    return `
    <html lang="en">
    <head>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.5.0/github-markdown.css" integrity="sha512-LX/J+iRwkfRqaipVsfmi2B1S7xrqXNHdTb6o4tWe2Ex+//EN3ifknyLIbX5f+kC31zEKHon5l9HDEwTQR1H8cg==" crossorigin="anonymous" referrerpolicy="no-referrer" />
    <style>
        html, body {
            margin: 0;
            padding: 0;
        }
        .markdown-body {
            padding: 50px 100px;
        }

        tr, td {
            color: var(--color-fg-default);
        }
    </style>
    </head>
    <body>
        <div class="markdown-body">${md.render(markdown)}</div>
    </body>
    </html>
    `
}

app.use(Static("./m3u"))

router.get("/", (ctx) => {
    const readme_p = path.resolve("m3u", "README.md")
    const back_readme_p = path.resolve("back", "README.md")

    ctx.body = markdownBody(readme_p, back_readme_p)
})

router.get("/list/:channel", (ctx) => {
    const list = ctx.params.channel
    const list_readme_p = path.resolve("m3u", "list", `${list}.md`)
    const back_list_readme_p = path.resolve("back", "list", `${list}.md`)

    ctx.body = markdownBody(list_readme_p, back_list_readme_p)
})

router.get("/check/:channel", async (ctx) => {
    const chan = ctx.params.channel

    if (!canIUseM3uFile(`${chan}.m3u`)) {
        ctx.status = 404
        return
    }

    if (!(await canIUseIPTVChecker())) {
        ctx.status = 403
        return
    }

    ctx.body = fs.readFileSync(path.resolve("public", "check.html")).toString()
})

router.get("/api/check", async (ctx) => {
    if (!(await canIUseIPTVChecker())) {
        ctx.status = 403
        return
    }

    const { url, timeout } = ctx.query
    if (!url) {
        ctx.status = 403
        return
    }

    try {
        const t = parseInt(timeout as string, 10)
        const res = await fetch(
            `${
                process.env.IPTV_CHECKER_URL
            }/check/url-is-available?url=${url}&timeout=${isNaN(t) ? -1 : t}`
        )

        ctx.status = res.status
        ctx.body = await res.text()
    } catch (e) {
        ctx.status = 500
        return
    }
})

app.use(router.routes())

app.listen(8080, () => {
    console.log("Serving at http://127.0.0.1:8080")
    console.log("If the network supports ipv6, visit http://[::1]:8080")
})
