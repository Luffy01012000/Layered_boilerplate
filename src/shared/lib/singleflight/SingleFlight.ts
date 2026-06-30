export class SingleFlight {
  private readonly inflight = new Map<string, Promise<unknown>>()

  async use<T>(key: string, fn: () => Promise<T>): Promise<T> {
    const existing = this.inflight.get(key)

    if (existing) {
      return existing as Promise<T>
    }

    const promise = fn().finally(() => {
      this.inflight.delete(key)
    })

    this.inflight.set(key, promise)

    return promise
  }
}
