export const get_channel_id = (extinf: string) => {
    const regExp = /\#EXTINF:-1([^,]*),(.*)/
    const name = regExp.exec(extinf)![2]

    return name
        .replace(/\[([^\]]*)\]/g, "")
        .replace(/\(([^\)]*)\)/g, "")
        .replace(/\-/g, "")
        .replace(/\@\@[0-9]*/g, "")
        .replace(/ +/g, "")
        .trim()
}
