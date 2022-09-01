import { WebPage } from '@/WebPage'
import { waitTillHTMLRendered } from '@/Utils/Sleep'
import { WebNavButton } from '@/WebElements/WebNavButton'
import { WebTextBox } from '@/WebElements/WebTextBox'
import { WebDropDown } from '@/WebElements/WebDropDown'
import { WebRadio } from '@/WebElements/WebRadio'

/**
 * Reads from {@link Page} and handles all radio element groups.
 *
 * @async
 * @param {WebPage} webPage Current working instance of {@link WebPage}.
 * @param {Map<string, string>} labels Matched labels read from {@link Page}. 
 * @returns {Promise<void>}
 */
async function handleRadios(webPage: WebPage, labels: Map<string, string>): Promise<void> {
    const radios: Array<WebRadio> = await WebRadio.matchFromPageAndLabels(webPage, labels)
    radios.forEach(async radio => await radio.handle())
}

/**
 * Reads from {@link Page} and handles all text box elements.
 *
 * @async
 * @param {WebPage} webPage Current working instance of {@link WebPage}.
 * @param {Map<string, string>} labels Matched labels read from {@link Page}. 
 * @returns {Promise<void>}
 */
async function handleTextBoxes(webPage: WebPage, labels: Map<string, string>): Promise<void> {
    const textBoxes: Array<WebTextBox> = await WebTextBox.readFromPage(webPage, labels)
    for(const textBox of textBoxes){
        await textBox.handle()
    }
}

/**
 * Reads from {@link Page} and handles all drop down groups.
 *
 * @async
 * @param {WebPage} webPage Current working instance of {@link WebPage}.
 * @param {Map<string, string>} labels Matched labels read from {@link Page}. 
 * @returns {Promise<void>}
 */
async function handleDropDowns(webPage: WebPage, labels: Map<string, string>): Promise<void> {
    const dropDowns: Array<WebDropDown> = await WebDropDown.readFromPage(webPage, labels)
    for(const dropDown of dropDowns) {
        await dropDown.init()
        await dropDown.handle()
    }
}

/**
 * Reads from {@link Page} and handles all navigation button elements.
 *
 * @async
 * @param {WebPage} webPage Current working instance of {@link WebPage}.
 * @returns {Promise<void>}
 */
async function handleNavButtons(webPage: WebPage): Promise<void> {
    const navButtons = await WebNavButton.readFromPage(webPage)
    for(const navButton of navButtons){
        await navButton.init()
        await navButton.handle();
    }
}

/**
 * Handles all user interactable entities parsed from the current working 
 * instance of {@link Page} of {@link WebPage}.
 *
 * @async
 * @param {WebPage} webPage Current working instance of {@link WebPage}.
 * @returns {Promise<void>}
 */
async function handlePage(webPage: WebPage): Promise<void> {
    const currentURL: string = webPage.page.url()
    webPage.handledQuestions.clear()

    await handleNavButtons(webPage)

    while (currentURL === webPage.page.url() ) {
        const labels: Map<string, string> = await webPage.getLabels()
        handleRadios(webPage, labels)
        await handleTextBoxes(webPage, labels)
        await handleDropDowns(webPage, labels)
    }
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
export async function start(this: WebPage, startURL: string): Promise<void> {
    this.page.on('load', async () => {
        try {
            await waitTillHTMLRendered(this.page)
            const currentLifeCycleID = this.lifeCycleID++
            console.log(`[Life Cycle] Start (id: ${currentLifeCycleID})`)
            await handlePage(this)
            console.log(`[Life Cycle] End   (id: ${currentLifeCycleID})`)
        } catch (exception){
            console.log(exception)
        }    
    })

    await this.page.goto(startURL, { waitUntil: 'networkidle0' })
}
