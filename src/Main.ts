import { Env } from './Env'
import { sleep } from './Utils/Sleep'
import { WebPage } from './WebPage'
;(async () => {
    const page: WebPage = new WebPage()
    await page.init({
        baseURL: 'https://sec.wd3.myworkdayjobs.com/en-US/Samsung_Careers/job/Android-Software-Engineer_R61728',
    })

    while (true) {
        if (Env.AUTOMATE_BUTTONS) {
            await page.checkButtons()
            await sleep(Env.BASE_SLEEP_TIME)
        }

        if (Env.AUTOMATE_FORMS) {
            await page.checkForms()
            await sleep(Env.BASE_SLEEP_TIME)
        }
    }
})()
