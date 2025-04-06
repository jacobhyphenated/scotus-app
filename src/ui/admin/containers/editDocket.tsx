import React, { useCallback, useContext, useEffect, useState } from 'react';
import {
  Typography,
  IconButton,
  Theme,
  MenuItem,
  FormControlLabel,
  FormControl,
  FormLabel,
  RadioGroup,
  Radio,
  Stack,
} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import BackIcon from '@mui/icons-material/ArrowBack';
import { DocketStatus, FullDocket, DocketEdit, DocketStoreContext } from '../../../stores/docketStore';
import { useNavigate, useParams } from 'react-router';
import ViewEditInputText from '../components/viewEditInputText';

const useStyles = makeStyles((theme: Theme) => ({
  formContainer: {
    marginTop: theme.spacing(2),
    [theme.breakpoints.down('md')]: {
      width: 320,
    },
    [theme.breakpoints.up('md')]: {
      width: 450,
    },
  },
}));

const EditDocketPage = () => {

  const [submitting, setSubmitting] = useState(false);
  const [docket, setDocket] = useState<FullDocket | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const docketStore = useContext(DocketStoreContext);
  const navigate = useNavigate();

  const { id } = useParams<{ id: string }>();
  
  useEffect(() => {
    const docketId = id;
    if (!docketId || isNaN(Number(docketId))) {
      console.warn('No docket id in url params');
      navigate('/admin/docket', { replace: true });
      return;
    }
    const loadDocket = async () => {
      try {
        const docket = await docketStore.getDocketById(Number(docketId));
        if (!docket) {
          throw new Error(`No docket found with id ${docketId}`);
        }
        document.title = `SCOTUS App | Admin | Edit Docket ${docket.docketNumber}`;
        setDocket(docket);
      } catch (e: any) {
        console.warn(e);
        navigate('/admin/docket', { replace: true });
      }
    };
    loadDocket();
  }, [id, docketStore, navigate]);

  const edit = useCallback(async (docketEdit: DocketEdit) => {
    if (!docket) {
      return;
    }
    setSubmitting(true);
    setFormError(null);
    try {
      const updatedDocket = await docketStore.editDocket(docket.id, docketEdit);
      setDocket(updatedDocket);
    } catch (e: any) {
      setFormError(e?.errorMessage ?? 'Failed to update docket');
    } finally {
      setSubmitting(false);
    } 
  }, [docket, docketStore]);

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
    navigate(-1);
  }, [navigate]);

  const classes = useStyles();

  return (
    <Stack alignItems="start">
      <IconButton onClick={back} size="large">
        <BackIcon color="action" />
      </IconButton>
      <Typography variant="h4" component="h2">Edit Docket</Typography>
      {!!docket &&
        <Stack className={classes.formContainer} spacing={2}>
          {!!formError &&
            <Typography color="error">{formError}</Typography>
          }

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
        </Stack> 
      }
    </Stack>
  );
};

export default EditDocketPage;
