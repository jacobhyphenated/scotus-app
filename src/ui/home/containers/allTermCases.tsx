import React, { Component } from 'react';
import { withStyles, WithStyles, createStyles } from '@material-ui/styles';
import { Theme, TextField, InputAdornment, Paper, Grid, Typography, IconButton } from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import BackIcon from '@material-ui/icons/ArrowBack';
import { Case, CaseSitting, CaseStatus, CaseStore, Term } from '../../../stores/caseStore';
import { Subject } from 'rxjs';
import { debounceTime, map } from 'rxjs/operators';
import { inject, observer } from 'mobx-react';
import { autorun } from 'mobx';
import { History } from 'history';
import { CaseListItem } from '../components';
import { match } from 'react-router';

const styles = (theme: Theme) => createStyles({
  paper: {
    marginTop: theme.spacing(1),
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    padding: theme.spacing(2),
    height: `calc(100vh - ${theme.spacing(8)}px)`,
    overflowY: 'scroll',
  },
  search: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(3),
    marginLeft: theme.spacing(2),
    minWidth: 300,
    [theme.breakpoints.up('sm')]: {
      width: '40vw',
    },
    [theme.breakpoints.up('xl')]: {
      width: '30vw',
    },
  },
  sitting: {
    padding: theme.spacing(1),
  },
});

interface Props extends WithStyles<typeof styles> {
  caseStore: CaseStore;
  routing: History;
  match: match<{ id: string }>;
}

interface State {
  termCases: Case[];
  filteredCases: Case[];
  term?: Term;
  searchText: string;
}

@inject('caseStore', 'routing')
@observer
class AllTermCasesPage extends Component<Props, State> {

  state: State = {
    termCases: [],
    filteredCases: [],
    searchText: '',
  };

  searchText$ = new Subject<string>();

  caseSorter = (c1: Case, c2: Case) => {
    if (!c1.argumentDate && !!c2.argumentDate) {
      return 1;
    }
    if (!c2.argumentDate && !!c1.argumentDate) {
      return -1;
    }
    if (c1.argumentDate && c2.argumentDate) {
      const argumentOrder = c1.argumentDate.compareTo(c2.argumentDate);
      if (argumentOrder !== 0) {
        return argumentOrder;
      }
    }
    const statusOrder = [CaseStatus.GRANTED, CaseStatus.GVR,  CaseStatus.DIG, CaseStatus.DISMISSED];
    return statusOrder.indexOf(c1.status) - statusOrder.indexOf(c2.status);
  };

  async componentDidMount() {
    this.searchText$.pipe(
      debounceTime(200),
      map(searchText => searchText.length >= 3 
        ? this.state.termCases.filter(c => c.case.toLocaleLowerCase().includes(searchText.toLocaleLowerCase()))
        : this.state.termCases),
    ).subscribe({
      next: cases => {
        this.setState({ filteredCases: cases });
      },
    });

    const termId = this.props.match.params.id;

    autorun((reaction) => {
      if (this.props.caseStore.allTerms.length > 0 && !this.state.term) {
        const term = this.props.caseStore.allTerms.find(t => t.id === Number(termId));
        if (!term) {
          console.warn(`${termId} is not a valid term id`);
          this.props.routing.replace('/');
          return;
        }
        this.setState({ term });
        document.title = `SCOTUS App | Term ${term.name}`;
        reaction.dispose();
      }
    });

    if (termId && !isNaN(Number(termId))) {
      const cases = await this.props.caseStore.getCaseByTerm(Number(termId));
      this.setState({ termCases: cases });
      this.searchText$.next(this.state.searchText);
    } else {
      console.error(`${termId} is not a valid term`);
      this.props.routing.goBack();
    }
  }

  updateSearchText: React.ChangeEventHandler<HTMLInputElement> = event => {
    const searchText = event.target.value;
    if (searchText.length < 3) {
      this.setState({ filteredCases: this.state.termCases });
    }
    this.setState({ searchText });
    this.searchText$.next(searchText);
  };

  onCaseClick = (c: Case) => {
    this.props.routing.push(`/case/${c.id}`);
  };

  back = () => {
    this.props.routing.goBack();
  };

  render() {
    const { searchText, filteredCases } = this.state;
    const mappedCases = filteredCases.reduce((acc, value) => {
      const key = value.sitting ?? 'None';
      acc.set(key, [...(acc.get(key) ?? []), value]);
      return acc;
    }, new Map<string, Case[]>());


    return (
      <Paper className={this.props.classes.paper}>
        <Grid container direction="row" justifyContent="flex-start" alignItems="center" spacing={1}>
          <Grid item>
            <IconButton onClick={this.back}>
              <BackIcon color="action" />
            </IconButton>
          </Grid>
          <Grid item>
            <Typography variant="h4">
              Cases for the {this.state.term?.name} term 
            </Typography>
          </Grid>
        </Grid>

        <TextField
          className={this.props.classes.search}
          label="Filter"
          variant="outlined"
          size="small"
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

        <Grid container direction="column" spacing={2}>
          {[...Object.values(CaseSitting), 'None'].filter(sitting => mappedCases.has(sitting)).map((sitting) => (
            <Grid item key={sitting}>
              <Paper className={this.props.classes.sitting}>
                {sitting !== 'None' && <Typography variant="h4">{sitting}</Typography> }
                {mappedCases.get(sitting)?.sort(this.caseSorter).map(termCase => (
                  <CaseListItem key={termCase.id} onCaseClick={this.onCaseClick} scotusCase={termCase} caseStore={this.props.caseStore} />
                ))}
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Paper>
    );
  }
}

export default withStyles(styles)(AllTermCasesPage);