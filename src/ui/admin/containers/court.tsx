import { useCallback, useContext, useEffect } from 'react';
import { observer } from 'mobx-react';
import { Typography, Paper, Theme, Grid2 as Grid, Fab } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import AddIcon from '@mui/icons-material/Add';
import { CourtStoreContext } from '../../../stores/courtStore';
import { useNavigate } from 'react-router';

const useStyles = makeStyles((theme: Theme) => ({
  courtCard: {
    margin: theme.spacing(1),
    padding: theme.spacing(1),
    [theme.breakpoints.down('md')]: {
      maxWidth: 250,
    },
    [theme.breakpoints.up('md')]: {
      maxWidth: 300,
    },
    [theme.breakpoints.up('xl')]: {
      maxWidth: 450,
    },
  },
  fab: {
    position: 'fixed',
    right: '25%',
    bottom: '10vh',
  },
}));

const CourtPage = () => {

  const courtStore = useContext(CourtStoreContext);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'SCOTUS App | Admin | Court';
  }, []);   

  const createCourt = useCallback(() => {
    navigate('/admin/court/create');
  }, [navigate]);

  const courts = courtStore.allCourts;
  const classes = useStyles();
  
  return (
    <>
      <Typography variant="h5">Appeals Courts:</Typography>
      <Grid container>
        {courts.map(court => (
          <Grid key={court.id} size={{ xs: 12, md: 6, lg: 4, xl: 3 }}>
            <Paper className={classes.courtCard} variant="elevation">
              <Typography variant="subtitle2" color="textSecondary">{court.shortName}</Typography>
              <Typography>{court.name}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
      <Fab className={classes.fab} onClick={createCourt} color="primary" aria-label="add">
        <AddIcon />
      </Fab>
    </>
  );
};

export default observer(CourtPage);
