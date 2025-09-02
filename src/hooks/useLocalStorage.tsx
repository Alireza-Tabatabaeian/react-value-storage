import {KeyValueStorage, KeyValueStore} from "../core"
import {useState} from "react"

export type UseLocalStorageInterface = {
    /** Reads a value by path, e.g. "form.values.username", "items[0].name", or "items.0.name". */
    getStorageValue: (key: string) => unknown
    /**
     * Sets a value by path without forcing a re-render.
     * Pass `forceUpdateState=true` if you want an immediate re-render.
     */
    setStorageValue: (key: string, value: unknown, forceUpdateState?: boolean) => void
    /** Removes a value by path without forcing a re-render.
     * Pass `forceUpdateState=true` if you want an immediate re-render.
     */
    deleteStorageValue: (key: string, setUndefined?: boolean, forceUpdateState?: boolean) => void
    /** Forces a re-render using an immutable clone of the storage. */
    updateStorageState: () => void
}

/**
 *
 * highly recommended to use Static Keys in order to prevent mistyping issues.
 * adapt the following approach and you won't get into further issues.
 *
 * const USER_PREFERRED_NOTIFY_TYPE = "userPreferredNotifyType"
 * setStorageValue(USER_PREFERRED_NOTIFY_TYPE, [NotificationTypes.SMS, NotificationTypes.EMAIL])
 * getStorageValue(USER_PREFERRED_NOTIFY_TYPE) as NotificationTypes[]
 *
 * you can also define a class called "GlobalKeys" with keys as static properties like this:
 *
 * export class GlobalKeys {
 *     static USER_PREFERRED_NOTIFY_TYPE = "userPreferredNotifyType"
 *     static SELECTED_THEME = "selectedThemeKey"
 * }
 *
 * and then:
 *
 * const selectedTheme = getStorageValue(GlobalKeys.SELECTED_THEME)
 *
 * call `updateStorageState()` for component refresh
 *
 * @param initialValues
 */
export const useLocalStorage = (initialValues: KeyValueStore = {}): UseLocalStorageInterface => {
    const [keyValueStorage, setKeyValueStorage] = useState(new KeyValueStorage(initialValues))

    /**
     *
     * @param key
     * an example is: "form.values.userName"
     * the return type is set as unknown so use it with as to specify the type like below:
     * const username = keyValueStorage.getValue("form.values.username") as string
     * array items can be accessed by index with these methods:
     *  - keyValueStorage.getValue("myArray[0].name")
     *  - keyValueStorage.getValue("myArray.0.name")
     */
    const getStorageValue = (key: string) => {
        return keyValueStorage.getValue(key)
    }

    /**
     *
     * @param key
     * @param value
     * @param forceUpdateState // if you wish to update the preview after setting the value pass true. default: false
     *
     * any values can be set like this:
     * const testData = {
     *     name: "Alireza",
     *     hobbies: ["Chess", "Movies", ...]
     * }
     * keyValueStorage.setValue("myTestData", testData)
     * now `keyValueStorage.getValue("myTestData.hobbies.0")` will return "Chess" ;)
     */
    const setStorageValue = (key: string, value: unknown, forceUpdateState: boolean = false) => {
        keyValueStorage.setValue(key, value)
        if (forceUpdateState)
            setKeyValueStorage(keyValueStorage.getClone())
    }

    const deleteStorageValue = (key: string, setUndefined: boolean = false, forceUpdateState: boolean = false) => {
        keyValueStorage.delValue(key, setUndefined)
        if (forceUpdateState)
            setKeyValueStorage(keyValueStorage.getClone())
    }

    /**
     * setting the value won't cause component refresh (no more refresh compete;) )
     * in order to refresh the component call this method
     */
    const updateStorageState = () => setKeyValueStorage(keyValueStorage.getClone())

    return {getStorageValue, setStorageValue, deleteStorageValue, updateStorageState}
}