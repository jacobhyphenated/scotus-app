import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Typography, Theme, TextField, Button, IconButton, Stack } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import BackIcon from '@mui/icons-material/ArrowBack';
import { CaseStoreContext } from '../../../stores/caseStore';
import { useNavigate } from 'react-router';

const useStyles = makeStyles((theme: Theme) => ({
  formContainer: {
    marginTop: theme.spacing(2),
    [theme.breakpoints.down('md')]: {
      width: 280,
    },
    [theme.breakpoints.up('md')]: {
      width: 400,
    },
  },
}));

const CreateTermPage = () => {

  const [name, setName] = useState('');
  const [otName, setOtName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [otNameError, setOtNameError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const caseStore = useContext(CaseStoreContext);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'SCOTUS App | Admin | Create Term';
  }, []);

  const back = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const changeName = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
    setNameError(null);
  }, []);

  const changeOtName = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setOtName(event.target.value);
    setOtNameError(null);
  }, []);

  const submit = useCallback(async () => {
    let valid = true;
    if (!name) {
      setNameError('Name is required');
      valid = false;
    }
    if (!otName) {
      setOtName('OT Name is required');
      valid = false;
    }
    if (!valid) {
      return;
    }

    setSubmitting(true);
    try {
      await caseStore.createTerm(name, otName);
      navigate(-1);
    } catch(e: any) {
      setFormError(e?.errorMessage ?? 'An error occurred creating the term');
    } finally {
      setSubmitting(false);
    }
  }, [name, otName, caseStore, navigate]);

  const classes = useStyles();

  return (
    <Stack alignItems="start">
      <IconButton onClick={back} size="large">
        <BackIcon color="action" />
      </IconButton>
      <Typography variant="h4" component="h2">Create Term</Typography>
      <form className={classes.formContainer} onSubmit={submit}>
        <Stack spacing={2}>
          {!!formError &&
            <Typography color="error">{formError}</Typography>
          }
          <TextField
            id="create-term-name"
            name="name"
            size="small"
            color="primary"
            variant="outlined"
            fullWidth
            required
            label="Name"
            onChange={changeName}
            value={name}
            error={!!nameError}
            helperText={nameError}
          />
          <TextField
            id="create-term-otname"
            name="otname"
            size="small"
            color="primary"
            variant="outlined"
            fullWidth
            required
            label="OT Name"
            onChange={changeOtName}
            value={otName}
            error={!!otNameError}
            helperText={otNameError || 'October Term name notation'}
          />
          <Button 
            disabled={submitting || !!nameError || !!otNameError}
            color="primary"
            variant="contained"
            fullWidth
            onClick={submit}
          >Create</Button>
        </Stack>
      </form>
    </Stack>
  );
};

export default CreateTermPage;
