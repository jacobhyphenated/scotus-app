import React, { Component } from 'react';
import { Grid, Typography, IconButton, TextField, Theme, Button, withStyles, MenuItem } from '@material-ui/core';
import BackIcon from '@material-ui/icons/ArrowBack';
import { inject, observer } from 'mobx-react';
import { History } from 'history';
import { DocketStore, DocketStatus } from '../../../stores/docketStore';
import { CourtStore } from '../../../stores/courtStore';

const styleDecorator = withStyles((theme: Theme) => ({
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
  title: string;
  docketNumber: string;
  lowerCourtId: number | null;
  lowerCourtRuling: string;
  status: DocketStatus;

  formError?: string;
  titleError?: string;
  docketNumberError?: string;
  lowerCourtError?: string;

  submitting: boolean;
}

interface Props {
  routing: History;
  docketStore: DocketStore;
  courtStore: CourtStore;
  classes: {[id: string]: string};
}

@inject('routing', 'courtStore', 'docketStore')
@observer
class CreateDocketPage extends Component<Props, State> {

  state: State = {
    title: '',
    docketNumber: '',
    lowerCourtId: 0,
    lowerCourtRuling: '',
    status: DocketStatus.CERT_GRANTED,
    submitting: false,
  };

  componentDidMount() {
    document.title = 'SCOTUS App | Admin | Create Docket';
  }

  back = () => {
    this.props.routing.goBack();
  };

  changeTitle = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ title: event.target.value, titleError: undefined });
  };

  changeDocketNumber = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ docketNumber: event.target.value, docketNumberError: undefined });
  };

  changeLowerCourt = (event: React.ChangeEvent<{value: unknown}>) => {
    this.setState({ lowerCourtId: event.target.value as number, lowerCourtError: undefined});
  };

  changeRuling = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ lowerCourtRuling: event.target.value });
  };

  changeStatus = (event: React.ChangeEvent<{value: unknown}>) => {
    this.setState({ status: event.target.value as DocketStatus });
  };

  submit = async () => {
    const { title, docketNumber, lowerCourtId, lowerCourtRuling, status } = this.state;
    let valid = true;
    if (!title) {
      this.setState({ titleError: 'Title is required' });
      valid = false;
    }
    if (!docketNumber) {
      this.setState({ docketNumberError: 'Docket number is required' });
      valid = false;
    }
    if (!lowerCourtId) {
      this.setState({ lowerCourtError: 'Select a lower court' });
      valid = false;
    }
    if (!valid) {
      return;
    }
    this.setState({ submitting: true });
    try {
      await this.props.docketStore.createDocket(title, docketNumber, lowerCourtId!, lowerCourtRuling, status);
      this.props.routing.goBack();
    } catch (e: any) {
      this.setState({ formError: e?.message ?? 'An error occurred creating this docket'});
    } finally {
      this.setState({ submitting: false });
    }
    
  };

  render() {
    const courts = this.props.courtStore.allCourts;
    const { title, docketNumber, lowerCourtId, lowerCourtRuling, status, formError, titleError, docketNumberError, lowerCourtError, submitting } = this.state;
    return (
      <Grid container direction="column">
        <Grid item>
          <IconButton onClick={this.back}>
            <BackIcon color="action" />
          </IconButton>
        </Grid>
        <Grid item>
          <Typography variant="h4" component="h2">Create Docket</Typography>
        </Grid>
        <Grid item>
          <form className={this.props.classes.formContainer} onSubmit={this.submit}>
            <Grid container direction="column" spacing={2}>
              {!!formError ? (
                <Grid item>
                  <Typography color="error">{formError}</Typography>
                </Grid>) 
                : ''
              }
              <Grid item>
                <TextField
                  id="create-docket-title"
                  name="title"
                  size="small"
                  color="primary"
                  variant="outlined"
                  fullWidth
                  required
                  label="Title"
                  onChange={this.changeTitle}
                  value={title ?? ''}
                  error={!!titleError}
                  helperText={titleError}
                />
              </Grid>
              <Grid item>
                <TextField
                  id="create-docket-number"
                  name="docketNumber"
                  size="small"
                  color="primary"
                  variant="outlined"
                  fullWidth
                  required
                  label="Docket Number"
                  onChange={this.changeDocketNumber}
                  value={docketNumber ?? ''}
                  error={!!docketNumberError}
                  helperText={docketNumberError}
                />
              </Grid>
              <Grid item>
                <TextField
                  id="create-docket-court-select"
                  label="Lower Court"
                  size="small"
                  color="primary"
                  variant="outlined"
                  required
                  fullWidth
                  select
                  error={!!lowerCourtError}
                  helperText={lowerCourtError}
                  value={lowerCourtId}
                  onChange={this.changeLowerCourt}
                >
                  <MenuItem value={0} disabled>Choose a lower court</MenuItem>
                  {courts.map(court => (
                    <MenuItem key={court.id} value={court.id}>{court.name}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item>
                <TextField 
                  id="create-docket-lower-court-ruling"
                  label="Lower Court Ruling"
                  color="primary"
                  variant="outlined"
                  fullWidth
                  multiline
                  rows={4}
                  value={lowerCourtRuling}
                  onChange={this.changeRuling}
                />
              </Grid>
              <Grid item>
                <TextField
                  id="create-docket-status"
                  label="Status"
                  size="small"
                  color="primary"
                  variant="outlined"
                  required
                  fullWidth
                  select
                  value={status}
                  onChange={this.changeStatus}
                >
                  {Object.values(DocketStatus).map((status, index) => (
                    <MenuItem key={index} value={status}>{status}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item>
                <Button 
                  disabled={ submitting || !!titleError || !!docketNumberError || !!lowerCourtError }
                  color="primary"
                  variant="contained"
                  fullWidth
                  onClick={this.submit}
                >Create</Button>
              </Grid>
            </Grid>
          </form>
        </Grid>
      </Grid>
    );
  }
}

export default styleDecorator(CreateDocketPage);
