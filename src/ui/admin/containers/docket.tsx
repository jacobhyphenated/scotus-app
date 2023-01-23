import React, { useCallback, useContext, useEffect, useState } from 'react';
import { inject, observer } from 'mobx-react';
import { BareDocket, FullDocket, DocketStoreContext } from '../../../stores/docketStore';
import { Typography, Theme, Grid, Fab, TextField, InputAdornment, Button, makeStyles } from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import AddIcon from '@material-ui/icons/Add';
import { History } from 'history';
import DocketCard from '../components/docketCard';

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

interface Props {
  routing: History;
}

const DocketPage = (props: Props) => {
  
  const [searchResults, setSearchResults] = useState<BareDocket[]>([]);
  const [searchText, setSearchText] = useState('');

  const docketStore = useContext(DocketStoreContext);

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
    props.routing.push('/admin/docket/create');
  }, [props.routing]);

  const editDocket = useCallback((docket: BareDocket) => {
    props.routing.push(`/admin/docket/edit/${docket.id}`);
  }, [props.routing]);

  const casePage = useCallback((caseId: number) => {
    props.routing.push(`/admin/case/edit/${caseId}`);
  }, [props.routing]);

  const getFullDocketFun = useCallback((docketId: number): () => Promise<FullDocket> => {
    return () => docketStore.getDocketById(docketId);
  }, [docketStore]);

  const unassigned = docketStore.unassignedDockets;
  const classes = useStyles();

  return (
    <>
      <Typography variant="h4">Dockets</Typography>
      <Grid container direction="row" alignItems="baseline">
        <TextField
          className={classes.search}
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
        <Button color="primary" onClick={search}>Search</Button>
      </Grid>
      {searchResults.length === 0 &&
        <Typography variant="h5">Unassigned:</Typography>
      }
      <Grid container>
        {(searchResults.length === 0 ? unassigned : searchResults).map( docket => (
          <Grid item key={docket.id} xs={12} md={6} lg={4} xl={3}>
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

export default inject('routing')(observer(DocketPage));
