import { Env } from '@/Env'
import { WebPage } from '@/WebPage'
import { sleep } from '@/Utils/Sleep'
import { WebElement } from '@/Meta/WebElement'
import { Page } from 'puppeteer'

async function getNavSequence(webPage: WebPage, button: WebElement): Promise<string[]> {
    const page: Page = webPage.page
    const current_domain: string = webPage.page.url().toLowerCase()

    for (const recordAutoButton of webPage.navButtons) {
        // only consider the button if it is within the correct domain
        const recordAutoButtonDomain: string = recordAutoButton.domain
        if (recordAutoButtonDomain !== '*' && !current_domain.includes(recordAutoButtonDomain)) continue

        // check all buttons to see if {@param button} matches the record.
        // if the button matches, it must be a navigation button so we handle
        // the sequence by clicking each button in the sequence one by one.
        for (const recordSequenceButton of recordAutoButton.sequence_buttons) {
            const recordParentKey: string = recordSequenceButton.parent_key
            const buttonAttribute: string = await button.getAttribute(page, recordParentKey)

            // if the attribute exists, we need to check the value (innerText)
            // if the value matches, the record matches the button and we return the children
            if (buttonAttribute && buttonAttribute === recordSequenceButton.parent_value) {
                return recordSequenceButton.children
            }
        }
    }

    return []
}

async function getNavButtons(webPage: WebPage, defaultProperties: string[], defaultAttributes: string[]): Promise<WebElement[]> {
    const page: Page = webPage.page
    const buttons: WebElement[] = await webPage.getElements(page, Env.NAV_TAGS)

    // todo: see if there is a more efficient solution. for
    // some reason some websites display the same button twice
    const handledButtons: Set<string> = new Set()
    const navButtons: WebElement[] = []

    for (const button of buttons) {
        const partiallyUniqueID = await button.getPartiallyUniqueID()

        if (handledButtons.has(partiallyUniqueID)) continue
        handledButtons.add(partiallyUniqueID)

        // load the properties and attributes in the event the reference held
        // by ElementHandle becomes invalid
        defaultProperties.forEach((property) => button.getProperty(property))
        defaultAttributes.forEach((attribute) => button.getAttribute(page, attribute))

        navButtons.push(button)
    }

    return navButtons
}

async function handleNavButtons(webPage: WebPage) {
    const defaultProperties = ['id', 'innerText']
    const defaultAttributes = ['data-automation-id']
    const navButtons: WebElement[] = await getNavButtons(webPage, defaultProperties, defaultAttributes)

    for (const button of navButtons) {
        if (!webPage.checkState()) return

        let wasButtonClicked: boolean = await webPage.focusElement(button)
        if (!wasButtonClicked || !webPage.checkState()) return

        const navSequence: string[] = await getNavSequence(webPage, button)
        for (let i = 0; i < navSequence.length; i++) {
            const nextElement = await webPage.getElement(webPage.page, navSequence[i], true)
            if (!nextElement) break

            wasButtonClicked = await webPage.focusElement(nextElement)
            if (!wasButtonClicked || !webPage.checkState()) break
        }
    }
}

/**
 * Parses the current webPage for input fields, labels, and buttons.
 * Matches all labels (questions) to buttons and text inputs then selects
 * (button) or types (text input) pre-defined responses parsed from @/data/form.json.
 *
 * Current buttons handled: raadio, checkbox, data, selection.
 *
 * @async
 * @param {WebPage} webPage instance of WebPage.
 * @returns {Promise<void>}
 */
async function parsePage(webPage: WebPage) {
    await handleNavButtons(webPage)
    if (!webPage.checkState()) return

    // for (const input of await webPage.getElements(page, Env.INPUT_TAGS)) {
    //     console.log('input id: ', await input.getProperty('id'))
    // }

    // for (const label of await webPage.getLabels(page)) {
    //     console.log(`question: ${label.text} for: ${label.for}`)
    // }

    // for (const button of await webPage.getElements(page, Env.INPUT_BUTTON_TAGS)) {
    //     console.log('button id: ', await button.getProperty('id'))
    // }
}

export function checkState(this: WebPage): boolean {
    const pageURL = this.page.url()
    if (this.url !== pageURL) {
        this.url = pageURL
        console.log('state updated')
        return false
    }

    return true
}

/**
 * Starts a service to continuously check the current page for dom elements
 * to be handled (filled, clicked). Service indefinitely blocks the thread.
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
