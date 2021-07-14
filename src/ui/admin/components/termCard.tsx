import { Grid, makeStyles, Paper, Theme, Typography } from "@material-ui/core";
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
    [theme.breakpoints.down('xs')]: {
      maxWidth: '100%',
    },
    [theme.breakpoints.up('sm')]: {
      maxWidth: 400,
    },
    [theme.breakpoints.up('md')]: {
      maxWidth: 600,
    },
    [theme.breakpoints.up('xl')]: {
      maxWidth: 900,
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
      <Grid container direction="row" justifyContent='space-between' alignItems='center'>
        <Grid item>
          <Grid container direction="column">
            <Grid item>
              <Typography variant="h6">{term.otName}</Typography>
            </Grid>
            <Grid item>
              <Typography>{term.name}</Typography>
            </Grid>
          </Grid>
        </Grid>
        <Grid item>
          <Typography color={ term.inactive ? 'error' : 'textPrimary' }>
            {term.inactive ? 'Inactive' : 'Active'} 
          </Typography>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default TermCard;