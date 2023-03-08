import React, { useCallback, useState } from "react";
import { Typography, Paper, Grid, Button, Theme, TextField, MenuItem } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import { LocalDate, DateTimeFormatter } from "@js-joda/core";
import DatePicker from './datePicker';
import { CaseSitting } from '../../../stores/caseStore';

const useStyles = makeStyles( (theme: Theme) => ({
  paper: {
    padding: theme.spacing(1),
  },
}));

interface Props {
  onSave: (argumentDate: LocalDate | null, sitting: CaseSitting | undefined) => void;
  argumentDate: LocalDate | null;
  sitting: CaseSitting | undefined;
  disabled?: boolean;

  fullWidth?: boolean;
  required?: boolean;
}

const ArgumentDateEditField = (props: Props) => {

  const {onSave, argumentDate, sitting, ...inputProps} = props;

  const [editMode, setEditMode] = useState(false);
  const [editArgumentDate, setEditArgumentDate] = useState(argumentDate);
  const [editSitting, setEditSitting] = useState(sitting ?? CaseSitting.October);
  const [disableSave,  setDisableSave] = useState(false);

  const onEditClick = useCallback(() => {
    setEditMode(true);
  }, []);

  const onChangeDate = useCallback((event: LocalDate | null) => {
    if (event && !(event instanceof LocalDate)){
      setDisableSave(true);
      return;
    }
    setDisableSave(false);
    setEditArgumentDate(event);
  }, []);

  const onChangeSitting = useCallback((event: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<{value: unknown}>) => {
    setEditSitting(event.target.value as CaseSitting);
  }, []);

  const onSaveClick = useCallback(() => {
    onSave(editArgumentDate, editSitting);
    setEditMode(false);
  }, [editArgumentDate, editSitting, onSave]);

  const classes = useStyles();
  const formatter = DateTimeFormatter.ofPattern('MM/dd/yyyy');

  return (
    <>
      {!editMode ?
        <Paper variant="outlined" className={classes.paper}>
          <Grid container direction="row" alignItems="center" justifyContent="space-between">
            <Grid item xs={10}>
              <Grid container direction="column" spacing={1}>
                <Grid item>
                  <Typography color="textSecondary" variant="subtitle2">Argument Date</Typography>
                  <Typography>{argumentDate?.format(formatter) ?? 'None'}</Typography>
                </Grid>
                {sitting &&
                  <Grid item>
                    <Typography color="textSecondary" variant="subtitle2">Sitting</Typography>
                    <Typography>{sitting}</Typography>
                  </Grid>
                }
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
            <Grid container direction="column">
              <DatePicker 
                onChange={onChangeDate}
                label="Argument Date"
                value={editArgumentDate}
                inputVariant="outlined"
                {...inputProps}
              />
              <TextField
                label="Sitting"
                value={editSitting}
                variant="outlined"
                color="secondary"
                size="small"
                {...inputProps}
                select
                onChange={onChangeSitting}
              >
                {Object.values(CaseSitting).map((val, index) => (
                  <MenuItem key={index} value={val}>{val}</MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
          <Grid xs={2} item>
            <Button color="secondary" disabled={disableSave} onClick={onSaveClick}>save</Button>
          </Grid>
        </Grid>
      }
    </>
  );
};

export default ArgumentDateEditField;
