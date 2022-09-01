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
     * Current working instance of {@link WebPage}.
     *
     * @public
     * @type {WebPage}
     */
    public webPage: WebPage
    /**
     * Wrapped {@link ElementHandle<Element>} being handled. Element corresponds
     * to {@link question} and {@link answer} as this is the element where 
     * {@link answer} is written to.
     *
     * @public
     * @type {ElementHandle<Element>}
     */
    public element: ElementHandle<Element>


    /**
     * 'id' property read of web element {@link element}.
     *
     * @public
     * @type {string}
     */
    public id: string
    /**
     * Corresponding question to be answered.
     *
     * @public
     * @type {string}
     */
    public question: string
    /**
     * Corresponding answer to {@link question}. This is parsed from 
     * {@link @/data/form-data.json}.
     *
     * @public
     * @type {string}
     */
    public answer: string

    /**
     * Base constructor for {@link WebElement}.
     *
     * @constructor
     * @param {WebPage} webPage Current working instance of {@link WebPage}.
     * @param {ElementHandle<Element>} element Element being wrapped and 
     * bound to {@link element}.
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
     * @public
     * @static
     * @async
     * @param {string} property Target property name of {@link element}.
     * @returns {Promise<string>} String value of target property value of 
     * {@link element} or empty string if {@link element} does not contain 
     * {@param property}.
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
     * Retrieves the string attribute value associated to {@param attribute} by
     * evaluating {@param page} if {@link attributes} does not contain
     * @{param key}. The cached result is cach caching the result.
     *
     * @public
     * @static
     * @async
     * @param {Page} page Current working instance of {@link Page}.
     * @param {ElementHandle<Element>} element Element parsed from {@link Page}.
     * @param {WebElementAttribute} attribute Target attribute name of 
     * {@link element}.
     * @returns {Promise<string>} String value of target attribute associated to 
     * {@param attribute} if it exists, otherwise empty string.
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
     * Returns the associated parent to {@link element} if the parent exists,
     * otherwise undefined.
     *
     * @public
     * @static
     * @async
     * @param {ElementHandle<Element>} element Child element.
     * @returns {Promise<ElementHandle<Element>>} The associated parent to 
     * {@link element} if the parent exists, otherwise undefined.
     */
    public static async getParent(element: ElementHandle<Element>): Promise<ElementHandle<Element>> {
        const parent: ElementHandle<ParentNode> = await element.getProperty('parentNode')
        return parent as ElementHandle<Element> 
    }

    /**
     * Returns true if the current element being handled has the following:
     *      1. a non-empty question and answer.
     *      2. the answer is not '-ignored-input-fields'.
     *      3. the question has not yet been handled already.
     * @public
     * @static
     * @param webPage Current working instace of {@link WebPage}.
     * @param element Element to be handled.
     * @returns true if properties 1-3 are true, otherwise false.
     */
    public static shouldHandle(webPage: WebPage, element: WebElement): boolean {
        return element.question
            && element.answer
            && element.answer !== '-ignored-input-fields'
            && webPage.handledQuestions.has(element.question) === false
    }

    /**
     * Calls {@link getProperty}.
     *
     * @public
     * @async
     * @param {WebElementProperty} property Target property name of 
     * {@link element}
   * @returns {Promise<string>} String value of target property value of 
     * {@link element} or empty string if {@link element} does not contain 
     * {@param property}.
     */
    public async getProperty(property: WebElementProperty): Promise<string> {
        return await WebElement.getProperty(this.element, property)
    }

    /**
     * Calls {@link getAttribute}.
     *
     * @public
     * @async
     * @param {WebElementAttribute} attribute Target attribute name of 
     * {@link element}.
     * @returns {Promise<string>} String value of target attribute associated to 
     * {@param attribute} if it exists, otherwise empty string.
     */
    public async getAttribute(attribute: WebElementAttribute): Promise<string> {
        return await WebElement.getAttribute(this.webPage.page, this.element, attribute)
    }

    /**
     * Calls {@link getParent}.
     *
     * @public
     * @async
     * @returns {Promise<ElementHandle<Element>>} The associated parent to 
     * {@link element} if the parent exists, otherwise undefined.
     */
    public async getParent(): Promise<ElementHandle<Element>> {
        return await WebElement.getParent(this.element)
    }

    /**
     * Returns the property value of 'id' from {@link element} if it exists. If
     * 'id' does not exist, returns the property value of 'innerText' from 
     * {@link element} if it exist. If neither exists, returns empty string.
     *
     * @public
     * @async
     * @returns {Promise<string>} Property value of 'id', 'innerText' or empty
     * string.
     */
    public async getPartialID(): Promise<string> {
        const id: string = await this.getProperty(WebElementProperty.ID)
        if(id !== ''){
            return id
        }

        const innerText: string = await this.getProperty(WebElementProperty.InnerText)
        if(innerText !== ''){
            return innerText
        }

        return ''
    }


    /**
     * Default implementation for initializing parameters of {@link WebElement}.
     *
     * @public
     * @async
     * @returns {Promise<void>}
     */
    public async init(): Promise<void> {
        this.id = await this.getProperty(WebElementProperty.ID)
    }


    /**
     * Default implementation for handling the current {@link WebElement}. The
     * default implementation thows an error for 'Method not implemented' as 
     * each inherited child of {@link WebElement} should have unique cases for
     * {@func handle}.
     *
     * @public
     * @async
     * @returns {Promise<void>}
     */
    public async handle(): Promise<void> {
        throw new Error("Method not implemented.");
    }


    /**
     * Default implementation to return the string value representation of 
     * {@link WebElement}.
     *
     * @public
     * @async
     * @returns {Promise<string>} Calls the native {@func toString()} method.
     */
    public async toString(): Promise<string> {
        return this.toString()
    }
}