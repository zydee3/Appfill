import { Env } from '../Env'
import { ElementHandle, Page } from 'puppeteer'
import { WebElement } from '@/Meta/WebElement'
import { WebPage } from '@/WebPage'

export type WebLabelElement = {
    text: string
    for: string
}

/**
 * Uses querySelector ($) to query the {@link  document} for a single
 * {@link  Element} with {@param property}.
 *
 * @export
 * @async
 * @param {(ElementHandle<Element> | Page)} ref element to run
 * {@link document.querySelector} on.
 * @param {string} tag property to be queried for.
 * @param {boolean} shouldWait determines if the function should block until the
 * element is present in the dom.
 * @returns {Promise<WebElement>} queried {@link WebElement}, a wrapper for
 * {@link ElementHandle}).
 */
export async function getElement(ref: ElementHandle<Element> | Page, tag: string, shouldWait: boolean): Promise<WebElement> {
    const element: ElementHandle<Element> = shouldWait 
        ? await ref.waitForSelector(tag) 
        : await ref.$(tag)
    return ref 
        ? new WebElement(element) 
        : undefined
}

/**
 * Uses querySelectorAll ($$) to query the {@link  document} for elements with
 * {@param property}.
 *
 * @export
 * @async
 * @param {Page} page instance of {@link Page}.
 * @param {string} property tag property to be queried for.
 * @returns {Promise<Array<WebElement>>} queried WebElements, an array of a
 * wrapper
 * for {@link ElementHandle}).
 */
export async function getElements(page: Page, property: string): Promise<Array<WebElement>> {
    const rawElements: Array<ElementHandle<Element>> = await page.$$(property)
    return WebElement.fromSource(rawElements)
}

/**
 * Uses querySelectorAll ($$) to query the {@link  document} for
 * {@link  Element}s with the "for" property. The value of each "for" property
 * from each document element queried are extracted and returned.
 *
 * @export
 * @async
 * @param {Page} pageinstance of {@link Page}.
 * @returns {Promise<Array<WebLabelElement>>} an array of json objects
 * containing the inner text and "for" target of queiried elements containing
 * the "for" attribute. An empty array is present if no elements were found with
 * the "for" attribute.
 */
export async function getLabels(page: Page): Promise<Array<WebLabelElement>> {
    return await page.$$eval(Env.LABEL_TAGS, (elements) =>
        elements.map((element) => ({
            text: element.textContent,
            for: element.getAttribute('for'),
        })),
    )
}

async function wasButtonHandled(handledButtons: Set<string>, button: WebElement): Promise<boolean> {
    const partiallyUniqueID = await button.getPartiallyUniqueID()
    if (handledButtons.has(partiallyUniqueID)) {
        return true
    } else {
        handledButtons.add(partiallyUniqueID)
        return false
    }
}

export async function getNavButtons(this: WebPage): Promise<Array<WebElement>> {
    const page: Page = this.page
    const navButtons: Array<WebElement> = []
    const buttons: Array<WebElement> = await this.getElements(page, Env.NAV_TAGS)
    this.handledButtons.clear()

    for (const button of buttons) {
        if (await wasButtonHandled(this.handledButtons, button)) {
            continue
        }

        navButtons.push(button)
    }

    return navButtons
}
