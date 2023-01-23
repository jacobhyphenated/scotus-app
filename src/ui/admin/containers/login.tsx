import React, { useCallback, useEffect, useState, useContext } from 'react';
import { UserStoreContext } from '../../../stores/userStore';
import { Grid, TextField, Button, Theme, makeStyles } from '@material-ui/core';
import { Alert } from '@material-ui/lab';

const useStyles = makeStyles((theme: Theme) => ({
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
}));

const Login = () => {

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string>();

  const userStore = useContext(UserStoreContext);

  useEffect(() => {
    document.title = 'SCOTUS App | Login';
  }, []);

  const submit = useCallback(async () => {
    try {
      const user = await userStore.authenticate(username, password);
      if (!user) {
        setError('Invalid Username or Password');
      }
    } catch (e: any) {
      console.log(e);
      setError(e.message);
    }
  }, [password, userStore, username]);

  const changeUsername = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(event.target.value);
  }, []);

  const changePassword = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  }, []);

  const keyPress = useCallback((ev: React.KeyboardEvent<HTMLDivElement>) => {
    if (ev.key === 'Enter') {
      submit();
    }
  }, [submit]);


  const classes = useStyles();
  return (
    <Grid className={classes?.paper} container direction="column" justifyContent="center" alignItems="stretch" spacing={2}>
      <Grid item>
        <h2>Log In</h2>
      </Grid>
      {error ? (<Alert severity="error">{error}</Alert>) : '' }
      <Grid item>
        <TextField
          size="small"
          fullWidth
          color="secondary"
          variant="filled"
          name="username"
          required
          label="Username"
          onChange={changeUsername}
          value={username}
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
          onChange={changePassword}
          onKeyPress={keyPress}
          value={password}
        />  
      </Grid>
      
      <Grid item>
        <Button 
          color="primary"
          variant="contained"
          fullWidth
          onClick={submit}
        >Log In</Button>
      </Grid>
    </Grid>
  );
};

export default Login;
