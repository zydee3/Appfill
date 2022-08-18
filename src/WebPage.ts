import { Env } from './Env'
import { sleep } from './Utils/Sleep'
import path from 'path'
import fs from 'fs/promises'
import puppeteer, { Browser, ElementHandle, JSHandle, Page } from 'puppeteer'
import { WebParams } from './WebParams'

interface IWebPageOptions {
    baseURL: string
}

interface IPageElementOptions {
    tag: string
    shouldWait?: boolean
    shouldClick?: boolean
}

const DEFAULT_ELEMENT_OPTIONS: Partial<IPageElementOptions> = { shouldClick: false, shouldWait: false }

export class WebPage {
    public page: Page
    public params: WebParams

    public async init(options: IWebPageOptions) {
        this.params = new WebParams()
        await this.params.init({ loadAll: true })

        const browser = await puppeteer.launch({
            args: [`--window-size=${Env.WINDOW_WIDTH},${Env.WINDOW_HEIGHT}`],
            ignoreHTTPSErrors: true,
            headless: false,
        })

        const pages: Page[] = await browser.pages()
        this.page = pages[0]

        await this.page.setViewport({ width: Env.WINDOW_WIDTH, height: Env.WINDOW_HEIGHT - 200 })
        await this.page.goto(options.baseURL, { waitUntil: 'networkidle0' })
    }

    private async getElement(options: IPageElementOptions): Promise<ElementHandle<Element>> {
        options = { ...DEFAULT_ELEMENT_OPTIONS, ...options }
        const element: ElementHandle<Element> = options.shouldWait
            ? await this.page.waitForSelector(options.tag)
            : await this.page.$(options.tag)

        if (element && options.shouldClick) {
            await element.click()
        }

        return element
    }

    private async canWriteToForm(element: ElementHandle<Element>): Promise<boolean> {
        if (!element) return false

        const wrapper: JSHandle<unknown> = await element.getProperty('value')
        const content: string = (await wrapper.jsonValue()) as string

        return content === ''
    }

    private async writeToForm(formElement: ElementHandle<Element>, data: string) {
        if (!formElement) return
        await formElement.click()
        await this.page.keyboard.type(data)
    }

    public async checkForms() {
        // const elements: ElementHandle<Element>[] = await this.page.$$(Env.INPUT_TAGS)
        // if (elements.length >= 1) {
        //     elements.map(handle => handle.getProperties)
        // }
        const formElement = await this.getElement({ tag: '#input-4', shouldClick: false, shouldWait: false })
        if (await this.canWriteToForm(formElement)) {
            await this.writeToForm(formElement, 'Vincent')
        }
    }

    public async checkButtons() {
        for (const selectors of this.params.sequentialSelectors) {
            if (await this.getElement({ tag: selectors[0], shouldClick: true })) {
                for (let i = 1; i < selectors.length; i++) {
                    await this.getElement({ tag: selectors[i], shouldClick: true, shouldWait: true })
                }
            }
        }
    }
}
