import React, { useState, ReactNode, useCallback } from "react";
import { Typography, Paper, Grid, Button, TextField, Theme, makeStyles } from '@material-ui/core';

const useStyles = makeStyles( (theme: Theme) => ({
  paper: {
    padding: `${theme.spacing(1)}px`,
    whiteSpace: 'pre-wrap',
  },
  noOverflow: {
    overflow: 'hidden',
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
  minRows?: number;
}

const ViewEditInputText = (props: Props) => {

  const {onSave, label, value, display, children, ...inputProps} = props;

  const [editMode, setEditMode] = useState(false);
  const [editValue, setEditValue] = useState(value);

  const onEditClick = useCallback(() => {
    setEditMode(true);
  }, []);

  const onChange = useCallback((event: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<{value: unknown}>) => {
    setEditValue(event.target.value as string);
  }, []);

  const onSaveClick = useCallback(() => {
    onSave(editValue);
    setEditMode(false);
  }, [editValue, onSave]);

  const keyPress = useCallback((ev: React.KeyboardEvent<HTMLDivElement>) => {
    if (ev.key === 'Enter' && (!props.multiline || !ev.shiftKey)) {
      onSaveClick();
    }
  }, [onSaveClick, props.multiline]);

  const classes = useStyles();
  return (
    <>
      {!editMode ?
      <Paper variant="outlined" className={classes.paper}>
        <Grid container direction="row" alignItems="center" justifyContent="space-between">
          <Grid item xs={10}>
            <Grid container direction="column" className={classes.noOverflow}>
              <Grid item>
                <Typography color="textSecondary" variant="subtitle2">{label}</Typography>
              </Grid>
              <Grid item>
                <Typography>{display ?? value}</Typography>
              </Grid>
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
