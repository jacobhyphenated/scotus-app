import React, { useCallback, useState } from "react";
import {
  Typography,
  Paper,
  Grid2 as Grid,
  Button,
  TextField,
  Theme,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Stack,
} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import CloseIcon from '@mui/icons-material/Close';
import { Opinion } from '../../../stores/opinionStore';

const useStyles = makeStyles( (theme: Theme) => ({
  paper: {
    padding: theme.spacing(1),
    marginTop: theme.spacing(1),
  },
  chip: {
    marginLeft: '4px',
    marginBottom: '2px',
    height: theme.spacing(3),
  },
  opinionSummary: {
    'white-space': 'pre-line',
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

  const toggleConfirmDelete = useCallback(() => {
    setConfirmDelete(!confirmDelete);
  }, [confirmDelete]);

  const deleteOpinion = useCallback(() => {
    toggleConfirmDelete();
    props.onDeleteOpinion(opinion);
  }, [opinion, props, toggleConfirmDelete]);

  const saveSummary = useCallback(() => {
    setEditMode(false);
    props.editOpinionSummary(opinion.id, summaryText);
  }, [opinion.id, props, summaryText]);

  const onChangeSummary = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSummaryText(e.target.value);
  }, []);

  const toggleEditMode = useCallback(() => {
    setEditMode(!editMode);
  }, [editMode]);

  

  const classes = useStyles();
  const author = opinion.justices.find(j => j.isAuthor);
  const joined = opinion.justices.filter(j => !j.isAuthor);

  return (
    <Paper variant="elevation" className={classes.paper}>
      <Stack spacing={1}>
        <Grid container justifyContent="space-between" alignItems="baseline">
          <Grid>
            <Typography variant="subtitle2" color="textSecondary">
              {opinion.opinionType}
            </Typography>
          </Grid>
          <Grid>
            <IconButton onClick={toggleConfirmDelete} size="large">
              <CloseIcon />
            </IconButton>
          </Grid>
        </Grid>
        {!editMode ?
          <Grid container alignItems="center" justifyContent="space-between">
            <Grid size={10}>
              <Typography className={classes.opinionSummary}>{opinion.summary}</Typography>
            </Grid>
            <Grid size={2}>
              <Button color="primary" onClick={toggleEditMode}>edit</Button>
            </Grid>
          </Grid>
        :
          <Grid container alignItems="center">
            <Grid size={10}>
              <TextField
                label="Summary"
                fullWidth
                multiline
                minRows={4}
                maxRows={10}
                value={summaryText}
                variant="outlined"
                color="secondary"
                onChange={onChangeSummary}
              />
            </Grid>
            <Grid size={2}>
              <Button color="secondary" onClick={saveSummary}>save</Button>
            </Grid>
          </Grid>
        }
        <div>
          <Typography>Author: <strong>{author?.justiceName}</strong></Typography>
          {joined.length > 0 &&
            <>
              <Typography component="span">Joined By:</Typography>
              {joined.map(j => (
                <Chip key={j.justiceId} label={j.justiceName} className={classes.chip} variant="outlined" />
              ))}
            </>
          }
        </div>
      </Stack>
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
