import React, { Component } from 'react';
import { Grid, Typography, IconButton, TextField, Theme, Button, withStyles } from '@material-ui/core';
import BackIcon from '@material-ui/icons/ArrowBack';
import { inject } from 'mobx-react';
import { History } from 'history';
import { CourtStore } from '../../../stores/courtStore';

const styleDecorator = withStyles((theme: Theme) => ({
  formContainer: {
    'margin-top': `${theme.spacing(2)}px`,
    [theme.breakpoints.down('sm')]: {
      maxWidth: 280,
    },
    [theme.breakpoints.up('md')]: {
      maxWidth: 400,
    },
  },
}));

interface State {
  name: string;
  shortName: string;

  formError?: string;
  nameError?: string;
  shortNameError?: string;

  submitting: boolean;
}

interface Props {
  routing: History;
  courtStore: CourtStore;
  classes: {[id: string]: string};
}

@inject('routing', 'courtStore')
class CreateJusticePage extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      name: '',
      shortName: '',
      submitting: false,
    };
  }

  back = () => {
    this.props.routing.goBack();
  };

  changeName = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ name: event.target.value, nameError: undefined });
  };

  changeShortName = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ shortName: event.target.value, shortNameError: undefined });
  };

  submit = async () => {
    const { name, shortName } = this.state;
    let valid = true;
    if (!name) {
      this.setState({ nameError: 'Name is required' });
      valid = false;
    }
    if (!shortName) {
      this.setState({ shortNameError: 'Short Name is required' });
      valid = false;
    }
    if (!valid) {
      return;
    }
    this.setState({ submitting: true });
    try {
      await this.props.courtStore.createCourt(name, shortName);
      this.props.routing.goBack();
    } catch (e) {
      this.setState({ formError: e?.message ?? 'An error occurred creating this justice'});
    } finally {
      this.setState({ submitting: false });
    }
  };

  render() {
    const { name, shortName, formError, nameError, shortNameError, submitting } = this.state;
    return (
      <Grid container direction="column">
        <Grid item>
          <IconButton onClick={this.back}>
            <BackIcon color="action" />
          </IconButton>
        </Grid>
        <Grid item>
          <Typography variant="h4" component="h2">Create Court</Typography>
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
                  id="create-court-name"
                  name="name"
                  size="small"
                  color="primary"
                  variant="outlined"
                  fullWidth
                  required
                  label="Name"
                  onChange={this.changeName}
                  value={name ?? ''}
                  error={!!nameError}
                  helperText={nameError || 'Full name of the appeals court'}
                />
              </Grid>
              <Grid item>
                <TextField
                  id="create-court-short-name"
                  name="shortName"
                  size="small"
                  color="primary"
                  variant="outlined"
                  fullWidth
                  required
                  label="Short Name"
                  onChange={this.changeShortName}
                  value={shortName ?? ''}
                  error={!!shortNameError}
                  helperText={shortNameError || 'Abbreviation or short name for the court'}
                />
              </Grid>
              <Grid item>
                <Button 
                  disabled={ submitting || !!nameError || !!shortNameError }
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

export default styleDecorator(CreateJusticePage);