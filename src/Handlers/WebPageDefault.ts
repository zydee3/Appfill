import path from 'path'
import fs from 'fs/promises'
import { Env } from '@/Env'
import { WebPage } from '@/WebPage'
import puppeteer, { Page } from 'puppeteer'
import { MultiKeyMap } from '@/Utils/MultiKeyMap'

/**
 * Initializes a single {@link Browser} instance and assigns it to
 * {@link WebPage}.browser.
 *
 * @async
 * @param {WebPage} page instance of {@link WebPage}.
 * @returns {Promise<void>}
 */
async function setBrowser(page: WebPage) {
    page.browser = await puppeteer.launch({
        args: [`--window-size=${Env.WINDOW_WIDTH},${Env.WINDOW_HEIGHT}`],
        ignoreHTTPSErrors: true,
        headless: false,
    })
}

/**
 * Initializes a single {@link Page} instance and assigns it to
 * {@link WebPage}.page.
 *
 * @async
 * @param {WebPage} webPage instance of {@link WebPage}.
 * @returns {Promise<void>}
 */
async function setPage(webPage: WebPage) {
    const pages: Array<Page> = await webPage.browser.pages()
    const page: Page = pages[0]

    await page.setViewport({
        width: Env.WINDOW_WIDTH,
        height: Env.WINDOW_HEIGHT - 200,
    })

    webPage.page = page
}


export type InputFormQA = {
    question: Array<string>,
    answer: string
}


/**
 * Loads all associated JSON data.
 *
 * @async
 * @param {WebPage} page instance of {@link WebPage}.
 * @returns {Promise<void>}
 */
async function setParams(page: WebPage) {
    const selPath: string = path.join(process.cwd(), 'data/button-targets.json')
    const selectors: string = await fs.readFile(selPath, { encoding: 'utf-8' })

    page.targetNavButtons = []
    for (const targetButton of JSON.parse(selectors)) {
        page.targetNavButtons.push(targetButton)
    }

    

    const loadQA = async() => {
        const filePath: string = path.join(process.cwd(), 'data/form-data.json')
        const data: string = await fs.readFile(filePath, { encoding: 'utf-8' })

        for(const entry of JSON.parse(data)){
            const questions: Array<string> = entry.question
            const answer: string = entry.answer

            for(const question of questions) {
                page.mappedQA.add(question, answer)
            }
        }
    }

    loadQA()
}

/**
 * Initializes all members of {@link WebPage}.
 *
 * @export
 * @async
 * @param {WebPage} this binded instance of {@link WebPage}.
 * @returns {Promise<void>}
 */
export async function init(this: WebPage): Promise<void> {
    this.lifeCycleID = 0
    this.ignoredExceptions = new Set<string>()
    this.handledButtons = new Set<string>()
    this.handledQuestions = new Set<string>()
    this.mappedQA = new MultiKeyMap<string, string>()

    await setBrowser(this)
    await setPage(this)
    await setParams(this)
    
    this.ignoredExceptions.add('Execution context was destroyed, most likely because of a navigation.')
}
