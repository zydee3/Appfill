import { Env } from '../Env'
import { ElementHandle } from 'puppeteer'
import { WebPage } from '@/WebPage'

export async function getElement(this: WebPage, tag: string, shouldWait: boolean): Promise<ElementHandle<Element>> {   
    if(this.page) { 
        return shouldWait 
            ? await this.page.waitForSelector(tag) 
            : await this.page.$(tag)
    } else {
        return undefined
    }
}

export async function getElements(this: WebPage, tag: string): Promise<Array<ElementHandle<Element>>> {
    if(this.page) { 
        return await this.page.$$(tag)
    } else {
        return undefined
    }
}