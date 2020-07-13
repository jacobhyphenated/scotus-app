import React from 'react';
import { makeStyles } from '@material-ui/styles';
import { Theme, Grid, Typography, Hidden } from '@material-ui/core';
import { Case, CaseStatus } from '../../../stores/caseStore';
import { shuffleArray } from '../../../util';
import CasePreviewCard from './casePreview';

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

const dismissedCases: (c: Case) => boolean = c => [CaseStatus.DIG, CaseStatus.DISMISSED, CaseStatus.GVR].includes(c.status);

const random3Cases: (cases: Case[]) => Case[] = cases => ([
  ...shuffleArray(cases.filter(c => c.important)),
  ...shuffleArray(cases.filter(c => !c.important)),
].slice(0,4));

const TermSummaryInProgress = (props: Props) => {
  const classes = useStyles();

  const decided = props.cases.filter(c => c.decisionDate)
    .sort((c1, c2) => c2.decisionDate!.compareTo(c1.decisionDate!));
  const open = props.cases.filter(c => !dismissedCases(c) && !c.argumentDate);
  
  const recentlyDecided = [
    ...decided.filter(c => c.important),
    ...decided.filter(c => !c.important),
  ].slice(0,4);
  const awaitingDecision = random3Cases(props.cases.filter(c => !c.decisionDate && c.argumentDate && !dismissedCases(c)));
  // cases to watch
  const openCases = random3Cases([
    ...open, 
    ...props.cases.filter(c => ![...recentlyDecided, ...awaitingDecision].find(rd => rd.id === c.id)),
  ]);

  const gridRow: (cases: Case[], title: string) => JSX.Element = (cases, title) => (
    <>
      {cases.length > 0 &&
        <>
          <Typography variant="h5" color="textSecondary">{title}</Typography>
          <Grid container direction="row" justify="flex-start" spacing={2} className={classes.row}>
            <Grid item xs={12} sm={6} md={4} lg={3}>
              <CasePreviewCard case={cases[0]} onClick={props.onCaseClick} />
            </Grid>
            { cases.length > 1 && 
              <Hidden xsDown>
                <Grid item xs={12} sm={6} md={4} lg={3}>
                  <CasePreviewCard case={cases[1]} onClick={props.onCaseClick} />
                </Grid>
              </Hidden>
            }
            { cases.length > 2 && 
              <Hidden smDown>
                <Grid item xs={12} sm={6} md={4} lg={3}>
                  <CasePreviewCard case={cases[2]} onClick={props.onCaseClick} />
                </Grid>
              </Hidden>
            }
            { cases.length > 3 && 
              <Hidden mdDown>
                <Grid item xs={12} sm={6} md={4} lg={3}>
                  <CasePreviewCard case={cases[3]} onClick={props.onCaseClick} />
                </Grid>
              </Hidden>
            }
          </Grid>
        </>
      }
    </>
  );

  return (
    <>
      {gridRow(recentlyDecided, 'Recently Decided')}
      {gridRow(awaitingDecision, 'Awaiting Decision')}
      {gridRow(openCases, 'Cases to Watch')}
    </>
  );
};

export default TermSummaryInProgress;