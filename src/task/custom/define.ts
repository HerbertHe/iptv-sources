export interface ICustomRuleAppend {
    name: string
    url: string
    extinf?: string
}

export interface ICustomRule {
    upstream: string
    exclude?: string[]
    include?: string[]
    append?: ICustomRuleAppend[]
}

export interface ICustom {
    rules: ICustomRule[]
}
