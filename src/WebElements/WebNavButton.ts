import { Env } from "@/Env";
import { NavSequence, WebPage } from "@/WebPage";
import { ElementHandle } from "puppeteer";
import { getAttrByValue } from "./Meta/WebElementAttribute";
import { WebElement } from "./WebElement";

export class WebNavButton extends WebElement {
    private sequence: Array<string> 
    private waitForNavigation: boolean 
    private shouldHandle: boolean

    private isInDomain(currentDomain: string, targetDomain: string): boolean {
        return targetDomain === '*' || currentDomain.includes(targetDomain)
    }

    private async isInNavSequence(sequence: NavSequence): Promise<boolean> {
        const targetAttrName: string = sequence.parent_key
        const targetAttrValue: string = sequence.parent_value
        const currentAttrValue: string = await this.getAttr(getAttrByValue(targetAttrName))
        return currentAttrValue && currentAttrValue === targetAttrValue
    }

    private isExpectingRedirect(numHandledBtns: number, lenSequence: number){
        return this.waitForNavigation && (numHandledBtns == lenSequence - 1)
    }

    private async getNextBtn(posInSequence: number): Promise<ElementHandle<Element>> {
        return await this.webPage.getElement(this.sequence[posInSequence], true)
    }

    public override async init() {
        await super.init()
        const currentDomain: string = this.webPage.page.url().toLowerCase()
    
        for (const target of this.webPage.targetNavButtons) {
            if (this.isInDomain(currentDomain, target.domain) == false) {
                continue
            }
    
            for (const sequence of target.sequence) {
                if (this.isInNavSequence(sequence)) {
                    this.sequence = sequence.children
                    this.waitForNavigation = sequence.waitForNavigation
                    this.shouldHandle = true
                }
            }
        }
    
        this.sequence = []
        this.shouldHandle = false
    }

    public override async handle() {
        if(this.shouldHandle === false) {
            return
        }

        await this.element.click()
        
        const lenSequence = this.sequence.length

        for (let numHandledBtns = 0; numHandledBtns < lenSequence; numHandledBtns++) {
            const next: ElementHandle<Element> = await this.getNextBtn(numHandledBtns)
            if(!next){
                return
            }

            if (this.isExpectingRedirect(numHandledBtns, lenSequence) == false){
                await next.click()
                continue
            }

            await Promise.all([
                next.click(),
                this.webPage.page.waitForNavigation({waitUntil: 'networkidle2'})
            ])
        }
    }

    public static readFromPage(webPage: WebPage): Promise<Array<WebNavButton>>{
        return new Promise(async (resolve, reject) => {
            const handles: Array<ElementHandle<Element>> = await webPage.page.$$(Env.NAV_TAGS)
            const navButtons: Array<WebNavButton> = []
            const handledButtons: Set<string> = new Set()

            for(const element of handles){
                const navButton: WebNavButton = new WebNavButton(webPage, element)
                const partialID: string = await navButton.getPartialID()
                if(handledButtons.has(partialID) == false){
                    navButtons.push(navButton)
                    handledButtons.add(partialID)
                }
            }

            resolve(navButtons)
        })
    }
}