import React, { Component } from 'react';
import { withStyles, WithStyles, createStyles } from '@material-ui/styles';
import { Theme, TextField, InputAdornment, Paper, Grid, Typography, MenuItem, Button } from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import { Case, CaseStore, dismissedCases } from '../../../stores/caseStore';
import { Subject } from 'rxjs';
import { debounceTime, flatMap, filter } from 'rxjs/operators';
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
    marginTop: theme.spacing(15),
    marginBottom: theme.spacing(3),
    minWidth: 300,
    [theme.breakpoints.up('sm')]: {
      width: '40vw',
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
  }

  searchText$ = new Subject<string>();

  componentDidMount() {
    this.searchText$.pipe(
      debounceTime(400),
      filter(searchText => searchText.length >= 3),
      flatMap((searchText) => this.props.caseStore.searchCase(searchText)))
      .subscribe(cases => {
        this.setState({ searchResults: cases });
      }, err => {
        console.error(err?.message ?? 'Error searching for cases', err);
      });

    autorun((reaction) => {
      const allTerms = this.props.caseStore.allTerms;
      if (allTerms.length > 0 && !this.state.selectedTermId) {
        const termId = this.props.match.params.id;
        if (termId && !isNaN(Number(termId))) {
          this.setSelectedTerm(Number(termId));
        } else {
          this.setSelectedTerm(allTerms[allTerms.length - 1].id);
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
    catch (e) {
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

  allCasesClick = () => {
    this.props.routing.replace(`/term/${this.state.selectedTermId}`);
    this.props.routing.push(`/term/${this.state.selectedTermId}/all`);
  };

  render() {
    const { searchText, selectedTermId, searchResults, termCases } = this.state;
    const allTerms = this.props.caseStore.allTerms;

    const undecidedThisTerm = termCases.filter(c => !c.decisionDate && !dismissedCases(c)); 

    return (
      <Paper className={this.props.classes.paper}>
        <Grid container direction="row" justify="center">
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
        { searchResults.length === 0 &&
          <Grid container direction="row" justify="center" spacing={1} alignItems="center">
            <Grid item>
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
                  {allTerms.map(term => (
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
                <Grid container direction="row" justify="flex-start" spacing={2} className={this.props.classes.searchGrid}>
                {searchResults.map(r => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={r.id}>
                    <CasePreviewCard case={r} onClick={this.onCaseClick} />
                  </Grid>
                ))}
                </Grid>
              </>
            : undecidedThisTerm.length === 0 ? 
              <TermSummaryComplete
                cases={termCases}
                termId={this.state.selectedTermId!}
                caseStore={this.props.caseStore}
                invalidTerm={this.handleInvalidTerm}
                onCaseClick={this.onCaseClick} 
              />
            : (undecidedThisTerm.length / termCases.length < .25) ?
              <TermSummaryNearEnd cases={termCases} onCaseClick={this.onCaseClick} />
            : <TermSummaryInProgress cases={termCases} onCaseClick={this.onCaseClick} />
            }
            {searchResults.length === 0 &&
              <Button variant="text" color="primary" onClick={this.allCasesClick}>All Term Cases</Button>
            }
          </div>
        }
      </Paper>
    );
  }
}

export default withStyles(styles)(Home);
