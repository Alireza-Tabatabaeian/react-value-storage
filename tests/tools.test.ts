import {describe, it, expect} from 'vitest'
import {deepGet, deepRemove, deepSet, parsePath} from 'src/tools'

describe('path handling', () => {
    it('test how path is parsed', () => {
        const path = 'values.0.scores[5].value'
        const parsedPath = parsePath(path)
        expect(parsedPath.length).toBe(5)
        expect(typeof parsedPath[0]).toBe('string') //values
        expect(typeof parsedPath[1]).toBe('number') // 0
        expect(typeof parsedPath[2]).toBe('string') // scores
        expect(typeof parsedPath[3]).toBe('number') // 5
        expect(typeof parsedPath[4]).toBe('string') // value
    })

    it('treats dot numeric segments as indexes', () => {
        const s: any = {}
        deepSet(s, 'students.0.name', 'Sara')
        expect(Array.isArray(s.students)).toBe(true)
        expect(s.students[0].name).toBe('Sara')
    })

    it('supports bracket numeric segments', () => {
        const s: any = {}
        deepSet(s, 'items[1].title', 'Book')
        expect(Array.isArray(s.items)).toBe(true)
        expect(s.items[1].title).toBe('Book')
    })

    it('mixes dot and bracket notations', () => {
        const s: any = {}
        deepSet(s, 'group.members[2].id', 42)
        deepSet(s, 'group.members.3.id', 43)
        expect(Array.isArray(s.group.members)).toBe(true)
        expect(s.group.members[2].id).toBe(42)
        expect(s.group.members[3].id).toBe(43)
    })

    it('reads back deep values', () => {
        const s: any = {}
        deepSet(s, 'a.b.c', 'ok')
        expect(deepGet(s, 'a.b.c')).toBe('ok')
        expect(deepGet(s, 'a.b.x')).toBeUndefined()
    })

    it('converts array-shape to object and preserves entries', () => {
        const s: any = {}

        // Now write using bracket index → should be stored as array
        deepSet(s, 'students[0].name', 'Sara')
        expect(Array.isArray(s.students)).toBe(true)

        // Now writing a property like totalCount should convert the array-shape to object while preserve students[0]
        deepSet(s, 'students.totalCount', 25)

        expect(s.students[0]).toEqual({name: 'Sara'})
        expect(s.students.totalCount).toEqual(25)
    })

    it('creates intermediate containers with correct shapes', () => {
        const s: any = {}
        deepSet(s, 'x.y[0].z', 10)
        expect(s.x).toBeTypeOf('object')
        expect(Array.isArray(s.x.y)).toBe(true)
        expect(s.x.y[0].z).toBe(10)
    })

    it('check get function with a complex data', () => {
        const s: any = {
            students: [
                {name: 'Ali', hobbies: ['Chess', 'Movies', 'Books', {'Fun Projects': ['dirfix', 'react-value-storage', 'react-form-api']}]},
            ]
        }
        expect(deepGet(s,'students.0.hobbies[3].Fun Projects.1')).toBe('react-value-storage')
    })

    it('check delete function on array when remove', () => {
        const s: any = {students:[{name: 'Ali'}, {name: 'Sarah'}]}
        deepRemove(s,'students.0')
        expect(s.students.length).toBe(1)
        expect(s.students[0].name).toBe('Sarah')
    })

    it('check delete function on object when remove', () => {
        const s: any = {name: 'Ali', age : 25}
        deepRemove(s,'age')
        expect('age' in s).toBe(false)
        expect(s.age).toBe(undefined)
    })

    it('check delete function on array when set to undefined', () => {
        const s: any = {students:[{name: 'Ali'}, {name: 'Sarah'}]}
        deepRemove(s,'students.0', true)
        expect(s.students.length).toBe(2)
        expect(s.students[0]).toBe(undefined)
        expect(s.students[1].name).toBe('Sarah')
    })

    it('check delete function on object when set to undefined', () => {
        const s: any = {name: 'Ali', age: 25}
        deepRemove(s,'age', true)
        expect('age' in s).toBe(true)
        expect(s.age).toBe(undefined)
    })
})