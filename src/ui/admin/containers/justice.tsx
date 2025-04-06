import { useCallback, useContext, useEffect, useState } from 'react';
import { observer } from 'mobx-react';
import { Justice, JusticeStoreContext } from '../../../stores/justiceStore';
import {
  Theme,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Fab,
  FormControlLabel,
  Stack,
} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import JusticeCard from '../components/justiceCard';
import DatePicker from '../components/datePicker';
import { LocalDate } from '@js-joda/core';
import AddIcon from '@mui/icons-material/Add';
import Switch from '@mui/material/Switch';
import { useNavigate } from 'react-router';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    padding: theme.spacing(1),
  },
  fab: {
    position: 'fixed',
    right: '42%',
    bottom: '10vh',
  },
}));

const JusticePage = () => {

  const [showAll, setShowAll] = useState(false);
  const [allJustices, setAllJustices] = useState<Justice[]>([]);
  const [retireModal, setRetireModal] = useState<Justice>();
  const [retireDate, setRetireDate] = useState<LocalDate>();

  const justiceStore = useContext(JusticeStoreContext);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'SCOTUS App | Admin | Justice';
  }, []);

  const attemptRetire = useCallback((justice: Justice) => {
    setRetireModal(justice);
    setRetireDate(LocalDate.now());
  }, []);

  const confirmRetire = useCallback(async () => {
    if (!retireModal || !retireDate){
      return;
    }
    await justiceStore.retireJustice(retireModal.id, retireDate);
    setRetireModal(undefined);
    setRetireDate(undefined);
    justiceStore.refreshActiveJustices();
  }, [retireModal, retireDate, justiceStore]);

  const closeRetireModal = useCallback(() => {
    setRetireModal(undefined);
  }, []);

  const handleRetireDateChange = useCallback((date: LocalDate | null) => {
    setRetireDate(date ?? undefined);
  }, []);

  const createJustice = useCallback(() => {
    navigate('/admin/justice/create');
  }, [navigate]);

  const toggleShowAll = useCallback(async () => {
    const showAllCurrent = showAll;
    setShowAll(!showAllCurrent);
    if (!showAllCurrent) {
      try {
        const justices = await justiceStore.getAllJustices();
        setAllJustices(justices);
      } catch (e) {
        console.error(e);
      }
    }
  }, [justiceStore, showAll]);

  const active = justiceStore.activeJustices;
  const justiceList = showAll ? allJustices : active;

  const classes = useStyles();

  return (
    <>
      <Stack alignItems="start" spacing={1}>
        <Typography variant="h5">{showAll ? 'All Justices' : 'Active Justices'}:</Typography>
        <FormControlLabel
          control={
            <Switch
              checked={showAll}
              onChange={toggleShowAll}
              color="primary"
            />
          }
          label="Show all justices"
        />
      </Stack>
      {justiceList?.map( justice => (
        <JusticeCard key={justice.id} justice={justice} retireCallback={attemptRetire}></JusticeCard>
      )) }
      
      <Fab className={classes!.fab} onClick={createJustice} color="primary" aria-label="add">
        <AddIcon />
      </Fab>

      <Dialog
        open={!!retireModal}
        onClose={closeRetireModal}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Retire Justice?"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to mark {retireModal?.name} as retired?
          </DialogContentText>
          <DatePicker
            onChange={handleRetireDateChange}
            value={retireDate}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeRetireModal} color="primary">
            Cancel
          </Button>
          <Button disabled={!retireDate} onClick={confirmRetire} color="primary" autoFocus>
            Yes, Retire This Justice
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default observer(JusticePage);
