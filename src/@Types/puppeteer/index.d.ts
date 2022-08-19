import { IPageElementOptions } from '@/WebPage'

declare module 'puppeteer' {
    export interface Page {
        getElement: (options: IPageElementOptions) => Promise<ElementHandle<Element> | null>
    }
}
