import { converter } from "../sources/utils"

export const get_channel_id = (extinf: string) => {
    const regExp = /\#EXTINF:-1([^,]*),(.*)/
    const name = converter(regExp.exec(extinf)![2]).toLowerCase()

    return name
        .replace(/\[([^\]]*)\]/g, "")
        .replace(/\(([^\)]*)\)/g, "")
        .replace(/（([^）]*)）/g, "")
        .replace(/「([^」]+)」/g, "")
        .replace(/\-/g, "")
        .replace(/\@\@[0-9]*/g, "")
        .replace(/Ⅰ/g, "")
        .replace(/ 8m/g, "")
        .replace(/([^\|]+)\|/g, "")
        .replace(/([^ⅰ]+)ⅰ/g, "")
        .replace(/([\u4e00-\u9fff]+)\s+([\u4e00-\u9fff]+)/g, "$1$2")
        .replace(/ +/g, " ")
        .trim()
}
