import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { History } from 'history';
import { JusticeStore, Justice } from '../../../stores/justiceStore';
import { Theme, Typography, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, Fab } from '@material-ui/core';
import { withStyles } from '@material-ui/styles';
import { KeyboardDatePicker } from '@material-ui/pickers';
import JusticeCard from '../components/justiceCard';
import { LocalDate } from '@js-joda/core';
import createJsJodaUtils from '@prinzdezibel/date-io-js-joda'
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import AddIcon from '@material-ui/icons/Add'
import { Locale as JsJodaLocale } from "@js-joda/locale_en-us";

const styles = (theme: Theme) => ({
  root: {
    padding: `${theme.spacing(1)}px`,
  },
  fab: {
    position: 'fixed' as 'fixed', // TypeScript is hard
    right: '42%',
    bottom: '10vh',
  },
});

const dateUtils = createJsJodaUtils(LocalDate);

interface Props {
  routing?: History;
  justiceStore?: JusticeStore;
  classes?: {[id: string]: string};
}

interface State {
  retireModal?: Justice;
  retireDate?: LocalDate;
}

@inject('routing', 'justiceStore')
@observer
class JusticePage extends Component<Props, State> {

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
    this.setState({retireDate: date ?? undefined })
  };

  createJustice = () => {
    this.props.routing!.push('/admin/justice/create');
  }

  render() {
    const active = this.props.justiceStore!.activeJustices;
    const retireModalJustice = this.state?.retireModal;

    return (
      <>
        <Typography variant="h4" component="h2">Justices</Typography>
        Search for all justices somewhere up top?
        <Typography variant="h5">Active:</Typography>
        {active?.map( justice => (
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
            <MuiPickersUtilsProvider utils={dateUtils} locale={JsJodaLocale.US}>
              <KeyboardDatePicker
                disableToolbar
                variant="inline"
                format="MM/dd/yyyy"
                margin="normal"
                id="date-picker-inline"
                label="Date picker inline"
                value={this.state?.retireDate}
                onChange={this.handleRetireDateChange}
                KeyboardButtonProps={{
                  'aria-label': 'change date',
                }}
                
              />
            </MuiPickersUtilsProvider>
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
    )
  }
}

export default withStyles(styles)(JusticePage);