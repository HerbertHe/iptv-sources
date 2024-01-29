import { channels_logo } from "./const"

const is_fmml_logo_channel = (c: string) => channels_logo.includes(c)

/**
 * @deprecated 计划建立自己的 logo 库，等待移除
 * @param c 
 * @returns
 */
export const with_fmml_logo_channel = (c: string) =>
    is_fmml_logo_channel(c)
        ? `https://live.fanmingming.com/tv/${c}.png`
        : is_fmml_logo_channel(c.toLowerCase())
        ? `https://live.fanmingming.com/tv/${c.toLowerCase()}.png`
        : void 0
