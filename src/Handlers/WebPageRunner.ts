import { WebPage } from '@/WebPage'
import { sleep } from '@/Utils/Sleep'
import { ElementHandle } from 'puppeteer'

export async function checkForms(this: WebPage) {
    const mappedInputs: Map<string, ElementHandle<Element>[]> = await this.readInputFields()
    await sleep(10000)
}

export async function checkButtons(this: WebPage) {
    // for (const selectors of this.params.sequentialSelectors) {
    //     const firstElement = await getElement(this.page, { tag: selectors[0] })
    //     if ((await this.clickElement(firstElement)) == false) continue
    //     for (let nextIdx = 1; nextIdx < selectors.length; nextIdx++) {
    //         const nextElement = await getElement(this.page, { tag: selectors[nextIdx], shouldWait: true })
    //         if ((await this.clickElement(nextElement)) == false) break
    //     }
    // }
}
