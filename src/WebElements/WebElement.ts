import { WebPage } from "@/WebPage";
import { ElementHandle, JSHandle } from "puppeteer";

export abstract class WebElement {
    public webPage: WebPage
    public element: ElementHandle<Element>
    public question: string
    public answer: string

    constructor(webPage: WebPage, element: ElementHandle<Element>) {
        this.webPage = webPage
        this.element = element
        this.question = ''
        this.answer = ''
    }

    public async getID(): Promise<string> {
        return await this.getProperty('id')
    }

    public async getType(): Promise<string> {
        return await this.getProperty('type')
    }

    public async getInnerText(): Promise<string> {
        return await this.getProperty('innerText')
    }

    public async getFor(): Promise<string> {
        return await this.getAttribute('for')
    }

    public async getValue(): Promise<string> {
        return await this.getProperty('value')
    }

    /**
     * From {@link element}, returns the property string value associated to
     * {@param property} or empty string if no such property exists.
     *
     * @private
     * @async
     * @param {string} property target property name of {@link element}
     * @returns {Promise<string>} target property value of {@link element} or empty
     * string if {@link element} does not contain {@param property}.
     */
    public async getProperty(property: string): Promise<string> {
        if(this.element){
            const wrapper: JSHandle<unknown> = await this.element.getProperty(property)
            const value = (await wrapper.jsonValue()) as string
            if(value) {
                return value
            }
        }

        return ''
    }

    /**
     * Retrieves the string attribute value associated to {@param key} by
     * evaluating {@param page} if {@link attributes} does not contain
     * @{param key}. The cached result is cach caching the result.
     *
     * @public
     * @async
     * @param {string} key target property name of {@link element}
     * @returns {Promise<string>} target property value of {@link element} or empty
     * string if {@link element} does not contain {@param property}.
     */
    public async getAttribute(attribute: string): Promise<string> {
        if(this.element){
            const value = await this.webPage.page.evaluate((element, tag) => {
                return element.getAttribute(tag)
            }, this.element, attribute)
            if(value){
                return value
            }
        }

        return ''
    }

    public async getParent(): Promise<ElementHandle<Element>> {
        const parent: ElementHandle<ParentNode> = await this.element.getProperty('parentNode')
        return parent as ElementHandle<Element>
    }

    public async getPartialID(): Promise<string> {
        const id: string = await this.getID()
        if(id !== ''){
            return id
        }

        const innerText: string = await this.getInnerText()
        return innerText
    }

    public async init() {}
    public async handle() {}

    public async toString(): Promise<string> {
        return this.toString()
    }
}