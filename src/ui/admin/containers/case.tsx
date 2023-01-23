import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { inject, observer } from 'mobx-react';
import { Typography, Theme, Grid, Fab, TextField, MenuItem, makeStyles } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import { History } from 'history';
import { Case, CaseStatus, CaseStoreContext } from '../../../stores/caseStore';
import { autorun } from 'mobx';
import CaseCard from '../components/caseCard';

const useStyles = makeStyles((theme: Theme) =>({
  fab: {
    position: 'fixed',
    right: '25%',
    bottom: '10vh',
  },
  filters: {
    marginTop: theme.spacing(5),
    marginBottom: theme.spacing(4),
  },
  searchBox: {
    width: 250,
  },
}));

interface Props {
  routing: History;
}

const CasePage = (props: Props) => {

  const [termResults, setTermResults] = useState<Case[]>([]);
  const [searchText, setSearchText] = useState('');
  const [selectedTermId, setSelectedTermId] = useState<number | null>(null);
  const [searching, setSearching] = useState(true);
  const [caseStatus, setCaseStatus] = useState<CaseStatus | 'all'>('all');

  const caseStore = useContext(CaseStoreContext);

  useEffect(() => {
    document.title = 'SCOTUS App | Admin | Case';
  }, []);

  const setSelectedTerm = useCallback(async (termId: number) => {
    try {
      setSearching(true);
      setSelectedTermId(termId);
      const results = await caseStore.getCaseByTerm(termId);
      setTermResults(results);
      setSearching(false);
    } catch (e: any) {
      setSearching(false);
      console.error(e?.errorMessage ?? 'Error occurred getting cases by term', e);
    }
  }, [caseStore]);


  useEffect(() =>{
    autorun((reaction) => {
      const allTerms = caseStore.allTerms;
      if (allTerms.length > 0 && !selectedTermId) {
        setSelectedTerm(allTerms[0].id);
        reaction.dispose();
      }
    });
  },[caseStore.allTerms, selectedTermId, setSelectedTerm]);

  const changeSelectedTerm = useCallback((event: React.ChangeEvent<{value: unknown}>) => {
    setSelectedTerm(event.target.value as number);
  }, [setSelectedTerm]);

  const changeSearchText = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(event.target.value);
  },[]);

  const createCase = useCallback(() => {
    props.routing.push('/admin/case/create');
  },[props.routing]);

  const editCase = useCallback((c: Case) => {
    props.routing.push(`/admin/case/edit/${c.id}`);
  },[props.routing]);

  const changeCaseStatus = useCallback((event: React.ChangeEvent<{value: unknown}>) => {
    setCaseStatus(event.target.value as CaseStatus | 'all');
  },[]);

  const classes = useStyles();

  const allTerms = caseStore.allTerms;
  const filteredCases = useMemo(() => (
    (!searchText ? termResults : 
      termResults.filter(c => c.case.toLocaleLowerCase().indexOf(searchText.toLocaleLowerCase()) !== -1)
    ).filter(c => caseStatus === 'all' || c.status === caseStatus)
  ), [caseStatus, searchText, termResults]);
  return (
    <>
      <Grid container direction="row" spacing={3} alignItems="center">
        <Grid item><Typography variant="h4">Cases</Typography></Grid>
        {!!selectedTermId &&
          <Grid item>
            <TextField
              id="admin-case-term-filter"
              label="Term"
              size="small"
              color="primary"
              variant="outlined"
              select
              value={selectedTermId}
              onChange={changeSelectedTerm}
            >
              {allTerms.map(term => (
                <MenuItem key={term.id} value={term.id}>{term.name}</MenuItem>
              ))}
            </TextField>
          </Grid>
        }
      </Grid>
      {searching ?
        <Typography variant="h6" color="textSecondary">Searching...</Typography>  
        :
        <>
          <Grid container direction="row" alignItems="baseline" spacing={2} className={classes.filters}>
            <Grid item>
              <TextField
                id="admin-case-search"
                label="Filter"
                size="small"
                color="primary"
                variant="outlined"
                value={searchText}
                onChange={changeSearchText}
              />
            </Grid>
            <Grid item>
              <TextField
                id="create-case-status-select"
                label="Status"
                size="small"
                color="primary"
                variant="outlined"
                className={classes.searchBox}
                select
                value={caseStatus}
                onChange={changeCaseStatus}
              >
                <MenuItem value="all">All</MenuItem>
                {Object.keys(CaseStatus).map(status => (
                  <MenuItem key={status} value={status}>{status}</MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
          <Grid container>
            {filteredCases.map(filteredCase => (
              <Grid item key={filteredCase.id} xs={12} md={6} lg={4}>
                <CaseCard key={filteredCase.id} case={filteredCase} onEditCase={editCase} />
              </Grid>
            ))}
          </Grid>
        </>
      }
      <Fab className={classes.fab} onClick={createCase} color="primary" aria-label="add">
        <AddIcon />
      </Fab>
    </>
  );
};

export default inject('routing')(observer(CasePage));
