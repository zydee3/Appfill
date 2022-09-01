import { Env } from "@/Env";
import { WebPage } from "@/WebPage";
import { ElementHandle } from "puppeteer";
import { WebElementProperty } from "./Meta/WebElementProperty";
import { WebElement } from "./WebElement";

/**
 * Extended wrapper of {@link WebElement} which provides specific support for
 * handling text boxes. 
 *
 * @remarks Each input element is queried by looking for all present type=text 
 * elements in {@link Page}. For each text box, if the text box has non-empty 
 * {@link question} and {@link answer} and has not been handled, then typing is 
 * simulated towards {@link element} with {@link answer}.
 * @export
 * @class WebTextBox
 * @typedef {WebTextBox}
 * @extends {WebElement}
 */
export class WebTextBox extends WebElement {
    
    /**
     * If {@link question} and {@link answer} are non-empty strings and 
     * {@link answer} is not '-ignored-input-fields', then typing is simulaated
     * to write {@link answer} into {@link element}.
     *
     * @public
     * @override
     * @async
     * @returns {Promise<void>}
     */
    public override async handle(): Promise<void> {
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

    /**
     * Returns an array of input text boxes with a matched non-empty question 
     * and answer. Any elements with a non-empty property 'innerText' or
     * elements with a question already answered is filtered out as well.
     *
     * @public
     * @static
     * @param {WebPage} webPage Current working instance of {@link WebPage}.
     * @param {Map<string, string>} labeledQuestions Matched labels read from
     * {@link Page}. 
     * @returns {Promise<Array<WebTextBox>>} An array of filtered input text box
     * elements.
     */
    public static readFromPage(webPage: WebPage, labeledQuestions: Map<string, string>): Promise<Array<WebTextBox>>{
        return new Promise(async (resolve, _) => {
            const elements: Array<ElementHandle<Element>> = await webPage.getElements(Env.TEXT_BOX_TAGS)
            const textBoxes: Array<WebTextBox> = []

            if(elements){
                for(const element of elements){
                    const textBox: WebTextBox = new WebTextBox(webPage, element)

                    textBox.id = await textBox.getProperty(WebElementProperty.ID)
                    textBox.question = labeledQuestions.get(textBox.id)
                    textBox.answer = webPage.mappedQA.get(textBox.question)

                    const canHandle: boolean = await textBox.getProperty(WebElementProperty.Value) === ''
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