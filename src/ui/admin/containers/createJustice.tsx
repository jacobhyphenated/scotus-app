import React, { useCallback, useEffect, useState, useContext } from 'react';
import { Grid, Typography, IconButton, TextField, Theme, Button } from '@mui/material';
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
      maxWidth: 280,
    },
    [theme.breakpoints.up('md')]: {
      maxWidth: 400,
    },
  },
}));

const CreateJusticePage = () => {

  const [name, setName] = useState('');
  const [dateConfirmed, setDateConfirmed] = useState<LocalDate | null>(LocalDate.now());
  const [birthday, setBirthday] = useState<LocalDate | null>(LocalDate.now().minusYears(50));
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
      await justiceStore.createJustice(name, birthday!, dateConfirmed!);
      justiceStore.refreshActiveJustices();
      navigate(-1);
    } catch (e: any) {
      setFormError(e?.message ?? 'An error occurred creating this justice');
    } finally {
      setSubmitting(false);
    }

  }, [birthday, birthdayError, confirmDateError, dateConfirmed, name, nameError, justiceStore, navigate]);

  const classes = useStyles();

  return (
    <Grid container direction="column">
      <Grid item>
        <IconButton onClick={back} size="large">
          <BackIcon color="action" />
        </IconButton>
      </Grid>
      <Grid item>
        <Typography variant="h4" component="h2">Create Justice</Typography>
      </Grid>
      <Grid item>
        <form className={classes.formContainer} onSubmit={submit}>
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
                onChange={changeName}
                value={name}
                error={!!nameError}
                helperText={nameError}
              />
            </Grid>
            <Grid item>
              <DatePicker
                required
                fullWidth
                onChange={changeBirthday}
                value={birthday}
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
                onChange={changeConfirmDate}
                value={dateConfirmed}
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
                onClick={submit}
              >Create</Button>
            </Grid>
          </Grid>
        </form>
      </Grid>
    </Grid>
  );
};

export default CreateJusticePage;