import React, { Component } from 'react';
import { Grid, Typography, IconButton, TextField, Theme, Button } from '@material-ui/core';
import BackIcon from '@material-ui/icons/ArrowBack';
import { inject } from 'mobx-react';
import { History } from 'history';
import { JusticeStore } from '../../../stores/justiceStore';
import { LocalDate } from '@js-joda/core';
import { withStyles } from '@material-ui/styles';
import DatePicker from '../components/datePicker';


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

interface Props {
  routing: History;
  justiceStore: JusticeStore;
  classes: {[id: string]: string};
}

interface State {
  name?: string;
  dateConfirmed: LocalDate | null;
  birthday: LocalDate | null;

  formError?: string;
  nameError?: string;
  confirmDateError?: string;
  birthdayError?: string;

  submitting: boolean;
}

@inject('routing', 'justiceStore')
class CreateJusticePage extends Component<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {
      name: undefined,
      dateConfirmed: LocalDate.now(),
      birthday: LocalDate.now().minusYears(50),
      submitting: false,
    };
  }

  componentDidMount() {
    document.title = 'SCOTUS App | Admin | Create Justice';
  }

  back = () => {
    this.props.routing.goBack();
  };

  changeName = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ name: event.target.value, nameError: undefined });
  };

  changeBirthday = (date: LocalDate | null | Error) => {
    if (date instanceof Error) {
      this.setState({ birthdayError: 'Invalid Date' });
      return;
    }
    this.setState({ birthday: date, birthdayError: undefined });
  };

  changeConfirmDate = (date: LocalDate | null | Error) => {
    if (date instanceof Error) {
      this.setState({ confirmDateError: 'Invalid Date' });
      return;
    }
    this.setState({ dateConfirmed: date, confirmDateError: undefined });
  };

  submit = async () => {
    const {name, dateConfirmed, birthday} = this.state;
    let valid = true;
    if (!name) {
      this.setState({ nameError: 'Name is required' });
      valid = false;
    }
    if (!dateConfirmed) {
      this.setState({ confirmDateError: 'Confirmation Date is required' });
      valid = false;
    }
    if (!birthday) {
      this.setState({ birthdayError: 'Birthday is required' });
      valid = false;
    }
    if (!valid || this.state.nameError || this.state.confirmDateError || this.state.birthdayError) {
      return;
    }
    this.setState({ submitting: true });
    try{ 
      await this.props.justiceStore.createJustice(name!, birthday!, dateConfirmed!);
      this.props.justiceStore.refreshActiveJustices();
      this.props.routing.goBack();
    } catch (e) {
      this.setState({ formError: e?.message ?? 'An error occurred creating this justice'});
    } finally {
      this.setState({ submitting: false });
    }

  };

  render() {
    const { classes } = this.props;
    const { nameError, birthdayError, confirmDateError, formError, submitting } = this.state;

    return(
      <Grid container direction="column">
        <Grid item>
          <IconButton onClick={this.back}>
            <BackIcon color="action" />
          </IconButton>
        </Grid>
        <Grid item>
          <Typography variant="h4" component="h2">Create Justice</Typography>
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
                  id="create-justice-name"
                  name="name"
                  size="small"
                  color="primary"
                  variant="outlined"
                  fullWidth
                  required
                  label="Name"
                  onChange={this.changeName}
                  value={this.state.name ?? ''}
                  error={!!nameError}
                  helperText={nameError}
                />
              </Grid>
              <Grid item>
                <DatePicker
                  required
                  fullWidth
                  onChange={this.changeBirthday}
                  value={this.state.birthday}
                  label="Birthday"
                  inputVariant="outlined"
                  error={!!birthdayError}
                  helperText={birthdayError}
                />
              </Grid>
              <Grid item>
                <DatePicker
                  required
                  fullWidth
                  onChange={this.changeConfirmDate}
                  value={this.state.dateConfirmed}
                  label="Confirmation Date"
                  inputVariant="outlined"
                  error={!!confirmDateError}
                  helperText={confirmDateError}
                />
              </Grid>
              <Grid item>
                <Button 
                  disabled={submitting || !!nameError || !!birthdayError || !!confirmDateError}
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