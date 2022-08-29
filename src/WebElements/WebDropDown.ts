import { Env } from "@/Env";
import { sleep } from "@/Utils/Sleep";
import { WebPage } from "@/WebPage";
import { ElementHandle } from "puppeteer";
import { WebElementProperty } from "./Meta/WebElementProperty";
import { WebDummy } from "./WebDummy";
import { WebElement } from "./WebElement";

export class WebDropDown extends WebElement {
    public override async handle() {
        const id: string = await this.getProperty(WebElementProperty.ID)
        const parentTag: string = `button#${id}`
        const optionTag: string = Env.DROP_DOWN_ITEM_TAGS
        
        await this.webPage.page.evaluate((parentTag, optionTag, answer) => {
            let wasOptionSelected = false
            const parent = document.querySelector(parentTag)
            //@ts-ignore
            parent.click()

            const children = Array.from(document.querySelectorAll(optionTag))
            
            for(const child of children){
                //@ts-ignore
                const optionText = child.innerText.toLowerCase()

                if(optionText.includes(answer)) {
                    //@ts-ignore
                    child.click()
                    wasOptionSelected = true
                    break;
                }
            }

            if(wasOptionSelected === false){
                //@ts-ignore
                parent.click()
            }
        }, parentTag, optionTag, this.answer) 
        
        this.webPage.handledQuestions.add(this.question)
    }

    public static readFromPage(webPage: WebPage, labeledQuestions: Map<string, string>): Promise<Array<WebDropDown>>{
        return new Promise(async (resolve, _) => {
            const elements: Array<ElementHandle<Element>> = await webPage.getElements(Env.BUTTON_TAGS)
            const dropDowns: Array<WebDropDown> = []

            if(elements){
                for(const element of elements) {
                    const dropDown: WebDropDown = new WebDropDown(webPage, element)
                    const dropDownID: string = await dropDown.getProperty(WebElementProperty.ID)
                    dropDown.question = labeledQuestions.get(dropDownID)
                    dropDown.answer = webPage.mappedQA.get(dropDown.question)

                    if(dropDown.question 
                        && dropDown.answer 
                        && dropDown.answer !== '-ignored-input-fields'
                        && webPage.handledQuestions.has(dropDown.question) === false) {
                            dropDowns.push(dropDown)
                    }
                }
            }

            resolve(dropDowns)
        })
    }
}