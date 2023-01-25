import { useCallback, useContext, useEffect, useState } from 'react';
import { observer } from 'mobx-react';
import { Typography, Theme, Grid, Fab, makeStyles } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import { CaseStoreContext, Term } from '../../../stores/caseStore';
import TermCard from '../components/termCard';
import { useNavigate } from 'react-router';

const useStyles = makeStyles((theme: Theme) => ({
  formContainer: {
    marginTop: theme.spacing(2),
    [theme.breakpoints.down('sm')]: {
      maxWidth: 280,
    },
    [theme.breakpoints.up('md')]: {
      maxWidth: 400,
    },
  },
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
      <Grid container direction='column'>
        {terms.map(term => (
          <Grid item key={term.id}>
            <TermCard term={term} onClick={selectTerm} />
          </Grid>
        ))}
      </Grid>
      <Fab className={classes.fab} onClick={createTerm} color="primary" aria-label="add">
        <AddIcon />
      </Fab>
    </>
  );
};

export default observer(TermAdminPage);
