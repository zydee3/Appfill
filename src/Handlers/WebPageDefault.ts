import path from 'path'
import fs from 'fs/promises'

import { Env } from '@/Env'
import { WebPage } from '@/WebPage'
import puppeteer, { Page } from 'puppeteer'

export interface IWebPageOptions {
    baseURL: string
}

async function setBrowser(page: WebPage) {
    page.browser = await puppeteer.launch({
        args: [`--window-size=${Env.WINDOW_WIDTH},${Env.WINDOW_HEIGHT}`],
        ignoreHTTPSErrors: true,
        headless: false,
    })
}

async function setPage(webPage: WebPage) {
    const pages: Page[] = await webPage.browser.pages()
    const page: Page = pages[0]

    await page.setViewport({
        width: Env.WINDOW_WIDTH,
        height: Env.WINDOW_HEIGHT - 200,
    })

    webPage.page = page
}

async function setParams(page: WebPage) {
    const selPath: string = path.join(process.cwd(), 'data/button-targets.json')
    const selectors: string = await fs.readFile(selPath, { encoding: 'utf-8' })

    page.targetButtons = []

    for (const element of JSON.parse(selectors)) {
        page.targetButtons.push(element.target)
    }
}

export async function init(this: WebPage) {
    await setBrowser(this)
    await setPage(this)
    await setParams(this)
}
