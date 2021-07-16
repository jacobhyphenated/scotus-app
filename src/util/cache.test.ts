import { Duration, LocalDateTime } from "@js-joda/core";
import { CacheItem, ObjectCache } from "./cache";

interface CacheTest {
  id: number;
  foo: string;
}

describe('Object Cache', () => {
  it ('Should insert a new item', () => {
    const map = new Map<number, CacheItem<CacheTest>>();
    const cache = new ObjectCache<CacheTest, 'id'>(undefined, map);
    cache.putItem(5, {
      id: 5,
      foo: 'someString',
    });
    expect(map.get(5)).not.toBeNull();
    expect(map.get(5).item.foo).toBe('someString');
    expect(map.get(5).expiration.isAfter(LocalDateTime.now())).toBeTruthy();
  });

  it('Should retrieve a newly inserted item', () => {
    const cache = new ObjectCache<CacheTest, 'id'>();
    const item = {
      id: 4,
      foo: 'barbar',
    };
    cache.putItem(item.id, item);
    expect(cache.getItem(4)).toStrictEqual(item);
  });

  it('Should return null if the item does not exist', () => {
    const cache = new ObjectCache<CacheTest, 'id'>();
    expect(cache.getItem(2)).toBeNull();
  });

  it('Should return null if the item in the cache has expired', () => {
    const map = new Map<number, CacheItem<CacheTest>>();
    map.set(2, {
      item: {
        id: 2,
        foo: 'something',
      },
      expiration: LocalDateTime.now().minusMinutes(20),
    });
    const cache = new ObjectCache<CacheTest, 'id'>(Duration.ofMinutes(15), map);
    expect(cache.getItem(2)).toBeNull();
  });

  it('Should update the cache if inserting an item already in the cache', () =>{
    const map = new Map<number, CacheItem<CacheTest>>();
    map.set(2, {
      item: {
        id: 2,
        foo: 'something',
      },
      expiration: LocalDateTime.now().minusMinutes(5),
    });
    const cache = new ObjectCache<CacheTest, 'id'>(Duration.ofMinutes(15), map);
    cache.putItem(2, {
      id: 2,
      foo: 'somethingElse',
    });
    expect(cache.getItem(2)).toStrictEqual({
      id: 2,
      foo: 'somethingElse',
    });
  });

  it('Should revoke an item in the cache', () => {
    const map = new Map<number, CacheItem<CacheTest>>();
    map.set(2, {
      item: {
        id: 2,
        foo: 'something',
      },
      expiration: LocalDateTime.now().minusMinutes(5),
    });
    const cache = new ObjectCache<CacheTest, 'id'>(Duration.ofMinutes(15), map);
    cache.revoke(2);
    expect(cache.getItem(2)).toBeNull();
  });

  it('Should do nothing on revoking an item not in the cache', () => {
    const cache = new ObjectCache<CacheTest, 'id'>();
    cache.revoke(2);
    expect(cache.getItem(2)).toBeNull();
  });
});