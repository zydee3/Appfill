import { getAttrByValue, WebElementAttribute } from './WebElements/Meta/WebElementAttribute'
import { WebPage } from './WebPage'
;(async () => {
    const page: WebPage = new WebPage()
    await page.init()
    await page.start('https://sec.wd3.myworkdayjobs.com/en-US/Samsung_Careers/job/Android-Software-Engineer_R61728')
})()

