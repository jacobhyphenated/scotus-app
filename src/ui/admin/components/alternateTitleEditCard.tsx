import React, { useState, useCallback } from "react";
import { Typography, Paper, Grid2 as Grid, Button, TextField, Theme, IconButton, Stack } from '@mui/material';
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
    marginRight: theme.spacing(-1),
  },
  topSpacer: {
    '&&': {
      marginTop: theme.spacing(2),
    },
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
      <Stack spacing={1}>
        <Typography color="textSecondary" variant="subtitle2">Alternate Titles</Typography>
        {existingTitles.map(existingTitle => (
          <ExistingTitleCard key={existingTitle} title={existingTitle} onDelete={deleteExisting} />
        ))}
        {newTitleIds.map(id => (
          <div className={classes.topSpacer} key={id}>
            <NewTitleCard id={id} createNewTitle={createNewTitle} />
          </div>
        ))}
        <div>
          <Button onClick={onClickNewTitle} color="primary">Add Title</Button>
        </div>
      </Stack>
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
      <Grid container alignItems="center">
        <Grid className={classes.title} size={11}>
          <Typography>{props.title}</Typography>
        </Grid>
        <Grid size={1}>
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
    <Grid container alignItems="center">
      <Grid size={10}>
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
      <Grid size={2}>
        <Button color="secondary" onClick={save}>save</Button>
      </Grid>
    </Grid>
  );
};