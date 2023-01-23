import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Grid, Typography, IconButton, TextField, Theme, Button, MenuItem, FormControlLabel, Checkbox, makeStyles } from '@material-ui/core';
import BackIcon from '@material-ui/icons/ArrowBack';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { inject, observer } from 'mobx-react';
import { History } from 'history';
import { BareDocket, DocketStoreContext } from '../../../stores/docketStore';
import { CaseStoreContext } from '../../../stores/caseStore';
import { autorun } from 'mobx';

const useStyles = makeStyles((theme: Theme) => ({
  formContainer: {
    'margin-top': `${theme.spacing(2)}px`,
    [theme.breakpoints.down('sm')]: {
      maxWidth: 320,
    },
    [theme.breakpoints.up('md')]: {
      maxWidth: 450,
    },
  },
}));

interface Props {
  routing: History;
}

const CreateCasePage = (props: Props) => {

  const [title, setTitle] = useState('');
  const [shortSummary, setShortSummary] = useState('');
  const [termId, setTermId] = useState(0);
  const [dockets, setDockets] = useState<BareDocket[]>([]);
  const [important, setImportant] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formError, setFormError] = useState<string | null>(null);
  const [caseError, setCaseError] = useState<string | null>(null);
  const [shortSummaryError, setShortSummaryError] = useState<string | null>(null);

  const docketStore = useContext(DocketStoreContext);
  const caseStore = useContext(CaseStoreContext);

  useEffect(() => {
    document.title = 'SCOTUS App | Admin | Create Case';
  }, []);

  useEffect(() => {
    autorun((reaction) => {
      const allTerms = caseStore.allTerms;
      if (allTerms.length > 0) {
        setTermId(allTerms[0].id);
        reaction.dispose();
      }
    });
  }, [caseStore]);


  const back = useCallback(() => {
    props.routing.goBack();
  }, [props.routing]);

  const changeTitle = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(event.target.value);
    setCaseError(null);
  }, []);

  const changeShortSummary = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setShortSummary(event.target.value);
    setShortSummaryError(null);
  }, []);

  const changeTermId = useCallback((event: React.ChangeEvent<{value: unknown}>) => {
    setTermId(event.target.value as number);
  }, []);

  const changeDockets = useCallback((_: React.ChangeEvent<{}>, value: BareDocket[]) => {
    setDockets(value);
  }, []);

  const changeImportant = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setImportant(event.target.checked);
  }, []);

  const submit = useCallback(async () => {
    let valid = true;
    if (!title) {
      setCaseError('Case Title is required');
      valid = false;
    }
    if (!shortSummary) {
      setShortSummaryError('Short Summary is required');
      valid = false;
    }

    if(!valid) {
      return null;
    }

    setSubmitting(true);
    try {
      return await caseStore.createCase(title, shortSummary, termId, important, dockets.map(d => d.id));
    } catch (e: any) {
      console.warn(e);
      setFormError(e?.message ?? 'There was a problem creating this case');
      setSubmitting(false);
      return null;
    }
  }, [dockets, important, caseStore, shortSummary, termId, title]);

  const save = useCallback(async () => {
    const newCase = await submit();
    if (newCase) {
      props.routing.push('/admin/case');
    }
  }, [props.routing, submit]);

  const saveAndEdit = useCallback(async () => {
    const newCase = await submit();
    if (newCase) {
      props.routing.push(`/admin/case/edit/${newCase.id}`);
    }
  }, [props.routing, submit]);

  const unassignedDockets = docketStore.unassignedDockets;
  const allTerms = caseStore.allTerms;
  const classes = useStyles();

  return (
    <Grid container direction="column">
      <Grid item>
        <IconButton onClick={back}>
          <BackIcon color="action" />
        </IconButton>
      </Grid>
      <Grid item>
        <Typography variant="h4" component="h2">Create Case</Typography>
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
                id="create-case-title"
                name="title"
                size="small"
                color="primary"
                variant="outlined"
                fullWidth
                required
                label="Title"
                onChange={changeTitle}
                value={title}
                error={!!caseError}
                helperText={caseError}
              />
            </Grid>
            <Grid item>
              <TextField
                id="create-case-short-summary"
                name="shortSummary"
                size="small"
                color="primary"
                variant="outlined"
                fullWidth
                required
                multiline
                minRows={2}
                label="Short Summary"
                onChange={changeShortSummary}
                value={shortSummary}
                error={!!shortSummaryError}
                helperText={shortSummaryError}
              />
            </Grid>
            { termId > 0 && 
              <Grid item>
                <TextField
                  id="create-case-term-select"
                  label="Term"
                  size="small"
                  color="primary"
                  variant="outlined"
                  required
                  fullWidth
                  select
                  value={termId}
                  onChange={changeTermId}
                >
                  {allTerms.map(term => (
                    <MenuItem key={term.id} value={term.id}>{term.name}</MenuItem>
                  ))}
                </TextField>
              </Grid>
            }
            <Grid item>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={important}
                    onChange={changeImportant}
                    name="caseImportant"
                    color="primary"
                  />
                }
                label="Important?"
              />
            </Grid>
            <Grid item>
              <Autocomplete<BareDocket, true>
                multiple
                id="case-create-docket-autocomplete"
                options={unassignedDockets}
                // eslint-disable-next-line react/jsx-no-bind
                getOptionLabel={(docket) => docket.title}
                onChange={changeDockets}
                value={dockets}
                filterSelectedOptions
                // eslint-disable-next-line react/jsx-no-bind
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="outlined"
                    label="Linked Dockets"
                  />
                )}
              />
            </Grid>
            <Grid item>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Button 
                    disabled={ submitting || !!caseError || !!shortSummaryError }
                    color="primary"
                    variant="contained"
                    fullWidth
                    onClick={save}
                  >Create</Button>
                </Grid>
                <Grid item xs={6}>
                  <Button 
                    disabled={ submitting || !!caseError || !!shortSummaryError }
                    color="secondary"
                    variant="contained"
                    fullWidth
                    onClick={saveAndEdit}
                  >Create and Edit</Button>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </form>
      </Grid>
    </Grid>
  );

};

export default inject('routing')(observer(CreateCasePage));
