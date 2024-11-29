import { collectM3uSource } from "../utils"
import { handle_m3u, ISource, type TSources } from "./utils"

export const cymz6_lives_filter: ISource["filter"] = (
  raw,
  caller,
  collectFn
): [string, number] => {
  const rawArray = handle_m3u(raw)

  if (caller === "normal" && collectFn) {
    for (let i = 1; i < rawArray.length; i += 2) {
      collectM3uSource(rawArray[i], rawArray[i + 1], collectFn)
    }
  }

  return [rawArray.join("\n"), (rawArray.length - 1) / 2]
}

export const cymz6_lives_sources: TSources = [
  {
    name: "cymz6/AutoIPTV-Hotel lives",
    f_name: "cymz6_lives",
    url: "https://raw.githubusercontent.com/cymz6/AutoIPTV-Hotel/main/lives.m3u",
    filter: cymz6_lives_filter,
  },
]
