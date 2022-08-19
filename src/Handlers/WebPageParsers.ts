import { Env } from '../Env'
import { ElementHandle, Page } from 'puppeteer'
import { WebElement } from '@/Meta/WebElement'
import { WebPage } from '@/WebPage'

export async function getElementByTag(ref: ElementHandle<Element> | Page, tag: string, shouldWait: boolean): Promise<WebElement> {
    const element: ElementHandle<Element> = shouldWait ? await ref.waitForSelector(tag) : await ref.$(tag)
    return ref ? new WebElement(element) : undefined
}

// export async function getElementsByAttr(page: Page, attr: string): Promise<WebElement[]> {
//     const elements = await page.$$eval(attr, (element) => element)
//     const webElements = []

//     for (const element of elements) {
//         element.children
//     }
// }

export async function readInputFields(this: WebPage): Promise<Map<string, ElementHandle<Element>[]>> {
    const rawInputs: ElementHandle<Element>[] = await this.page.$$(Env.INPUT_TAGS)
    const webInputs: WebElement[] = WebElement.fromSource(rawInputs)

    const webLabels: { question: string; for: string }[] = await this.page.$$eval(Env.LABEL_TAGS, (elements) =>
        elements.map((element) => ({ question: element.textContent, for: element.getAttribute('for') })),
    )

    const rawButtons: ElementHandle<Element>[] = await this.page.$$(Env.BUTTON_TAGS)
    const webButtons: WebElement[] = WebElement.fromSource(rawButtons)

    this.page.$

    for (const input of webInputs) {
        console.log('input id: ', await input.getProperty('id'))
    }

    for (const label of webLabels) {
        console.log(`question: ${label.question} for: ${label.for}`)
    }

    for (const button of webButtons) {
        console.log('button id: ', await button.getProperty('id'))
    }

    return undefined
}
