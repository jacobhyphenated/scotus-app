import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/styles';
import { Theme, Typography, Grid, Paper } from '@material-ui/core';
import { Case, TermSummary, CaseStore, TermJusticeSummary, TermCourtSummary } from '../../../stores/caseStore';
import { shuffleArray } from '../../../util';
import { CaseGridRow } from './';

const useStyles = makeStyles( (theme: Theme) => ({
  summaryBox: {
    padding: theme.spacing(2),
    marginBottom: theme.spacing(1),
    overflow: 'hidden',
    whiteSpace: 'nowrap',
  },
  termSummaryGrid: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(3),
  },
  error: {
    marginBottom: theme.spacing(5),
  },
}));

interface Props {
  cases: Case[]
  termId: number;
  caseStore: CaseStore;
  invalidTerm: () => void;
  onCaseClick?: (scotusCase: Case) => void;
}

const TermSummaryComplete = (props: Props) => {
  const classes = useStyles();
  const [summary, setSummary] = useState<TermSummary | null>(null);

  const importantCases = shuffleArray(props.cases.filter(c => c.important));

  const sortJusticeSummary = (j1: TermJusticeSummary, j2: TermJusticeSummary) => {
    return j2.percentInMajority - j1.percentInMajority;
  };

  const sortCourtSummary = (c1: TermCourtSummary, c2: TermCourtSummary) => {
    return c2.cases - c1.cases;
  };

  const { invalidTerm, caseStore, termId } = props;
  useEffect(() => {
    const getTermSummary = async () => {
      try {
        const summaryResult = await caseStore.getTermSummary(termId);
        let caseTotal = 0;
        let reverseRemandTotal = 0;
        summaryResult.courtSummary.forEach(item => {
          caseTotal += item.cases;
          reverseRemandTotal += item.reversedRemanded;
        });
        summaryResult.courtSummary.push({
          cases: caseTotal,
          reversedRemanded: reverseRemandTotal,
          court: { id: 0, name: 'All Cases', shortName: 'all' },
          affirmed: caseTotal - reverseRemandTotal,
        });
        setSummary(summaryResult);
      } catch (e) {
        console.error(e);
        invalidTerm();
      }
    };

    getTermSummary();
  }, [caseStore, termId, invalidTerm]);

  return (
    <>
      <Typography variant="h5" color="textSecondary">The Justices</Typography>
      <Grid container direction="row" className={classes.termSummaryGrid} spacing={1}>
        {summary && summary.justiceSummary.sort(sortJusticeSummary).map(item => (
          <Grid item key={item.justice.id} xs={6} sm={4} md={3} lg={2} xl={1}>
            <TermJusticeSummaryBox item={item} />
          </Grid>
        ))}
      </Grid>

      <Typography variant="h5" color="textSecondary">Appeals Court Stats</Typography>
      <Grid container direction="row" className={classes.termSummaryGrid} spacing={1}>
        {summary && summary.courtSummary.filter(c => c.cases > 1).sort(sortCourtSummary).map(item => (
          <Grid item key={item.court.id} xs={1} sm={6} md={4} lg={3} xl={2}>
            <TermCourtSummaryBox item={item} />
          </Grid>
        ))}
      </Grid>
      
      <CaseGridRow cases={importantCases} title="Key Decision Highlights" onCaseClick={props.onCaseClick} />
    </>
  );
};

export default TermSummaryComplete;

interface TermJusticeSummaryProps {
  item: TermJusticeSummary;
}

const TermJusticeSummaryBox = (props: TermJusticeSummaryProps) => {

  const classes = useStyles();

  const { item } = props;

  return (
    <Paper elevation={1} className={classes.summaryBox}>
      <Grid container direction="column">
        <Grid item>
          <Typography variant="subtitle2" color="textSecondary">Cases: {item.casesWithOpinion}</Typography>
        </Grid>
        <Grid item>
          <Typography variant="h6">{item.justice.name}</Typography>
        </Grid>
        <Grid item>
          <Grid item>
            <Typography>In Majority: {Math.round(item.percentInMajority * 100)}%</Typography>
          </Grid>
          <Grid item>
            <Typography>Authored Opinions: {item.majorityAuthor + item.concurringAuthor + 
              item.concurJudgementAuthor + item.dissentAuthor + item.dissentJudgementAuthor}</Typography>
          </Grid>
          <Grid item>
            <Typography>Concurrences Authored: {item.concurringAuthor + item.concurJudgementAuthor}</Typography>
          </Grid>
          <Grid item>
            <Typography>Dissents Authored: {item.dissentAuthor + item.dissentJudgementAuthor}</Typography>
          </Grid>
        </Grid>
      </Grid>
    </Paper>
  );
};

interface TermCourtSummaryProps {
  item: TermCourtSummary;
}

const TermCourtSummaryBox = (props: TermCourtSummaryProps) => {

  const classes = useStyles();

  return (
    <Paper elevation={1} className={classes.summaryBox}>
      <Grid container direction="column">
        <Grid item>
          <Typography variant="h6" title={props.item.court.name}>{props.item.court.name}</Typography>
        </Grid>
        <Grid item>
          <Typography>Cases: {props.item.cases}</Typography>
        </Grid>
        <Grid item>
          <Grid item>
            <Typography>Overturned: {Math.round(props.item.reversedRemanded / props.item.cases * 100)}%</Typography>
          </Grid>
        </Grid>
      </Grid>
    </Paper>
  );
};
