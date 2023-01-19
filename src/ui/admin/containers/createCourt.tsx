import React, { useCallback, useEffect, useState } from 'react';
import { Grid, Typography, IconButton, TextField, Theme, Button, makeStyles } from '@material-ui/core';
import BackIcon from '@material-ui/icons/ArrowBack';
import { inject } from 'mobx-react';
import { History } from 'history';
import { CourtStore } from '../../../stores/courtStore';

const useStyles = makeStyles((theme: Theme) => ({
  formContainer: {
    marginTop: theme.spacing(2),
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
  courtStore: CourtStore;
}

const CreateCourtPage = (props: Props) => {

  const [name, setName] = useState('');
  const [shortName, setShortName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [formError, setFormError] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const [shortNameError, setShortNameError] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'SCOTUS App | Admin | Create Court';
  }, []);

  const back = useCallback(() => {
    props.routing.goBack();
  }, [props.routing]);

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
      await props.courtStore.createCourt(name, shortName);
      props.routing.goBack();
    } catch (e: any) {
      setFormError(e?.message ?? 'An error occurred creating this court');
    } finally {
      setSubmitting(false);
    }
  }, [name, props.courtStore, props.routing, shortName]);

  const classes = useStyles();

  return (
    <Grid container direction="column">
      <Grid item>
        <IconButton onClick={back}>
          <BackIcon color="action" />
        </IconButton>
      </Grid>
      <Grid item>
        <Typography variant="h4" component="h2">Create Court</Typography>
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
            </Grid>
            <Grid item>
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
            </Grid>
            <Grid item>
              <Button 
                disabled={ submitting || !!nameError || !!shortNameError }
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

export default inject('routing', 'courtStore')(CreateCourtPage);