import React, { useState } from "react";
import { Typography, Paper, Grid, Button, Theme, makeStyles } from '@material-ui/core';
import { LocalDate, DateTimeFormatter } from "@js-joda/core";
import DatePicker from './datePicker';

const useStyles = makeStyles( (theme: Theme) => ({
  paper: {
    padding: `${theme.spacing(1)}px`,
  },
}));

interface Props {
  onSave: (value: LocalDate | null) => void;
  label: string;
  value: LocalDate | null;
  disabled?: boolean;

  fullWidth?: boolean;
  required?: boolean;
}

const ViewEditDatePicker = (props: Props) => {

  const {onSave, label, value, ...inputProps} = props;

  const [editMode, setEditMode] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [disableSave,  setDisableSave] = useState(false);

  const onEditClick = () => {
    setEditMode(true);
  };

  const onChange = (event: LocalDate | null) => {
    if (event && !(event instanceof LocalDate)){
      setDisableSave(true);
      return;
    }
    setDisableSave(false);
    setEditValue(event);
  };

  const onSaveClick = () => {
    onSave(editValue);
    setEditMode(false);
  };

  const classes = useStyles();
  const formatter = DateTimeFormatter.ofPattern('MM/dd/yyyy');

  return (
    <>
      {!editMode ?
        <Paper variant="outlined" className={classes.paper}>
          <Grid container direction="row" alignItems="center" justify="space-between">
            <Grid item xs={10}>
              <Grid container direction="column">
                <Typography color="textSecondary" variant="subtitle2">{label}</Typography>
                <Typography>{value?.format(formatter) ?? 'None'}</Typography>
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
            <DatePicker 
              onChange={onChange}
              label={label}
              value={editValue}
              inputVariant="outlined"
              {...inputProps}
            />
          </Grid>
          <Grid xs={2} item>
            <Button color="secondary" disabled={disableSave} onClick={onSaveClick}>save</Button>
          </Grid>
        </Grid>
      }
    </>
  );
};

export default ViewEditDatePicker;
