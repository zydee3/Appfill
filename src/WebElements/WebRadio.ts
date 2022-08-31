import { Env } from "@/Env"
import { WebElement } from "@/WebElements/WebElement"
import { WebPage } from "@/WebPage"
import { ElementHandle } from "puppeteer"
import { WebElementAttribute } from "./Meta/WebElementAttribute"
import { WebElementProperty } from "./Meta/WebElementProperty"
import { WebDummy } from "./WebDummy"

export class WebRadio extends WebElement {
    // key = selection text, value = element to click
    public selections: Map<string, ElementHandle<Element>>

    public override async init() {
        await super.init()
        this.selections = new Map()
    }

    public override async handle() {
        const answer: string = this.webPage.mappedQA.get(this.question)
        switch(answer){
            case '':
                console.log('Unhandled Text Input Field: ', this.question)
            case '-ignored-input-fields':
                return
            default:
                await this.makeSelection(answer)
                break
        }

        const optionDummy: WebDummy = new WebDummy(undefined, undefined)
        for(const option of Array.from(this.selections.values())){
            optionDummy.element = option
            const id: string = await optionDummy.getProp(WebElementProperty.ID)
            this.webPage.handledQuestions.add(id)
        }
    }

    private addSelection(optionValue: string, element: ElementHandle<Element>){
        if(this.selections.has(optionValue)){
            console.log("duplicate radio selection: ", optionValue)
        } else if(!element){
            console.log("inserting undefined ElementHandle for radio selection: ", optionValue)
        } else {
            this.selections.set(optionValue, element)
        }
    }

    private async makeSelection(answer: string) {
        for(const [selectionValue, element] of this.selections){
            const compare = selectionValue.toLowerCase()
            if(compare.includes(answer)){
                await element.click()
                return
            }
        }
    }

    public static async getContainerID(webPage: WebPage, element: ElementHandle<Element>): Promise<string> {
        let child: WebDummy = new WebDummy(webPage, element)
        let parent = await child.getParent()
        
        while(parent){
            let dummyParent: WebDummy = new WebDummy(webPage, parent)
            const id: string = await dummyParent.getProp(WebElementProperty.ID)
            if(id !== '') {
                return id
            }

            parent = await dummyParent.getParent()
        }

        return ''
    }

    public static async matchFromPageAndLabels(webPage: WebPage, labels: Map<string, string>): Promise<Array<WebRadio>> {
        const createRadio = (containerQuestion: string): WebRadio => {
            if(containerQuestion){
                const radio = new WebRadio(webPage, undefined)
                radio.init()
                radio.question = containerQuestion
                return radio
            } 

            return undefined
        }

        const shouldHandle = async (containerID: string, option: WebDummy): Promise<boolean> => {
            if(handled.has(containerID)){
                return false
            }

            if(await option.getAttr(WebElementAttribute.AriaChecked) === 'true') {
                return false
            }

            if(labels.has(await option.getProp(WebElementProperty.ID)) === false) {
                return false
            }

            return true
        }

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
        
        const handled: Set<string> = new Set()
        const radios: Map<string, WebRadio> = new Map() // key = for attr = containerID
        const radioSelections: Array<ElementHandle<Element>> = await webPage.getElements(Env.RADIO_TAGS)
        
        for(const element of radioSelections) {
            const containerID: string = await WebRadio.getContainerID(webPage, element)
            const containerQuestion: string = labels.get(containerID)

            if(!containerQuestion || webPage.handledQuestions.has(containerQuestion)){
                continue
            }
            
            const dummy: WebDummy = new WebDummy(webPage, element)

            if(await shouldHandle(containerID, dummy) === false) {
                handled.add(containerID)
                radios.delete(containerID)
                continue
            }
    
            const optionValue: string = labels.get(await dummy.getProp(WebElementProperty.ID))
            const radio: WebRadio = getOrCreate(containerID, containerQuestion)

            if(radio){
                radio.addSelection(optionValue, element)
            }
        }
        
        return Array.from(radios.values())
    }
}