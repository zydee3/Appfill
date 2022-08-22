import { WebElement } from '@/Meta/WebElement'
import { WebPage } from '../WebPage'

/**
 * Focuses an {@link Element} on the dom by clicking it.
 *
 * @export
 * @async
 * @param {WebPage} this binded instance of {@link WebPage}.
 * @param {ElementHandle<Element>} element {@link Element} to be focused on.
 * @returns {Promise<boolean>} true if the element was successfully clicked,
 * otherwise false.
 */
export async function focusElement(this: WebPage, element: WebElement): Promise<boolean> {
    if (element) {
        element.ref.click()
        return true
    }

    return false
}

/**
 * Sends data to a {@link document} {@link Element} by focusing it then sending
 * {@param data}.
 *
 * @export
 * @async
 * @param {WebPage} this binded instance of WebPage.
 * @param {ElementHandle<Element>} formElement {@link Element} to be typed to.
 * @param {string} data string to be typed into the input field.
 * @returns {Promise<boolean>} true if the element was successfully typed to,
 * otherwise false.
 */
export async function sendTextToElement(this: WebPage, formElement: WebElement, data: string): Promise<boolean> {
    if (await this.focusElement(formElement)) {
        await this.page.keyboard.type(data)
        return true
    }

    return false
}
