import { Env } from '@/Env'
import { NavSequence, MappedFormElement, WebPage } from '@/WebPage'
import { sleep } from '@/Utils/Sleep'
import { WebElement } from '@/Meta/WebElement'
import { Page, Target } from 'puppeteer'
import { WebLabelElement } from './WebPageParsers'



function isInDomain(currentDomain: string, targetDomain: string): boolean {
    return targetDomain === '*' || currentDomain.includes(targetDomain)
}

async function isInNavSequence(page: Page, button: WebElement, sequence: NavSequence): Promise<boolean> {
    const attrName: string = sequence.parent_key
    const attrValue: string = await button.getAttribute(page, attrName)
    return attrValue && attrValue === sequence.parent_value
}

async function getNavSequence(webPage: WebPage, button: WebElement): Promise<Array<string>> {
    const page: Page = webPage.page
    const currentDomain: string = webPage.page.url().toLowerCase()

    for (const target of webPage.targetNavButtons) {
        if (isInDomain(currentDomain, target.domain) == false) {
            continue
        }

        for (const sequence of target.sequence) {
            if (isInNavSequence(page, button, sequence)) {
                return sequence.children
            }
        }
    }

    return []
}

async function handleNavButtons(webPage: WebPage) {
    const navButtons: Array<WebElement> = await webPage.getNavButtons()

    for (const button of navButtons) {
        if ((await webPage.focusElement(button)) == false) {
            return
        }

        button.init(webPage.page, ['id', 'innerText'], ['data-automation-id'])
        const sequence: Array<string> = await getNavSequence(webPage, button)

        for (let i = 0; i < sequence.length; i++) {
            const next: WebElement = await webPage.getElement(webPage.page, sequence[i], true)
            if ((await webPage.focusElement(next)) == false) {
                return
            }
        }
    }

    return
}

async function createEntry(webPage: WebPage, label: WebLabelElement){
    const mappedElements: Map<string, MappedFormElement> = webPage.mappedElements
    const question: string = label.text
    const forAttr: string = label.for

    if(mappedElements.has(forAttr) == false) {
        const value: MappedFormElement = { question: question, fields: [] }
        mappedElements.set(forAttr, value)
    }
}

async function addToEntry(webPage: WebPage, forAttr: string, inputField: WebElement) {
    const mappedElements: Map<string, MappedFormElement> = webPage.mappedElements
    if(forAttr && inputField) {
        const entry: MappedFormElement = mappedElements.get(forAttr)
        if(entry) {
            entry.fields.push(inputField)
        }
    }
}

async function mapWebPage(webPage: WebPage) {
    webPage.mappedElements.clear()

    const page = webPage.page

    const labels: Array<WebLabelElement> = await webPage.getLabels(page)
    const inputs: Array<WebElement> = await webPage.getElements(page, Env.INPUT_TAGS)
    const selectors: Array<WebElement> = await webPage.getElements(page, Env.BUTTON_TAGS)

    for (const label of labels) {
        createEntry(webPage, label)
        console.log("label: ", label)
    }

    for (const input of inputs) {
        let inputElementID: string = await input.getProperty('id')
        const propertyType: string = await input.getProperty('type')

        if(propertyType == 'radio'){
            const ancestor: WebElement = await input.getAncestorWithProperty("id")
            inputElementID = await ancestor.getProperty('id')
        }

        addToEntry(webPage, inputElementID, input)
    }

    for (const button of selectors) {
        const buttonElementID: string = await button.getProperty('id')
        addToEntry(webPage, buttonElementID, button)
    }
}

async function handleTextInputField(webPage: WebPage, inputField: WebElement, formElement: MappedFormElement) {
    const value: string = await inputField.getProperty("value")
    if(value !== '') {
        return
    }

    const question: string = formElement.question
    const answer: string = await webPage.getAnswer(question)

    switch(answer){
        case '':
            console.log('Unhandled Text Input Field: ', question)
        case '-ignored-input-fields':
            return
        default:
            // console.log(`Writing Text: ${question}=${answer}`)
            await webPage.sendTextToElement(inputField, answer)
            await sleep(10*answer.length)
            break
    }
}

async function handleRadioInputField(webPage: WebPage, inputField: WebElement, formElement: MappedFormElement) {
    const question: string = formElement.question
    const answer: string = await webPage.getAnswer(question)

    // console.log(await inputField.getProperty("innerText"))

}

async function handleInputFields(webPage: WebPage) {
    await mapWebPage(webPage)

    const mappedElements: Map<string, MappedFormElement> = webPage.mappedElements

    for(const [forAttr, formElement] of mappedElements){
        for(const field of formElement.fields){
            const type = await field.getProperty('type')
            switch(type){
                case 'text':
                    await handleTextInputField(webPage, field, formElement)
                    break
                case 'button':
                    break
                case 'radio':
                    await handleRadioInputField(webPage, field, formElement)
                    break
                default:
                    console.log("unhandled input field type: ", type)
            }
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
export async function start(this: WebPage, startURL: string) {
    let pageLifeCycleID: number = 0


    this.page.on('load', async () => {
        await waitTillHTMLRendered(this.page)
        
        const lifeCycleID = pageLifeCycleID++
        const currentURL: string = this.page.url()

        console.log(`[Life Cycle] Start (id: ${lifeCycleID})`)

        await handleNavButtons(this)

        while (currentURL === this.page.url()) {
            try {
                await handleInputFields(this)
                await sleep(500)
            } catch (e) {
                if(e.message !== 'Execution context was destroyed, most likely because of a navigation.'){
                    console.log(e)
                }
                break;
            }
        }

        console.log(`[Life Cycle] End   (id: ${lifeCycleID})`)
    })

    await this.page.goto(startURL, { waitUntil: 'networkidle0' })
}
