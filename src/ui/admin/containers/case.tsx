import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { observer } from 'mobx-react';
import { Typography, Theme, Grid2 as Grid, Fab, TextField, MenuItem } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import AddIcon from '@mui/icons-material/Add';
import { Case, CaseStatus, CaseStoreContext } from '../../../stores/caseStore';
import { autorun } from 'mobx';
import CaseCard from '../components/caseCard';
import { useNavigate } from 'react-router';

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

const CasePage = () => {

  const [termResults, setTermResults] = useState<Case[]>([]);
  const [searchText, setSearchText] = useState('');
  const [selectedTermId, setSelectedTermId] = useState<number | null>(null);
  const [searching, setSearching] = useState(true);
  const [caseStatus, setCaseStatus] = useState<CaseStatus | 'all'>('all');

  const caseStore = useContext(CaseStoreContext);
  const navigate = useNavigate();

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
    navigate('/admin/case/create');
  },[navigate]);

  const editCase = useCallback((c: Case) => {
    navigate(`/admin/case/edit/${c.id}`);
  },[navigate]);

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
      <Grid container spacing={3} alignItems="center">
        <Grid><Typography variant="h4">Cases</Typography></Grid>
        {!!selectedTermId &&
          <Grid>
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
          <Grid container alignItems="baseline" spacing={2} className={classes.filters}>
            <Grid>
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
            <Grid>
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
              <Grid key={filteredCase.id} size={{ xs: 12, md: 6, lg: 4 }}>
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

export default observer(CasePage);
