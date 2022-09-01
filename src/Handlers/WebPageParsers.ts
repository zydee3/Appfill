import { ElementHandle } from 'puppeteer'
import { WebPage } from '@/WebPage'
import { WebTextBox } from '@/WebElements/WebTextBox'
import { WebElementAttribute } from '@/WebElements/Meta/WebElementAttribute'
import { WebElementProperty } from '@/WebElements/Meta/WebElementProperty'
import { Env } from '@/Env'

/**
 * Returns an element with the {@param tag} property or attribute.
 *
 * @export
 * @async
 * @param {WebPage} this Current binded instance of WebPage
 * @param {string} tag Property or attribute present in the element being
 * queried for.
 * @param {boolean} shouldWait True if wait for the element to be present before
 * returning, otherwise false.
 * @returns {Promise<ElementHandle<Element>>} Queried web element with the given
 * property or attribute {@param tag} if it is present, otherwise undefined.
 */
export async function getElement(this: WebPage, tag: string, shouldWait: boolean): Promise<ElementHandle<Element>> {   
    if(this.page) { 
        return shouldWait 
            ? await this.page.waitForSelector(tag) 
            : await this.page.$(tag)
    } else {
        return undefined
    }
}

/**
 * Returns an array of elements with the {@param tag} property or attribute.
 *
 * @export
 * @async
 * @param {WebPage} this Current binded instance of WebPage.
 * @param {string} tag Property or attribute present in the elements being
 * queried for.
 * @returns {Promise<Array<ElementHandle<Element>>>} Array of queried web 
 * elements with the given property or attribute {@param tag} if it is present, 
 * otherwise undefined..
 */
export async function getElements(this: WebPage, tag: string): Promise<Array<ElementHandle<Element>>> {
    if(this.page) { 
        return await this.page.$$(tag)
    } else {
        return undefined
    }
}

/**
 * Returns a map of all labels parsed from the current working instance of 
 * {@link Page}. The key and value is the 'for' attribute and 'innerText' 
 * property associated with each label found.
 *
 * @export
 * @async
 * @remarks innerText in this case represents the question asked by the
 * application for the applicant at each label / section for user input.
 * @param {WebPage} this Current binded instance of WebPage
 * @returns {Promise<Map<string, string>>} Map of 'for' attributes to 
 * 'innerText' properties.
 */
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
