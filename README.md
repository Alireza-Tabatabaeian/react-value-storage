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


## Why

### Why use React Value Storage?

>React already has useState, useReducer, and context — so why another tool?

### This package solves some real developer pains you’ll likely recognize:

#### 1. Batch-friendly updates without fighting React’s re-renders

With multiple related variables, updating them one by one can trigger multiple renders in quick succession.

Sometimes later updates even miss the right state because the component re-rendered too early.

With this package, you can update as many key–paths as you want, and only call updateStorageState() when you’re ready.

👉 Fewer renders, less chance of race-y code, more predictable UI.


#### 2. Flexible object storage without rigid type boilerplate

One workaround is to keep “all related stuff” in one big object and update it.

But in TypeScript you’d have to predefine the exact object shape — which gets verbose and noisy.

Here you can use deep keys ("user.profile.name", "items[3].price") without having to define every nested level ahead of time.

👉 TypeScript stays happy, warnings stay quiet, and your code stays clean.


#### 3. Global state with zero ceremony

Instead of wiring multiple contexts or reaching for a full-blown state library, you just wrap your app with GlobalStorageContextProvider.

Any component can then call useGlobalStorage() and read/write values by path.

👉 No need for “context per domain” — you get a universal, lightweight global store.

#### 4. SSR-safe & UI-agnostic

Unlike localStorage-based solutions, this store is purely in-memory.

Safe to use in SSR environments (Next.js, Remix, etc.) without guards.

Works anywhere React does.


#### 5. Tiny, typed, tree-shakable

No dependencies beyond React.

Under the hood is just a plain JS object with deep get/set helpers.

Tree-shaking works (thanks to proper exports), so you only ship what you use.


### ✨ In short: it’s a minimal state helper that makes working with structured data + global context painless, while staying lightweight and React-idiomatic.

## License

MIT © [Alireza Tabatabaeian](https://github.com/Alireza-Tabatabaeian)
