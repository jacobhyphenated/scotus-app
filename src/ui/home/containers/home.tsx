import React, { Component } from 'react';
import { withStyles, WithStyles, createStyles } from '@material-ui/styles';
import { Theme, TextField, InputAdornment, Paper, Grid, Typography, MenuItem, Button } from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import { Case, CaseStore, dismissedCases } from '../../../stores/caseStore';
import { Subject } from 'rxjs';
import { debounceTime, filter, mergeMap } from 'rxjs/operators';
import { inject, observer } from 'mobx-react';
import { autorun } from 'mobx';
import { History } from 'history';
import { CasePreviewCard, TermSummaryInProgress, TermSummaryNearEnd, TermSummaryComplete } from '../components';
import { match } from 'react-router';

const styles = (theme: Theme) => createStyles({
  paper: {
    marginTop: theme.spacing(1),
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    height: `calc(100vh - ${theme.spacing(8)}px)`,
    overflow: 'scroll',
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
});

interface Props extends WithStyles<typeof styles> {
  caseStore: CaseStore;
  routing: History;
  match: match<{ id: string }>;
}

interface State {
  searchText: string;
  searchResults: Case[];
  selectedTermId?: number;
  termCases: Case[];
  loading: boolean;
}

@inject('caseStore', 'routing')
@observer
class Home extends Component<Props, State> {
  state: State = {
    searchText: '',
    searchResults: [],
    termCases: [],
    loading: true,
  };

  searchText$ = new Subject<string>();

  componentDidMount() {
    document.title = 'SCOTUS App';
    this.searchText$.pipe(
      debounceTime(400),
      filter(searchText => searchText.length >= 3),
      mergeMap((searchText) => this.props.caseStore.searchCase(searchText)),
    ).subscribe({
      next: cases => {
        this.setState({ searchResults: cases });
      },
      error: err => {
        console.error(err?.message ?? 'Error searching for cases', err);
      },
    });

    autorun((reaction) => {
      const allTerms = this.props.caseStore.allTerms.filter(t => !t.inactive);
      if (allTerms.length > 0 && !this.state.selectedTermId) {
        const termId = this.props.match.params.id;
        if (termId && !isNaN(Number(termId))) {
          this.setSelectedTerm(Number(termId));
        } else {
          this.setSelectedTerm(allTerms[0].id);
        }
        reaction.dispose();
      }
    });
  }

  setSelectedTerm = async (termId: number) => {
    this.setState({ selectedTermId: termId });
    try {
      const results = await this.props.caseStore.getCaseByTerm(termId);
      this.setState({ termCases: results, loading: false });
    }
    catch (e: any) {
      console.error(e?.message ?? 'Error occurred getting cases by term', e);
    }
  };

  handleInvalidTerm = () => {
    this.setSelectedTerm(this.props.caseStore.allTerms[0].id);
    this.props.routing.push('/');
  };
  
  updateSearchText: React.ChangeEventHandler<HTMLInputElement> = event => {
    const searchText = event.target.value;
    if (searchText.length < 3) {
      this.setState({ searchResults: [] });
    }
    this.setState({ searchText });
    this.searchText$.next(searchText);
  };

  changeSelectedTerm: React.ChangeEventHandler<HTMLInputElement> = event => {
    this.setSelectedTerm(Number(event.target.value));
  };

  onCaseClick: (scotusCase: Case) => void = scotusCase => {
    this.props.routing.push(`/case/${scotusCase.id}`);
  };

  onTermJusticeClick = (termId: number, justiceId: number) => {
    this.props.routing.replace(`/term/${termId}`);
    this.props.routing.push(`/term/${termId}/justice/${justiceId}`);
  };

  allCasesClick = () => {
    this.props.routing.replace(`/term/${this.state.selectedTermId}`);
    this.props.routing.push(`/term/${this.state.selectedTermId}/all`);
  };

  render() {
    const { searchText, selectedTermId, searchResults, termCases } = this.state;
    const activeTerms = this.props.caseStore.allTerms.filter(t => !t.inactive);

    const undecidedThisTerm = termCases.filter(c => !c.decisionDate && !dismissedCases(c)); 

    return (
      <Paper className={this.props.classes.paper}>
        <Grid container direction="row" justifyContent="center">
          <Grid item>
            <TextField
              className={this.props.classes.search}
              label="Search Cases"
              variant="outlined"
              size="medium"
              helperText={searchText.length >0 && searchText.length < 3 && 'Enter at least 3 characters'}
              onChange={this.updateSearchText}
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
            <Grid item className={this.props.classes.searchSpacing}>
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
                  onChange={this.changeSelectedTerm}
                >
                  {activeTerms.map(term => (
                    <MenuItem key={term.id} value={term.id}>{term.name}</MenuItem>
                  ))}
                </TextField>
              }
            </Grid>
          </Grid>
        }
        {!this.state.loading &&
          <div className={this.props.classes.body}>
            {searchResults.length > 0 ? 
              <>
                <Typography variant="h5" color="textSecondary">Search results</Typography>
                <Grid container direction="row" justifyContent="flex-start" spacing={2} className={this.props.classes.searchGrid}>
                {searchResults.map(r => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={r.id}>
                    <CasePreviewCard case={r} onClick={this.onCaseClick} />
                  </Grid>
                ))}
                </Grid>
              </>
            : searchText.length >= 3 ?
              <Typography variant="h5" color="textSecondary">No Results</Typography>
            : undecidedThisTerm.length === 0 ? 
              <TermSummaryComplete
                cases={termCases}
                termId={this.state.selectedTermId!}
                caseStore={this.props.caseStore}
                invalidTerm={this.handleInvalidTerm}
                onCaseClick={this.onCaseClick} 
                navigateToJustice={this.onTermJusticeClick}
              />
            : (undecidedThisTerm.length / termCases.length < .25) ?
              <TermSummaryNearEnd cases={termCases} onCaseClick={this.onCaseClick} />
            : <TermSummaryInProgress cases={termCases} onCaseClick={this.onCaseClick} />
            }
            {searchResults.length === 0 && !(searchText.length >= 3) &&
              <Button variant="text" color="secondary" onClick={this.allCasesClick}>All Term Cases</Button>
            }
          </div>
        }
      </Paper>
    );
  }
}

export default withStyles(styles)(Home);
