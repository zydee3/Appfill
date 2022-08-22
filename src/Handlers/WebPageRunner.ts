import { Env } from '@/Env'
import { WebPage } from '@/WebPage'
import { sleep } from '@/Utils/Sleep'
import { WebElement } from '@/Meta/WebElement'
import { Page } from 'puppeteer'

type MappedFormElement = {
    question: string
    fields: Array<WebElement>
}

async function getNavSequence(webPage: WebPage, button: WebElement): Promise<Array<string>> {
    const page: Page = webPage.page
    const current_domain: string = webPage.page.url().toLowerCase()

    for (const buttonRecord of webPage.navButtons) {
        // only consider the button if it is within the correct domain
        const domain: string = buttonRecord.domain
        if (domain !== '*' && !current_domain.includes(domain)) continue

        // check all buttons to see if {@param button} matches the record.
        // if the button matches, it must be a navigation button so we handle
        // the sequence by clicking each button in the sequence one by one.
        for (const sequence of buttonRecord.sequence_buttons) {
            const key: string = sequence.parent_key
            const value: string = await button.getAttribute(page, key)

            // if the attribute exists, we need to check the value (innerText)
            // if the value matches the button record, we return the children
            if (value && value === sequence.parent_value) {
                return sequence.children
            }
        }
    }

    return []
}

async function getNavButtons(webPage: WebPage, props: Array<string>, attr: Array<string>): Promise<Array<WebElement>> {
    const page: Page = webPage.page
    const buttons: Array<WebElement> = await webPage.getElements(page, Env.NAV_TAGS)

    // todo: see if there is a more efficient solution. for
    // some reason some websites display the same button twice
    const handledButtons: Set<string> = new Set()
    const navButtons: Array<WebElement> = []

    for (const button of buttons) {
        const partiallyUniqueID = await button.getPartiallyUniqueID()

        if (handledButtons.has(partiallyUniqueID)) continue
        handledButtons.add(partiallyUniqueID)

        // load the properties and attributes in the event the reference held
        // by ElementHandle becomes invalid
        props.forEach((property) => button.getProperty(property))
        attr.forEach((attribute) => button.getAttribute(page, attribute))

        navButtons.push(button)
    }

    return navButtons
}

async function handleNavButtons(webPage: WebPage): Promise<boolean> {
    const defaultProperties = ['id', 'innerText']
    const defaultAttributes = ['data-automation-id']
    const navButtons: Array<WebElement> = await getNavButtons(webPage, defaultProperties, defaultAttributes)

    for (const button of navButtons) {
        let wasButtonClicked: boolean = await webPage.focusElement(button)
        if (!wasButtonClicked || webPage.hasURLChanged()) return true

        const navSequence: Array<string> = await getNavSequence(webPage, button)
        for (let i = 0; i < navSequence.length; i++) {
            const nextElement = await webPage.getElement(webPage.page, navSequence[i], true)
            if (!nextElement) break

            wasButtonClicked = await webPage.focusElement(nextElement)
            if (!wasButtonClicked || webPage.hasURLChanged()) return true
        }
    }

    return false
}

async function getMappedPage(webPage: WebPage): Promise<Map<string, MappedFormElement>> {
    const entries = new Map<string, MappedFormElement>()

    function insertEntry(target: string, question: string, field: WebElement) {
        if (!entries.has(target)) {
        }
    }

    const page = webPage.page
    const selectors = await webPage.getElements(page, Env.BUTTON_TAGS)
    const labels = await webPage.getLabels(page)
    const inputs: Array<WebElement> = await webPage.getElements(page, Env.INPUT_TAGS)

    // for (const input of await webPage.getElements(webPage.page, Env.INPUT_TAGS)) {
    //     console.log('input id: ', await input.getProperty('id'))
    // }

    // for (const label of await webPage.getLabels(page)) {
    //     console.log(`question: ${label.text} for: ${label.for}`)
    // }

    // for (const button of await webPage.getElements(page, Env.INPUT_BUTTON_TAGS)) {
    //     console.log('button id: ', await button.getProperty('id'))
    // }

    return entries
}

/**
 * Parses the current webPage for input fields, labels, and buttons. Matches all
 * labels (questions) to buttons and text inputs then selects (button) or types
 * (text input) pre-defined responses parsed from @/data/form.json.
 *
 * Current buttons handled: raadio, checkbox, data, selection.
 *
 * @async
 * @param {WebPage} webPage instance of WebPage.
 * @returns {Promise<void>}
 */
async function parsePage(webPage: WebPage) {
    // if the url has changed, then we move on to the next iteration so we can
    // check the navigation buttons on that page before parsing anything else
    if (await handleNavButtons(webPage)) return

    // if the function reaches this point, we assume all values scraped remain
    // valid since we have completed all possible navigations.
    const mappedFormElement: Map<string, MappedFormElement> = await getMappedPage(webPage)
}

export function hasURLChanged(this: WebPage): boolean {
    const pageURL = this.page.url()
    if (this.url !== pageURL) {
        this.url = pageURL
        return true
    }

    return false
}

/**
 * Starts a service to continuously check the current page for dom elements to
 * be handled (filled, clicked). Service indefinitely blocks the thread.
 *
 * @export
 * @async
 * @param {WebPage} this binded instance of WebPage
 * @param {string} startURL the website first loaded when chrome is opened.
 * @returns {Promise<void>}
 */
export async function start(this: WebPage, startURL: string) {
    await this.page.goto(startURL, { waitUntil: 'networkidle0' })
    this.url = startURL

    while (true) {
        await parsePage(this)
        await sleep(Env.BASE_SLEEP_TIME)
    }
}
