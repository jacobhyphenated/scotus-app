import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Typography, withStyles, Theme, Grid, Fab, TextField, Button, MenuItem } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import { History } from 'history';
import { CaseStore, Case } from '../../../stores/caseStore';
import { autorun } from 'mobx';
import CaseCard from '../components/caseCard';

const styleDecorator = withStyles((theme: Theme) => ({
  fab: {
    position: 'fixed',
    right: '25%',
    bottom: '10vh',
  },
  search: {
    'margin-top': `${theme.spacing(5)}px`,
    'margin-bottom': `${theme.spacing(4)}px`,
  },
}));

interface Props {
  routing: History;
  caseStore: CaseStore;
  classes: {[id: string]: string};
}

interface State {
  termResults: Case[];
  searchText: string;
  selectedTermId: number | null;
  searching: boolean;
}

@inject('routing', 'caseStore')
@observer
class CasePage extends Component<Props, State> {

  state: State = {
    termResults: [],
    searchText: '',
    selectedTermId: null,
    searching: true,
  }

  componentDidMount() {
    autorun((reaction) => {
      const allTerms = this.props.caseStore.allTerms;
      if (allTerms.length > 0 && !this.state.selectedTermId) {
        this.setSelectedTerm(allTerms[allTerms.length - 1].id);
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

  render() {
    const { termResults, searchText, selectedTermId, searching } = this.state;
    const allTerms = this.props.caseStore.allTerms;
    const filteredCases = !searchText ? 
      termResults : 
      termResults.filter(c => c.case.toLocaleLowerCase().indexOf(searchText.toLocaleLowerCase()) !== -1);
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
            <TextField
              id="admin-case-search"
              className={this.props.classes.search}
              label="Filter"
              size="small"
              color="primary"
              variant="outlined"
              value={searchText}
              onChange={this.changeSearchText}
            />
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

export default styleDecorator(CasePage);
