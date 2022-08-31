import { Env } from "@/Env";
import { WebPage } from "@/WebPage";
import { ElementHandle } from "puppeteer";
import { WebElementAttribute } from "./Meta/WebElementAttribute";
import { WebElementProperty } from "./Meta/WebElementProperty";
import { WebTextBox } from "./WebTextBox";

export async function readFromPage(webPage: WebPage): Promise<Map<string, string>>{
    const labels: Map<string, string> = new Map()

    const elements: Array<ElementHandle<Element>> = await webPage.getElements(Env.LABEL_TAGS)

    const dummy: WebTextBox =  new WebTextBox(webPage, undefined)
    for(const element of elements) {
        dummy.element = element
        const targetFor: string = await dummy.getAttribute(WebElementAttribute.For)
        const textContent: string = await dummy.getProperty(WebElementProperty.TextContent)

        if(webPage.handledQuestions.has(targetFor)){
            continue
        }

        labels.set(targetFor, textContent)
    }

    return labels
}
