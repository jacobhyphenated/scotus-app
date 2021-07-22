import { whenDefined } from "./functional";

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
      const value: string = undefined;
      whenDefined(value, (_) => {
        expect(true).toBeFalsy();
      });
    });
  });
});