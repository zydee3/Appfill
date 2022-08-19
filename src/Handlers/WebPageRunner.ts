import { Env } from '@/Env'
import { WebPage } from '@/WebPage'
import { sleep } from '@/Utils/Sleep'
import { Page } from 'puppeteer'

async function parsePage(webPage: WebPage) {
    const page: Page = webPage.page

    for (const input of await webPage.getElements(page, Env.INPUT_TAGS)) {
        console.log('input id: ', await input.getProperty('id'))
    }

    for (const label of await webPage.getLabels(page)) {
        console.log(`question: ${label.question} for: ${label.for}`)
    }

    for (const button of await webPage.getElements(page, Env.BUTTON_TAGS)) {
        console.log('button id: ', await button.getProperty('id'))
    }
}

async function checkButtons() {
    // for (const selectors of this.params.sequentialSelectors) {
    //     const firstElement = await getElement(this.page, { tag: selectors[0] })
    //     if ((await this.clickElement(firstElement)) == false) continue
    //     for (let nextIdx = 1; nextIdx < selectors.length; nextIdx++) {
    //         const nextElement = await getElement(this.page, { tag: selectors[nextIdx], shouldWait: true })
    //         if ((await this.clickElement(nextElement)) == false) break
    //     }
    // }
}

export async function start(this: WebPage, startURL: string) {
    await this.page.goto(startURL, { waitUntil: 'networkidle0' })
    while (true) {
        await parsePage(this)
        await sleep(Env.BASE_SLEEP_TIME)
    }
}
