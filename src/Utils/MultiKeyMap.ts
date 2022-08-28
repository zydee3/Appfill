export class MultiKeyMap<K, V> {
    private keys: Map<K, number>
    private values: Map<number, V>
    private keyNum: number

    constructor(){
        this.keys = new Map<K, number>()
        this.values = new Map<number, V>()
        this.keyNum = 0
    }

    private getKeyFromFragment(fragment: K): number {
        const master: number = this.keys.get(fragment)
        return master ? master : -1
    }

    private getKeyFromValue(value: V): number {
        for(const [k, v] of this.values){
            if(v == value){
                return k
            }
        }

        return -1
    }

    private countMappedKeys(masterKey: number){
        const values: Array<number> = Array.from(this.keys.values())
        return values.filter(entry => entry == masterKey).length
    }

    public add(key: K, value: V) {
        const masterKey: number = this.getKeyFromValue(value)
        
        if(masterKey === -1){
            const nextKeyNum: number = this.keyNum++
            this.keys.set(key, nextKeyNum)
            this.values.set(nextKeyNum, value)
        } else {
            this.keys.set(key, masterKey)
        }
    }

    public remove(key: K): string {
        const masterKey: number = this.getKeyFromFragment(key)
        
        if(masterKey === -1){
            return
        }

        if(this.countMappedKeys(masterKey) === 1) {
            this.values.delete(masterKey)
        }

        this.keys.delete(key)
    }

    public get(key: K): V {
        if(typeof key === 'string') {
            const bgKey: string = (key as string).toLowerCase()
            for(const [k, v] of this.keys){
                const smKey: string = k as unknown as string
                if(bgKey.includes(smKey)) {
                    return this.values.get(v)
                }
            }
        } else {
            const masterKey: number = this.getKeyFromFragment(key)
            if (masterKey !== -1){
                return this.values.get(masterKey)
            }
        }

        return undefined
    }

    public getExact(key: K): V {
        const masterKey: number = this.getKeyFromFragment(key)

        return masterKey >= 0 
            ? this.values.get(masterKey) 
            : undefined
    }
}