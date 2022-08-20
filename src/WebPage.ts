import { Browser, Page } from 'puppeteer'
import { getElement, getElements, getLabels } from './Handlers/WebPageParsers'
import { focusElement, sendTextToElement } from './Handlers/WebPageActions'
import { init } from './Handlers/WebPageDefault'
import { start } from './Handlers/WebPageRunner'

export class WebPage {
    public browser: Browser
    public page: Page
    public targetButtons: string[][]

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
}
