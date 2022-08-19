import { sleep } from './Utils/Sleep'
import { Browser, ElementHandle, Page } from 'puppeteer'
import { getElement, getElements, getLabels } from './Handlers/WebPageParsers'
import { clickElement, sendTextToElement } from './Handlers/WebPageActions'
import { init } from './Handlers/WebPageDefault'
import { start } from './Handlers/WebPageRunner'

interface IWebPageOptions {
    baseURL: string
}

export interface IPageElementOptions {
    tag: string
    shouldWait?: boolean
    shouldClick?: boolean
}

export const DEFAULT_ELEMENT_OPTIONS: Partial<IPageElementOptions> = { shouldClick: false, shouldWait: false }

export class WebPage {
    public browser: Browser
    public page: Page
    public sequentialSelectors: string[][]

    // WebPage Defaults
    public init = init

    // WebPage Runner
    public start = start

    // WebPage Actions
    public clickElement = clickElement
    public sendTextToElement = sendTextToElement

    // WebPage Parsers
    public getElement = getElement
    public getElements = getElements
    public getLabels = getLabels
}
