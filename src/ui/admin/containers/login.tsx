import React, { useCallback, useEffect, useState, useContext } from 'react';
import { UserStoreContext } from '../../../stores/userStore';
import { TextField, Button, Theme, Stack, Typography } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import { Alert } from '@mui/material';

const useStyles = makeStyles((theme: Theme) => ({
  paper: {
    [theme.breakpoints.down('md')]: {
      width: 600,
    },
    [theme.breakpoints.up('md')]: {
      width: 768,
    },
    [theme.breakpoints.up('xl')]: {
      width: 1200,
    },
    margin: `${theme.spacing(1)} auto`,
    padding: theme.spacing(2),
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
      console.error(e);
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
    <Stack className={classes?.paper} justifyContent="center" alignItems="stretch" spacing={2}>
      <Typography variant='h4'>Log In</Typography>
      {error ? (<Alert severity="error">{error}</Alert>) : '' }
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
      <Button 
        color="primary"
        variant="contained"
        fullWidth
        onClick={submit}
      >Log In</Button>
    </Stack>
  );
};

export default Login;
