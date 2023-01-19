import React, { useMemo, useState } from 'react';
import { Theme, TextField, InputAdornment, Paper, Grid, Typography, IconButton, makeStyles } from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import BackIcon from '@material-ui/icons/ArrowBack';
import { Case, CaseSitting, CaseStatus, CaseStore, Term } from '../../../stores/caseStore';
import { Subject } from 'rxjs';
import { debounceTime, map } from 'rxjs/operators';
import { inject, observer } from 'mobx-react';
import { autorun } from 'mobx';
import { History } from 'history';
import { CaseListItem } from '../components';
import { useParams } from 'react-router';
import { useCallback } from 'react';
import { useEffect } from 'react';

const useStyles = makeStyles((theme: Theme) => ({
  paper: {
    marginTop: theme.spacing(1),
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    padding: theme.spacing(2),
    height: `calc(100vh - ${theme.spacing(8)}px)`,
    overflowY: 'scroll',
  },
  search: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(3),
    marginLeft: theme.spacing(2),
    minWidth: 300,
    [theme.breakpoints.up('sm')]: {
      width: '40vw',
    },
    [theme.breakpoints.up('xl')]: {
      width: '30vw',
    },
  },
  sitting: {
    padding: theme.spacing(1),
  },
}));

interface Props {
  caseStore: CaseStore;
  routing: History;
}

const AllTermCasesPage = (props: Props) => {

  const [termCases, setTermCases] = useState<Case[]>([]);
  const [filteredCases, setFilteredCases] = useState<Case[]>([]);
  const [searchText, setSearchText] = useState('');
  const [term, setTerm] = useState<Term>();
  const [searchText$] = useState(() => new Subject<string>());


  const caseSorter = useCallback((c1: Case, c2: Case) => {
    if (!c1.argumentDate && !!c2.argumentDate) {
      return 1;
    }
    if (!c2.argumentDate && !!c1.argumentDate) {
      return -1;
    }
    if (c1.argumentDate && c2.argumentDate) {
      const argumentOrder = c1.argumentDate.compareTo(c2.argumentDate);
      if (argumentOrder !== 0) {
        return argumentOrder;
      }
    }
    const statusOrder = [CaseStatus.GRANTED, CaseStatus.GVR,  CaseStatus.DIG, CaseStatus.DISMISSED];
    return statusOrder.indexOf(c1.status) - statusOrder.indexOf(c2.status);
  }, []);

  useEffect(() => {
    const subscription = searchText$.pipe(
      debounceTime(200),
      map(search => search.length >= 3 
        ? termCases.filter(c => c.case.toLocaleLowerCase().includes(search.toLocaleLowerCase()))
        : termCases),
    ).subscribe({
      next: cases => {
        setFilteredCases(cases);
      },
    });
    return () => subscription.unsubscribe();
  }, [searchText$, termCases]);

  const { id } = useParams<{ id: string }>();
  const allTerms = props.caseStore.allTerms;

  useEffect(() => {
    const termId = id;
    autorun((reaction) => {
      if (allTerms.length > 0 && !term) {
        const selectedTerm = allTerms.find(t => t.id === Number(termId));
        if (!selectedTerm) {
          console.warn(`${termId} is not a valid term id`);
          props.routing.replace('/');
          return;
        }
        setTerm(selectedTerm);
        document.title = `SCOTUS App | Term ${selectedTerm.name}`;
        reaction.dispose();
      }
    });
  }, [allTerms, id, props.routing, term]);

  useEffect(() => {
    if(!!term) {
      const loadCases = async () => {
        const cases = await props.caseStore.getCaseByTerm(term.id);
        setTermCases(cases);
        setFilteredCases(cases);
      };
      loadCases();
    }
  }, [term, props.caseStore]);

  const updateSearchText: React.ChangeEventHandler<HTMLInputElement> = useCallback(event => {
    const newSearchText = event.target.value;
    if (newSearchText.length < 3) {
      setFilteredCases(termCases);
    }
    setSearchText(newSearchText);
    searchText$.next(newSearchText);
  }, [searchText$, termCases]);

  const onCaseClick = useCallback((c: Case) => {
    props.routing.push(`/case/${c.id}`);
  }, [props.routing]);

  const back = useCallback(() => {
    props.routing.goBack();
  }, [props.routing]);

  const mappedCases = useMemo(() => {
    return filteredCases.reduce((acc, value) => {
      const key = value.sitting ?? 'None';
      acc.set(key, [...(acc.get(key) ?? []), value]);
      return acc;
    }, new Map<string, Case[]>());
  }, [filteredCases]);

  const classes = useStyles();

  return (
    <Paper className={classes.paper}>
      <Grid container direction="row" justifyContent="flex-start" alignItems="center" spacing={1}>
        <Grid item>
          <IconButton onClick={back}>
            <BackIcon color="action" />
          </IconButton>
        </Grid>
        <Grid item>
          <Typography variant="h4">
            Cases for the {term?.name} term 
          </Typography>
        </Grid>
      </Grid>

      <TextField
        className={classes.search}
        label="Filter"
        variant="outlined"
        size="small"
        helperText={searchText.length >0 && searchText.length < 3 && 'Enter at least 3 characters'}
        onChange={updateSearchText}
        value={searchText}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color="action" />
            </InputAdornment>
          ),
        }}
      />

      <Grid container direction="column" spacing={2}>
        {[...Object.values(CaseSitting), 'None'].filter(sitting => mappedCases.has(sitting)).map((sitting) => (
          <Grid item key={sitting}>
            <Paper className={classes.sitting}>
              {sitting !== 'None' && <Typography variant="h4">{sitting}</Typography> }
              {mappedCases.get(sitting)?.sort(caseSorter).map(termCase => (
                <CaseListItem key={termCase.id} onCaseClick={onCaseClick} scotusCase={termCase} caseStore={props.caseStore} />
              ))}
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
};

export default inject('caseStore', 'routing')(observer(AllTermCasesPage));
