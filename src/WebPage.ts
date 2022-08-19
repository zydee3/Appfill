import { sleep } from './Utils/Sleep'
import { Browser, ElementHandle, Page } from 'puppeteer'
import { readInputFields } from './Handlers/WebPageParsers'
import { clickElement, sendTextToElement } from './Handlers/WebPageActions'
import { init, setBrowser, setPage, setParams } from './Handlers/WebPageDefault'
import { checkForms, checkButtons } from './Handlers/WebPageRunner'

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
    public setBrowser = setBrowser
    public setPage = setPage
    public setParams = setParams

    // WebPage Runner
    public checkForms = checkForms
    public checkButtons = checkButtons

    // WebPage Actions
    public clickElement = clickElement
    public sendTextToElement = sendTextToElement

    // WebPage
    public readInputFields = readInputFields
}
