import React, { useState, ReactNode } from "react";
import { Typography, Paper, Grid, Button, TextField, Theme, makeStyles } from '@material-ui/core';

const useStyles = makeStyles( (theme: Theme) => ({
  paper: {
    padding: `${theme.spacing(1)}px`,
    whiteSpace: 'pre-wrap',
  },
}));

interface Props {
  onSave: (value: string) => void;
  label: string;
  value: string;
  display?: string;
  children?: ReactNode;
  disabled?: boolean;

  id?: string;
  name?: string;
  fullWidth?: boolean;
  required?: boolean;
  select?: boolean;
  multiline?: boolean;
  rows?: number;
}

const ViewEditInputText = (props: Props) => {

  const {onSave, label, value, display, children, ...inputProps} = props;

  const [editMode, setEditMode] = useState(false);
  const [editValue, setEditValue] = useState(value);

  const onEditClick = () => {
    setEditMode(true);
  };

  const onChange = (event: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<{value: unknown}>) => {
    setEditValue(event.target.value as string);
  };

  const onSaveClick = () => {
    onSave(editValue);
    setEditMode(false);
  };

  const keyPress = (ev: React.KeyboardEvent<HTMLDivElement>) => {
    if (ev.key === 'Enter' && (!props.multiline || !ev.shiftKey)) {
      onSaveClick();
    }
  };

  const classes = useStyles();
  return (
    <>
      {!editMode ?
      <Paper variant="outlined" className={classes.paper}>
        <Grid container direction="row" alignItems="center" justify="space-between">
          <Grid item xs={10}>
            <Grid container direction="column">
              <Typography color="textSecondary" variant="subtitle2">{label}</Typography>
              <Typography>{display ?? value}</Typography>
            </Grid>
          </Grid>
          <Grid item xs={2}>
            <Button disabled={props.disabled} color="primary" onClick={onEditClick}>edit</Button>
          </Grid>
        </Grid>
      </Paper>
      :
      <Grid container direction="row" alignItems="center">
        <Grid xs={10} item>
          <TextField
            label={label}
            value={editValue}
            variant="outlined"
            color="secondary"
            onKeyPress={keyPress}
            {...inputProps}
            onChange={onChange}>
              {children}
          </TextField>
        </Grid>
        <Grid xs={2} item>
          <Button color="secondary" onClick={onSaveClick}>save</Button>
        </Grid>
      </Grid>
      }
    </>
  );
};

export default ViewEditInputText;
