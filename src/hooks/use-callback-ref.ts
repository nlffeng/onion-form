import { useRef, MutableRefObject } from 'react'

export default <T extends (...args: any[]) => void>(callback?: T): MutableRefObject<T | undefined> => {
  const callbackRef = useRef(callback)
  callbackRef.current = callback

  return callbackRef
}
