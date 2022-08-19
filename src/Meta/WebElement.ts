import { WebPage } from '@/WebPage'
import { ElementHandle, JSHandle, Page } from 'puppeteer'

export class WebElement {
    private ref: ElementHandle<Element>
    private properties: Map<string, string>
    private type: string

    constructor(ref: ElementHandle<Element>) {
        if (ref) {
            this.ref = ref
            this.properties = new Map()
        } else {
            console.log('null reference in WebElement')
        }
    }

    public static fromSource(rawElements: ElementHandle<Element>[]): WebElement[] {
        return rawElements.map((rawElement) => new WebElement(rawElement))
    }

    private async extractProperty(property: string): Promise<string> {
        if (!this.ref) return ''
        // const wrapper: JSHandle<unknown> = await this.ref.getProperty(property)
        const wrapper: JSHandle<unknown> = await this.ref.getProperty(property)
        return (await wrapper.jsonValue()) as string
    }

    public async getProperty(key: string): Promise<string> {
        let value: string = this.properties.get(key)

        if (!value) {
            value = await this.extractProperty(key)
            this.properties.set(key, value)
        }

        return value ? value : ''
    }

    public async getParent(): Promise<WebElement> {
        const parentNode: ElementHandle<ParentNode> = await this.ref.getProperty('parentNode')
        return parentNode ? new WebElement(parentNode as ElementHandle<Element>) : undefined
    }

    public async getChildren(page: Page): Promise<WebElement[]> {
        const target = `#${await this.getProperty('id')} > [id]`
        const rawElements: ElementHandle<Element>[] = await page.$$(target)

        const refId: string = await this.getProperty('id')
        const listHandle: JSHandle<HTMLCollection> = await this.ref.evaluateHandle(() => {
            const ref = document.getElementById(refId)
            return ref ? ref.children : undefined
        })

        const children: WebElement[] = []

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

    public async getChildrenWithProperty(page: Page, property: string): Promise<WebElement[]> {
        if (parent) {
            const children: WebElement[] = await this.getChildren(page)
            return children.filter(async (child) => (await child.getProperty(property)) !== '')
        }

        return []
    }

    public async addProperty(key: string, value: string): Promise<string> {
        const existingEntry: string = this.properties.get(key)
        this.properties.set(key, value)
        return existingEntry
    }

    public async removeProperty(key: string): Promise<string> {
        const existingEntry: string = this.properties.get(key)
        this.properties.delete(key)
        return existingEntry
    }
}
