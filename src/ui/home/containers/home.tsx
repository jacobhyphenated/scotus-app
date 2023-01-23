import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Theme, TextField, InputAdornment, Paper, Grid, Typography, MenuItem, Button, makeStyles } from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import { Case, CaseStoreContext, dismissedCases } from '../../../stores/caseStore';
import { Subject } from 'rxjs';
import { debounceTime, filter, mergeMap } from 'rxjs/operators';
import { inject, observer } from 'mobx-react';
import { History } from 'history';
import { CasePreviewCard, TermSummaryInProgress, TermSummaryNearEnd, TermSummaryComplete } from '../components';
import { useParams } from 'react-router';

const useStyles = makeStyles((theme: Theme) => ({
  paper: {
    marginTop: theme.spacing(1),
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    height: `calc(100vh - ${theme.spacing(8)}px)`,
    overflowY: 'scroll',
  },
  search: {
    marginBottom: theme.spacing(3),
    minWidth: 300,
    [theme.breakpoints.up('xs')]: {
      marginTop: theme.spacing(3),
    },
    [theme.breakpoints.up('sm')]: {
      width: '40vw',
      marginTop: theme.spacing(15),
    },
    [theme.breakpoints.up('xl')]: {
      width: '30vw',
    },
  },
  body: {
    marginRight: theme.spacing(2),
    marginLeft: theme.spacing(2),
    marginTop: theme.spacing(4),
  },
  searchGrid: {
    marginTop: theme.spacing(1),
  },
  searchSpacing: {
    marginRight: theme.spacing(1),
  },
}));

interface Props {
  routing: History;
}

const Home = (props: Props) => {

  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState<Case[]>([]);
  const [termCases, setTermCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTermId, setSelectedTermId] = useState<number>();
  const [searchText$] = useState(() => new Subject<string>());

  const caseStore = useContext(CaseStoreContext);

  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    document.title = 'SCOTUS App';
  }, []);

  useEffect(() => {
    const subscription = searchText$.pipe(
      debounceTime(400),
      filter(text => text.length >= 3),
      mergeMap((searchText) => caseStore.searchCase(searchText)),
    ).subscribe({
      next: setSearchResults,
      error: err => {
        console.error(err?.message ?? 'Error searching for cases', err);
      },
    });
    return () => subscription.unsubscribe();
  }, [searchText$, caseStore]);

  const allTerms = caseStore.allTerms;
  const activeTerms = useMemo(() => allTerms.filter(t => !t.inactive), [allTerms]);

  const setSelectedTerm = useCallback(async (termId: number) => {
    setSelectedTermId(termId);
    try {
      const results = await caseStore.getCaseByTerm(termId);
      setTermCases(results);
      setLoading(false);
    }
    catch (e: any) {
      console.error(e?.message ?? 'Error occurred getting cases by term', e);
      props.routing.replace('/');
    }
  }, [caseStore, props.routing]);

  useEffect(() => {
    if (activeTerms.length > 0 && !selectedTermId) {
      const termId = id;
      if (termId && !isNaN(Number(termId))) {
        setSelectedTerm(Number(termId));
      } else {
        setSelectedTerm(activeTerms[0].id);
      }
    }
  }, [activeTerms, id, selectedTermId, setSelectedTerm]);

  const handleInvalidTerm = useCallback(() => {
    setSelectedTerm(activeTerms[0].id);
  }, [activeTerms, setSelectedTerm]);
  
  const updateSearchText: React.ChangeEventHandler<HTMLInputElement> = useCallback(event => {
    const newSearchText = event.target.value;
    if (newSearchText.length < 3) {
      setSearchResults([]);
    }
    setSearchText(newSearchText);
    searchText$.next(newSearchText);
  }, [searchText$]);

  const changeSelectedTerm: React.ChangeEventHandler<HTMLInputElement> = useCallback(event => {
    setSelectedTerm(Number(event.target.value));
  }, [setSelectedTerm]);

  const onCaseClick: (scotusCase: Case) => void = useCallback(scotusCase => {
    props.routing.push(`/case/${scotusCase.id}`);
  }, [props.routing]);

  const onTermJusticeClick = useCallback((termId: number, justiceId: number) => {
    props.routing.replace(`/term/${termId}`);
    props.routing.push(`/term/${termId}/justice/${justiceId}`);
  }, [props.routing]);

  const allCasesClick = useCallback(() => {
    props.routing.replace(`/term/${selectedTermId}`);
    props.routing.push(`/term/${selectedTermId}/all`);
  }, [props.routing, selectedTermId]);

  const undecidedThisTerm = useMemo(() => termCases.filter(c => !c.decisionDate && !dismissedCases(c)), [termCases]); 
  const classes = useStyles();

  return (
    <Paper className={classes.paper}>
      <Grid container direction="row" justifyContent="center">
        <Grid item>
          <TextField
            className={classes.search}
            label="Search Cases"
            variant="outlined"
            size="medium"
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
        </Grid>
      </Grid>
      { searchResults.length === 0 && !(searchText.length >= 3) &&
        <Grid container direction="row" justifyContent="center" alignItems="center">
          <Grid item className={classes.searchSpacing}>
            <Typography>Term: </Typography>
          </Grid>
          <Grid item>
            {selectedTermId && 
              <TextField
                id="admin-case-term-filter"
                size="small"
                color="primary"
                variant="outlined"
                select
                value={selectedTermId}
                onChange={changeSelectedTerm}
              >
                {activeTerms.map(term => (
                  <MenuItem key={term.id} value={term.id}>{term.name}</MenuItem>
                ))}
              </TextField>
            }
          </Grid>
        </Grid>
      }
      {!loading &&
        <div className={classes.body}>
          {searchResults.length > 0 ? 
            <>
              <Typography variant="h5" color="textSecondary">Search results</Typography>
              <Grid container direction="row" justifyContent="flex-start" spacing={2} className={classes.searchGrid}>
              {searchResults.map(r => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={r.id}>
                  <CasePreviewCard case={r} onClick={onCaseClick} />
                </Grid>
              ))}
              </Grid>
            </>
          : searchText.length >= 3 ?
            <Typography variant="h5" color="textSecondary">No Results</Typography>
          : undecidedThisTerm.length === 0 ? 
            <TermSummaryComplete
              cases={termCases}
              termId={selectedTermId!}
              caseStore={caseStore}
              invalidTerm={handleInvalidTerm}
              onCaseClick={onCaseClick} 
              navigateToJustice={onTermJusticeClick}
            />
          : (undecidedThisTerm.length / termCases.length < .25) ?
            <TermSummaryNearEnd cases={termCases} onCaseClick={onCaseClick} />
          : <TermSummaryInProgress cases={termCases} onCaseClick={onCaseClick} />
          }
          {searchResults.length === 0 && !(searchText.length >= 3) &&
            <Button variant="text" color="secondary" onClick={allCasesClick}>All Term Cases</Button>
          }
        </div>
      }
    </Paper>
  );
};

export default inject('routing')(observer(Home));
