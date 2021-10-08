import React, { Component } from 'react';
import { inject } from 'mobx-react';
import { UserStore } from '../../../stores/userStore';
import { Grid, TextField, Button, withStyles, Theme, createStyles, WithStyles } from '@material-ui/core';
import { Alert } from '@material-ui/lab';

interface Props extends WithStyles<typeof styles>  {
  userStore?: UserStore;
}

interface State {
  username: string;
  password: string;
  error?: string;
}

const styles = (theme: Theme) => createStyles({
  paper: {
    [theme.breakpoints.down('sm')]: {
      maxWidth: 600,
    },
    [theme.breakpoints.up('md')]: {
      maxWidth: 768,
    },
    [theme.breakpoints.up('xl')]: {
      maxWidth: 1200,
    },
    margin: `${theme.spacing(1)}px auto`,
    padding: '16px',
  },
});

@inject('userStore')
class Login extends Component<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {
      username: '',
      password: '',
    };
  }

  componentDidMount() {
    document.title = 'SCOTUS App | Login';
  }

  submit = async () => {
    try {
      const user = await this.props.userStore?.authenticate(this.state.username, this.state.password);
      if (!user) {
        this.setState({ error: 'Invalid Username or Password'});
      }
    } catch (e: any) {
      this.setState({ error: e.message?.toString() || 'Invalid Username or Password'});
    }
  }

  changeUsername = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ username: event.target.value });
  }

  changePassword = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ password: event.target.value });
  }

  keyPress = (ev: React.KeyboardEvent<HTMLDivElement>) => {
    if (ev.key === 'Enter') {
      this.submit();
    }
  }

  render() {
    const { classes } = this.props;
    return (
      <Grid className={classes?.paper} container direction="column" justifyContent="center" alignItems="stretch" spacing={2}>
        <Grid item>
          <h2>Log In</h2>
        </Grid>
        {this.state.error ? (<Alert severity="error">{this.state.error}</Alert>) : '' }
        <Grid item>
          <TextField
            size="small"
            fullWidth
            color="secondary"
            variant="filled"
            name="username"
            required
            label="Username"
            onChange={this.changeUsername}
            value={this.state.username}
          />
        </Grid>
        <Grid item>
          <TextField
            size="small"
            color="secondary"
            variant="filled"
            fullWidth
            name="password"
            type="password"
            required
            label="Password"
            onChange={this.changePassword}
            onKeyPress={this.keyPress}
            value={this.state.password}
          />  
        </Grid>
        
        <Grid item>
          <Button 
            color="primary"
            variant="contained"
            fullWidth
            onClick={this.submit}
          >Log In</Button>
        </Grid>
      </Grid>
    );
  }
}

export default withStyles(styles)(Login);
