import { useCallback, useState } from "react";
import { Typography, Paper, Grid2 as Grid, Button, Theme } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import { LocalDate, DateTimeFormatter } from "@js-joda/core";
import DatePicker from './datePicker';

const useStyles = makeStyles( (theme: Theme) => ({
  paper: {
    padding: theme.spacing(1),
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

  const onEditClick = useCallback(() => {
    setEditMode(true);
  }, []);

  const onChange = useCallback((event: LocalDate | null) => {
    if (event && !(event instanceof LocalDate)){
      setDisableSave(true);
      return;
    }
    setDisableSave(false);
    setEditValue(event);
  }, []);

  const onSaveClick = useCallback(() => {
    onSave(editValue);
    setEditMode(false);
  }, [editValue, onSave]);

  const classes = useStyles();
  const formatter = DateTimeFormatter.ofPattern('MM/dd/yyyy');

  return (
    <>
      {!editMode ?
        <Paper variant="outlined" className={classes.paper}>
          <Grid container alignItems="center" justifyContent="space-between">
            <Grid size={10}>
              <Grid container direction="column">
                <Typography color="textSecondary" variant="subtitle2">{label}</Typography>
                <Typography>{value?.format(formatter) ?? 'None'}</Typography>
              </Grid>
            </Grid>
            <Grid size={2}>
              <Button disabled={props.disabled} color="primary" onClick={onEditClick}>edit</Button>
            </Grid>
          </Grid>
        </Paper>
      :
        <Grid container alignItems="center">
          <Grid size={10}>
            <DatePicker 
              onChange={onChange}
              label={label}
              value={editValue}
              {...inputProps}
            />
          </Grid>
          <Grid size={2}>
            <Button color="secondary" disabled={disableSave} onClick={onSaveClick}>save</Button>
          </Grid>
        </Grid>
      }
    </>
  );
};

export default ViewEditDatePicker;
