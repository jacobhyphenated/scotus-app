import React, { useCallback, useContext, useEffect, useState } from 'react';
import { observer } from 'mobx-react';
import { BareDocket, FullDocket, DocketStoreContext } from '../../../stores/docketStore';
import { Typography, Theme, Grid2 as Grid, Fab, TextField, InputAdornment, Button } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import DocketCard from '../components/docketCard';
import { useNavigate } from 'react-router';

const useStyles = makeStyles((theme: Theme) => ({
  fab: {
    position: 'fixed',
    right: '25%',
    bottom: '10vh',
  },
  search: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(4),
  },
}));

const DocketPage = () => {
  
  const [searchResults, setSearchResults] = useState<BareDocket[]>([]);
  const [searchText, setSearchText] = useState('');

  const docketStore = useContext(DocketStoreContext);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'SCOTUS App | Admin | Docket';
  }, []);

  const updateSearchText = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const searchText = event.target.value;
    if (!searchText) {
      setSearchResults([]);
    }
    setSearchText(searchText);
  }, []);

  const search = useCallback(async () => {
    if (!searchText) {
      setSearchResults([]);
      return;
    }
    const results = await docketStore.searchDocket(searchText);
    setSearchResults(results);
  }, [docketStore, searchText]);

  const keyPress = useCallback((ev: React.KeyboardEvent<HTMLDivElement>) => {
    if (ev.key === 'Enter') {
      search();
    }
  }, [search]);

  const createDocket = useCallback(() => {
    navigate('/admin/docket/create');
  }, [navigate]);

  const editDocket = useCallback((docket: BareDocket) => {
    navigate(`/admin/docket/edit/${docket.id}`);
  }, [navigate]);

  const casePage = useCallback((caseId: number) => {
    navigate(`/admin/case/edit/${caseId}`);
  }, [navigate]);

  const getFullDocketFun = useCallback((docketId: number): () => Promise<FullDocket> => {
    return () => docketStore.getDocketById(docketId);
  }, [docketStore]);

  const unassigned = docketStore.unassignedDockets;
  const classes = useStyles();

  return (
    <>
      <Typography variant="h4">Dockets</Typography>
      <Grid container alignItems="center" className={classes.search}>
        <Grid>
          <TextField
            label="search all"
            variant="outlined"
            size="small"
            onChange={updateSearchText}
            onKeyPress={keyPress}
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
        <Grid>
          <Button color="primary" onClick={search}>Search</Button>
        </Grid>
      </Grid>
      {searchResults.length === 0 &&
        <Typography variant="h5">Unassigned:</Typography>
      }
      <Grid container>
        {(searchResults.length === 0 ? unassigned : searchResults).map( docket => (
          <Grid key={docket.id} size={{ xs: 12, md: 6, lg: 4, xl: 3 }}>
            <DocketCard
              docket={docket}
              getFullDocket={getFullDocketFun(docket.id)}
              onCaseClick={casePage}
              onEditClick={editDocket} />
          </Grid>
        ))}
      </Grid>
      <Fab className={classes.fab} onClick={createDocket} color="primary" aria-label="add">
        <AddIcon />
      </Fab>
    </>
  );
};

export default observer(DocketPage);
