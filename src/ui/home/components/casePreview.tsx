import React from 'react';
import { makeStyles } from '@material-ui/styles';
import { Theme, Paper, Grid, Typography } from '@material-ui/core';
import { Case } from '../../../stores/caseStore';

const useStyles = makeStyles( (theme: Theme) => ({
  paper: {
    margin: `${theme.spacing(1)}px`,
    padding: `${theme.spacing(1)}px`,
  },
}));

interface Props {
  case: Case
  onClick?: (scotusCase: Case) => void;
}

const CasePreviewCard = (props: Props) => {
  const classes = useStyles();
  return (
    <Paper className={classes.paper}>
      <Grid container direction="column">
        <Grid container direction="row" justify="space-between">
          <Typography color="textSecondary" variant="subtitle2">
            {props.case.status}{props.case.result && `: ${props.case.result}`}
          </Typography>
          <Typography color="textSecondary" variant="subtitle1">
            {props.case.term.name}
          </Typography>
        </Grid>
        <Typography variant="h6">
          {props.case.case}
        </Typography>
        <Typography paragraph>
          {props.case.decisionSummary ? props.case.decisionSummary : props.case.shortSummary}
        </Typography>
      </Grid>
    </Paper>
  );
};

export default CasePreviewCard;