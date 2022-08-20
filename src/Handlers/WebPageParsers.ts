import { Env } from '../Env'
import { ElementHandle, Page } from 'puppeteer'
import { WebElement } from '@/Meta/WebElement'

/**
 * Uses querySelector ($) to query the {@link  document} for a single {@link  Element} with {@param property}.
 *
 * @export
 * @async
 * @param {(ElementHandle<Element> | Page)} ref element to run {@link document.querySelector} on.
 * @param {string} tag property to be queried for.
 * @param {boolean} shouldWait determines if the function should block until the element is present in the dom.
 * @returns {Promise<WebElement>} queried {@link WebElement}, a wrapper for {@link ElementHandle}).
 */
export async function getElement(ref: ElementHandle<Element> | Page, tag: string, shouldWait: boolean): Promise<WebElement> {
    const element: ElementHandle<Element> = shouldWait ? await ref.waitForSelector(tag) : await ref.$(tag)
    return ref ? new WebElement(element) : undefined
}

/**
 * Uses querySelectorAll ($$) to query the {@link  document} for elements with {@param property}.
 *
 * @export
 * @async
 * @param {Page} page instance of {@link Page}.
 * @param {string} property tag property to be queried for.
 * @returns {Promise<WebElement[]>} queried WebElements, an array of a wrapper for {@link ElementHandle}).
 */
export async function getElements(page: Page, property: string): Promise<WebElement[]> {
    const rawElements: ElementHandle<Element>[] = await page.$$(property)
    return WebElement.fromSource(rawElements)
}

/**
 * Uses querySelectorAll ($$) to query the {@link  document} for {@link  Element}s with the "for" property.
 * The value of each "for" property from each document element queried are extracted and returned.
 *
 * @export
 * @async
 * @param {Page} pageinstance of {@link Page}.
 * @returns {Promise<{ text: string; for: string }[]>} an array of json objects containing the inner text
 * and "for" target of queiried elements containing the "for" attribute. An empty array is present if
 * no elements were found with the "for" attribute.
 */
export async function getLabels(page: Page): Promise<{ text: string; for: string }[]> {
    return await page.$$eval(Env.LABEL_TAGS, (elements) =>
        elements.map((element) => ({ text: element.textContent, for: element.getAttribute('for') })),
    )
}
