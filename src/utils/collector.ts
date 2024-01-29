import { get_channel_id } from "./id"

export const Collector = (
    keyFilter?: (k: string) => boolean,
    valueFilter?: (v: string) => boolean
) => {
    let data = new Map<string, string[]>()

    return {
        collect: (k: string, v: string) => {
            if (!!keyFilter && keyFilter(k)) {
                return
            }

            if (!!valueFilter && valueFilter(v)) {
                return
            }

            if (data.has(k)) {
                const vb = data.get(k)
                if (!vb) {
                    data.set(k, [v])
                    return
                }

                if (!vb.includes(v)) {
                    data.set(k, [...vb, v])
                    return
                }
            } else {
                data.set(k, [v])
            }
        },
        result: () => {
            return data
        },
    }
}

export const collectM3uSource = (
    extinf: string,
    url: string,
    fn: (k: string, v: string) => void
) => {
    const id = get_channel_id(extinf)
    fn(id, url)
}
