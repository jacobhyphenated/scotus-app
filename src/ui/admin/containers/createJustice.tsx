import React, { useCallback, useEffect, useState, useContext } from 'react';
import { Typography, IconButton, TextField, Theme, Button, MenuItem, Stack } from '@mui/material';
import BackIcon from '@mui/icons-material/ArrowBack';
import { JusticeStoreContext } from '../../../stores/justiceStore';
import { LocalDate } from '@js-joda/core';
import { makeStyles } from '@mui/styles';
import DatePicker from '../components/datePicker';
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

const CreateJusticePage = () => {

  const [name, setName] = useState('');
  const [dateConfirmed, setDateConfirmed] = useState<LocalDate | null>(LocalDate.now());
  const [birthday, setBirthday] = useState<LocalDate | null>(LocalDate.now().minusYears(50));
  const [party, setParty] = useState('R');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const [confirmDateError, setConfirmDateError] = useState<string | null>(null);
  const [birthdayError, setBirthdayError] = useState<string | null>(null);

  const justiceStore = useContext(JusticeStoreContext);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'SCOTUS App | Admin | Create Justice';
  }, []);

  const back = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const changeName = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
    setNameError(null);
  }, []);

  const changeBirthday = useCallback((date: LocalDate | null | Error) => {
    if (date instanceof Error) {
      setBirthdayError('Invalid Date');
      return;
    }
    setBirthday(date);
    setBirthdayError(null);
  }, []);

  const changeConfirmDate = useCallback((date: LocalDate | null | Error) => {
    if (date instanceof Error) {
      setConfirmDateError('Invalid Date');
      return;
    }
    setDateConfirmed(date);
    setConfirmDateError(null);
  }, []);

  const changeParty = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setParty(event.target.value);
  }, []);

  const submit = useCallback(async () => {
    let valid = true;
    if (!name) {
      setNameError('Name is required');
      valid = false;
    }
    if (!dateConfirmed) {
      setConfirmDateError('Confirmation Date is required');
      valid = false;
    }
    if (!birthday) {
      setBirthdayError('Birthday is required');
      valid = false;
    }
    if (!valid || nameError || confirmDateError || birthdayError) {
      return;
    }
    setSubmitting(true);
    try{ 
      await justiceStore.createJustice(name, birthday!, dateConfirmed!, party);
      justiceStore.refreshActiveJustices();
      navigate(-1);
    } catch (e: any) {
      setFormError(e?.message ?? 'An error occurred creating this justice');
    } finally {
      setSubmitting(false);
    }

  }, [name, dateConfirmed, birthday, nameError, confirmDateError, birthdayError, justiceStore, party, navigate]);

  const classes = useStyles();

  return (
    <Stack alignItems="start">
      <IconButton onClick={back} size="large">
        <BackIcon color="action" />
      </IconButton>
      <Typography variant="h4" component="h2">Create Justice</Typography>
      <form className={classes.formContainer} onSubmit={submit}>
        <Stack spacing={2}>
          {!!formError &&
            <Typography color="error">{formError}</Typography>
          }
          <TextField
            id="create-justice-name"
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
          <DatePicker
            required
            fullWidth
            onChange={changeBirthday}
            value={birthday}
            label="Birthday"
            error={!!birthdayError}
            helperText={birthdayError}
          />
          <DatePicker
            required
            fullWidth
            onChange={changeConfirmDate}
            value={dateConfirmed}
            label="Confirmation Date"
            error={!!confirmDateError}
            helperText={confirmDateError}
          />
          <TextField
            id="create-justice-party"
            label="Appointing Party"
            size="small"
            color="primary"
            variant="outlined"
            required
            fullWidth
            select
            value={party}
            onChange={changeParty}
          >
            <MenuItem value="R">Republican</MenuItem>
            <MenuItem value="D">Democrat</MenuItem>
          </TextField>
          <Button 
            disabled={submitting || !!nameError || !!birthdayError || !!confirmDateError}
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

export default CreateJusticePage;
