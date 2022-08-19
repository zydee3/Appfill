import path from 'path'
import fs from 'fs/promises'

import { Env } from '@/Env'
import { WebPage } from '@/WebPage'
import puppeteer, { Page } from 'puppeteer'

export interface IWebPageOptions {
    baseURL: string
}

export async function setBrowser(this: WebPage) {
    this.browser = await puppeteer.launch({
        args: [`--window-size=${Env.WINDOW_WIDTH},${Env.WINDOW_HEIGHT}`],
        ignoreHTTPSErrors: true,
        headless: false,
    })

    await this.setPage()
}

export async function setPage(this: WebPage) {
    const pages: Page[] = await this.browser.pages()
    const page: Page = pages[0]

    await page.setViewport({
        width: Env.WINDOW_WIDTH,
        height: Env.WINDOW_HEIGHT - 200,
    })
    this.page = page
}

export async function setParams(this: WebPage) {
    const selPath: string = path.join(process.cwd(), 'data/selectors.json')
    const selectors: string = await fs.readFile(selPath, { encoding: 'utf-8' })
    this.sequentialSelectors = JSON.parse(selectors)
}

export async function init(this: WebPage, options: IWebPageOptions) {
    await this.setParams()
    await this.setBrowser()
    await this.page.goto(options.baseURL, { waitUntil: 'networkidle0' })
}
