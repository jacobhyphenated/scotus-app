import { createLinks, stripLinks } from "./linkParse";
import { render } from '@testing-library/react';
import { BrowserRouter } from "react-router-dom";

describe('Link Parse', () => {
  const warn = global.console.warn;
  beforeAll(() => {
    global.console.warn = jest.fn();
  });
  afterAll(() => {
    global.console.warn = warn;
  });

  describe('Create Links', () => {

    const renderWithRouter = (text: string) => {
      return render(
        <BrowserRouter>
          {createLinks(text)}
        </BrowserRouter>,
      );
    };

    it('should handle a string with no links', () => {
      const text = 'this is a normal string with no links';
      const result = renderWithRouter(text);
      expect(result.getByText(text)).toBeDefined();
      expect(result.queryAllByRole('link')).toHaveLength(0);
    });

    it('should handle a string with one link', () => {
      const text = 'we are linking to [[51]]one v. two[[/]] for this text';
      const result = renderWithRouter(text);
      const link = result.getByRole('link');
      expect(link.textContent).toBe('one v. two');
      expect(link).toHaveAttribute('href', '/case/51');
      expect(result.container.textContent).toBe('we are linking to one v. two for this text');
    });

    it('should handle a string with multiple links', () => {
      const text = 'we are linking to [[51]]one v. two[[/]] and also for [[6]]another case[[/]]';
      const result = renderWithRouter(text);
      const links = result.getAllByRole('link');
      expect(links).toHaveLength(2);
      expect(links[0].textContent).toBe('one v. two');
      expect(links[0]).toHaveAttribute('href', '/case/51');
      expect(links[1].textContent).toBe('another case');
      expect(links[1]).toHaveAttribute('href', '/case/6');
      expect(result.container.textContent).toBe('we are linking to one v. two and also for another case');
    });

    it('should handle a string with invalid link id', () => {
      const text = 'this is a [[bad]]bad case[[/]] link';
      const result = renderWithRouter(text);
      expect(result.getByText(text)).toBeDefined();
      expect(result.queryAllByRole('link')).toHaveLength(0);
    });

    it('should handle a string with invalid link syntax', () => {
      const text = 'this is a [[6]]bad case[[/] link';
      const result = renderWithRouter(text);
      expect(result.getByText(text)).toBeDefined();
      expect(result.queryAllByRole('link')).toHaveLength(0);
    });
  });

  describe('Strip Links', () => {
    it('Should remove link markup', () => {
      const text = 'we are linking to [[51]]one v. two[[/]] and also for [[6]]another case[[/]]';
      const result = render(stripLinks(text));
      expect(result.container.textContent).toBe('we are linking to one v. two and also for another case');
      expect(result.queryAllByRole('link')).toHaveLength(0);
    });
  });
});