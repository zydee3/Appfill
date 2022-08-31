import { Env } from "@/Env";
import { NavSequence, WebPage } from "@/WebPage";
import { ElementHandle } from "puppeteer";
import { getAttrByValue } from "./Meta/WebElementAttribute";
import { WebElement } from "./WebElement";

/**
 * Extended wrapper of {@link WebElement} which provides specific support for
 * handling buttons that are expected to direct the user to another page / url 
 * or another part of the same page.
 * 
 * @remarks Each drop down is queried by looking for all present <button> 
 * elements. For each button found, check if any of the button is defined 
 * under {@link @/data/button-targets.json}. If defined, a sequence must exist. 
 * For each button in the sequence, click the button in order.
 *
 * @export
 * @class WebNavButton
 * @typedef {WebNavButton}
 * @extends {WebElement}
 */
export class WebNavButton extends WebElement {
    /**
     * Describes a sequence of buttons to be clicked in order.
     *
     * @private
     * @type {Array<string>}
     */
    private sequence: Array<string> 
    /**
     * True if the last button clicked in {@link sequence} is expected to 
     * redirect the user to another page. 
     *
     * @private
     * @type {boolean}
     */
    private waitForNavigation: boolean 
    /**
     * Only true if all parameters from {@link init} have been met, otherwise 
     * false for {@link handle} to exit immediately.
     *
     * @private
     * @type {boolean}
     */
    private shouldHandle: boolean

    /**
     * Sequences are defined for a specific domain, or '*' for any domain. If 
     * the current sequence being checked is not within the domain of the client
     * ({@link Page.url}), then we do not handle this sequence.
     *
     * @private
     * @param {string} currentDomain domain read from {@link Page.url}.
     * @param {string} targetDomain domain read from an entry of 
     * {@link @/data/button-targets.json}.
     * @returns {boolean} true if {@param targetDomain} is '*' or if 
     * {@param targetDomain} contains {@param currentDomain}.
     */
    private isInDomain(currentDomain: string, targetDomain: string): boolean {
        return targetDomain === '*' || currentDomain.includes(targetDomain)
    }

    /**
     * Tests the first element of the sequence for a match. If there is a match,
     * there exists a sequence for the current page to be handled.
     *
     * @private
     * @async
     * @param {NavSequence} sequence An array of {@link NavSequence} read from 
     * {@link @/data/button-targets.json}.
     * @returns {Promise<boolean>} True if the current navigation button 
     * ({@link element}) is the first element in the sequence. 
     */
    private async isInNavSequence(sequence: NavSequence): Promise<boolean> {
        const targetAttrName: string = sequence.parent_key
        const targetAttrValue: string = sequence.parent_value
        const currentAttrValue: string = await this.getAttribute(getAttrByValue(targetAttrName))
        return currentAttrValue && currentAttrValue === targetAttrValue
    }

    /**
     * True if the last button being clicked is expected to redirect the user to
     * another page.  
     *
     * @private
     * @param {number} numHandledBtns The current position in the sequence of 
     * buttons being handled. Only the last button ({@param lenSequence} - 1) 
     * should cause a redirect.
     * @param {number} lenSequence The number of buttons in the sequence of 
     * buttons to be clicked in order.
     * @returns {boolean} True if {@link waitForNavigation} is true and the
     * current button is the last button in the sequence.
     */
    private isExpectingRedirect(numHandledBtns: number, lenSequence: number): boolean{
        return this.waitForNavigation && (numHandledBtns == lenSequence - 1)
    }

    /**
     * Gets the next button in the sequence by querying {@link Page}. If the 
     * element being queried is present, return it, otherwise wait for it to
     * become present before returning it.
     *
     * @private
     * @async
     * @param {number} posInSequence The current position in the sequence of 
     * buttons being handled.
     * @returns {Promise<ElementHandle<Element>>} Returns the 
     * {@param posInSequence}'th button of the sequence.
     */
    private async getNextBtn(posInSequence: number): Promise<ElementHandle<Element>> {
        return await this.webPage.getElement(this.sequence[posInSequence], true)
    }

    /**
     * Checks to see if {@link this.webPage.targetNavButtons} contains the 
     * current button. If the current button exists, a sequence must exist. The
     * sequence is set and {@link shouldHandle} is set to true.
     *
     * @public
     * @override
     * @async
     * @returns {Promise<void>}
     */
    public override async init(): Promise<void> {
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

    /**
     * If the current button contains a sequence, the sequence is handled by 
     * clicking each element of the sequence in order. Otherwise, return.
     *
     * @public
     * @override
     * @async
     * @returns {Promise<void>}
     */
    public override async handle(): Promise<void> {
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

    /**
     * Returns an array of unique navigation buttons read from {@link Page}.
     *
     * @public
     * @static
     * @param {WebPage} webPage current working instance of {@link WebPage}.
     * @returns {Promise<Array<WebNavButton>>} An array of {@link WebNavButton}.
     */
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