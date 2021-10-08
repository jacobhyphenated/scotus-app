import React, { useCallback, useState } from "react";
import { Typography, Paper, Grid, Button, TextField, Theme, makeStyles, IconButton, MenuItem } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import { OpinionType, CreateOpinionJustice, Opinion } from '../../../stores/opinionStore';
import { Justice } from "../../../stores/justiceStore";
import { Autocomplete } from "@material-ui/lab";
import { useEffect } from "react";
import Switch from '@material-ui/core/Switch';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import { useMemo } from "react";


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
  getAllJustices: () => Promise<Justice[]>;
}

const CreateOpinionCard = (props: Props) => {
  const [createMode, setCreateMode] = useState(false);
  const [createError, setCreateError] = useState<string>();
  const [opinionType, setOpinionType] = useState(OpinionType.MAJORITY);
  const [summary, setSummary] = useState('');
  const [summaryError, setSummaryError] = useState<string>();
  const [authorId, setAuthorId] = useState<number | null>(null);
  const [justiceIds, setJusticeIds] = useState<number[]>([]);
  const [useAllJustices, setUseAllJustices] = useState(false);
  const [allJustices, setAllJustics] = useState<Justice[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const { getAllJustices } = props;
  useEffect(() => {
    const loadAllJustices = async () => {
      if(useAllJustices) {
        const all = await getAllJustices();
        setAllJustics(all);
      }
    };
    loadAllJustices();
    
  }, [useAllJustices, getAllJustices]);

  const changeOpinionType = useCallback((event: React.ChangeEvent<{value: unknown}>) => {
    setOpinionType(event.target.value as OpinionType);
  }, []);

  const changeSummary = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSummary(event.target.value);
    setSummaryError(undefined);
  }, []);

  const changeAuthorId = useCallback((_: React.ChangeEvent<{}>, newAuthorId: number | null) => {
    setAuthorId(newAuthorId);
    setCreateError(undefined);
    if (justiceIds.some(jid => jid === newAuthorId)) {
      setJusticeIds(justiceIds.filter(jid => jid !== newAuthorId ));
    }
  }, [justiceIds]);

  const changeJustices = useCallback((_: React.ChangeEvent<{}>, value: number[]) => {
    setJusticeIds(value);
  }, []);

  const reset = useCallback(() => {
    setSummaryError(undefined);
    setCreateError(undefined);
    setSummary('');
    setAuthorId(null);
    setJusticeIds([]);
    setOpinionType(OpinionType.MAJORITY);
    setCreateMode(false);
  }, []);

  const toggleAllJustices = useCallback(() => {
    setUseAllJustices(!useAllJustices);
  }, [useAllJustices]);

  const submit = useCallback(async () => {
    setCreateError(undefined);
    let valid = true;
    if (!summary) {
      setSummaryError('Summary is required');
      valid = false;
    }
    if (authorId === null) {
      setCreateError('Opinion must have an author');
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
    } catch (e: any) {
      setCreateError(e?.message ?? 'Error creating opinion');
    } finally {
      setSubmitting(false);
    }
  }, [authorId, justiceIds, opinionType, props, reset, summary]);

  const toggleCreateMode = useCallback(() => setCreateMode(!createMode), [createMode]);

  const justiceOptions = useMemo(() => {
    return (useAllJustices && allJustices.length > 0) ? allJustices : props.activeJustices;
  }, [allJustices, props.activeJustices, useAllJustices]);

  const getJusticeLabel = useCallback((jid) => {
    return justiceOptions.find(j => j.id === jid)?.name ?? 'Unknown Justice';
  }, [justiceOptions]);

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
            <Grid direction="row" container justifyContent="space-between" alignItems="baseline">
              <Grid item>
                <Typography variant="h6">Create Opinion</Typography>
                {(createError) && <Typography color="error">{createError}</Typography>}
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
            <Autocomplete<number, false>
              id="create-opinion-author-select"
              options={justiceOptions.map(j => j.id).filter(id => id !== authorId)}
              getOptionLabel={getJusticeLabel}
              value={authorId}
              onChange={changeAuthorId}
              // eslint-disable-next-line react/jsx-no-bind
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="outlined"
                  label="Author"
                />
              )}
            />
          </Grid>
          <Grid item>
            <Autocomplete<number, true>
              multiple
              id="opinion-justices-autocomplete"
              options={justiceOptions.map(j => j.id).filter(id => id !== authorId)}
              getOptionLabel={getJusticeLabel}
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
            <FormControlLabel
              control={
                <Switch
                  checked={useAllJustices}
                  onChange={toggleAllJustices}
                  color="primary"
                  name="use-old-justice-toggle"
                />
              }
              label="Use old justices"
            />
          </Grid>
          <Grid item>
            <Button 
              disabled={ submitting || !!summaryError }
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