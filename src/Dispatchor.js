import Event from './Event'

class Dispatchor {
  constructor () {
    this._events = new Map()
  }
  eventNames () {
    return Array.from(this._events.keys())
  }
  listeners (event) {
    return (this._events.get(event) || []).map(handler => handler.fn)
  }

  emit (evt) {
    const args = Object.values(arguments)

    if (this._events.has('*')) {
      this._runListeners('*', args)
    }

    if (!this._events.has(evt)) {
      return false
    }
    this._runListeners(evt, args.slice(1))
    return true
  }

  on (event, fn, context) {
    return this._addListener(event, fn, context, false)
  }

  once (event, fn, context) {
    return this._addListener(event, fn, context, true)
  }

  removeListener (evt, fn, context, once) {
    if (!this._events.has(evt)) return this
    if (!fn) {
      this._clearEvent(evt)
      return this
    }

    const listeners = this._events.get(evt)

    const events = []

    if (listeners.fn) {
      if (
        listeners.fn === fn &&
        (!once || listeners.once) &&
        (!context || listeners.context === context)
      ) {
        this._clearEvent(evt)
      }
    } else {
      listeners.forEach(listener => {
        if (
          listener.fn !== fn ||
          (once && !listener.once) ||
          (context && listener.context !== context)
        ) {
          events.push(listener)
        }
      })

      if (events.length) {
        this._events.set(evt, events)
      } else {
        this._events.delete(evt)
      }
    }

    return this
  }

  removeAllListeners (evt) {
    if (evt) {
      if (this._events.has(evt)) {
        this._clearEvent(evt)
      }
    } else {
      this._events.clear()
    }
    return this
  }

  // alias methods
  off (eventName, listener) {
    return this.removeListener(eventName, listener)
  }
  addListener (eventName, listener) {
    return this.on(eventName, listener)
  }

  // internal methods
  _clearEvent (evt) {
    this._events.delete(evt)
  }
  _addListener (evt, fn, context, once) {
    if (typeof fn !== 'function') {
      throw new TypeError('The listener must be a function')
    }

    const listener = new Event(fn, context || this, once)

    if (!this._events.has(evt)) {
      this._events.set(evt, [])
    }
    const listeners = this._events.get(evt)
    listeners.push(listener)

    return this
  }

  _runListeners (evt, args) {
    const listeners = this._events.get(evt)
    listeners.forEach(listener => {
      if (listener.once) {
        this.removeListener(evt, listener.fn, undefined, true)
      }
      Reflect.apply(listener.fn, listener.context, args)
    })
  }
}

export default Dispatchor
