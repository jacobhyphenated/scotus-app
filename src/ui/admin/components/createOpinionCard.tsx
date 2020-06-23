import React, { useState } from "react";
import { Typography, Paper, Grid, Button, TextField, Theme, makeStyles, IconButton, MenuItem } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import { OpinionType, CreateOpinionJustice, Opinion } from '../../../stores/opinionStore';
import { Justice } from "../../../stores/justiceStore";
import { Autocomplete } from "@material-ui/lab";

const useStyles = makeStyles( (theme: Theme) => ({
  paper: {
    padding: `${theme.spacing(1)}px`,
    'margin-top': `${theme.spacing(1)}px`,
  },
  createButton: {
    'margin-top': `${theme.spacing(2)}px`,
  },
}));

interface Props {
  createOpinion: (caseId: number, opinionType: OpinionType, summary: string, justices: CreateOpinionJustice[]) => Promise<Opinion>;
  onCreateOpinion: (opinion: Opinion) => void;
  caseId: number;
  activeJustices: Justice[];
}

const CreateOpinionCard = (props: Props) => {
  const [createMode, setCreateMode] = useState(false);
  const [createError, setCreateError] = useState<string>();
  const [opinionType, setOpinionType] = useState(OpinionType.CONCURRENCE);
  const [summary, setSummary] = useState('');
  const [summaryError, setSummaryError] = useState<string>();
  const [authorId, setAuthorId] = useState(-1);
  const [authorError, setAuthorError] = useState<string>();
  const [justiceIds, setJusticeIds] = useState<number[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const changeOpinionType = (event: React.ChangeEvent<{value: unknown}>) => {
    setOpinionType(event.target.value as OpinionType);
  };

  const changeSummary = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSummary(event.target.value);
    setSummaryError(undefined);
  };

  const changeAuthorId = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newAuthorId = Number(event.target.value);
    setAuthorId(newAuthorId);
    setAuthorError(undefined);
    if (justiceIds.some(jid => jid === newAuthorId)) {
      setJusticeIds(justiceIds.filter(jid => jid !== newAuthorId ));
    }
  };

  const changeJustices = (_: React.ChangeEvent<{}>, value: number[]) => {
    setJusticeIds(value);
  };

  const reset = () => {
    setAuthorError(undefined);
    setSummaryError(undefined);
    setCreateError(undefined);
    setSummary('');
    setAuthorId(-1);
    setJusticeIds([]);
    setOpinionType(OpinionType.CONCURRENCE);
    setCreateMode(false);
  };

  const submit = async () => {
    setCreateError(undefined);
    let valid = true;
    if (!summary) {
      setSummaryError('Summary is required');
      valid = false;
    }
    if (authorId <= 0) {
      setAuthorError('Opinion must have an author');
      valid = false;
    }
    if (!valid) {
      return;
    }
    setSubmitting(true);
    try {
      const justices: CreateOpinionJustice[] = [{justiceId: authorId!, isAuthor: true}, ...justiceIds.map(jid => ({
        justiceId: jid,
        isAuthor: false,
      }))];
      const opinion = await props.createOpinion(props.caseId, opinionType, summary, justices);
      reset();
      props.onCreateOpinion(opinion);
    } catch (e) {
      setCreateError(e?.message ?? 'Error creating opinion');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleCreateMode = () => {
    setCreateMode(!createMode);
  };

  const classes = useStyles();
  return (
    <>
    {!createMode ?
      <Button color="primary" className={classes.createButton} onClick={toggleCreateMode}>
        Add Opinion
      </Button>
    :
      <Paper className={classes.paper}>
        <Grid container direction="column" spacing={2}>
          <Grid item>
            <Grid direction="row" container justify="space-between" alignItems="baseline">
              <Grid item>
                <Typography variant="h6">Create Opinion</Typography>
                {createError && <Typography color="error">{createError}</Typography>}
              </Grid>
              <Grid>
                <IconButton onClick={reset} >
                  <CloseIcon />
                </IconButton>
              </Grid>
            </Grid>
          </Grid>
          <Grid item>
            <TextField
              id="create-opinion-type"
              label="Opinion Type"
              size="small"
              color="primary"
              variant="outlined"
              required
              fullWidth
              select
              value={opinionType}
              onChange={changeOpinionType}
            >
              {Object.values(OpinionType).map((type, index) => (
                <MenuItem key={index} value={type}>{type}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item>
            <TextField 
              id="create-opinion-summary"
              label="Summary"
              color="primary"
              variant="outlined"
              fullWidth
              required
              multiline
              rows={4}
              value={summary}
              error={!!summaryError}
              helperText={summaryError}
              onChange={changeSummary}
            />
          </Grid>
          <Grid item>
            <TextField
              id="create-opinion-author-select"
              label="Author"
              size="small"
              color="primary"
              variant="outlined"
              required
              fullWidth
              select
              value={authorId}
              onChange={changeAuthorId}
            >
              <MenuItem value={-1}><Typography color="textSecondary">Select an author</Typography></MenuItem>
              {props.activeJustices.map(justice => (
                <MenuItem key={justice.id} value={justice.id}>{justice.name}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item>
            <Autocomplete<number, true>
              multiple
              id="opinion-justices-autocomplete"
              options={props.activeJustices.map(j => j.id).filter(id => id !== authorId)}
              // eslint-disable-next-line react/jsx-no-bind
              getOptionLabel={(jid) => props.activeJustices.find(j => j.id === jid)?.name ?? 'Unknown Justice'}
              onChange={changeJustices}
              value={justiceIds}
              filterSelectedOptions
              // eslint-disable-next-line react/jsx-no-bind
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="outlined"
                  label="Joined By"
                />
              )}
            />
          </Grid>
          <Grid item>
            <Button 
              disabled={ submitting || !!summaryError || !!authorError }
              color="primary"
              variant="contained"
              fullWidth
              onClick={submit}
            >Create</Button>
          </Grid>
        </Grid>
      </Paper>
    }
    </>
  );
};

export default CreateOpinionCard;