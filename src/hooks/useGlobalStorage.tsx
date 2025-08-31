import React, {createContext, useContext} from "react"

import {KeyValueStore} from "../core"
import {useLocalStorage, UseLocalStorageInterface} from "./useLocalStorage"

type GlobalKeyValueStorageParams = {
    initialValues?: KeyValueStore
    children: React.ReactNode
}

const GlobalKeyValueContext = createContext<UseLocalStorageInterface | null>(null)

export const GlobalStorageContextProvider:React.FC<GlobalKeyValueStorageParams> = (
    {
        initialValues = {},
        children
    }
) => {
    const {getStorageValue, setStorageValue, deleteStorageValue, updateStorageState} = useLocalStorage(initialValues)

    return (
        <GlobalKeyValueContext.Provider value={{getStorageValue,setStorageValue,deleteStorageValue, updateStorageState}}>
            {children}
        </GlobalKeyValueContext.Provider>
    )
}


/**
 * Must be used inside <GlobalStorageContextProvider>.
 *
 * In order to use the useGlobalStorage, you'll need to alter the main response file
 * (page.js or index.js in react or layout.tsx in case developing based on NextJS or any other file that is considered as root html provider)
 * and place the children within a GlobalStorageContextProvider tag like below:
 *
 *
 * export default function RootLayout({children,}: Readonly<{ children: React.ReactNode; }>) {
 *
 *     return (
 *         <html lang="en">
 *         <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
 *           <GlobalStorageContextProvider initialValues={}>
 *             {children}
 *           </GlobalStorageContextProvider>
 *         </body>
 *         </html>
 *     );
 * }
 *
 */
export const useGlobalStorage = (): UseLocalStorageInterface => {
    const ctx = useContext(GlobalKeyValueContext)
    if (!ctx) {
        throw new Error('useGlobalStorage must be used within a GlobalStorageContextProvider')
    }
    return ctx
}