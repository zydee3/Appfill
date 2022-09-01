import { ElementHandle } from 'puppeteer'
import { WebPage } from '@/WebPage'
import { WebTextBox } from '@/WebElements/WebTextBox'
import { WebElementAttribute } from '@/WebElements/Meta/WebElementAttribute'
import { WebElementProperty } from '@/WebElements/Meta/WebElementProperty'
import { Env } from '@/Env'

export async function getElement(this: WebPage, tag: string, shouldWait: boolean): Promise<ElementHandle<Element>> {   
    if(this.page) { 
        return shouldWait 
            ? await this.page.waitForSelector(tag) 
            : await this.page.$(tag)
    } else {
        return undefined
    }
}

export async function getElements(this: WebPage, tag: string): Promise<Array<ElementHandle<Element>>> {
    if(this.page) { 
        return await this.page.$$(tag)
    } else {
        return undefined
    }
}

export async function getLabels(this: WebPage): Promise<Map<string, string>>{
    const labels: Map<string, string> = new Map()

    const elements: Array<ElementHandle<Element>> = await this.getElements(Env.LABEL_TAGS)

    const dummy: WebTextBox =  new WebTextBox(this, undefined)
    for(const element of elements) {
        dummy.element = element
        const targetFor: string = await dummy.getAttribute(WebElementAttribute.For)
        const textContent: string = await dummy.getProperty(WebElementProperty.TextContent)

        if(this.handledQuestions.has(targetFor)){
            continue
        }

        labels.set(targetFor, textContent)
    }

    return labels
}
