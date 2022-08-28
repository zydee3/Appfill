import { WebPage } from '@/WebPage'
import { sleep } from '@/Utils/Sleep'
import { WebNavButton } from '@/WebElements/WebNavButton'
import { WebTextBox } from '@/WebElements/WebTextBox'
import { WebDropDown } from '@/WebElements/WebDropDown'
import * as WebLabel from  '@/WebElements/WebLabel'
import { WebRadio } from '@/WebElements/WebRadio'


async function handleInputFields(webPage: WebPage) {
    const handleRadios = async () => {
        const radios: Array<WebRadio> = await WebRadio.matchFromPageAndLabels(webPage, labeledQuestions)
        radios.forEach(async radio => {
            await radio.handle()
        })
    }

    const handleTextBoxes = async() => {
        const textBoxes: Array<WebTextBox> = await WebTextBox.readFromPage(webPage, labeledQuestions)
        for(const textBox of textBoxes){
            await textBox.handle()
        }
    }

    const handleDropDowns = async() => {
        const dropDowns: Array<WebDropDown> = await WebDropDown.readFromPage(webPage, labeledQuestions)
        for(const dropDown of dropDowns) {
            await dropDown.init()
            await dropDown.handle()
            await sleep(500)
        }
    }

    const labeledQuestions: Map<string, string> = await WebLabel.readFromPage(webPage)
        
    // const selections for dropdowns: Array<ElementHandle<Element>>
    //      foreach selection in selections, add to dropDown.options <- make this a member of dropdowns  

    handleRadios()
    await handleTextBoxes()
    await handleDropDowns()
}

async function handleNavButtons(webPage: WebPage) {
    const navButtons = await WebNavButton.readFromPage(webPage)
    for(const navButton of navButtons){
        await navButton.init()
        await navButton.handle();
    }
}

async function handlePage(webPage: WebPage, currentLifeCycleID: number) {
    const currentURL: string = webPage.page.url()
    webPage.handledQuestions.clear()

    await handleNavButtons(webPage)

    while (currentURL === webPage.page.url() ) {
        try {
            await handleInputFields(webPage)
            // await sleep(500)
        } catch (e) {
            if(webPage.ignoredExceptions.has(e.message) == false) {
                console.log(e.message, e)
            }
            break;
        }
    }
}

// taken from https://stackoverflow.com/questions/52497252/puppeteer-wait-until-page-is-completely-loaded
const waitTillHTMLRendered = async (page, timeout = 30000) => {
    const checkDurationMsecs = 250
    const maxChecks = timeout / checkDurationMsecs
    let lastHTMLSize = 0
    let checkCounts = 1
    let countStableSizeIterations = 0
    const minStableSizeIterations = 4

    while (checkCounts++ <= maxChecks) {
        let html = await page.content()
        let currentHTMLSize = html.length

        if (lastHTMLSize != 0 && currentHTMLSize == lastHTMLSize) {
            countStableSizeIterations++
        } else {
            countStableSizeIterations = 0 //reset the counter
        }

        if (countStableSizeIterations >= minStableSizeIterations) {
            break
        }

        lastHTMLSize = currentHTMLSize
        await page.waitForTimeout(checkDurationMsecs)
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
        await waitTillHTMLRendered(this.page)
        
        const currentLifeCycleID = this.lifeCycleID++
        
        console.log(`[Life Cycle] Start (id: ${currentLifeCycleID})`)
        
        await handlePage(this, currentLifeCycleID)
        
        console.log(`[Life Cycle] End   (id: ${currentLifeCycleID})`)
    })

    await this.page.goto(startURL, { waitUntil: 'networkidle0' })
}
