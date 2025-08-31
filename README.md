# React Value Storage

Tiny key-path state helper + optional global context for React apps.

- **Deep get/set/del by path**: `"user.profile.name"`, `"items[0].title"`, or `"items.0.title"`.
- **Local hook** `useLocalStorage` for co-located state.
- **Global provider + hook** `GlobalStorageContextProvider` / `useGlobalStorage` to share across components.
- **Typed**. Works great with TypeScript.

## Install

```bash
npm i react-value-storage
# or
yarn add react-value-storage
```

Peer deps: `react` and `react-dom` (v18+).

## Quick start

### Local storage (per component)

```tsx
import {useLocalStorage} from 'react-value-storage'

function Profile() {
    const {getStorageValue, setStorageValue, deleteStorageValue, updateStorageState} = useLocalStorage({
        user: {profile: {name: 'Ada', hobbies: ['Soccer', 'Swim', 'Cycling']}},
    })

    const name = (getStorageValue('user.profile.name') ?? '') as string

    const rename = (newName: string) => {
        setStorageValue('user.profile.name', newName)
        updateStorageState() // trigger rerender
        // instead of calling updateStorageState you can pass `forceUpdateState = true` when calling setValueStorage
    }

    const removeHobby = (hobby: string) => {
        const hobbyKey = 'user.profile.hobbies'
        const hobbyIndex = (getStorageValue(hobbyKey) as string[]).indexOf(hobby)
        if (hobbyIndex >= 0)
            deleteStorageValue(`${hobbyKey}.${hobbyIndex}`, forceUpdateState = true)
    }

    return (
        <>
            <div>Name: {name}</div>
            <button onClick={() => rename('Dada')}>Rename to Dada</button>
            <button onClick={() => removeHobby('Soccer')}>Remove Soccer from hobbies</button>
        </>
    );
}
```

### Global storage (shared anywhere)

```tsx
// app root (e.g., App.tsx or Next.js layout.tsx)
import {GlobalStorageContextProvider} from 'react-value-storage'

export default function App({children}) {
    return (
        <GlobalStorageContextProvider initialValues={{cart: {items: []}}}>
            {children}
        </GlobalStorageContextProvider>
    );
}
```

```tsx
// any child
import {useGlobalStorage} from 'react-value-storage'

function AddToCart({productId}: { productId: string }) {
    const {getStorageValue, setStorageValue, deleteValueStorage, updateStorageState} = useGlobalStorage()

    const add = () => {
        const items = (getStorageValue('cart.items') as string[]) ?? []
        setStorageValue('cart.items', [...items, productId])
        updateStorageState()
    }

    return <button onClick={add}>Add</button>
}
```

## API

### `useLocalStorage(initialValues?: KeyValueStore)`

Returns:

- `getStorageValue(key: string): unknown`
- `setStorageValue(key: string, value: unknown, forceUpdateState = false): void`
- `deleteStorageValue(key: string, forceUpdateState = false): void`
- `updateStorageState(): void` – forces a rerender using an immutable clone

**Key paths**

- Dots: `a.b.c`
- Array index (dot): `arr.0.name`
- Array index (bracket): `arr[0].name`
- Mixture: `arr[0].items.5`

### `GlobalStorageContextProvider`

Props:

- `initialValues?: KeyValueStore`
- `children: React.ReactNode`

### `useGlobalStorage()`

Same return shape as `useLocalStorage`, but bound to the global store. Throws if used outside the provider.

## TypeScript tips

Use string constants to avoid typos:

```ts
const USERNAME = 'form.user.name' as const
const name = getStorageValue(USERNAME) as string
```

## Notes

- The library is **UI-agnostic**: it only manages an in-memory JS object and your React rerenders.
- No localStorage/sessionStorage usage; SSR-safe by default.

## License

MIT © [Alireza Tabatabaeian](https://github.com/Alireza-Tabatabaeian)
