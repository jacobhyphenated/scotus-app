import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { DocketStore, BareDocket, FullDocket } from '../../../stores/docketStore';
import { Typography, withStyles, Theme, Grid, Fab, TextField, InputAdornment, Button } from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import AddIcon from '@material-ui/icons/Add';
import { History } from 'history';
import DocketCard from '../components/docketCard';

const styleDecorator = withStyles((theme: Theme) => ({
  fab: {
    position: 'fixed',
    right: '25%',
    bottom: '10vh',
  },
  search: {
    'margin-top': `${theme.spacing(2)}px`,
    'margin-bottom': `${theme.spacing(4)}px`,
  },
}));

interface Props {
  routing: History;
  docketStore: DocketStore;
  classes: {[id: string]: string};
}

interface State {
  searchResults: BareDocket[];
  searchText: string;
}

@inject('routing', 'docketStore')
@observer
class DocketPage extends Component<Props, State> {
  
  state = {
    searchResults: [],
    searchText: '',
  }

  updateSearchText = (event: React.ChangeEvent<HTMLInputElement>) => {
    const searchText = event.target.value;
    if (!searchText) {
      this.setState({ searchResults: []});
    }
    this.setState({ searchText });
  };

  search = async () => {
    if (!this.state.searchText) {
      this.setState({ searchResults: [] });
      return;
    }
    const results = await this.props.docketStore.searchDocket(this.state.searchText);
    this.setState({ searchResults: results });
  };

  keyPress = (ev: React.KeyboardEvent<HTMLDivElement>) => {
    if (ev.key === 'Enter') {
      this.search();
    }
  }

  createDocket = () => {
    this.props.routing.push('/admin/docket/create');
  };

  editDocket = (docket: BareDocket) => {
    this.props.routing.push(`/admin/docket/edit/${docket.id}`);
  }

  casePage = (caseId: number) => {
    this.props.routing.push(`/admin/case/edit/${caseId}`);
  }

  getFullDocketFun = (docketId: number): () => Promise<FullDocket> => {
    return () => this.props.docketStore.getDocketById(docketId);
  }

  render() {
    const { searchResults, searchText } = this.state;
    const unassigned = this.props.docketStore.unassignedDockets;
    return (
      <>
        <Typography variant="h4">Dockets</Typography>
        <Grid container direction="row" alignItems="baseline">
          <TextField
            className={this.props.classes.search}
            label="search all"
            variant="outlined"
            size="small"
            onChange={this.updateSearchText}
            onKeyPress={this.keyPress}
            value={searchText}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
          <Button color="primary" onClick={this.search}>Search</Button>
        </Grid>
        {searchResults.length === 0 &&
          <>
            <Typography variant="h5">Unassigned:</Typography>
          </>
        }
        <Grid container>
          {(searchResults.length === 0 ? unassigned : searchResults).map( docket => (
            <Grid item key={docket.id} xs={12} md={6} lg={4} xl={3}>
              <DocketCard
                docket={docket}
                getFullDocket={this.getFullDocketFun(docket.id)}
                onCaseClick={this.casePage}
                onEditClick={this.editDocket} />
            </Grid>
          ))}
        </Grid>
        <Fab className={this.props.classes.fab} onClick={this.createDocket} color="primary" aria-label="add">
          <AddIcon />
        </Fab>

      </>
    );
  }
}

export default styleDecorator(DocketPage);
