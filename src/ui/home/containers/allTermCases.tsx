import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Theme, TextField, InputAdornment, Paper, Grid, Typography, IconButton, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, MenuItem, Stack } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import SearchIcon from '@mui/icons-material/Search';
import BackIcon from '@mui/icons-material/ArrowBack';
import CancelIcon from '@mui/icons-material/Close';
import { Case, CaseSitting, CaseStoreContext, Term } from '../../../stores/caseStore';
import { Subject } from 'rxjs';
import { debounceTime, map } from 'rxjs/operators';
import { observer } from 'mobx-react';
import { autorun } from 'mobx';
import { CaseListItem } from '../components';
import { useNavigate, useParams } from 'react-router';
import { LocalDate } from '@js-joda/core';
import DatePicker from '../../admin/components/datePicker';
import { caseSorter, groupCasesBySitting } from '../service/allTermCaseService';

const useStyles = makeStyles((theme: Theme) => ({
  paper: {
    marginTop: theme.spacing(1),
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    padding: theme.spacing(2),
    height: `calc(100vh - ${theme.spacing(8)})`,
    overflowY: 'scroll',
  },
  search: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(3),
    marginLeft: theme.spacing(2),
    minWidth: 300,
    [theme.breakpoints.up('sm')]: {
      width: '40vw',
    },
    [theme.breakpoints.up('xl')]: {
      width: '30vw',
    },
  },
  sitting: {
    padding: theme.spacing(1),
  },
  editModalText: {
    marginTop: theme.spacing(1),
  },
  padLeft: {
    marginLeft: theme.spacing(1),
  },
  bottomMargin: {
    marginBottom: theme.spacing(2),
  },
}));

const AllTermCasesPage = () => {

  const [termCases, setTermCases] = useState<Case[]>([]);
  const [filteredCases, setFilteredCases] = useState<Case[]>([]);
  const [searchText, setSearchText] = useState('');
  const [term, setTerm] = useState<Term>();
  const [searchText$] = useState(() => new Subject<string>());

  const [editModal, setEditModal] = useState<Case>();
  const [editArgumentDate, setEditArgumentDate] = useState<LocalDate>();
  const [editArgumentSitting, setEditArgumentSitting] = useState(CaseSitting.October);
  const [disableEditSave, setDisableEditSave] = useState(false);

  const caseStore = useContext(CaseStoreContext);
  const navigate = useNavigate();

  useEffect(() => {
    const subscription = searchText$.pipe(
      debounceTime(200),
      map(search => search.length >= 3 
        ? termCases.filter(c => c.case.toLocaleLowerCase().includes(search.toLocaleLowerCase()))
        : termCases),
    ).subscribe({
      next: cases => {
        setFilteredCases(cases);
      },
    });
    return () => subscription.unsubscribe();
  }, [searchText$, termCases]);

  const { termId } = useParams<{ termId: string }>();
  const allTerms = caseStore.allTerms;

  useEffect(() => {
    autorun((reaction) => {
      if (allTerms.length > 0 && !term) {
        const selectedTerm = allTerms.find(t => t.id === Number(termId));
        if (!selectedTerm) {
          console.warn(`${termId} is not a valid term id`);
          navigate('/', { replace: true });
          return;
        }
        setTerm(selectedTerm);
        document.title = `SCOTUS App | Term ${selectedTerm.name}`;
        reaction.dispose();
      }
    });
  }, [allTerms, termId, navigate, term]);

  useEffect(() => {
    if(!!term) {
      const loadCases = async () => {
        const cases = await caseStore.getCaseByTerm(term.id);
        setTermCases(cases);
        setFilteredCases(cases);
      };
      loadCases();
    }
  }, [term, caseStore]);

  const setUpdatedSerachText = useCallback((newSearchText: string) => {
    if (newSearchText.length < 3) {
      setFilteredCases(termCases);
    }
    setSearchText(newSearchText);
    searchText$.next(newSearchText);
  }, [searchText$, termCases]);

  const updateSearchText: React.ChangeEventHandler<HTMLInputElement> = useCallback(event => {
    const newSearchText = event.target.value;
    setUpdatedSerachText(newSearchText);
  }, [setUpdatedSerachText]);

  const onCaseClick = useCallback((c: Case) => {
    navigate(`/case/${c.id}`);
  }, [navigate]);

  const onEditClick = useCallback((c: Case) => {
    setEditArgumentDate(c.argumentDate);
    setEditArgumentSitting(c.sitting ?? CaseSitting.October);
    setEditModal(c);
  }, []);

  const closeEditModal = useCallback(() => {
    setEditModal(undefined);
    setEditArgumentDate(undefined);
  }, []);

  const handleEditDateChange = useCallback((event: LocalDate | null) => {
    if (event && !(event instanceof LocalDate)){
      return;
    }
    setEditArgumentDate(event ?? undefined);
  }, []);

  const handleEditSitting = useCallback((event: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<{value: unknown}>) => {
    setEditArgumentSitting(event.target.value as CaseSitting);
  }, []);

  const saveEditDateChanges = useCallback(async () => {
    if (!editModal) {
      console.error("No case to edit");
      return;
    }
    const payload = {
      argumentDate: editArgumentDate,
      sitting: editArgumentSitting,
    };
    try {
      setDisableEditSave(true);
      const result = await caseStore.editCase(editModal.id, payload);
      const otherCases = termCases.filter(c => c.id !== editModal.id);
      const updatedCaases = [...otherCases, result];
      setTermCases(updatedCaases);
      setFilteredCases([...filteredCases.filter(c => c.id !== editModal.id), result]);
      closeEditModal();
    } catch(e) {
      console.error(e);
      console.error("Failed to save argument date");
    }
    finally {
      setDisableEditSave(false);
    }
  }, [caseStore, closeEditModal, editArgumentDate, editArgumentSitting, editModal, filteredCases, termCases]);

  const back = useCallback(() => {
    navigate('..');
  }, [navigate]);

  const clearSearch = useCallback(() => {
    setUpdatedSerachText('');
  }, [setUpdatedSerachText]);

  const mappedCases = useMemo(() => {
    return groupCasesBySitting(filteredCases);
  }, [filteredCases]);

  const undecidedCases = useMemo(() => {
    return termCases.filter(c => !c.decisionDate).length;
  }, [termCases]);

  const classes = useStyles();

  return (
    <Paper className={classes.paper}>
      <Grid container justifyContent="flex-start" alignItems="center" spacing={1}>
        <Grid>
          <IconButton onClick={back} size="large">
            <BackIcon color="action" />
          </IconButton>
        </Grid>
        <Grid>
          <Typography variant="h4">
            Cases for the {term?.name} term 
          </Typography>
        </Grid>
      </Grid>

      <TextField
        className={classes.search}
        label="Filter"
        variant="outlined"
        size="small"
        helperText={searchText.length >0 && searchText.length < 3 && 'Enter at least 3 characters'}
        onChange={updateSearchText}
        value={searchText}
        slotProps={{ input: {
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color="action" />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={clearSearch}>
                <CancelIcon color="action" />
              </IconButton>
            </InputAdornment>
          ),
        }}}
      />

      {searchText.length < 3 &&
        <Grid container className={classes.bottomMargin}>
          <Typography>
            {termCases.length} total cases.
            {undecidedCases > 0 && <>&nbsp;{undecidedCases} decisions pending.</> }
          </Typography>
        </Grid>
      }

      <Stack spacing={2}>
        {[...Object.values(CaseSitting), 'None'].filter(sitting => mappedCases.has(sitting)).map((sitting) => (
          <Paper className={classes.sitting} key={sitting}>
            {sitting !== 'None' && <Typography variant="h4">{sitting} ({mappedCases.get(sitting)?.length})</Typography> }
            {mappedCases.get(sitting)?.sort(caseSorter).map(termCase => (
              <CaseListItem key={termCase.id} onCaseClick={onCaseClick} scotusCase={termCase} caseStore={caseStore} onEditClick={onEditClick} />
            ))}
          </Paper>
        ))}
      </Stack>
      <Dialog
        open={!!editModal}
        onClose={closeEditModal}
        aria-labelledby="edit-dialog-title"
        aria-describedby="edit-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Edit Argument Date</DialogTitle>
        
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Edit Arguiment Date for {editModal?.case}
          </DialogContentText>
          <div className={classes.editModalText}>
            <DatePicker
              onChange={handleEditDateChange}
              value={editArgumentDate}
            />
            <TextField
              label="Sitting"
              className={classes.padLeft}
              value={editArgumentSitting}
              variant="outlined"
              color="secondary"
              size="small"
              select
              onChange={handleEditSitting}
            >
              {Object.values(CaseSitting).map((val, index) => (
                <MenuItem key={index} value={val}>{val}</MenuItem>
              ))}
            </TextField>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeEditModal} color="primary">
            Cancel
          </Button>
          <Button disabled={!editArgumentDate || disableEditSave} onClick={saveEditDateChanges} color="primary" autoFocus>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default observer(AllTermCasesPage);
