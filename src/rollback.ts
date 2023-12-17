import { filter } from "./sources"

export const updateByRollback = async (
    f_name: string,
    sr_filter?: (raw: string) => [string, number]
): Promise<[string, number] | undefined> => {
    const res = await fetch(`https://m3u.ibert.me/${f_name}.m3u`)
    const status = res.status
    if (/^[2]/.test(status.toString())) {
        const text = await res.text()
        return !!sr_filter ? sr_filter(text as string) : filter(text as string)
    } else {
        return undefined
    }
}
