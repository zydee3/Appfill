import { Env } from "@/Env";
import { WebPage } from "@/WebPage";
import { ElementHandle } from "puppeteer";
import { WebElementProperty } from "./Meta/WebElementProperty";
import { WebElement } from "./WebElement";

export class WebTextBox extends WebElement {
    
    public override async handle() {


        const answer: string = this.webPage.mappedQA.get(this.question)

        switch(answer){
            case '':
                console.log('Unhandled Text Input Field: ', this.question)
            case '-ignored-input-fields':
                return
            default:
                await this.element.click()
                await this.webPage.page.keyboard.type(answer)
                break
        }

        this.webPage.handledQuestions.add(this.question)
    }

    public static readFromPage(webPage: WebPage, labeledQuestions: Map<string, string>): Promise<Array<WebTextBox>>{
        return new Promise(async (resolve, _) => {
            const elements: Array<ElementHandle<Element>> = await webPage.getElements(Env.TEXT_BOX_TAGS)
            const textBoxes: Array<WebTextBox> = []

            if(elements){
                for(const element of elements){
                    const textBox: WebTextBox = new WebTextBox(webPage, element)

                    const id: string = await textBox.getProp(WebElementProperty.ID)
                    textBox.question = labeledQuestions.get(id)
                    textBox.answer = webPage.mappedQA.get(textBox.question)

                    const canHandle: boolean = await textBox.getProp(WebElementProperty.Value) === ''
                        || webPage.handledQuestions.has(textBox.question) === false

                    if(textBox.question
                        && textBox.answer
                        && textBox.answer !== '-ignored-input-fields'
                        && canHandle) {
                            textBoxes.push(textBox)
                    }                    
                }
            }

            resolve(textBoxes)
        })
    }
}