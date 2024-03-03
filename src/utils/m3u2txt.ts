export const m3u2txt = (m3uArray: string[]) => {
    let groups = new Map<string, string>()
    const channelRegExp = /\#EXTINF:-1([^,]*),(.*)/
    const groupRegExp = /group-title="([^"]*)"/

    for (let i = 1; i < m3uArray.length; i += 2) {
        const reg = channelRegExp.exec(m3uArray[i]) as RegExpExecArray
        const group = groupRegExp.exec(reg[1].trim())
        let g = ""

        if (!group) {
            g = "Undefined"
        } else {
            g = group[1].trim()
        }

        if (groups.has(g)) {
            groups.set(
                g,
                `${groups.get(g)}${reg[2].trim().replace(/\s+/g, "_")},${
                    m3uArray[i + 1]
                }\n`
            )
        } else {
            groups.set(
                g,
                `${reg[2].trim().replace(/\s+/g, "_")},${m3uArray[i + 1]}\n`
            )
        }
    }

    let txt = ""

    groups.forEach((v, k) => {
        txt += `${k},#genre#\n${v}\n`
    })

    return txt.substring(0, txt.length - 2)
}
