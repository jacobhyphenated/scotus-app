import { useMemo } from 'react';
import { makeStyles } from '@material-ui/styles';
import { Theme, Paper, Grid, Typography, IconButton } from '@material-ui/core';
import BackIcon from '@material-ui/icons/ArrowBack';
import { Case, CaseStore, FullCase, Term } from '../../../stores/caseStore';
import { forkJoin } from 'rxjs';
import { inject, observer } from 'mobx-react';
import { History } from 'history';
import { CaseListItem } from '../components';
import { useParams } from 'react-router';
import { Justice, JusticeStore } from '../../../stores/justiceStore';
import { Opinion, OpinionType } from '../../../stores/opinionStore';
import { partitionArray } from '../../../util';
import { useState } from 'react';
import { useEffect } from 'react';
import { useCallback } from 'react';

const useStyles = makeStyles((theme: Theme) => ({
  paper: {
    marginTop: theme.spacing(1),
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    padding: theme.spacing(2),
    height: `calc(100vh - ${theme.spacing(8)}px)`,
    overflow: 'scroll',
  },
  caseGroup: {
    padding: theme.spacing(1),
  },
}));

interface Props {
  caseStore: CaseStore;
  justiceStore: JusticeStore;
  routing: History;
}

const TermJusticeSummary = (props: Props) => {
  
  const [termCases, setTermCases] = useState<FullCase[]>([]);
  const [term, setTerm] = useState<Term>();
  const [justice, setJustice] = useState<Justice>();

  const { termId, justiceId } = useParams<{ termId: string, justiceId: string }>();

  const dataLoadingError = useCallback((error: any) => {
    console.warn(error);
    props.routing.replace('/');
  }, [props.routing]);

  useEffect(() => {
    if (props.caseStore.allTerms.length > 0 && !term) {
      const selectedTerm = props.caseStore.allTerms.find(t => t.id === Number(termId));
      if (!selectedTerm) {
        dataLoadingError(`${termId} is not a valid term id`);
        return;
      }
      setTerm(selectedTerm);
    }
  }, [dataLoadingError, props.caseStore.allTerms, term, termId]);

  useEffect(() => {
    const loadTermCases = async () => {
      if (termId && !isNaN(Number(termId))) {
        const cases = await props.caseStore.getCaseByTerm(Number(termId));
        const fetchAllSubscription = forkJoin(cases.filter(c => c.argumentDate).map(c => props.caseStore.getCaseById(c.id)))
          .subscribe({
            next: setTermCases,
            error: dataLoadingError,
          });
          return () => fetchAllSubscription.unsubscribe();
      } else {
        dataLoadingError(`${termId} is not a valid term id`);
      }
    };
    loadTermCases();
  }, [dataLoadingError, props.caseStore, termId]);

  useEffect(() => {
    const loadJustice = async () => {
      if (justiceId && !isNaN(Number(justiceId))) {
        try {
          const j = await props.justiceStore.getById(Number(justiceId));
          setJustice(j);
        } catch(e) {
          dataLoadingError(e);
        }
      } else {
        dataLoadingError(`${justiceId} is not a valid justice id`);
      }
    };
    loadJustice();
  }, [dataLoadingError, justiceId, props.justiceStore]);

  useEffect(() => {
    document.title = `SCOTUS App | Term ${term?.name} | ${justice?.name}`;
  }, [term, justice]);

  const back = useCallback(() => {
    props.routing.goBack();
  }, [props.routing]);

  const onCaseClick = useCallback((c: Case) => {
    props.routing.push(`/case/${c.id}`);
  }, [props.routing]);

  const classes = useStyles();

  const caseGroupRow = useCallback((cases: FullCase[], header: string) => {
    if (cases.length === 0) {
      return <></>;
    }
    return (
      <Grid item>
        <div className={classes.caseGroup}>
          <Grid container direction="column">
            <Grid item><Typography variant="h6">{header} ({cases.length})</Typography></Grid>
            {cases.map(c => (
              <CaseListItem key={c.id} onCaseClick={onCaseClick} scotusCase={c} caseStore={props.caseStore} />
            ))}
          </Grid>
        </div>
      </Grid>
    );
  }, [classes.caseGroup, onCaseClick, props.caseStore]);


  const isAuthor = useCallback((o: Opinion) => o.justices.some(j => j.isAuthor && j.justiceId === justice?.id), [justice]);
  const isAuthorOfType = useCallback((c: FullCase, types: OpinionType[]) => c.opinions.some(o => isAuthor(o) && types.includes(o.opinionType)), [isAuthor]);
  const isInMajority = useCallback((c: FullCase) => c.opinions.some(o => {
    return [OpinionType.MAJORITY, OpinionType.PER_CURIUM, OpinionType.CONCUR_JUDGEMENT, OpinionType.CONCURRENCE].includes(o.opinionType)
      && o.justices.some(j => j.justiceId === justice?.id);
  }), [justice]);
  const isInDissent = useCallback((c: FullCase) => c.opinions.some(o => {
    return [OpinionType.DISSENT, OpinionType.DISSENT_JUDGEMENT].includes(o.opinionType)
      && o.justices.some(j => j.justiceId === justice?.id);
  }), [justice]);

  const [authored, remaining] = useMemo(() => partitionArray(termCases, c => c.opinions.some(isAuthor)), [isAuthor, termCases]);
  const majorityAuthor = useMemo(() => authored.filter(c => isAuthorOfType(c, [OpinionType.MAJORITY])), [authored, isAuthorOfType]);
  const concurringAuthor = useMemo(() => authored.filter(c => isAuthorOfType(c, [OpinionType.CONCURRENCE, OpinionType.CONCUR_JUDGEMENT])), [authored, isAuthorOfType]);
  const dissentJudgement = useMemo(() => authored.filter(c => isAuthorOfType(c, [OpinionType.DISSENT_JUDGEMENT])), [authored, isAuthorOfType]);
  const dissentAuthor = useMemo(() => authored.filter(c => isAuthorOfType(c, [OpinionType.DISSENT])), [authored, isAuthorOfType]);
  const [otherMajority, nonMajority] = useMemo(() => partitionArray(remaining, isInMajority), [isInMajority, remaining]);
  const otherDissent = useMemo(() => nonMajority.filter(isInDissent), [isInDissent, nonMajority]);

  if (!justice) {
    return <></>;
  }

  return (
    <Paper className={classes.paper}>
      <Grid container direction="column" spacing={2}>
        <Grid item>
          <Grid container direction="row" justifyContent="flex-start" alignItems="center" spacing={1}>
            <Grid item>
              <IconButton onClick={back}>
                <BackIcon color="action" />
              </IconButton>
            </Grid>
            <Grid item>
              <Typography variant="h5">
                Argued Cases for {justice.name} for the {term?.name} term 
              </Typography>
            </Grid>
          </Grid>
        </Grid>
        {caseGroupRow(majorityAuthor, 'Authored Opinions of the Court')}
        {caseGroupRow(concurringAuthor, 'Concurring Opinions')}
        {caseGroupRow(dissentJudgement, 'Concurring in Part and Dissenting in Part')}
        {caseGroupRow(dissentAuthor, 'Dissenting Opinions')}
        {caseGroupRow(otherMajority, 'Other Cases in Majority')}
        {caseGroupRow(otherDissent, 'Other Cases in Dissent')}
      </Grid>
    </Paper>
  );
};

export default inject('caseStore', 'justiceStore', 'routing')(observer(TermJusticeSummary));
