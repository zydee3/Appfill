import { ElementHandle, JSHandle, Page } from 'puppeteer'

/**
 * A wrapper for {@link ElementHandle<Element>} to provide parsing functionality.
 *
 * @export
 * @class WebElement
 * @typedef {WebElement}
 */
export class WebElement {
    /**
     * Stored reference to {@link ElementHandle}.
     *
     * @public
     * @type {ElementHandle<Element>}
     */
    public ref: ElementHandle<Element>
    /**
     * A record of all previously parsed properties of {@link ElementHandle}.
     *
     * @private
     * @type {Map<string, string>}
     */
    private properties: Map<string, string>
    /**
     * A record of all previously parsed aattributes of {@link ElementHandle}.
     *
     * @private
     * @type {Map<string, string>}
     */
    private attributes: Map<string, string>

    /**
     * Creates an instance of WebElement.
     *
     * @constructor
     * @param {ElementHandle<Element>} ref
     */
    constructor(ref: ElementHandle<Element>) {
        if (ref) {
            this.ref = ref
            this.properties = new Map()
            this.attributes = new Map()
        } else {
            console.log('null reference in WebElement')
        }
    }

    public async init(page: Page, props: Array<string>, attr: Array<string>) {
        props.forEach((property) => this.getProperty(property))
        attr.forEach((attribute) => this.getAttribute(page, attribute))
    }

    /**
     * Converts Array<{@link ElementHandle<Element>}> to
     * Array<{@link WebElement}>.
     *
     * @public
     * @static
     * @param {Array<ElementHandle<Element>>} rawElements elements to be
     * converted.
     * @returns {Array<WebElement>} an array of the converted elements.
     */
    public static fromSource(rawElements: Array<ElementHandle<Element>>): Array<WebElement> {
        return rawElements.map((rawElement) => new WebElement(rawElement))
    }

    /**
     * From {@link ref}, returns the property string value associated to
     * {@param property} or empty string if no such property exists.
     *
     * @private
     * @async
     * @param {string} property target property name of {@link ref}
     * @returns {Promise<string>} target property value of {@link ref} or empty
     * string if {@link ref} does not contain {@param property}.
     */
    private async extractProperty(property: string): Promise<string> {
        if (!this.ref) {
            return ''
        }

        const wrapper: JSHandle<unknown> = await this.ref.getProperty(property)
        const value = (await wrapper.jsonValue()) as string
        return value ? value : ''
    }

    /**
     * Retrieves the string property value associated to {@param key} by
     * checking if {@link properties} contains {@param key}. If no,
     * {@link fromSource()} is called and the result is cached. The cached
     * result is returned.
     *
     * @public
     * @async
     * @param {string} key target property name of {@link ref}
     * @returns {Promise<string>} target property value of {@link ref} or empty
     * string if {@link ref} does not contain {@param property}.
     */
    public async getProperty(key: string): Promise<string> {
        let value: string = this.properties.get(key)

        if (!value) {
            value = await this.extractProperty(key)
            this.properties.set(key, value)
        }

        return value
    }

    /**
     * Retrieves the string attribute value associated to {@param key} by
     * evaluating {@param page} if {@link attributes} does not contain
     * @{param key}. The cached result is cach caching the result.
     *
     * @public
     * @async
     * @param {string} key target property name of {@link ref}
     * @returns {Promise<string>} target property value of {@link ref} or empty
     * string if {@link ref} does not contain {@param property}.
     */
    public async getAttribute(page: Page, key: string): Promise<string> {
        let value: string = this.attributes.get(key)

        if (!value) {
            value = await page.evaluate((element, tag) => element.getAttribute(tag), this.ref, key)
            value = value ? value : ''
            this.attributes.set(key, value)
        }

        return value
    }

    /**
     * Description placeholder
     *
     * @public
     * @async
     * @returns {Promise<WebElement>}
     */
    public async getParent(): Promise<WebElement> {
        const parentNode: ElementHandle<ParentNode> = await this.ref.getProperty('parentNode')
        return parentNode ? new WebElement(parentNode as ElementHandle<Element>) : undefined
    }

    /**
     * Description placeholder
     *
     * @public
     * @async
     * @param {Page} page
     * @returns {Promise<Array<WebElement>>}
     */
    public async getChildren(page: Page): Promise<Array<WebElement>> {
        //todo: redo this function
        const target = `#${await this.getProperty('id')} > [id]`
        const rawElements: Array<ElementHandle<Element>> = await page.$$(target)

        const refId: string = await this.getProperty('id')
        const listHandle: JSHandle<HTMLCollection> = await this.ref.evaluateHandle(() => {
            const ref = document.getElementById(refId)
            return ref ? ref.children : undefined
        })

        const children: Array<WebElement> = []

        if (listHandle) {
            const properties = await listHandle.getProperties()
            for (const property of properties.values()) {
                const element = property.asElement() as ElementHandle<Element>
                if (element) {
                    children.push(new WebElement(element))
                }
            }
        }

        return children
    }

    /**
     * Description placeholder
     *
     * @public
     * @async
     * @param {string} property
     * @returns {Promise<WebElement>}
     */
    public async getAncestorWithProperty(property: string): Promise<WebElement> {
        let parent: WebElement = await this.getParent()
        while (parent) {
            if (await parent.getProperty(property)) {
                return parent
            }
            parent = await parent.getParent()
        }

        return undefined
    }

    /**
     * Description placeholder
     *
     * @public
     * @async
     * @param {Page} page
     * @param {string} property
     * @returns {Promise<WebElement>}
     */
    public async getAncestorOfProperty(page: Page, property: string): Promise<WebElement> {
        let parent: WebElement = await this.getParent()
        while (parent) {
            if ((await parent.getChildrenWithProperty(page, property)).length >= 1) {
                return parent
            }

            parent = await parent.getParent()
        }

        return parent
    }

    /**
     * Description placeholder
     *
     * @public
     * @async
     * @param {Page} page
     * @param {string} property
     * @returns {Promise<Array<WebElement>>}
     */
    public async getChildrenWithProperty(page: Page, property: string): Promise<Array<WebElement>> {
        if (parent) {
            const children: Array<WebElement> = await this.getChildren(page)
            return children.filter(async (child) => (await child.getProperty(property)) !== '')
        }

        return []
    }

    /**
     * Description placeholder
     *
     * @public
     * @async
     * @param {string} key
     * @param {string} value
     * @returns {Promise<string>}
     */
    public async addProperty(key: string, value: string): Promise<string> {
        const existingEntry: string = this.properties.get(key)
        this.properties.set(key, value)
        return existingEntry
    }

    /**
     * Description placeholder
     *
     * @public
     * @async
     * @param {string} key
     * @returns {Promise<string>}
     */
    public async removeProperty(key: string): Promise<string> {
        const existingEntry: string = this.properties.get(key)
        this.properties.delete(key)
        return existingEntry
    }

    /**
     * Description placeholder
     *
     * @public
     * @async
     * @returns {Promise<string>}
     */
    public async getPartiallyUniqueID(): Promise<string> {
        const id: string = await this.getProperty('id')
        return id !== '' ? id : await this.getProperty('innerText')
    }
}
