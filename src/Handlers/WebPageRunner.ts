import { Env } from '@/Env'
import { WebPage } from '@/WebPage'
import { sleep } from '@/Utils/Sleep'
import { Page } from 'puppeteer'

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
    const page: Page = webPage.page

    for (const input of await webPage.getElements(page, Env.INPUT_TAGS)) {
        console.log('input id: ', await input.getProperty('id'))
    }

    for (const label of await webPage.getLabels(page)) {
        console.log(`question: ${label.text} for: ${label.for}`)
    }

    for (const button of await webPage.getElements(page, Env.BUTTON_TAGS)) {
        console.log('button id: ', await button.getProperty('id'))
    }
}

/**
 * Description placeholder
 *
 * @async
 * @returns {*}
 */
async function checkButtons() {
    // for (const selectors of this.params.sequentialSelectors) {
    //     const firstElement = await getElement(this.page, { tag: selectors[0] })
    //     if ((await this.clickElement(firstElement)) == false) continue
    //     for (let nextIdx = 1; nextIdx < selectors.length; nextIdx++) {
    //         const nextElement = await getElement(this.page, { tag: selectors[nextIdx], shouldWait: true })
    //         if ((await this.clickElement(nextElement)) == false) break
    //     }
    // }
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
    while (true) {
        await parsePage(this)
        await sleep(Env.BASE_SLEEP_TIME)
    }
}
