import React, { Component } from 'react';
import { withStyles, WithStyles, createStyles } from '@material-ui/styles';
import { Theme, Paper, Grid, Typography, IconButton } from '@material-ui/core';
import BackIcon from '@material-ui/icons/ArrowBack';
import { Case, CaseStore, FullCase, Term } from '../../../stores/caseStore';
import { forkJoin, Subscription } from 'rxjs';
import { inject, observer } from 'mobx-react';
import { autorun } from 'mobx';
import { History } from 'history';
import { CaseListItem } from '../components';
import { match } from 'react-router';
import { Justice, JusticeStore } from '../../../stores/justiceStore';
import { Opinion, OpinionType } from '../../../stores/opinionStore';
import { partitionArray } from '../../../util';

const styles = (theme: Theme) => createStyles({
  paper: {
    marginTop: theme.spacing(1),
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    padding: theme.spacing(2),
    height: `calc(100vh - ${theme.spacing(8)}px)`,
    overflow: 'scroll',
  },
  caseGroup: {
    paddingTop: theme.spacing(1),
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
    paddingBottom: theme.spacing(1),
  },
});

interface Props extends WithStyles<typeof styles> {
  caseStore: CaseStore;
  justiceStore: JusticeStore;
  routing: History;
  match: match<{ termId: string, justiceId: string }>;
}

interface State {
  termCases: FullCase[];
  term?: Term;
  justice?: Justice;
}

@inject('caseStore', 'justiceStore', 'routing')
@observer
class TermJusticeSummary extends Component<Props, State> {
  
  state: State = {
    termCases: [],
  };

  fetchAllSubscription?: Subscription;

  async componentDidMount() {
    const termId = this.props.match.params.termId;
    const justiceId = this.props.match.params.justiceId;

    autorun((reaction) => {
      if (this.props.caseStore.allTerms.length > 0 && !this.state.term) {
        const term = this.props.caseStore.allTerms.find(t => t.id === Number(termId));
        if (!term) {
          this.dataLoadingError(`${termId} is not a valid term id`);
          return;
        }
        this.setState({ term });
        reaction.dispose();
      }
    });

    if (termId && !isNaN(Number(termId))) {
      const cases = await this.props.caseStore.getCaseByTerm(Number(termId));
      this.fetchAllSubscription = forkJoin(cases.filter(c => c.argumentDate).map(c => this.props.caseStore.getCaseById(c.id)))
        .subscribe({
          next: fullCases => {
            this.setState({ termCases: fullCases});
          },
          error: e => {
            this.dataLoadingError(e);
          },
        });

    } else {
      this.dataLoadingError(`${termId} is not a valid term id`);
    }

    if (justiceId && !isNaN(Number(justiceId))) {
      try {
        const justice = await this.props.justiceStore.getById(Number(justiceId));
        this.setState({ justice });
      } catch(e) {
        this.dataLoadingError(e);
      }
    } else {
      this.dataLoadingError(`${justiceId} is not a valid justice id`);
    }

    setImmediate(() => {
      document.title = `SCOTUS App | Term ${this.state.term?.name ?? termId} | ${this.state.justice?.name}`;
    });
  }

  dataLoadingError = (error: any) => {
    console.warn(error);
    this.fetchAllSubscription?.unsubscribe();
    this.props.routing.replace('/');
  };

  back = () => {
    this.fetchAllSubscription?.unsubscribe();
    this.props.routing.goBack();
  };

  onCaseClick = (c: Case) => {
    this.props.routing.push(`/case/${c.id}`);
  };

  caseGroupRow = (cases: FullCase[], header: string) => {
    if (cases.length === 0) {
      return <></>;
    }
    return (
      <Grid item>
        <div className={this.props.classes.caseGroup}>
          <Grid container direction="column">
            <Grid item><Typography variant="h6">{header} ({cases.length})</Typography></Grid>
            {cases.map(c => (
              <CaseListItem key={c.id} onCaseClick={this.onCaseClick} scotusCase={c} caseStore={this.props.caseStore} />
            ))}
          </Grid>
        </div>
      </Grid>
    );
  };

  render() {
    const { termCases, justice } = this.state;
    if (!justice) {
      return <></>;
    }

    const isAuthor = (o: Opinion) => o.justices.some(j => j.isAuthor && j.justiceId === justice.id);
    const isAuthorOfType = (c: FullCase, types: OpinionType[]) => c.opinions.some(o => isAuthor(o) && types.includes(o.opinionType));
    const isInMajority = (c: FullCase) => c.opinions.some(o => {
      return [OpinionType.MAJORITY, OpinionType.PER_CURIUM, OpinionType.CONCUR_JUDGEMENT, OpinionType.CONCURRENCE].includes(o.opinionType)
        && o.justices.some(j => j.justiceId === justice.id);
    });
    const isInDissent = (c: FullCase) => c.opinions.some(o => {
      return [OpinionType.DISSENT, OpinionType.DISSENT_JUDGEMENT].includes(o.opinionType)
        && o.justices.some(j => j.justiceId === justice.id);
    });

    const [authored, remaining] = partitionArray(termCases, c => c.opinions.some(isAuthor));
    const majorityAuthor = authored.filter(c => isAuthorOfType(c, [OpinionType.MAJORITY]));
    const concurringAuthor = authored.filter(c => isAuthorOfType(c, [OpinionType.CONCURRENCE, OpinionType.CONCUR_JUDGEMENT]));
    const dissentJudgement = authored.filter(c => isAuthorOfType(c, [OpinionType.DISSENT_JUDGEMENT]));
    const dissentAuthor = authored.filter(c => isAuthorOfType(c, [OpinionType.DISSENT]));
    const [otherMajority, nonMajority] = partitionArray(remaining, isInMajority);
    const otherDissent = nonMajority.filter(isInDissent);

    return (
      <Paper className={this.props.classes.paper}>
        <Grid container direction="column" spacing={2}>
          <Grid item>
            <Grid container direction="row" justifyContent="flex-start" alignItems="center" spacing={1}>
              <Grid item>
                <IconButton onClick={this.back}>
                  <BackIcon color="action" />
                </IconButton>
              </Grid>
              <Grid item>
                <Typography variant="h5">
                  Argued Cases for {this.state.justice?.name} for the {this.state.term?.name} term 
                </Typography>
              </Grid>
            </Grid>
          </Grid>
          {this.caseGroupRow(majorityAuthor, 'Authored Opinions of the Court')}
          {this.caseGroupRow(concurringAuthor, 'Concurring Opinions')}
          {this.caseGroupRow(dissentJudgement, 'Concurring in Part and Dissenting in Part')}
          {this.caseGroupRow(dissentAuthor, 'Dissenting Opinions')}
          {this.caseGroupRow(otherMajority, 'Other Cases in Majority')}
          {this.caseGroupRow(otherDissent, 'Other Cases in Dissent')}
        </Grid>
      </Paper>
    );
  }
}

export default withStyles(styles)(TermJusticeSummary);