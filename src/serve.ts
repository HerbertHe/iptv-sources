import fs from "fs"
import path from "path"

import Koa from "koa"
import { default as Static } from "koa-static"
import Router from "koa-router"
import MarkdownIt from "markdown-it"

const app = new Koa()
const router = new Router()

app.use(Static("./m3u"))

router.get("/", (ctx) => {
    const markdown = fs
        .readFileSync(path.resolve("m3u", "README.md"))
        .toString()
    const md = new MarkdownIt({ html: true })
    ctx.body = `
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
})

app.use(router.routes())

app.listen(8080, () => {
    console.log("Serving at http://127.0.0.1:8080")
})
