import { Browser, Page } from 'puppeteer'
import { getElement, getElements, getLabels, getNavButtons } from './Handlers/WebPageParsers'
import { focusElement, sendTextToElement } from './Handlers/WebPageActions'
import { init } from './Handlers/WebPageDefault'
import { start } from './Handlers/WebPageRunner'
import { WebElement } from './Meta/WebElement'

export type MappedFormElement = {
    question: string
    fields: Array<WebElement>
}

export type NavSequence = {
    parent_key: string
    parent_value: string
    children: Array<string>
}

export type NavButton = {
    domain: string
    sequence: Array<NavSequence>
}

export class WebPage {
    public browser: Browser
    public page: Page
    public targetNavButtons: Array<NavButton>
    public handledButtons: Set<string>


    /**
     * Stores parsed {@link MappedFormElement}. Key is 'for' attribute of the
     * element. Value is a question and an array of input fields or selections. 
     *
     * @public
     * @type {Map<string, MappedFormElement>}
     */
    public mappedElements: Map<string, MappedFormElement>

    // WebPage Defaults
    public init = init

    // WebPage Runner
    public start = start

    // WebPage Actions
    public focusElement = focusElement
    public sendTextToElement = sendTextToElement

    // WebPage Parsers
    public getElement = getElement
    public getElements = getElements
    public getLabels = getLabels
    public getNavButtons = getNavButtons
}
