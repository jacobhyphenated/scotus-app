import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Typography, withStyles, Theme, Grid, createStyles, WithStyles, Fab } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import { History } from 'history';
import { CaseStore, Term } from '../../../stores/caseStore';
import { autorun } from 'mobx';
import TermCard from '../components/termCard';

const styles = (theme: Theme) => createStyles({
  formContainer: {
    'margin-top': `${theme.spacing(2)}px`,
    [theme.breakpoints.down('sm')]: {
      maxWidth: 280,
    },
    [theme.breakpoints.up('md')]: {
      maxWidth: 400,
    },
  },
  fab: {
    position: 'fixed',
    right: '25%',
    bottom: '10vh',
  },
});

interface Props extends WithStyles<typeof styles> {
  routing: History;
  caseStore: CaseStore;
}

interface State {
  terms: Term[];
}

@inject('routing', 'caseStore')
@observer
class TermAdminPage extends Component<Props, State> {

  state: State = {
    terms: [],
  }
  
  componentDidMount() {
    autorun((reaction) => {
      const allTerms = this.props.caseStore.allTerms;
      if (allTerms.length > 0) {
        this.setState({ terms: allTerms });
        reaction.dispose();
      }
    });
  }

  selectTerm = (term: Term) => {
    this.props.routing.push(`/admin/term/edit/${term.id}`);
  }

  createTerm = () => {
    this.props.routing.push(`/admin/term/create`);
  }

  render() {
    return (
      <>
        <Typography variant='h4'>Terms</Typography>
        <Grid container direction='column'>
          {this.state.terms.map(term => (
            <Grid item key={term.id}>
              <TermCard term={term} onClick={this.selectTerm} />
            </Grid>
          ))}
        </Grid>
        <Fab className={this.props.classes.fab} onClick={this.createTerm} color="primary" aria-label="add">
          <AddIcon />
        </Fab>
      </>
    );
  }
}

export default withStyles(styles)(TermAdminPage);

