import { Env } from "@/Env";
import { WebPage } from "@/WebPage";
import { ElementHandle } from "puppeteer";
import { WebElementProperty } from "./Meta/WebElementProperty";
import { WebElement } from "./WebElement";

/**
 * Extended wrapper of {@link WebElement} which provides specific support for
 * handling drop down menus.
 *
 * @export
 * @class WebDropDown
 * @typedef {WebDropDown}
 * @extends {WebElement}
 */
export class WebDropDown extends WebElement {

    /**
     * Matches a drop down option to the expected answer. If any matches are 
     * made, the first option is selected.
     *
     * @public
     * @override
     * @async
     * @returns {Promise<void>}
     */
    public override async handle(): Promise<void> {
        const parentTag: string = `button#${this.id}`
        const optionTag: string = Env.DROP_DOWN_ITEM_TAGS
        
        await this.webPage.page.evaluate((parentTag, optionTag, answer) => {
            function clickElement(element: Element) {
                //@ts-ignore
                element.click()
            }

            function isSubString(s: string, t: string) {
                return s.toLowerCase().includes(t.toLowerCase())
            }

            const dropdown: Element = document.querySelector(parentTag)
            clickElement(dropdown)

            const options = Array.from(document.querySelectorAll(optionTag))
            
            for(const option of options){
                //@ts-ignore
                if(isSubString(option.innerText, answer)) {
                    clickElement(option)
                    return;
                }
            }

            clickElement(dropdown)
        }, parentTag, optionTag, this.answer) 
        
        this.webPage.handledQuestions.add(this.question)
    }

    /**
     * Returns an array of drop down menus with a matched non-empty question and
     * answer. Any question already handled is filtered out as well.
     *
     * @public
     * @static
     * @param {WebPage} webPage current working instance of {@link WebPage}.
     * @param {Map<string, string>} labeledQuestions matched labels read from
     * {@link Page}. 
     * @returns {Promise<Array<WebDropDown>>} An array of drop down menus that 
     * have not been handled and have non-empty question and answer fields.
     */
    public static readFromPage(webPage: WebPage, labeledQuestions: Map<string, string>): Promise<Array<WebDropDown>>{
        return new Promise(async (resolve, _) => {
            const elements: Array<ElementHandle<Element>> = await webPage.getElements(Env.BUTTON_TAGS)
            const dropDowns: Array<WebDropDown> = []

            if(elements){
                for(const element of elements) {
                    const dropDown: WebDropDown = new WebDropDown(webPage, element)
                    await dropDown.init()

                    dropDown.question = labeledQuestions.get(dropDown.id)
                    dropDown.answer = webPage.mappedQA.get(dropDown.question)

                    if(WebElement.shouldHandle(webPage, dropDown)){
                        dropDowns.push(dropDown)
                    }
                }
            }

            resolve(dropDowns)
        })
    }
}