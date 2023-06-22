/**
 * event
 * @description 事件总线
 * @author moting.nq
 * @create 2022-06-08 14:23
 */

type Callback = (...args: any[]) => void

export default class Event<EventName extends string> {
  events: Record<EventName, Callback[]>

  constructor() {
    this.events = {} as any
  }

  public subscribe(eventName: EventName, callback: Callback) {
    if (!this.events[eventName]) {
      this.events[eventName] = []
    }
    if (typeof callback !== 'function') return
    this.events[eventName].push(callback)
  }

  public publish(eventName: EventName, params?: any) {
    const cbs = this.events[eventName]
    cbs?.forEach(cb => {
      cb(params)
    })
  }
}
