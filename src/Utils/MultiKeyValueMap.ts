import { MultiKeyMap } from "./MultiKeyMap"

export class MultiKeyValueMap<K,V> {
    private keys: Map<K, number>
    private values: Map<number, V[]>

    constructor() {

    }

    public get(key: K): V[] 
}