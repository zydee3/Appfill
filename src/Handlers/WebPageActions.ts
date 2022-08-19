import { ElementHandle, Page } from 'puppeteer'
import { WebPage } from '../WebPage'

export async function clickElement(this: WebPage, element: ElementHandle<Element>): Promise<boolean> {
    if (element) {
        element.click()
        return true
    }

    return false
}

export async function sendTextToElement(this: WebPage, formElement: ElementHandle<Element>, data: string) {
    if (!formElement || data == '') return
    await formElement.click()
    await this.page.keyboard.type(data)
}
