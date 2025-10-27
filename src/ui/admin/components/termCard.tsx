import { Grid, Paper, Stack, Theme, Typography } from "@mui/material";
import makeStyles from '@mui/styles/makeStyles';
import { useCallback } from "react";
import { Term } from "../../../stores/caseStore";

interface Props {
  term: Term;
  onClick: (term: Term) => void;
}

const useStyles = makeStyles( (theme: Theme) => ({
  termCard: {
    margin: theme.spacing(1),
    padding: theme.spacing(1),
    paddingRight: theme.spacing(3),
    cursor: 'pointer',
    [theme.breakpoints.down('sm')]: {
      width: '100%',
    },
    [theme.breakpoints.up('sm')]: {
      width: 400,
    },
    [theme.breakpoints.up('md')]: {
      width: 600,
    },
    [theme.breakpoints.up('xl')]: {
      width: 900,
    },
  },
}));

const TermCard = (props: Props) => {

  const { term, onClick } = props; 

  const classes = useStyles();

  const clickEvent = useCallback(() => {
    onClick(term);
  }, [term, onClick]);

  return (
    <Paper elevation={1} onClick={clickEvent} className={classes.termCard}>
      <Grid container justifyContent='space-between' alignItems='center'>
        <Grid>
          <Stack>
            <Typography variant="h6">{term.otName}</Typography>
            <Typography>{term.name}</Typography>
          </Stack>
        </Grid>
        <Grid>
          <Typography color={ term.inactive ? 'error' : 'textPrimary' }>
            {term.inactive ? 'Inactive' : 'Active'} 
          </Typography>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default TermCard;