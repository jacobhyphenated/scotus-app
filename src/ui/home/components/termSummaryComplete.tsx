import { useState, useEffect, useCallback, useMemo } from 'react';
import { makeStyles } from '@mui/styles';
import { Theme, Typography, Grid, Paper, Hidden } from '@mui/material';
import { Case, TermSummary, CaseStore, TermJusticeSummary, TermCourtSummary } from '../../../stores/caseStore';
import { shuffleArray } from '../../../util';
import { CaseGridRow, CasePreviewCard } from './';

const useStyles = makeStyles( (theme: Theme) => ({
  summaryBox: {
    padding: theme.spacing(2),
    marginBottom: theme.spacing(1),
    overflow: 'hidden',
    whiteSpace: 'nowrap',
  },
  clickable: {
    cursor: 'pointer',
  },
  termSummaryGrid: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(3),
  },
  error: {
    marginBottom: theme.spacing(5),
  },
  extraTopMargin: {
    marginTop: theme.spacing(2),
  },
  tableHead: {
    fontWeight: 'bold',
    borderBottomStyle: 'solid',
    borderBottomWidth: 2,
    borderBottomColor: theme.palette.primary.main,
    borderRightStyle: 'solid',
    borderRightWidth: 1,
    borderRightColor: theme.palette.primary.main,
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
  },
  tableLeft: {
    fontWeight: 'bold',
    borderRightStyle: 'solid',
    borderRightWidth: 2,
    borderRightColor: theme.palette.primary.main,
    borderBottomStyle: 'solid',
    borderBottomWidth: 1,
    borderBottomColor: theme.palette.primary.main,
  },
  tableCell: {
    borderRightStyle: 'solid',
    borderRightWidth: 1,
    borderRightColor: theme.palette.primary.main,
    borderBottomStyle: 'solid',
    borderBottomWidth: 1,
    borderBottomColor: theme.palette.primary.main,
    textAlign: 'center',
    height: 64,
  },
  matchVeryLow: {
    background: '#e7edf2',
  },
  matchLow: {
    background: '#d0dce5',
  },
  matchLowMid: {
    background: '#b9cbd8',
  },
  matchMid: {
    background: '#a1bacb',
  },
  matchMidHigh: {
    background: '#8aa9be',
  },
  matchHigh: {
    background: '#7397b1',
  },
  matchVeryHigh: {
    background: '#5b86a4',
  },
  matchExtreme: {
    background: '#447597',
  },
}));

interface Props {
  cases: Case[]
  termId: number;
  caseStore: CaseStore;
  invalidTerm: () => void;
  onCaseClick?: (scotusCase: Case) => void;
  navigateToJustice: (termId: number, justiceId: number) => void;
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

  const { invalidTerm, caseStore, termId, navigateToJustice } = props;
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

  const onJusticeClick = useCallback((justiceId: number) => {
    navigateToJustice(termId, justiceId);
  }, [navigateToJustice, termId]);

  const keyLink = useMemo(() => {
    return {
      text: 'All Key Decisions',
      to: `/term/${termId}/key`,
    };
  }, [termId]);

  const justiceAgreement = useMemo(() => {
    if (!summary) {
      return null;
    }
    const justiceNameLookup = (id: number) => {
      return summary.justiceSummary.find((js => js.justice.id === id))?.justice.name ?? `${id}`;
    };

    const ideologyMap = ['Sonia Sotomayor', 'Elena Kagan', 'Ketanji Brown Jackson', 'Ruth Bader Ginsburg', 'Stephen Breyer', 'John Roberts', 'Brett Kavanaugh', 'Amy Coney Barrett', 'Neil Gorsuch', 'Samuel Alito', 'Clarence Thomas'];

    return summary.justiceAgreement.map(j => ({
      justiceName: justiceNameLookup(j.justiceId),
      ...j,
    })).sort((j1, j2) => {
      // sort by the most agreeable justices as defined by the sum of the agreement map values
      // return Object.values(j2.opinionAgreementMap).reduce((a, j) => a + j, 0) - Object.values(j1.opinionAgreementMap).reduce((a, j) => a + j, 0);
      return ideologyMap.indexOf(j1.justiceName) - ideologyMap.indexOf(j2.justiceName);
    });

  }, [summary]);

  const heatMapStyle = useCallback((percentage: number) => {
    if (percentage <= .255) {
      return classes.matchVeryLow;
    } else if (percentage <= .35) {
      return classes.matchLow;
    } else if (percentage <= .45) {
      return classes.matchLowMid;
    } else if (percentage <= .55) {
      return classes.matchMid;
    } else if (percentage <= .65) {
      return classes.matchMidHigh;
    } else if (percentage <= .75) {
      return classes.matchHigh;
    } else if (percentage <= .85) {
      return classes.matchVeryHigh;
    } else {
      return classes.matchExtreme;
    }
  }, [classes]);

  const agreementHeatMap = useCallback((agreementMap: 'caseAgreementMap' | 'opinionAgreementMap') => {
    return (
      <table>
        <thead>
          <tr>
            <td></td>
            {justiceAgreement && justiceAgreement.map( j => (<td key={j.justiceId} className={classes.tableHead}>{j.justiceName}</td>) ) }
          </tr>
        </thead>
        <tbody>
          {justiceAgreement && justiceAgreement.map(j =>(
            <tr key={j.justiceId}>
              <td className={classes.tableLeft}>{j.justiceName}</td>
              {justiceAgreement.map(other => (
                <td key={other.justiceId} className={`${classes.tableCell} ${j.justiceId !== other.justiceId && heatMapStyle(j[agreementMap][other.justiceId])}`}>
                  {j.justiceId === other.justiceId 
                    ? '\u2014\u2014'
                    : `${Math.round(j[agreementMap][other.justiceId] * 100)}%`}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  }, [classes, heatMapStyle, justiceAgreement]);

  return (
    <>
      <CaseGridRow cases={importantCases} title="Key Decision Highlights" onCaseClick={props.onCaseClick} link={keyLink} />
      <Typography variant="h5" color="textSecondary">The Justices</Typography>
      <Grid container direction="row" className={classes.termSummaryGrid} spacing={1}>
        {summary && summary.justiceSummary.sort(sortJusticeSummary).map(item => (
          <Grid item key={item.justice.id} xs={12} sm={6} md={3} lg={3} xl={2}>
            <TermJusticeSummaryBox onJusticeClick={onJusticeClick} item={item} />
          </Grid>
        ))}
      </Grid>

      <Typography variant="h5" color="textSecondary">Appeals Court Stats</Typography>
      <Grid container direction="row" className={classes.termSummaryGrid} spacing={1}>
        {summary && summary.courtSummary.filter(c => c.cases > 1).sort(sortCourtSummary).map(item => (
          <Grid item key={item.court.id} xs={12} sm={6} md={4} lg={3} xl={2}>
            <TermCourtSummaryBox item={item} />
          </Grid>
        ))}
      </Grid>
      
      <Hidden mdDown>
        <Typography variant="h5" color="textSecondary">Justice Agreement by Case</Typography>
        <Typography>The percentage of time the justices are on the same side of a case.</Typography>
        <Grid container direction="row" className={classes.termSummaryGrid} spacing={1}>
          {agreementHeatMap('caseAgreementMap')}
        </Grid>
      </Hidden>

      <Hidden mdDown>
        <Typography variant="h5" color="textSecondary">Justice Agreement by Opinion</Typography>
        <Typography>The percentage of the time the justice along the top joins the same opinions as the justice along the left.</Typography>
        <Grid container direction="row" className={classes.termSummaryGrid} spacing={1}>
        {agreementHeatMap('opinionAgreementMap')}
        </Grid>
      </Hidden>

      <Typography variant="h5" color="textSecondary">Pace of Decisions</Typography>
      <Typography><>Average Decision Time: {summary?.averageDecisionDays} days</></Typography>
      <Typography><>Median Decision Time: {summary?.medianDecisionDays} days</></Typography>

      <Typography variant="h5" color="textSecondary" className={classes.extraTopMargin}>Opinions Along Party Lines ({summary?.partySplit.length})</Typography>
      <Grid container direction="row" className={classes.termSummaryGrid} spacing={1}>
        {summary && summary.partySplit.map(c => (
          <Grid key={c.id} item xs={12} sm={6} md={4} lg={3}>
            <CasePreviewCard case={c} onClick={props.onCaseClick} />
          </Grid>
        ))}
      </Grid>

      <Typography variant="h5" color="textSecondary">Unanimous Opinions ({summary?.unanimous.length})</Typography>
      <Grid container direction="row" className={classes.termSummaryGrid} spacing={1}>
        {summary && summary.unanimous.map(c => (
          <Grid key={c.id} item xs={12} sm={6} md={4} lg={3}>
            <CasePreviewCard case={c} onClick={props.onCaseClick} />
          </Grid>
        ))}
      </Grid>
      
    </>
  );
};

export default TermSummaryComplete;

interface TermJusticeSummaryProps {
  item: TermJusticeSummary;
  onJusticeClick: (justiceId: number) => void;
}

const TermJusticeSummaryBox = (props: TermJusticeSummaryProps) => {

  const classes = useStyles();

  const { item, onJusticeClick } = props;

  const onClick = useCallback(() => {
    onJusticeClick(item.justice.id);
  }, [item, onJusticeClick]);

  return (
    <Paper elevation={1} className={`${classes.summaryBox} ${classes.clickable}`} onClick={onClick}>
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
