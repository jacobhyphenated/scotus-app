import { Duration, LocalDateTime, TemporalAmount } from "@js-joda/core";

export interface CacheItem<T> {
  item: T;
  expiration: LocalDateTime;
}

export class ObjectCache<T, ID extends keyof T> {

  constructor(
    private expirationTime: TemporalAmount = Duration.ofMinutes(10),
    private cacheMap: Map<T[ID], CacheItem<T>> = new Map(),
  ) { }

  getItem(id: T[ID]): T | null {
    const cacheItem = this.cacheMap.get(id);
    if (!cacheItem) {
      return null;
    }
    if (cacheItem.expiration.isBefore(LocalDateTime.now())) {
      this.cacheMap.delete(id);
      return null;
    }
    return cacheItem.item;
  }

  putItem(id: T[ID], item: T) {
    const cacheItem: CacheItem<T> = {
      item,
      expiration: LocalDateTime.now().plus(this.expirationTime),
    };
    this.cacheMap.set(id, cacheItem);
  }

  revoke(id: T[ID]) {
    this.cacheMap.delete(id);
  }
}