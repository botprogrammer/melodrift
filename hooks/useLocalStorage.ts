import { useState, useCallback } from 'react'

export function useLocalStorage<T>(key: string, initialValue: T) {
  // Initialize state with a function to avoid unnecessary localStorage access during SSR
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue
    }
    try {
      const item = window.localStorage.getItem(key)
      return item ? (typeof initialValue === 'string' ? item as T : JSON.parse(item)) : initialValue
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  // Memoize the setValue function to prevent unnecessary re-renders
  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      
      if (typeof window !== 'undefined') {
        if (typeof valueToStore === 'string') {
          window.localStorage.setItem(key, valueToStore)
        } else {
          window.localStorage.setItem(key, JSON.stringify(valueToStore))
        }
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error)
    }
  }, [key, storedValue])

  return [storedValue, setValue] as const
}
