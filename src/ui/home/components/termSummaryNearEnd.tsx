import React from 'react';
import { makeStyles } from '@material-ui/styles';
import { Theme, Grid, Typography } from '@material-ui/core';
import { Case, dismissedCases } from '../../../stores/caseStore';
import { shuffleArray } from '../../../util';
import { CaseGridRow, CasePreviewCard } from './';

const useStyles = makeStyles( (theme: Theme) => ({
  row: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(3),
  },
}));

interface Props {
  cases: Case[]
  onCaseClick?: (scotusCase: Case) => void;
}

const TermSummaryNearEnd = (props: Props) => {
  const classes = useStyles();

  const importantCases = props.cases.filter(c => c.important);

  const undecided = importantCases.filter(c => !c.decisionDate && c.argumentDate && !dismissedCases(c));
  const decided = shuffleArray(importantCases.filter(c => c.result));

  return (
    <>
      <CaseGridRow cases={decided} title="Key Decisions" onCaseClick={props.onCaseClick} />

      <Typography variant="h5" color="textSecondary">Anticipated Cases</Typography>
      <Grid container direction="row" justifyContent="flex-start" spacing={2} className={classes.row}>
        {undecided.map(r => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={r.id}>
            <CasePreviewCard case={r} onClick={props.onCaseClick} />
          </Grid>
        ))}
      </Grid>
    </>
  );
};

export default React.memo(TermSummaryNearEnd);
