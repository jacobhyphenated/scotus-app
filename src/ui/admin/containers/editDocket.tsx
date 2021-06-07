import React, { Component } from 'react';
import { Grid, Typography, IconButton, Theme, withStyles, MenuItem, FormControlLabel, FormControl, FormLabel, RadioGroup, Radio, WithStyles, createStyles } from '@material-ui/core';
import BackIcon from '@material-ui/icons/ArrowBack';
import { inject, observer } from 'mobx-react';
import { History } from 'history';
import { DocketStore, DocketStatus, FullDocket, DocketEdit } from '../../../stores/docketStore';
import { CourtStore } from '../../../stores/courtStore';
import { match } from 'react-router';
import ViewEditInputText from '../components/viewEditInputText';

const styles = (theme: Theme) => createStyles(({
  formContainer: {
    'margin-top': `${theme.spacing(2)}px`,
    [theme.breakpoints.down('sm')]: {
      maxWidth: 320,
    },
    [theme.breakpoints.up('md')]: {
      maxWidth: 450,
    },
  },
}));

interface State {
  docket?: FullDocket;
  formError?: string;
  submitting: boolean;
}

interface RouteParams {
  id: string;
}

interface Props extends WithStyles<typeof styles> {
  routing: History;
  docketStore: DocketStore;
  courtStore: CourtStore;
  match: match<RouteParams>;
}

@inject('routing', 'courtStore', 'docketStore')
@observer
class EditDocketPage extends Component<Props, State> {

  state: State = {
    submitting: false,
  }

  async componentDidMount() {
    const docketId = this.props.match.params.id;
    if (!docketId || isNaN(Number(docketId))) {
      console.warn('No docket id in url params');
      this.props.routing.push('/admin/docket');
      return;
    }
    try {
      const docket = await this.props.docketStore.getDocketById(Number(docketId));
      if (!docket) {
        throw new Error(`No docket found with id ${docketId}`);
      }
      document.title = `SCOTUS App | Admin | Edit Docket ${docket.docketNumber}`;
      this.setState({ docket });
    } catch (e) {
      console.warn(e);
      this.props.routing.push('/admin/docket');
    }
  }

  edit = async (docketEdit: DocketEdit) => {
    if (!this.state.docket) {
      return;
    }
    this.setState({ submitting: true, formError: undefined });
    try {
      const docket = await this.props.docketStore.editDocket(this.state.docket!.id, docketEdit);
      this.setState({ docket });
    } catch (e) {
      this.setState({ formError: e?.errorMessage ?? 'Failed to update docket'});
    } finally {
      this.setState({ submitting: false});
    } 
  }

  saveTitle = async (title: string) => {
    if (!title) {
      this.setState({formError: 'Cannot have an empty title'});
      return;
    }
    this.edit({title});
  }

  saveDocketNumber = async (docketNumber: string) => {
    if (!docketNumber) {
      this.setState({formError: 'Cannot have an empty docket number'});
      return;
    }
    this.edit({docketNumber});
  }

  saveCourtRuling = async (lowerCourtRuling: string) => {
    this.edit({lowerCourtRuling});
  }

  saveStatus = async (status: string) => {
    if (!Object.keys(DocketStatus).some(key => key === status)) {
      this.setState({formError: 'Invalid Status'});
      return;
    }
    this.edit({status: status as DocketStatus});
  }

  changeLowerCourtOverruled = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const lowerCourtOverruled = event.target.value === 'true' ? true : event.target.value === 'false' ? false : undefined;
    this.edit({lowerCourtOverruled});
  }

  back = () => {
    this.props.routing.goBack();
  };

  render() {

    return (
      <Grid container direction="column">
        <Grid item>
          <IconButton onClick={this.back}>
            <BackIcon color="action" />
          </IconButton>
        </Grid>
        <Grid item>
          <Typography variant="h4" component="h2">Edit Docket</Typography>
        </Grid>
        <Grid item>
          {!!this.state.docket ?
            <Grid className={this.props.classes.formContainer} container direction="row" spacing={2}>
              {!!this.state.formError ? (
                <Grid item>
                  <Typography color="error">{this.state.formError}</Typography>
                </Grid>) 
                : ''
              }
              <Grid item xs={12}>
                <ViewEditInputText
                  id="docket-edit-title"
                  fullWidth
                  required
                  disabled={this.state.submitting}
                  name="title"
                  label="Title"
                  value={this.state.docket!.title}
                  onSave={this.saveTitle}
                />
              </Grid>
              <Grid item xs={12}>
                <ViewEditInputText
                  id="docket-edit-docket-number"
                  fullWidth
                  required
                  disabled={this.state.submitting}
                  name="docketNumber"
                  label="Docket Number"
                  value={this.state.docket!.docketNumber}
                  onSave={this.saveDocketNumber}
                />
              </Grid>
              <Grid item xs={12}>
                <ViewEditInputText
                  id="docket-edit-lower-court-ruling"
                  fullWidth
                  required
                  disabled={this.state.submitting}
                  name="lowerCourt"
                  label="Lower Court Ruling"
                  multiline
                  rows={4}
                  value={this.state.docket!.lowerCourtRuling}
                  onSave={this.saveCourtRuling}
                />
              </Grid>
              <Grid item xs={12}>
                <ViewEditInputText
                  id="docket-edit-status"
                  fullWidth
                  required
                  disabled={this.state.submitting}
                  name="status"
                  label="Status"
                  select
                  value={this.state.docket!.status}
                  onSave={this.saveStatus}
                >
                  {Object.values(DocketStatus).map((status, index) => (
                    <MenuItem key={index} value={status}>{status}</MenuItem>
                  ))}
                </ViewEditInputText>
              </Grid>
              <Grid item xs={12}>
                <FormControl component="fieldset">
                  <FormLabel component="legend">Lower Court Overruled?</FormLabel>
                  <RadioGroup row aria-label="lower court overruled" name="lowerCourtOverruled"
                    value={this.state.docket.lowerCourtOverruled}
                    onChange={this.changeLowerCourtOverruled}
                  >
                    <FormControlLabel value={true} control={<Radio />} label="Yes" />
                    <FormControlLabel value={false} control={<Radio />} label="No" />
                  </RadioGroup>
                </FormControl>
              </Grid>
            </Grid> 
          :
            <></>}
        </Grid>
      </Grid>
    );
  }
}

export default withStyles(styles)(EditDocketPage);