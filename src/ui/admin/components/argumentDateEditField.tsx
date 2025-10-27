import React, { useCallback, useState } from "react";
import { Typography, Paper, Grid, Button, Theme, TextField, MenuItem, Stack } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import { LocalDate, DateTimeFormatter } from "@js-joda/core";
import DatePicker from './datePicker';
import { CaseSitting } from '../../../stores/caseStore';

const useStyles = makeStyles( (theme: Theme) => ({
  paper: {
    padding: theme.spacing(1),
  },
  topSpacer: {
    marginTop: theme.spacing(1),
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
          <Grid container alignItems="center" justifyContent="space-between">
            <Grid size={10}>
              <Stack spacing={1}>
                <div>
                  <Typography color="textSecondary" variant="subtitle2">Argument Date</Typography>
                  <Typography>{argumentDate?.format(formatter) ?? 'None'}</Typography>
                </div>
                {sitting &&
                  <div>
                    <Typography color="textSecondary" variant="subtitle2">Sitting</Typography>
                    <Typography>{sitting}</Typography>
                  </div>
                }
              </Stack>
            </Grid>
            <Grid size={2}>
              <Button disabled={props.disabled} color="primary" onClick={onEditClick}>edit</Button>
            </Grid>
          </Grid>
        </Paper>
      :
        <Grid container direction="row" alignItems="center">
          <Grid size={10}>
            <Stack>
              <DatePicker 
                onChange={onChangeDate}
                label="Argument Date"
                clearable
                value={editArgumentDate}
                {...inputProps}
              />
              <TextField
                label="Sitting"
                className={classes.topSpacer}
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
            </Stack>
          </Grid>
          <Grid size={2}>
            <Button color="secondary" disabled={disableSave} onClick={onSaveClick}>save</Button>
          </Grid>
        </Grid>
      }
    </>
  );
};

export default ArgumentDateEditField;
