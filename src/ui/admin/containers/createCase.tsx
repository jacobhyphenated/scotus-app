import React, { useCallback, useContext, useEffect, useState } from 'react';
import {
  Grid,
  Typography,
  IconButton,
  TextField,
  Theme,
  Button,
  MenuItem,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import BackIcon from '@mui/icons-material/ArrowBack';
import Autocomplete from '@mui/material/Autocomplete';
import { observer } from 'mobx-react';
import { BareDocket, DocketStoreContext } from '../../../stores/docketStore';
import { CaseStoreContext } from '../../../stores/caseStore';
import { autorun } from 'mobx';
import { useNavigate } from 'react-router';
import { Stack } from '@mui/system';

const useStyles = makeStyles((theme: Theme) => ({
  formContainer: {
    marginTop: theme.spacing(2),
    [theme.breakpoints.down('md')]: {
      width: 350,
    },
    [theme.breakpoints.up('md')]: {
      width: 500,
    },
  },
  checkbox: {
    '&&': {
      marginLeft: -11,
    },
  },
}));

const CreateCasePage = () => {

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
  const navigate = useNavigate();

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
    navigate(-1);
  }, [navigate]);

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
      navigate('/admin/case');
    }
  }, [navigate, submit]);

  const saveAndEdit = useCallback(async () => {
    const newCase = await submit();
    if (newCase) {
      navigate(`/admin/case/edit/${newCase.id}`);
    }
  }, [navigate, submit]);

  const unassignedDockets = docketStore.unassignedDockets;
  const allTerms = caseStore.allTerms;
  const classes = useStyles();

  return (
    <Stack alignItems='start'>
      <IconButton onClick={back} size="large">
        <BackIcon color="action" />
      </IconButton>
      <Typography variant="h4" component="h2">Create Case</Typography>
      <form className={classes.formContainer} onSubmit={submit}>
        <Stack spacing={2}>
          {!!formError &&
              <Typography color="error">{formError}</Typography>
          }
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
          { termId > 0 && 
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
          }
          <FormControlLabel
            className={classes.checkbox}
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
          <Grid container spacing={2}>
            <Grid size={6}>
              <Button 
                disabled={ submitting || !!caseError || !!shortSummaryError }
                color="primary"
                variant="contained"
                fullWidth
                onClick={save}
              >Create</Button>
            </Grid>
            <Grid size={6}>
              <Button 
                disabled={ submitting || !!caseError || !!shortSummaryError }
                color="secondary"
                variant="contained"
                fullWidth
                onClick={saveAndEdit}
              >Create and Edit</Button>
            </Grid>
          </Grid>
        </Stack>
      </form>
    </Stack>
  );
};

export default observer(CreateCasePage);
