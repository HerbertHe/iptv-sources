export interface ICustomRuleAppend {
    name: string
    url: string
    extinf?: string
}

export interface ICustomRuleReplacerItem {
    pattern: string
    type: "string" | "regexp"
    flags?: string
    target: string
}

export interface ICustomRuleReplacer {
    extinf?: ICustomRuleReplacerItem[]
    url?: ICustomRuleReplacerItem[]
}

export interface ICustomRule {
    upstream: string
    exclude?: string[]
    include?: string[]
    append?: ICustomRuleAppend[]
    replacer?: ICustomRuleReplacer
}

export interface ICustom {
    rules: ICustomRule[]
}
