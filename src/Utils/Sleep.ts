export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// taken from https://stackoverflow.com/questions/52497252/puppeteer-wait-until-page-is-completely-loaded
export const waitTillHTMLRendered = async (page, timeout = 30000) => {
    const checkDurationMsecs = 250
    const maxChecks = timeout / checkDurationMsecs
    let lastHTMLSize = 0
    let checkCounts = 1
    let countStableSizeIterations = 0
    const minStableSizeIterations = 4

    while (checkCounts++ <= maxChecks) {
        let html = await page.content()
        let currentHTMLSize = html.length

        if (lastHTMLSize != 0 && currentHTMLSize == lastHTMLSize) {
            countStableSizeIterations++
        } else {
            countStableSizeIterations = 0 //reset the counter
        }

        if (countStableSizeIterations >= minStableSizeIterations) {
            break
        }

        lastHTMLSize = currentHTMLSize
        await page.waitForTimeout(checkDurationMsecs)
    }
}
