export const trimAny = (any: any) => {
    if (Array.isArray(any)) {
        return any.map((a: any) => {
            if (typeof a === "string") {
                return a.trim()
            }

            if (typeof a === "object") {
                return trimAny(a)
            }
        })
    }

    if (typeof any === "object") {
        return Object.fromEntries(
            Object.entries(any).map(([key, value]) => {
                if (typeof value === "string") {
                    return [key, value.trim()]
                }

                if (typeof value === "object") {
                    return [key, trimAny(value)]
                }
            })
        )
    }

    if (typeof any === "string") {
        return any.trim()
    }

    return any
}
