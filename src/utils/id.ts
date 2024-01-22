import { converter } from "../sources/utils"

export const get_channel_id = (extinf: string) => {
    const regExp = /\#EXTINF:-1([^,]*),(.*)/
    const name = converter(regExp.exec(extinf)![2])

    return name
        .replace(/\[([^\]]*)\]/g, "")
        .replace(/\(([^\)]*)\)/g, "")
        .replace(/（([^）]*)）/g, "")
        .replace(/「([^」]+)」/g, "")
        .replace(/\-/g, "")
        .replace(/\@\@[0-9]*/g, "")
        .replace(/Ⅰ/g, "")
        .replace(/ +/g, " ")
        .trim()
}
