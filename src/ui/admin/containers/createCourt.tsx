import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Typography, IconButton, TextField, Theme, Button, Stack } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import BackIcon from '@mui/icons-material/ArrowBack';
import { CourtStoreContext } from '../../../stores/courtStore';
import { useNavigate } from 'react-router';

const useStyles = makeStyles((theme: Theme) => ({
  formContainer: {
    marginTop: theme.spacing(2),
    [theme.breakpoints.down('md')]: {
      width: 300,
    },
    [theme.breakpoints.up('md')]: {
      width: 420,
    },
  },
}));

const CreateCourtPage = () => {

  const [name, setName] = useState('');
  const [shortName, setShortName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [formError, setFormError] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const [shortNameError, setShortNameError] = useState<string | null>(null);

  const courtStore = useContext(CourtStoreContext);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'SCOTUS App | Admin | Create Court';
  }, []);

  const back = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const changeName = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
    setNameError(null);
  }, []);

  const changeShortName = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setShortName(event.target.value);
    setShortNameError(null);
  }, []);

  const submit = useCallback(async () => {
    let valid = true;
    if (!name) {
      setNameError('Name is required');
      valid = false;
    }
    if (!shortName) {
      setShortNameError('Short Name is required');
      valid = false;
    }
    if (!valid) {
      return;
    }
    setSubmitting(true);
    try {
      await courtStore.createCourt(name, shortName);
      navigate(-1);
    } catch (e: any) {
      setFormError(e?.message ?? 'An error occurred creating this court');
    } finally {
      setSubmitting(false);
    }
  }, [name, courtStore, navigate, shortName]);

  const classes = useStyles();

  return (
    <Stack alignItems="start">
      <IconButton onClick={back} size="large">
        <BackIcon color="action" />
      </IconButton>
      <Typography variant="h4" component="h2">Create Court</Typography>
      <form className={classes.formContainer} onSubmit={submit}>
        <Stack spacing={2}>
          {!!formError && 
              <Typography color="error">{formError}</Typography>
          }
          <TextField
            id="create-court-name"
            name="name"
            size="small"
            color="primary"
            variant="outlined"
            fullWidth
            required
            label="Name"
            onChange={changeName}
            value={name ?? ''}
            error={!!nameError}
            helperText={nameError || 'Full name of the appeals court'}
          />
          <TextField
            id="create-court-short-name"
            name="shortName"
            size="small"
            color="primary"
            variant="outlined"
            fullWidth
            required
            label="Short Name"
            onChange={changeShortName}
            value={shortName ?? ''}
            error={!!shortNameError}
            helperText={shortNameError || 'Abbreviation or short name for the court'}
          />
          <Button 
            disabled={ submitting || !!nameError || !!shortNameError }
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

export default CreateCourtPage;
