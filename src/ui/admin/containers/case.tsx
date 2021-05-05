import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Typography, withStyles, Theme, Grid, Fab, TextField, Button, MenuItem, WithStyles, createStyles } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import { History } from 'history';
import { CaseStore, Case, CaseStatus } from '../../../stores/caseStore';
import { autorun } from 'mobx';
import CaseCard from '../components/caseCard';

const styles = (theme: Theme) => createStyles(({
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

interface Props extends WithStyles<typeof styles> {
  routing: History;
  caseStore: CaseStore;
}

interface State {
  termResults: Case[];
  searchText: string;
  selectedTermId: number | null;
  searching: boolean;
  caseStatus: CaseStatus | 'all';
}

@inject('routing', 'caseStore')
@observer
class CasePage extends Component<Props, State> {

  state: State = {
    termResults: [],
    searchText: '',
    selectedTermId: null,
    searching: true,
    caseStatus: 'all',
  }

  componentDidMount() {
    autorun((reaction) => {
      const allTerms = this.props.caseStore.allTerms;
      if (allTerms.length > 0 && !this.state.selectedTermId) {
        this.setSelectedTerm(allTerms[0].id);
        reaction.dispose();
      }
    });
  }

  async setSelectedTerm(termId: number) {
    try {
      this.setState({searching: true, selectedTermId: termId});
      const results = await this.props.caseStore.getCaseByTerm(termId);
      this.setState({termResults: results, searching: false});
    } catch (e) {
      console.error(e?.errorMessage ?? 'Error occurred getting cases by term', e);
    }
  }

  changeSelectedTerm = (event: React.ChangeEvent<{value: unknown}>) => {
    this.setSelectedTerm(event.target.value as number);
  };

  changeSearchText = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({searchText: event.target.value});
  }

  createCase = () => {
    this.props.routing.push('/admin/case/create');
  }

  editCase = (c: Case) => {
    this.props.routing.push(`/admin/case/edit/${c.id}`);
  }

  createTerm = () => {
    this.props.routing.push('/admin/case/term/create');
  }

  changeCaseStatus = (event: React.ChangeEvent<{value: unknown}>) => {
    this.setState({ caseStatus: event.target.value as CaseStatus | 'all' });
  };

  render() {
    const { termResults, searchText, selectedTermId, searching, caseStatus } = this.state;
    const allTerms = this.props.caseStore.allTerms;
    const filteredCases = (!searchText ? 
      termResults : 
      termResults.filter(c => c.case.toLocaleLowerCase().indexOf(searchText.toLocaleLowerCase()) !== -1))
      .filter(c => caseStatus === 'all' || c.status === caseStatus);
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
                onChange={this.changeSelectedTerm}
              >
                {allTerms.map(term => (
                  <MenuItem key={term.id} value={term.id}>{term.name}</MenuItem>
                ))}
              </TextField>
            </Grid>
          }
          <Grid item>
            <Button onClick={this.createTerm} color="primary" size="small" variant="contained">
              <AddIcon />Term
            </Button>
          </Grid>
        </Grid>
        {searching ?
          <Typography variant="h6" color="textSecondary">Searching...</Typography>  
          :
          <>
            <Grid container direction="row" alignItems="baseline" spacing={2} className={this.props.classes.filters}>
              <Grid item>
                <TextField
                  id="admin-case-search"
                  label="Filter"
                  size="small"
                  color="primary"
                  variant="outlined"
                  value={searchText}
                  onChange={this.changeSearchText}
                />
              </Grid>
              <Grid item>
                <TextField
                  id="create-case-status-select"
                  label="Status"
                  size="small"
                  color="primary"
                  variant="outlined"
                  className={this.props.classes.searchBox}
                  select
                  value={caseStatus}
                  onChange={this.changeCaseStatus}
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
                  <CaseCard key={filteredCase.id} case={filteredCase} onEditCase={this.editCase} />
                </Grid>
              ))}
            </Grid>
          </>
        }
        <Fab className={this.props.classes.fab} onClick={this.createCase} color="primary" aria-label="add">
          <AddIcon />
        </Fab>
      </>
    );
  }

}

export default withStyles(styles)(CasePage);
