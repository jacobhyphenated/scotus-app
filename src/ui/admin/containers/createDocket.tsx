import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Grid, Typography, IconButton, TextField, Theme, Button, MenuItem, makeStyles } from '@material-ui/core';
import BackIcon from '@material-ui/icons/ArrowBack';
import { observer } from 'mobx-react';
import { DocketStatus, DocketStoreContext } from '../../../stores/docketStore';
import { CourtStoreContext } from '../../../stores/courtStore';
import { useNavigate } from 'react-router';

const useStyles = makeStyles((theme: Theme) => ({
  formContainer: {
    marginTop: theme.spacing(2),
    [theme.breakpoints.down('sm')]: {
      maxWidth: 320,
    },
    [theme.breakpoints.up('md')]: {
      maxWidth: 450,
    },
  },
}));


const CreateDocketPage = () => {

  const [title, setTitle] =  useState('');
  const [docketNumber, setDocketNumber] = useState('');
  const [lowerCourtId, setLowerCourtId] = useState(0);
  const [lowerCourtRuling, setLowerCourtRuling] = useState('');
  const [status, setStatus] = useState(DocketStatus.CERT_GRANTED);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [titleError, setTitleError] = useState<string | null>(null);
  const [docketNumberError, setDocketNumberError] = useState<string | null>(null);
  const [lowerCourtError, setLowerCourtError] = useState<string | null>(null);

  const courtStore = useContext(CourtStoreContext);
  const docketStore = useContext(DocketStoreContext);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'SCOTUS App | Admin | Create Docket';
  }, []);

  const back = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const changeTitle = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(event.target.value);
    setTitleError(null);
  }, []);

  const changeDocketNumber = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setDocketNumber(event.target.value);
    setDocketNumberError(null);
  }, []);

  const changeLowerCourt = useCallback((event: React.ChangeEvent<{value: unknown}>) => {
    setLowerCourtId(event.target.value as number);
    setLowerCourtError(null);
  }, []);

  const changeRuling = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setLowerCourtRuling(event.target.value);
  }, []);

  const changeStatus = useCallback((event: React.ChangeEvent<{value: unknown}>) => {
    setStatus(event.target.value as DocketStatus);
  }, []);

  const submit = useCallback(async () => {
    let valid = true;
    if (!title) {
      setTitleError('Title is required');
      valid = false;
    }
    if (!docketNumber) {
      setDocketNumberError('Docket number is required');
      valid = false;
    }
    if (!lowerCourtId) {
      setLowerCourtError('Select a lower court');
      valid = false;
    }
    if (!valid) {
      return;
    }
    setSubmitting(true);
    try {
      await docketStore.createDocket(title, docketNumber, lowerCourtId, lowerCourtRuling, status);
      navigate(-1);
    } catch (e: any) {
      setFormError(e?.message ?? 'An error occurred creating this docket');
    } finally {
      setSubmitting(false);
    }
    
  }, [docketNumber, lowerCourtId, lowerCourtRuling, docketStore, navigate, status, title]);

  const courts = courtStore.allCourts;
  const classes = useStyles();
  return (
    <Grid container direction="column">
      <Grid item>
        <IconButton onClick={back}>
          <BackIcon color="action" />
        </IconButton>
      </Grid>
      <Grid item>
        <Typography variant="h4" component="h2">Create Docket</Typography>
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
                id="create-docket-title"
                name="title"
                size="small"
                color="primary"
                variant="outlined"
                fullWidth
                required
                label="Title"
                onChange={changeTitle}
                value={title ?? ''}
                error={!!titleError}
                helperText={titleError}
              />
            </Grid>
            <Grid item>
              <TextField
                id="create-docket-number"
                name="docketNumber"
                size="small"
                color="primary"
                variant="outlined"
                fullWidth
                required
                label="Docket Number"
                onChange={changeDocketNumber}
                value={docketNumber ?? ''}
                error={!!docketNumberError}
                helperText={docketNumberError}
              />
            </Grid>
            <Grid item>
              <TextField
                id="create-docket-court-select"
                label="Lower Court"
                size="small"
                color="primary"
                variant="outlined"
                required
                fullWidth
                select
                error={!!lowerCourtError}
                helperText={lowerCourtError}
                value={lowerCourtId}
                onChange={changeLowerCourt}
              >
                <MenuItem value={0} disabled>Choose a lower court</MenuItem>
                {courts.map(court => (
                  <MenuItem key={court.id} value={court.id}>{court.name}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item>
              <TextField 
                id="create-docket-lower-court-ruling"
                label="Lower Court Ruling"
                color="primary"
                variant="outlined"
                fullWidth
                multiline
                minRows={4}
                value={lowerCourtRuling}
                onChange={changeRuling}
              />
            </Grid>
            <Grid item>
              <TextField
                id="create-docket-status"
                label="Status"
                size="small"
                color="primary"
                variant="outlined"
                required
                fullWidth
                select
                value={status}
                onChange={changeStatus}
              >
                {Object.values(DocketStatus).map((status, index) => (
                  <MenuItem key={index} value={status}>{status}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item>
              <Button 
                disabled={ submitting || !!titleError || !!docketNumberError || !!lowerCourtError }
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

export default observer(CreateDocketPage);
