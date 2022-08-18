import { Env } from './Env'
import path from 'path'
import fs from 'fs/promises'
import puppeteer, { Browser, ElementHandle, JSHandle, Page } from 'puppeteer'

interface IWebParamOptions {
    loadAll: boolean
}

export class WebParams {
    public sequentialSelectors: string[][]

    public async init(options: IWebParamOptions) {
        const selPath: string = path.join(process.cwd(), 'data/selectors.json')
        const selectors: string = await fs.readFile(selPath, { encoding: 'utf-8' })
        this.sequentialSelectors = JSON.parse(selectors)
    }
}
