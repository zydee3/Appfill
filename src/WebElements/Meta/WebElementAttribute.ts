export enum WebElementAttribute {
    None            = "none",
    For             = "for",

    // workday attributes
    AriaChecked     = "aria-checked",
}

const isTargetEnum = async (current: string, target: string) => {
    return current === target || current === 'none'
}

export function getAttrByValue(target: string): WebElementAttribute {
    const keys: string[] = Object.keys(WebElementAttribute)
    const result: WebElementAttribute[] = (keys as WebElementAttribute[])
        .filter(key => isTargetEnum(WebElementAttribute[key], target));
    
    const none: WebElementAttribute = result[0]
    const prop: WebElementAttribute = result[1]

    return prop ? prop : none;
}