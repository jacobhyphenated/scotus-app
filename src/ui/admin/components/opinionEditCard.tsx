import React, { useState } from "react";
import { Typography, Paper, Grid, Button, TextField, Theme, makeStyles, IconButton, Chip, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import { Opinion } from '../../../stores/opinionStore';

const useStyles = makeStyles( (theme: Theme) => ({
  paper: {
    padding: `${theme.spacing(1)}px`,
    'margin-top': `${theme.spacing(1)}px`,
  },
  chip: {
    'margin-left': '4px',
    'height': `${theme.spacing(3)}px`,
  },
}));

interface Props {
  onDeleteOpinion: (opinion: Opinion) => void;
  editOpinionSummary: (opinionId: number, summary: string) => void;
  opinion: Opinion;
}

const OpinionEditCard = (props: Props) => {
  const opinion = props.opinion;

  const [editMode, setEditMode] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [summaryText, setSummaryText] = useState(opinion.summary);

  const deleteOpinion = () => {
    toggleConfirmDelete();
    props.onDeleteOpinion(opinion);
  };

  const saveSummary = () => {
    setEditMode(false);
    props.editOpinionSummary(opinion.id, summaryText);
  };

  const onChangeSummary = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSummaryText(e.target.value);
  };

  const toggleEditMode = () => {
    setEditMode(!editMode);
  };

  const toggleConfirmDelete = () => {
    setConfirmDelete(!confirmDelete);
  };

  const keyPress = (ev: React.KeyboardEvent<HTMLDivElement>) => {
    if (ev.key === 'Enter') {
      saveSummary();
    }
  };

  const classes = useStyles();
  const author = opinion.justices.find(j => j.isAuthor);
  const joined = opinion.justices.filter(j => !j.isAuthor);

  return (
    <Paper variant="elevation" className={classes.paper}>
      <Grid container direction="column" spacing={1}>
        <Grid item>
          <Grid container direction="row" justify="space-between" alignItems="baseline">
            <Grid item>
              <Typography variant="subtitle2" color="textSecondary">
                {opinion.opinionType}
              </Typography>
            </Grid>
            <Grid item>
              <IconButton onClick={toggleConfirmDelete}>
                <CloseIcon />
              </IconButton>
            </Grid>
          </Grid>
        </Grid>
        <Grid item>
          {!editMode ?
            <Grid container direction="row" alignItems="center" justify="space-between">
              <Grid item xs={10}>
                <Grid container direction="column">
                  <Typography>{opinion.summary}</Typography>
                </Grid>
              </Grid>
              <Grid item xs={2}>
                <Button color="primary" onClick={toggleEditMode}>edit</Button>
              </Grid>
            </Grid>
          :
            <Grid container direction="row" alignItems="center">
              <Grid xs={10} item>
                <TextField
                  label="Summary"
                  fullWidth
                  multiline
                  rows={2}
                  value={summaryText}
                  variant="outlined"
                  color="secondary"
                  onKeyPress={keyPress}
                  onChange={onChangeSummary}
                />
              </Grid>
              <Grid xs={2} item>
                <Button color="secondary" onClick={saveSummary}>save</Button>
              </Grid>
            </Grid>
          }
        </Grid>
        <Grid item>
          <Typography>Author: {author?.justiceName}</Typography>
          {joined.length > 0 &&
            <>
              <Typography component="span">Joined By:</Typography>
              {joined.map(j => (<Chip key={j.justiceId} label={j.justiceName} className={classes.chip} variant="outlined" />))}
            </>
          }
          
        </Grid>
      </Grid>
      <Dialog
        open={confirmDelete}
        onClose={toggleConfirmDelete}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Delete this {opinion.opinionType} opinion?</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete this opinion? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={toggleConfirmDelete} color="primary">
            Cancel
          </Button>
          <Button onClick={deleteOpinion} color="secondary" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default OpinionEditCard;
