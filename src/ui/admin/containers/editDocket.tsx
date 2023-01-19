import React, { useCallback, useEffect, useState } from 'react';
import { Grid, Typography, IconButton, Theme, MenuItem, FormControlLabel, FormControl, FormLabel, RadioGroup, Radio, makeStyles } from '@material-ui/core';
import BackIcon from '@material-ui/icons/ArrowBack';
import { inject } from 'mobx-react';
import { History } from 'history';
import { DocketStore, DocketStatus, FullDocket, DocketEdit } from '../../../stores/docketStore';
import { CourtStore } from '../../../stores/courtStore';
import { useParams } from 'react-router';
import ViewEditInputText from '../components/viewEditInputText';

const useStyles = makeStyles((theme: Theme) => ({
  formContainer: {
    marginTop: theme.spacing(2),
    [theme.breakpoints.down('sm')]: {
      maxWidth: 320,
    },
    [theme.breakpoints.up('md')]: {
      maxWidth: 450,
    },
  },
}));

interface Props {
  routing: History;
  docketStore: DocketStore;
  courtStore: CourtStore;
}

const EditDocketPage = (props: Props) => {

  const [submitting, setSubmitting] = useState(false);
  const [docket, setDocket] = useState<FullDocket | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const { id } = useParams<{ id: string }>();
  
  useEffect(() => {
    const docketId = id;
    if (!docketId || isNaN(Number(docketId))) {
      console.warn('No docket id in url params');
      props.routing.push('/admin/docket');
      return;
    }
    const loadDocket = async () => {
      try {
        const docket = await props.docketStore.getDocketById(Number(docketId));
        if (!docket) {
          throw new Error(`No docket found with id ${docketId}`);
        }
        document.title = `SCOTUS App | Admin | Edit Docket ${docket.docketNumber}`;
        setDocket(docket);
      } catch (e: any) {
        console.warn(e);
        props.routing.push('/admin/docket');
      }
    };
    loadDocket();
  }, [id, props.docketStore, props.routing]);

  const edit = useCallback(async (docketEdit: DocketEdit) => {
    if (!docket) {
      return;
    }
    setSubmitting(true);
    setFormError(null);
    try {
      const updatedDocket = await props.docketStore.editDocket(docket.id, docketEdit);
      setDocket(updatedDocket);
    } catch (e: any) {
      setFormError(e?.errorMessage ?? 'Failed to update docket');
    } finally {
      setSubmitting(false);
    } 
  }, [docket, props.docketStore]);

  const saveTitle = useCallback((title: string) => {
    if (!title) {
      setFormError('Cannot have an empty title');
      return;
    }
    edit({title});
  }, [edit]);

  const saveDocketNumber = useCallback((docketNumber: string) => {
    if (!docketNumber) {
      setFormError('Cannot have an empty docket number');
      return;
    }
    edit({docketNumber});
  }, [edit]);

  const saveCourtRuling = useCallback((lowerCourtRuling: string) => {
    edit({lowerCourtRuling});
  }, [edit]);

  const saveStatus = useCallback((status: string) => {
    if (!Object.keys(DocketStatus).some(key => key === status)) {
      setFormError('Invalid Status');
      return;
    }
    edit({status: status as DocketStatus});
  }, [edit]);

  const changeLowerCourtOverruled = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const lowerCourtOverruled = event.target.value === 'true' ? true : event.target.value === 'false' ? false : undefined;
    edit({lowerCourtOverruled});
  }, [edit]);

  const back = useCallback(() => {
    props.routing.goBack();
  }, [props.routing]);

  const classes = useStyles();

  return (
    <Grid container direction="column">
      <Grid item>
        <IconButton onClick={back}>
          <BackIcon color="action" />
        </IconButton>
      </Grid>
      <Grid item>
        <Typography variant="h4" component="h2">Edit Docket</Typography>
      </Grid>
      <Grid item>
        {!!docket ?
          <Grid className={classes.formContainer} container direction="row" spacing={2}>
            {!!formError ? (
              <Grid item>
                <Typography color="error">{formError}</Typography>
              </Grid>) 
              : ''
            }
            <Grid item xs={12}>
              <ViewEditInputText
                id="docket-edit-title"
                fullWidth
                required
                disabled={submitting}
                name="title"
                label="Title"
                value={docket.title}
                onSave={saveTitle}
              />
            </Grid>
            <Grid item xs={12}>
              <ViewEditInputText
                id="docket-edit-docket-number"
                fullWidth
                required
                disabled={submitting}
                name="docketNumber"
                label="Docket Number"
                value={docket.docketNumber}
                onSave={saveDocketNumber}
              />
            </Grid>
            <Grid item xs={12}>
              <ViewEditInputText
                id="docket-edit-lower-court-ruling"
                fullWidth
                required
                disabled={submitting}
                name="lowerCourt"
                label="Lower Court Ruling"
                multiline
                minRows={4}
                value={docket.lowerCourtRuling}
                onSave={saveCourtRuling}
              />
            </Grid>
            <Grid item xs={12}>
              <ViewEditInputText
                id="docket-edit-status"
                fullWidth
                required
                disabled={submitting}
                name="status"
                label="Status"
                select
                value={docket.status}
                onSave={saveStatus}
              >
                {Object.values(DocketStatus).map((status, index) => (
                  <MenuItem key={index} value={status}>{status}</MenuItem>
                ))}
              </ViewEditInputText>
            </Grid>
            <Grid item xs={12}>
              <FormControl component="fieldset">
                <FormLabel component="legend">Lower Court Overruled?</FormLabel>
                <RadioGroup row aria-label="lower court overruled" name="lowerCourtOverruled"
                  value={docket.lowerCourtOverruled}
                  onChange={changeLowerCourtOverruled}
                >
                  <FormControlLabel value={true} control={<Radio />} label="Yes" />
                  <FormControlLabel value={false} control={<Radio />} label="No" />
                </RadioGroup>
              </FormControl>
            </Grid>
          </Grid> 
        :
          <></>}
      </Grid>
    </Grid>
  );
};

export default inject('routing', 'courtStore', 'docketStore')(EditDocketPage);
