import { useCallback, useContext, useEffect, useState } from 'react';
import { observer } from 'mobx-react';
import { Typography, Fab, Stack } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import AddIcon from '@mui/icons-material/Add';
import { CaseStoreContext, Term } from '../../../stores/caseStore';
import TermCard from '../components/termCard';
import { useNavigate } from 'react-router';

const useStyles = makeStyles(() => ({
  fab: {
    position: 'fixed',
    right: '25%',
    bottom: '10vh',
  },
}));

const TermAdminPage = () => {

  const [terms, setTerms] = useState<Term[]>([]);

  const caseStore = useContext(CaseStoreContext);
  const navigate = useNavigate();
  
  useEffect(() => {
    document.title = 'SCOTUS App | Admin | Term';
    const allTerms = caseStore.allTerms;
    if (allTerms.length > 0) {
      setTerms(allTerms);
    }
  }, [caseStore.allTerms]);

  const selectTerm = useCallback((term: Term) => {
    navigate(`/admin/term/edit/${term.id}`);
  }, [navigate]);

  const createTerm = useCallback(() => {
    navigate(`/admin/term/create`);
  }, [navigate]);

  const classes = useStyles();

  return (
    <>
      <Typography variant='h4'>Terms</Typography>
      <Stack>
        {terms.map(term => (
          <TermCard key={term.id} term={term} onClick={selectTerm} />
        ))}
      </Stack>
      <Fab className={classes.fab} onClick={createTerm} color="primary" aria-label="add">
        <AddIcon />
      </Fab>
    </>
  );
};

export default observer(TermAdminPage);
