import path from 'path'
import fs from 'fs/promises'

import { Env } from '@/Env'
import { WebPage } from '@/WebPage'
import puppeteer, { Page } from 'puppeteer'

/**
 * Initializes a single {@link Browser} instance and assigns it to {@link WebPage}.browser.
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
 * Initializes a single {@link Page} instance and assigns it to {@link WebPage}.page.
 *
 * @async
 * @param {WebPage} webPage instance of {@link WebPage}.
 * @returns {Promise<void>}
 */
async function setPage(webPage: WebPage) {
    const pages: Page[] = await webPage.browser.pages()
    const page: Page = pages[0]

    await page.setViewport({
        width: Env.WINDOW_WIDTH,
        height: Env.WINDOW_HEIGHT - 200,
    })

    webPage.page = page
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

    page.targetButtons = []

    for (const element of JSON.parse(selectors)) {
        page.targetButtons.push(element.target)
    }
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
    await setBrowser(this)
    await setPage(this)
    await setParams(this)
}
