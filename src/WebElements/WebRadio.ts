import { Env } from "@/Env"
import { WebElement } from "@/WebElements/WebElement"
import { WebPage } from "@/WebPage"
import { ElementHandle, Page } from "puppeteer"
import { WebElementAttribute } from "./Meta/WebElementAttribute"
import { WebElementProperty } from "./Meta/WebElementProperty"

/**
 * Extended wrapper of {@link WebElement} which provides specific support for
 * handling radio choice selections. 
 * 
 * @remarks Each radio option is queried by looking for all role=option elements
 * in in {@link Page}, grouped together under the current instance, and stored 
 * inside {@link options}. From {@link answer}, the corresponding option is 
 * selected if one exists, otherwise nothing happens. In either case, 
 * {@link question} is marked as handled. This is based on the assumption that 
 * no new answers are insertted at runtime. In the event a new question is
 * insertted, all questions marked handled are unmarked so no further design
 * updates are needed at this moment.
 * @export
 * @class WebRadio
 * @typedef {WebRadio}
 * @extends {WebElement}
 */
export class WebRadio extends WebElement {
    // key = selection text, value = element to click
    /**
     * A map of all collected options corresponding to {@link question}.
     *
     * @public
     * @type {Map<string, ElementHandle<Element>>}
     */
    public options: Map<string, ElementHandle<Element>>

    /**
     * Calls {@func super.init()} and initializes {@link options}.
     *
     * @public
     * @override
     * @async
     * @returns {Promise<void>}
     */
    public override async init(): Promise<void> {
        await super.init()
        this.options = new Map()
    }

    /**
     * Inserts a new key value pair (option text, option element) into 
     * {@link options} as long as option text does not already exist and option
     * element is not undefined.
     *
     * @private
     * @param {string} optionValue Option text; the string associated to the 
     * option; the text beside the check box.
     * @param {ElementHandle<Element>} element The check box associated to each 
     * option to be later clicked if the option is selected.
     */
    private addSelection(optionValue: string, element: ElementHandle<Element>){
        if(this.options.has(optionValue)){
            console.log("duplicate radio selection: ", optionValue)
        } else if(!element){
            console.log("inserting undefined ElementHandle for radio selection: ", optionValue)
        } else {
            this.options.set(optionValue, element)
        }
    }

    /**
     * For each option in {@link options}, clicks the first corresponding option
     * associated to {@param answer}. If none correspond, nothing is clicked.
     *
     * @private
     * @async
     * @returns {Promise<void>}
     */
    private async makeSelection(): Promise<void> {
        for(const [selectionValue, element] of this.options){
            const compare = selectionValue.toLowerCase()
            if(compare.includes(this.answer)){
                await element.click()
                return
            }
        }
    }

    /**
     * Returns the property 'id' of the element which contains the corresponding
     * label and radio options of the current instance. Operation carried out
     * by continuously searching through parents until a parent is found with 
     * the property 'id'. If none are found, empty string is returned.
     *
     * @public
     * @static
     * @async
     * @param {WebPage} webPage Current working instance of {@link WebPage}.
     * @param {ElementHandle<Element>} element Inner member / child of container
     * being looked for. 
     * @returns {Promise<string>}
     */
    public static async getContainerID(webPage: WebPage, element: ElementHandle<Element>): Promise<string> {
        let parent = await WebElement.getParent(element)
        
        while(parent){
            const id: string = await WebElement.getProperty(parent, WebElementProperty.ID)
            if(id !== '') {
                return id
            }

            parent = await WebElement.getParent(parent)
        }

        return ''
    }

    /**
     * Loops through all options in {@link options} and clicks the first 
     * corresponding answer to {@link answer}. If no options corresponds,
     * nothing is done and {@link question} is marked as handled.
     *
     * @public
     * @override
     * @async
     * @returns {Promise<void>}
     */
    public override async handle(): Promise<void> {
        this.answer = this.webPage.mappedQA.get(this.question).toLowerCase()
        switch(this.answer){
            case '':
                console.log('Unhandled Text Input Field: ', this.question)
            case '-ignored-input-fields':
                return
            default:
                await this.makeSelection()
                break
        }

        for(const option of Array.from(this.options.values())){
            const id: string = await WebElement.getProperty(option, WebElementProperty.ID)
            this.webPage.handledQuestions.add(id)
        }
    }

    /**
     * Matches all radio options to their corresponding question in an instance
     * of {@link WebRadio}. 
     *
     * @public
     * @static
     * @async 
     * @remarks This member function has nested member functions as the member
     * functions are unique to this implementation. 
     * @param {WebPage} webPage
     * @param {Map<string, string>} labels matched labels read from 
     * {@link Page}. 
     * @returns {Promise<Array<WebRadio>>} An array of constructed 
     * {@link WebRadio}.
     */
    public static async matchFromPageAndLabels(webPage: WebPage, labels: Map<string, string>): Promise<Array<WebRadio>> {
        /**
         * Creates a new instance of {@link WebRadio}.
         *
         * @param {string} containerQuestion value assigned to {@link question}.
         * @returns {WebRadio} A new instance of {@link WebRadio} with 
         * {@param containerQuestion} as {@link question}.
         */
        const createRadio = (containerQuestion: string): WebRadio => {
            if(containerQuestion){
                const radio = new WebRadio(webPage, undefined)
                radio.init()
                radio.question = containerQuestion
                return radio
            } 

            return undefined
        }

        /**
         * If a {@link WebRadio} already exists with the corresponding 
         * {@param containerQuestion}, return it. Otherwise, calls
         * {@func createRadio} to create a new instance of {@link WebRadio}.
         *
         * @param {string} containerID Property 'id' of the container element 
         * which holds all radio options and the labeled question; value 
         * assigned to {@link id}.
         * @param {string} containerQuestion value assigned to {@link question}.
         * @returns {WebRadio} An instance of {@link WebRadio}.
         */
        const getOrCreate = (containerID: string, containerQuestion: string): WebRadio => {
            if(!containerQuestion){
                return undefined
            }

            if(radios.has(containerID)){
                return radios.get(containerID)
            } 
                
            const radio: WebRadio = createRadio(containerQuestion)
            radios.set(containerID, radio)
            
            return radio
        }

        /**
         * Returns true if all of the following are true:
         *      1. a corresponding container id was found.
         *      2. the element was not yet handled.
         *      3. the element has a corresponding text value. the text value is
         *         the text besides each radio / selection box.
         *
         * @async
         * @param {string} containerID Property 'id' of the container element 
         * which holds all radio options and the labeled question; value 
         * assigned to {@link id}.
         * @param {WebDummy} option Element being checked.
         * @returns {Promise<boolean>} True if the element should be handled,
         * other wise false.
         */
        const shouldHandle = async (page: Page, option: ElementHandle<Element>, containerID: string): Promise<boolean> => {
            if(handled.has(containerID)){
                return false
            }

            if(await WebElement.getAttribute(page, option, WebElementAttribute.AriaChecked) === 'true') {
                return false
            }

            if(labels.has(await WebElement.getProperty(option, WebElementProperty.ID)) === false) {
                return false
            }

            return true
        }
        
        
        const handled: Set<string> = new Set()
        const radios: Map<string, WebRadio> = new Map() // key = for attr = containerID
        const radioSelections: Array<ElementHandle<Element>> = await webPage.getElements(Env.RADIO_TAGS)
        
        for(const element of radioSelections) {
            const containerID: string = await WebRadio.getContainerID(webPage, element)
            const containerQuestion: string = labels.get(containerID)

            if(!containerQuestion || webPage.handledQuestions.has(containerQuestion)){
                continue
            }
            

            if(await shouldHandle(webPage.page, element, containerID) === false) {
                handled.add(containerID)
                radios.delete(containerID)
                continue
            }
    
            const optionValue: string = labels.get(await WebElement.getProperty(element, WebElementProperty.ID))
            const radio: WebRadio = getOrCreate(containerID, containerQuestion)

            if(radio){
                radio.addSelection(optionValue, element)
            }
        }
        
        return Array.from(radios.values())
    }
}