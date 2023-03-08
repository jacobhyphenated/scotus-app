import React, { useState, useCallback } from "react";
import { Typography, Paper, Grid, Button, TextField, Theme, IconButton } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import CloseIcon from '@mui/icons-material/Close';

const useStyles = makeStyles( (theme: Theme) => ({
  paper: {
    padding: theme.spacing(1),
    whiteSpace: 'pre-wrap',
  },
  bottomSpacer: {
    marginBottom: theme.spacing(1),
  },
  title: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(-1), // TODO: Test margin here
  },
  topSpacer: {
    marginTop: theme.spacing(1),
  },
}));

interface Props {
  existingTitles: string[];
  onSave: (titles: string[]) => void;
}

const AlternateTitleEditCard = (props: Props) => {
  const { existingTitles, onSave } = props;

  const [titleKey, setTitleKey] = useState(1);
  const [newTitleIds, setNewTitleIds] = useState<number[]>([]);

  const classes = useStyles();

  const deleteExisting = useCallback((title: string) => {
    const updatedTitles = existingTitles.filter(t => t !== title);
    onSave(updatedTitles);
  }, [existingTitles, onSave]);

  const createNewTitle = useCallback((key: number, title: string) => {
    if (!title) {
      const updatedTitleKeys = newTitleIds.filter(id => id !== key);
      setNewTitleIds(updatedTitleKeys);
      return;
    }
    const updatedTitles = [...existingTitles, title];
    const updatedTitleKeys = newTitleIds.filter(id => id !== key);
    setNewTitleIds(updatedTitleKeys);
    onSave(updatedTitles);
  },[newTitleIds, existingTitles, onSave]);

  const onClickNewTitle = useCallback(() => {
    setNewTitleIds([...newTitleIds, titleKey]);
    setTitleKey(titleKey + 1);
  }, [titleKey, newTitleIds]);

  return (
    <Paper variant="outlined" className={classes.paper}>
      <Grid container direction="column">
        <Grid item className={classes.bottomSpacer}>
          <Typography color="textSecondary" variant="subtitle2">Alternate Titles</Typography>
        </Grid>
        {existingTitles.map(existingTitle => (
          <Grid item key={existingTitle} className={classes.bottomSpacer}>
            <ExistingTitleCard title={existingTitle} onDelete={deleteExisting} />
          </Grid>
        ))}
        {newTitleIds.map(id => (
          <Grid item key={id} className={`${classes.topSpacer} ${classes.bottomSpacer}`}>
            <NewTitleCard id={id} createNewTitle={createNewTitle} />
          </Grid>
        ))}
        <Grid item>
          <Button onClick={onClickNewTitle} color="primary">Add Title</Button>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default AlternateTitleEditCard;

interface ExistingTitleProps {
  title: string;
  onDelete: (title: string) => void;
}

const ExistingTitleCard = (props: ExistingTitleProps) => {
  const { title, onDelete } = props;

  const onDeleteTitle = useCallback(() => {
    onDelete(title);
  }, [onDelete, title]);

  const classes = useStyles();

  return (
    <Paper variant="outlined" className={classes.paper}>
      <Grid container direction="row" alignItems="center">
        <Grid item className={classes.title} xs={11}>
          <Typography>{props.title}</Typography>
        </Grid>
        <Grid item xs={1}>
          <IconButton size="small" onClick={onDeleteTitle}><CloseIcon /></IconButton>
        </Grid>
      </Grid>
    </Paper>
  );
};

interface NewTitleProps {
  id: number;
  createNewTitle: (key: number, title: string) => void;
}

const NewTitleCard = (props: NewTitleProps) => {
  const { id, createNewTitle } = props;

  const [title, setTitle ] = useState("");

  const onChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(event.target.value);
  }, []);

  const save = useCallback(() => {
    createNewTitle(id, title);
  }, [id, title, createNewTitle]);

  const keyPress = useCallback((ev: React.KeyboardEvent<HTMLDivElement>) => {
    if (ev.key === 'Enter') {
      save();
    }
  }, [save]);

  return (
    <Grid container direction="row" alignItems="center">
      <Grid xs={10} item>
        <TextField
          label="Title"
          value={title}
          variant="outlined"
          color="secondary"
          size="small"
          fullWidth
          onKeyPress={keyPress}
          onChange={onChange} />
      </Grid>
      <Grid xs={2} item>
        <Button color="secondary" onClick={save}>save</Button>
      </Grid>
    </Grid>
  );
};