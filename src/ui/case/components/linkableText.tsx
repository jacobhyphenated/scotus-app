import { Theme } from "@mui/material";
import makeStyles from '@mui/styles/makeStyles';
import { createLinks } from "../../../util/linkParse";


const useStyles = makeStyles( (_: Theme) => ({
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
