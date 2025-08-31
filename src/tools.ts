import {KeyNotFound, KeyValueStore, RawValueDetected} from "./core";

/**
 *
 * @param path
 * path to property, like "student.name"
 * if an array is saved in storage its first item can be easily accessed with : "arrayName.0" or like old school form of "arrayName[0]". both works.
 */
export const parsePath = (path: string): (string | number)[] => {
    const parts: (string | number)[] = [];
    const re = /([^[.\]]+)|\[(\d+)\]/g;
    let m: RegExpExecArray | null;

    while ((m = re.exec(path)) !== null) {
        const dotSeg = m[1];
        const bracketIndex = m[2];

        if (bracketIndex !== undefined) {
            // [123] -> number
            parts.push(Number(bracketIndex));
        } else if (dotSeg !== undefined) {
            // "0" -> number, "01" -> number (index), "users" -> string, "2025report" -> string
            if (/^\d+$/.test(dotSeg)) parts.push(Number(dotSeg));
            else parts.push(dotSeg);
        }
    }
    return parts;
};

export const deepSet = (
    obj: KeyValueStore,
    path: string,
    value: unknown
): void => {
    const keys = parsePath(path)
    let parentItem: any = obj
    let pathTrack = ''

    keys.forEach((key, i) => {
        pathTrack += (i === 0 ? '' : '.') + key

        const isLast = i === keys.length - 1
        if (isLast) {
            parentItem[key] = value
            return
        }

        const nextKey = keys[i + 1] // i < keys.length - 1, so nextKey definitely exist.
        const shouldBeArray = typeof nextKey === 'number'

        if (parentItem[key] == null) { // if key doesn't exist yet
            parentItem[key] = shouldBeArray ? [] : {}
        } else {
            const keyItem = parentItem[key]
            /**
             * if keyItem is a raw value (not an object) we can't assign next key to it so it should throw an error.
             * this only might happen if a raw value (string,number,boolean,...) had been assigned to parentItem[key] before.
             */
            if(typeof keyItem !== 'object') {
                throw new RawValueDetected(`${pathTrack} contains raw value, ${nextKey} can't be assigned to it.`)
            }

            // Fix shape if it doesn't match what we need next
            if (shouldBeArray && !Array.isArray(keyItem)) {
                // it's not much likely to happen except if user have had an object with numeric keys which has assigned to keyItem before.
                // I decided not to touch it so that user's previous shape doesn't change.
                // if you wish to change the shape to array the code in below comment might help:

                /**
                 * convert object to array
                 * const arr: any[] = []
                 *
                 * // Preserve numeric keys if current is an object with "0", "1", ...
                 * for (const k of Object.keys(keyItem)) {
                 *   if (/^\d+$/.test(k)) {
                 *     arr[Number(k)] = (keyItem as any)[k]
                 *   }
                 *   else {
                 *     // the object already has non-numeric keys so we shouldn't change the shape or some data might be lost
                 *     parentItem = keyItem
                 *     continue
                 *   }
                 * }
                 * keyItem = arr
                 */
            } else if (!shouldBeArray && Array.isArray(keyItem)) {
                // convert array to object
                parentItem[key] = { ...keyItem }
            }
        }
        parentItem = parentItem[key]
    })
}

export const deepGet = (obj: KeyValueStore, path: string): unknown => {
    const keys = parsePath(path)
    let curr: any = obj
    let pathTrack = ''
    let isFirst = true

    for (const key of keys) {
        pathTrack += isFirst ? '' : '.' + key
        isFirst = false
        if (curr == null) throw new KeyNotFound(`${pathTrack} is not defined.`)
        curr = curr[key]
    }

    return curr
}

export const deepRemove = (obj: KeyValueStore, path: string): void => {
    const keys = parsePath(path)
    let curr: any = obj
    let i = 0
    for (const key of keys) {
        if (curr == null) return
        const isLast = i === keys.length - 1
        if (isLast) {
            delete curr[key as any]
        }
        curr = curr[key]
    }
}

export function deepClone<T>(obj: T): T {
    if (obj === null || typeof obj !== 'object') return obj

    if (Array.isArray(obj)) {
        return obj.map(item => deepClone(item)) as any
    }

    const clonedObj: Record<string, unknown> = {}
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            clonedObj[key] = deepClone(obj[key])
        }
    }
    return clonedObj as T
}