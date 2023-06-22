/**
 * nextTick
 * @description 异步调用队列
 * @author moting.nq
 * @create 2022-06-14 12:46
 */

const callbacks: Array<(...args: any[]) => void> = []
let pending = false

function flushCallbacks() {
  pending = false
  const copies = callbacks.slice(0)
  callbacks.length = 0
  for (let i = 0; i < copies.length; i++) {
    copies[i]()
  }
}

const p = Promise.resolve()
const timerFunc = () => {
  p.then(flushCallbacks)
}

export default function nextTick(cb?: (...args: any[]) => void, ctx?: Record<string, any>) {
  let _resolve
  callbacks.push(() => {
    if (cb) {
      try {
        cb.call(ctx)
      } catch (e) {
        console.log(e)
      }
    } else if (_resolve) {
      _resolve(ctx)
    }
  })
  if (!pending) {
    pending = true
    timerFunc()
  }
}
