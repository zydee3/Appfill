import { Env } from "@/Env";
import { WebPage } from "@/WebPage";
import { ElementHandle } from "puppeteer";
import { WebTextBox } from "./WebTextBox";

export async function readFromPage(webPage: WebPage): Promise<Map<string, string>>{
    const labels: Map<string, string> = new Map()

    const elements: Array<ElementHandle<Element>> = await webPage.getElements(Env.LABEL_TAGS)

    const dummy: WebTextBox =  new WebTextBox(webPage, undefined)
    for(const element of elements) {
        dummy.element = element
        const targetFor: string = await dummy.getAttribute('for')
        const textContent: string = await dummy.getProperty('textContent')

        if(webPage.handledQuestions.has(targetFor)){
            continue
        }

        labels.set(targetFor, textContent)
    }

    return labels
}
