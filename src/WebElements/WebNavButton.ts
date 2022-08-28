import { Env } from "@/Env";
import { NavSequence, WebPage } from "@/WebPage";
import { ElementHandle } from "puppeteer";
import { WebElement } from "./WebElement";

export class WebNavButton extends WebElement {
    private sequence: Array<string> 
    private waitForNavigation: boolean 

    public override async init() {
        await this.setNavSequence()
    }

    public override async handle() {
        if(!this.sequence) {
            return
        }

        await this.element.click()
        
        const numSequenceButtons = this.sequence.length

        for (let i = 0; i < numSequenceButtons; i++) {
            const next: ElementHandle<Element> = await this.webPage.getElement(this.sequence[i], true)
            if(!next){
                return
            }

            if(this.waitForNavigation && (i == numSequenceButtons - 1)){
                await Promise.all([
                    next.click(),
                    this.webPage.page.waitForNavigation({waitUntil: 'networkidle2'})
                ])
            } else {
                await next.click()
            }
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

    private isInDomain(currentDomain: string, targetDomain: string): boolean {
        return targetDomain === '*' || currentDomain.includes(targetDomain)
    }

    private async isInNavSequence(sequence: NavSequence): Promise<boolean> {
        const targetAttrName: string = sequence.parent_key
        const targetAttrValue: string = sequence.parent_value
        const currentAttrValue: string = await this.getAttribute(targetAttrName)
        return currentAttrValue && currentAttrValue === targetAttrValue
    }
    
    private async setNavSequence(): Promise<Array<string>> {
        const currentDomain: string = this.webPage.page.url().toLowerCase()
    
        for (const target of this.webPage.targetNavButtons) {
            if (this.isInDomain(currentDomain, target.domain) == false) {
                continue
            }
    
            for (const sequence of target.sequence) {
                if (this.isInNavSequence(sequence)) {
                    this.sequence = sequence.children
                    this.waitForNavigation = sequence.waitForNavigation
                }
            }
        }
    
        return undefined
    }
}