export enum WebElementProperty {
    None        = "none",
    ID          = "id",
    Type        = "type",
    InnerText   = "innerText",
    Value       = "value",
    TextContent = "textContent"
}

const isTargetEnum = async (current: string, target: string) => {
    return current === target || current === 'none'
}

export function getPropByValue(target: string): WebElementProperty{
    const keys: string[] = Object.keys(WebElementProperty)
    const result: WebElementProperty[] = (keys as WebElementProperty[])
        .filter(key => isTargetEnum(WebElementProperty[key], target));
    
    const none: WebElementProperty = result[0]
    const prop: WebElementProperty = result[1]

    return prop ? prop : none;
}