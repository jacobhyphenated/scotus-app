import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Typography, withStyles, Theme, Grid, TextField, Button, IconButton, createStyles, WithStyles } from '@material-ui/core';
import BackIcon from '@material-ui/icons/ArrowBack';
import { History } from 'history';
import { CaseStore } from '../../../stores/caseStore';

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
});

interface Props extends WithStyles<typeof styles> {
  routing: History;
  caseStore: CaseStore;
}

interface State {
  name: string;
  otName: string;

  nameError?: string;
  otNameError?: string;
  formError?: string;
  submitting: boolean;
}

@inject('routing', 'caseStore')
@observer
class CreateTermPage extends Component<Props, State> {

  state: State = {
    name: '',
    otName: '',
    submitting: false,
  }

  back = () => {
    this.props.routing.goBack();
  };

  changeName = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ name: event.target.value, nameError: undefined });
  };

  changeOtName = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ otName: event.target.value, otNameError: undefined });
  };

  submit = async () => {
    const {name, otName} = this.state;
    let valid = true;
    if (!name) {
      this.setState({nameError: 'Name is required'});
      valid = false;
    }
    if (!otName) {
      this.setState({ otNameError: 'OT Name is required'});
      valid = false;
    }
    if (!valid) {
      return;
    }

    this.setState({ submitting: true });
    try {
      await this.props.caseStore.createTerm(name, otName);
      this.props.routing.goBack();
    } catch(e) {
      this.setState({ formError: e?.errorMessage ?? 'An error occurred creating the term'});
    } finally {
      this.setState({ submitting: false });
    }
  };

  render() {
    const classes = this.props.classes;
    const {name, otName, formError, nameError, otNameError, submitting} = this.state;

    return (
      <Grid container direction="column">
        <Grid item>
          <IconButton onClick={this.back}>
            <BackIcon color="action" />
          </IconButton>
        </Grid>
        <Grid item>
          <Typography variant="h4" component="h2">Create Term</Typography>
        </Grid>
        <Grid item>
          <form className={classes.formContainer} onSubmit={this.submit}>
            <Grid container direction="column" spacing={2}>
              {!!formError ? (
                <Grid item>
                  <Typography color="error">{formError}</Typography>
                </Grid>) 
                : ''
              }
              <Grid item>
                <TextField
                  id="create-term-name"
                  name="name"
                  size="small"
                  color="primary"
                  variant="outlined"
                  fullWidth
                  required
                  label="Name"
                  onChange={this.changeName}
                  value={name}
                  error={!!nameError}
                  helperText={nameError}
                />
              </Grid>
              <Grid item>
                <TextField
                  id="create-term-otname"
                  name="otname"
                  size="small"
                  color="primary"
                  variant="outlined"
                  fullWidth
                  required
                  label="OT Name"
                  onChange={this.changeOtName}
                  value={otName}
                  error={!!otNameError}
                  helperText={otNameError || 'October Term name notation'}
                />
              </Grid>
              <Grid item>
                <Button 
                  disabled={submitting || !!nameError || !!otNameError}
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

export default withStyles(styles)(CreateTermPage);
