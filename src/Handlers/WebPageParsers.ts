import { Env } from '../Env'
import { ElementHandle, Page } from 'puppeteer'
import { WebElement } from '@/Meta/WebElement'

export async function getElement(ref: ElementHandle<Element> | Page, tag: string, shouldWait: boolean): Promise<WebElement> {
    const element: ElementHandle<Element> = shouldWait ? await ref.waitForSelector(tag) : await ref.$(tag)
    return ref ? new WebElement(element) : undefined
}

export async function getElements(page: Page, tag: string): Promise<WebElement[]> {
    const rawElements: ElementHandle<Element>[] = await page.$$(tag)
    return WebElement.fromSource(rawElements)
}

export async function getLabels(page: Page): Promise<{ question: string; for: string }[]> {
    return await page.$$eval(Env.LABEL_TAGS, (elements) =>
        elements.map((element) => ({ question: element.textContent, for: element.getAttribute('for') })),
    )
}
