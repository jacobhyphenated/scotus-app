import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { History } from 'history';
import { JusticeStore, Justice } from '../../../stores/justiceStore';
import { Theme, Typography, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, Fab, Grid } from '@material-ui/core';
import { withStyles } from '@material-ui/styles';
import JusticeCard from '../components/justiceCard';
import DatePicker from '../components/datePicker';
import { LocalDate } from '@js-joda/core';
import AddIcon from '@material-ui/icons/Add';

const styleDecorator = withStyles((theme: Theme) => ({
  root: {
    padding: `${theme.spacing(1)}px`,
  },
  fab: {
    position: 'fixed',
    right: '42%',
    bottom: '10vh',
  },
}));

interface Props {
  routing?: History;
  justiceStore: JusticeStore;
  classes?: {[id: string]: string};
}

interface State {
  retireModal?: Justice;
  retireDate?: LocalDate;
  showAll: boolean;
  allJustices: Justice[];
}

@inject('routing', 'justiceStore')
@observer
class JusticePage extends Component<Props, State> {

  state: State = {
    showAll: false,
    allJustices: [],
  }

  attemptRetire = (justice: Justice) => {
    this.setState({retireModal: justice, retireDate: LocalDate.now()});
    console.log('attempt retire', justice.id);
  }

  confirmRetire = async () => {
    console.log('retire at date', this.state.retireDate);
    if (!this.state?.retireModal || !this.state?.retireDate){
      return;
    }
    await this.props.justiceStore!.retireJustice(this.state.retireModal.id, this.state.retireDate);
    this.setState({retireModal: undefined, retireDate: undefined});
    this.props.justiceStore!.refreshActiveJustices();
  }

  closeRetireModal = () => {
    this.setState({ retireModal: undefined});
  }

  handleRetireDateChange = (date: LocalDate | null) => {
    this.setState({retireDate: date ?? undefined });
  };

  createJustice = () => {
    this.props.routing!.push('/admin/justice/create');
  }

  toggleShowAll = async () => {
    const showAllCurrent = this.state.showAll;
    this.setState({ showAll: !showAllCurrent });
    if (!showAllCurrent) {
      try {
        const allJustices = await this.props.justiceStore.getAllJustices();
        this.setState({ allJustices });
      } catch (e) {
        console.error(e);
      }
    }
  }

  render() {
    const active = this.props.justiceStore.activeJustices;
    const retireModalJustice = this.state?.retireModal;
    const justiceList = this.state.showAll ? this.state.allJustices : active;

    return (
      <>
        <Grid container direction="row" spacing={3}>
          <Grid item>
            <Typography variant="h5">{this.state.showAll ? 'All Justices' : 'Active Justices'}:</Typography>
          </Grid>
          <Grid item>
            <Button variant="outlined" color="primary" onClick={this.toggleShowAll}>
              {this.state.showAll ? 'Show Active' : 'Show All'}
            </Button>
          </Grid>
        </Grid>
        {justiceList?.map( justice => (
          <JusticeCard key={justice.id} justice={justice} retireCallback={this.attemptRetire}></JusticeCard>
        )) }
        
        <Fab className={this.props.classes!.fab} onClick={this.createJustice} color="primary" aria-label="add">
          <AddIcon />
        </Fab>

        <Dialog
          open={!!retireModalJustice}
          onClose={this.closeRetireModal}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">{"Retire Justice?"}</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              Are you sure you want to mark {retireModalJustice?.name} as retired?
            </DialogContentText>
            <DatePicker
              disableToolbar
              onChange={this.handleRetireDateChange}
              value={this.state?.retireDate}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={this.closeRetireModal} color="primary">
              Cancel
            </Button>
            <Button disabled={!this.state?.retireDate} onClick={this.confirmRetire} color="primary" autoFocus>
              Yes, Retire This Justice
            </Button>
          </DialogActions>
        </Dialog>
      </>
    );
  }
}

export default styleDecorator(JusticePage);