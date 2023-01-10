import { whenDefined } from "./functional";
import { groupBy } from "./functional";

describe('Functional Utilitites', () => {

  describe('whenDefined', () => {
    it ('should execute code block when defined', () => {
      expect.assertions(1);
      whenDefined('string', (value) => {
        expect(value).toBe('string');
      });
    });

    it('should not execute code block when undefined', () => {
      expect.assertions(0);
      const value: string | undefined = undefined;
      whenDefined(value, (_) => {
        expect(true).toBeFalsy();
      });
    });
  });
  
  describe('groupBy', () => {
    it('should group like values from object', () => {
      const array = [{
        id: 1,
        title: 'my title',
      }, {
        id: 2,
        title: 'my title',
      },{
        id: 3,
        title: 'other',
      }];

      const result = groupBy(array, 'title');
      expect(result.size).toBe(2);
      expect(result.get('other')?.length).toBe(1);
      expect(result.get('other')!![0].id).toBe(3);
      expect(result.get('my title')?.length).toBe(2);
    });
  });
});