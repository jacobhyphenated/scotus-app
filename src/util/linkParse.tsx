import { Button } from '@mui/material';
import { Link } from 'react-router-dom';

const startElement = '[[';
const endElement = '[[/]]';
const caseIdRegex = /\[\[(\d+)\]\]/;

const parse = (
  text: string, 
  apply: (caseId: string | number, linkText: string) => JSX.Element | string,
): JSX.Element => {

  const output: (JSX.Element | string)[] = [];
  const parsedPosition = 0;
  let remainingText = text.substring(parsedPosition);

  while (remainingText.substring(parsedPosition).includes(startElement)) {
    const startPos = remainingText.indexOf(startElement);
    output.push(remainingText.substring(0, startPos));
    const matchGroup = remainingText.match(caseIdRegex);
    if (!matchGroup) {
      console.warn("no case link id found", remainingText);
      break;
    }
    const caseId = matchGroup[1];
    const endPosition = remainingText.indexOf(endElement);
    if (endPosition < 0) {
      console.warn("invalid link syntax", remainingText);
      break;
    }
    const linkText = remainingText.substring(
      startPos + matchGroup[0].length,
      endPosition,
    );
    output.push(apply(caseId, linkText));

    remainingText = remainingText.substring(endPosition + endElement.length);
  }
  output.push(remainingText);

  return <>
    {output.map((val, index) =>(
      <span key={index}>{val}</span>
    ))}
  </>;
};

export const createLinks = (text: string, className?: string): JSX.Element => {
  return parse(text, (caseId, linkText) => {
    return (
      <Button
        variant="text"
        color="primary"
        component={Link}
        className={className}
        to={ `/case/${caseId}`}
      >
        {linkText}
      </Button>
    );
  });
};

export const stripLinks = (text: string): JSX.Element => {
  return parse(text, (_, linkText) => <>{linkText}</>);
};
