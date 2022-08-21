import { Browser, Page } from 'puppeteer'
import { getElement, getElements, getLabels } from './Handlers/WebPageParsers'
import { focusElement, sendTextToElement } from './Handlers/WebPageActions'
import { init } from './Handlers/WebPageDefault'
import { checkState, start } from './Handlers/WebPageRunner'

export type NavSequence = {
    parent_key: string
    parent_value: string
    children: string[]
}

export type NavButton = {
    domain: string
    sequence_buttons: NavSequence[]
}

export class WebPage {
    public browser: Browser
    public page: Page
    public url: string
    public navButtons: NavButton[]

    // WebPage Defaults
    public init = init

    // WebPage Runner
    public start = start
    public checkState = checkState

    // WebPage Actions
    public focusElement = focusElement
    public sendTextToElement = sendTextToElement

    // WebPage Parsers
    public getElement = getElement
    public getElements = getElements
    public getLabels = getLabels
}
