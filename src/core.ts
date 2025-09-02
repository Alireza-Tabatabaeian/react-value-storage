import {deepSet, deepGet, deepClone, deepRemove} from "./tools"

export type KeyValueStore = Record<string, unknown>

export class KeyFormatException extends Error {
    constructor(message: string) {
        super(message)
        this.name = 'KeyFormatException'
    }
}

export class KeyNotFound extends Error {
    constructor(message: string) {
        super(message)
        this.name = 'KeyNotFounded'
    }
}

export class RawValueDetected extends Error {
    constructor(message: string) {
        super(message)
        this.name = 'RawValueDetected'
    }
}


interface KeyValueStorageInterface {
    getValue: (key: string) => unknown
    setValue: (key: string, value: unknown) => void
    delValue: (key: string) => void
    getClone: () => KeyValueStorage
}

export class KeyValueStorage implements KeyValueStorageInterface {
    private readonly _storage: KeyValueStore

    constructor(initialValue: KeyValueStore) {
        this._storage = initialValue
    }

    /**
     * might throw KeyFormatException or RawValueDetected so use it in try-catch
     * KeyFormatException throws when the key is emptyString
     * RawValueDetected throws when an object is set to be assigned to a raw value, in this case the value will be lost
     */
    setValue = (key: string, value: unknown): void => {
        if (key.trim() === '') {
            throw new KeyFormatException('Key must be a non-empty string.')
        }
        deepSet(this._storage, key.trim(), value)
    }

    getValue = (key: string): unknown => {
        if (key.trim() === '') {
            throw new KeyFormatException('Key must be a non-empty string.')
        }
        return deepGet(this._storage, key.trim())
    }

    delValue = (key: string, setUndefined: boolean = false): unknown => {
        if (key.trim() === '') {
            return // don't bother as it's ok if nothing happens
        }
        return deepRemove(this._storage, key.trim(), setUndefined)
    }

    getClone = () => new KeyValueStorage(deepClone(this._storage))
}