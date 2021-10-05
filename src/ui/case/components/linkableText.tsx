import { makeStyles, Theme } from "@material-ui/core";
import { createLinks } from "../../../util/linkParse";


const useStyles = makeStyles( (theme: Theme) => ({
  inlineLink: {
    padding: 0,
  },
}));

interface Props {
  text: string;
}

const LinkableText = ({ text }: Props) => {
  const classes = useStyles();
  return createLinks(text, classes.inlineLink);
};

export default LinkableText;
