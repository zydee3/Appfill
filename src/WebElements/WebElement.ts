import { WebPage } from "@/WebPage";
import { ElementHandle, JSHandle, Page } from "puppeteer";
import { WebElementProperty } from './Meta/WebElementProperty'
import { WebElementAttribute } from './Meta/WebElementAttribute'



/**
 * Wrapper for {@link ElementHandle<Element>}. Provides a simple set of helper
 * functions for parsing, storing, and handling data for each ElementHandle. 
 * Parent class to {@link ElementHandle<Element>} of different types, e.g.
 * Input, Button, Radio, Labels, etc.
 * 
 * @export
 * @abstract
 * @class WebElement
 * @typedef {WebElement}
 */
export abstract class WebElement {
    /**
     * Description placeholder
     *
     * @public
     * @type {WebPage}
     */
    public webPage: WebPage
    /**
     * Description placeholder
     *
     * @public
     * @type {ElementHandle<Element>}
     */
    public element: ElementHandle<Element>
    /**
     * Description placeholder
     *
     * @public
     * @type {string}
     */
    public question: string
    /**
     * Description placeholder
     *
     * @public
     * @type {string}
     */
    public answer: string

    /**
     * Creates an instance of WebElement.
     *
     * @constructor
     * @param {WebPage} webPage
     * @param {ElementHandle<Element>} element
     */
    constructor(webPage: WebPage, element: ElementHandle<Element>) {
        this.webPage = webPage
        this.element = element
        this.question = ''
        this.answer = ''
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
    public static async getProperty(element: ElementHandle<Element>, property: WebElementProperty): Promise<string> {
        if(element && property){
            const wrapper: JSHandle<unknown> = await element.getProperty(property)
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
    public static async getAttribute(page: Page, element: ElementHandle<Element>, attribute: WebElementAttribute): Promise<string> {
        if(page && element){
            const value = await page.evaluate((element, tag) => {
                return element.getAttribute(tag)
            }, element, attribute)
            if(value){
                return value
            }
        }

        return ''
    }

    /**
     * Description placeholder
     *
     * @public
     * @async
     * @param {WebElementProperty} property
     * @returns {Promise<string>}
     */
    public async getProperty(property: WebElementProperty): Promise<string> {
        return await WebElement.getProperty(this.element, property)
    }

    /**
     * Description placeholder
     *
     * @public
     * @async
     * @param {WebElementAttribute} attribute
     * @returns {Promise<string>}
     */
    public async getAttribute(attribute: WebElementAttribute): Promise<string> {
        return await WebElement.getAttribute(this.webPage.page, this.element, attribute)
    }

    /**
     * Description placeholder
     *
     * @public
     * @async
     * @returns {Promise<ElementHandle<Element>>}
     */
    public async getParent(): Promise<ElementHandle<Element>> {
        const parent: ElementHandle<ParentNode> = await this.element.getProperty('parentNode')
        return parent as ElementHandle<Element>
    }

    /**
     * Description placeholder
     *
     * @public
     * @async
     * @returns {Promise<string>}
     */
    public async getPartialID(): Promise<string> {
        const id: string = await this.getProperty(WebElementProperty.ID)
        if(id !== ''){
            return id
        }

        const innerText: string = await this.getProperty(WebElementProperty.ID)
        return innerText
    }


    /**
     * Description placeholder
     *
     * @public
     * @async
     * @returns {*}
     */
    public async init() {}


    /**
     * Description placeholder
     *
     * @public
     * @async
     * @returns {*}
     */
    public async handle() {}

    /**
     * Description placeholder
     *
     * @public
     * @async
     * @returns {Promise<string>}
     */
    public async toString(): Promise<string> {
        return this.toString()
    }
}