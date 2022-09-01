import { WebPage } from '@/WebPage'
import { waitTillHTMLRendered } from '@/Utils/Sleep'
import { WebNavButton } from '@/WebElements/WebNavButton'
import { WebTextBox } from '@/WebElements/WebTextBox'
import { WebDropDown } from '@/WebElements/WebDropDown'
import { WebRadio } from '@/WebElements/WebRadio'

async function handleRadios(webPage: WebPage, labels: Map<string, string>) {
    const radios: Array<WebRadio> = await WebRadio.matchFromPageAndLabels(webPage, labels)
    radios.forEach(async radio => await radio.handle())
}

async function handleTextBoxes(webPage: WebPage, labels: Map<string, string>) {
    const textBoxes: Array<WebTextBox> = await WebTextBox.readFromPage(webPage, labels)
    for(const textBox of textBoxes){
        await textBox.handle()
    }
}

async function handleDropDowns(webPage: WebPage, labels: Map<string, string>) {
    const dropDowns: Array<WebDropDown> = await WebDropDown.readFromPage(webPage, labels)
    for(const dropDown of dropDowns) {
        await dropDown.init()
        await dropDown.handle()
    }
}

async function handleNavButtons(webPage: WebPage) {
    const navButtons = await WebNavButton.readFromPage(webPage)
    for(const navButton of navButtons){
        await navButton.init()
        await navButton.handle();
    }
}

async function handlePage(webPage: WebPage) {
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
