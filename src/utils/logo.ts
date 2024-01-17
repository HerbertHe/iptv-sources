import { channels_logo } from "./const"

const is_fmml_logo_channel = (c: string) => channels_logo.includes(c)

export const with_fmml_logo_channel = (c: string) =>
    is_fmml_logo_channel(c)
        ? `https://live.fanmingming.com/tv/${c}.png`
        : is_fmml_logo_channel(c.toLowerCase())
        ? `https://live.fanmingming.com/tv/${c.toLowerCase()}.png`
        : void 0
