import { useCallback, useEffect, useState } from 'react';
import { inject, observer } from 'mobx-react';
import { History } from 'history';
import { JusticeStore, Justice } from '../../../stores/justiceStore';
import { Theme, Typography, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, Fab, Grid, FormControlLabel, makeStyles } from '@material-ui/core';
import JusticeCard from '../components/justiceCard';
import DatePicker from '../components/datePicker';
import { LocalDate } from '@js-joda/core';
import AddIcon from '@material-ui/icons/Add';
import Switch from '@material-ui/core/Switch';

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

interface Props {
  routing: History;
  justiceStore: JusticeStore;
}

const JusticePage = (props: Props) => {

  const [showAll, setShowAll] = useState(false);
  const [allJustices, setAllJustices] = useState<Justice[]>([]);
  const [retireModal, setRetireModal] = useState<Justice>();
  const [retireDate, setRetireDate] = useState<LocalDate>();

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
    await props.justiceStore.retireJustice(retireModal.id, retireDate);
    setRetireModal(undefined);
    setRetireDate(undefined);
    props.justiceStore.refreshActiveJustices();
  }, [retireModal, retireDate, props.justiceStore]);

  const closeRetireModal = useCallback(() => {
    setRetireModal(undefined);
  }, []);

  const handleRetireDateChange = useCallback((date: LocalDate | null) => {
    setRetireDate(date ?? undefined);
  }, []);

  const createJustice = useCallback(() => {
    props.routing!.push('/admin/justice/create');
  }, [props.routing]);

  const toggleShowAll = useCallback(async () => {
    const showAllCurrent = showAll;
    setShowAll(!showAllCurrent);
    if (!showAllCurrent) {
      try {
        const justices = await props.justiceStore.getAllJustices();
        setAllJustices(justices);
      } catch (e) {
        console.error(e);
      }
    }
  }, [props.justiceStore, showAll]);

  const active = props.justiceStore.activeJustices;
  const justiceList = showAll ? allJustices : active;

  const classes = useStyles();

  return (
    <>
      <Grid container direction="column" spacing={1}>
        <Grid item>
          <Typography variant="h5">{showAll ? 'All Justices' : 'Active Justices'}:</Typography>
        </Grid>
        <Grid item>
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
        </Grid>
      </Grid>
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
            disableToolbar
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

export default inject('routing', 'justiceStore')(observer(JusticePage));