import React, { Component } from 'react';
import { inject } from 'mobx-react';
import { UserStore } from '../../../stores/userStore';
import { Grid, TextField, Button, withStyles, Theme } from '@material-ui/core';
import { Alert } from '@material-ui/lab';

interface Props {
  userStore?: UserStore;
  classes?: {[id: string]: string};
}

interface State {
  username: string;
  password: string;
  error?: string;
}

const styles = (theme: Theme) => ({
  paper: {
    [theme.breakpoints.down('sm')]: {
      maxWidth: 600,
    },
    [theme.breakpoints.up('md')]: {
      maxWidth: 768
    },
    [theme.breakpoints.up('xl')]: {
      maxWidth: 1200
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
      password: ''
    };
  }

  async submit() {
    try {
      console.log('submit')
      const user = await this.props.userStore?.authenticate(this.state.username, this.state.password)
      if (!user) {
        this.setState({ error: 'Invalid Username or Password'})
      }
    } catch (e) {
      this.setState({ error: e.message.toString()})
    }
  }

  render() {
    const { classes } = this.props;
    return (
      <Grid className={classes?.paper} container direction="column" justify="center" alignItems="stretch" spacing={2}>
        <Grid item>
          <h2>Log In</h2>
        </Grid>
        <Grid item>
          <TextField
            size="small"
            fullWidth
            color="secondary"
            variant="filled"
            name="username"
            required
            label="Username"
            onChange={(event) => this.setState({ username: event.target.value })}
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
            onChange={(event) => this.setState({ password: event.target.value })}
            value={this.state.password}
          />  
        </Grid>
        
        {this.state.error ? (<Alert severity="error">{this.state.error}</Alert>) : '' }
        <Grid item>
          <Button 
            color="primary"
            variant="contained"
            fullWidth
            onClick={() => this.submit()}
          >Log In</Button>
        </Grid>
      </Grid>
    );
  }
}

export default withStyles(styles)(Login);
