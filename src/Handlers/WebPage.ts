import { Browser, Page } from 'puppeteer'
import { getElement, getElements, getLabels } from './WebPageParsers'
import { init } from './WebPageDefault'
import { start } from './WebPageRunner'
import { MultiKeyMap } from '../Utils/MultiKeyMap'

export type NavSequence = {
    parent_key: string
    parent_value: string
    waitForNavigation: boolean,
    children: Array<string>
}

export type NavButton = {
    domain: string
    sequence: Array<NavSequence>
}

export class WebPage {
    public browser: Browser
    public page: Page
    public lifeCycleID: number
    public numEduEntered: number
    public handledQuestions: Set<string>
    public handledButtons: Set<string>
    public targetNavButtons: Array<NavButton>
    public mappedQA: MultiKeyMap<string, string>

    // WebPage Defaults
    public init = init

    // WebPage Runner
    public start = start

    // WebPage Parsers
    public getElement = getElement
    public getElements = getElements
    public getLabels = getLabels
}
