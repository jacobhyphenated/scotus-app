import { useCallback, useMemo } from 'react';
import { Theme, Typography, Button, Paper, Grid } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import { Justice } from '../../../stores/justiceStore';
import { DateTimeFormatter } from '@js-joda/core';

const useStyles = makeStyles( (theme: Theme) => ({
  justiceCard: {
    margin: theme.spacing(1),
    padding: theme.spacing(1),
    [theme.breakpoints.down('md')]: {
      width: 300,
    },
    [theme.breakpoints.up('md')]: {
      width: 450,
    },
    [theme.breakpoints.up('xl')]: {
      width: 600,
    },
  },
}));

interface Props {
  justice: Justice;
  retireCallback?: (justice: Justice) => void;
}

const JusticeCard = (props: Props) => {
  const justice = props.justice;
  const styles = useStyles();
  const formatter = useMemo(() => DateTimeFormatter.ofPattern('MM/dd/yyyy'), []);

  const retireClick = useCallback(() => {
    props.retireCallback?.(justice);
  }, [justice, props]);

  return (
    <Paper className={styles.justiceCard}  key={justice.id}>
      <Typography color="textSecondary" variant="subtitle2">
        Confirmed: {justice.dateConfirmed.format(formatter)}
      </Typography>
      <Typography variant="h6">
        {justice.name} ({justice.party})
      </Typography>
      {justice.dateRetired && (
        <Typography color="textSecondary">
          Retired: {justice.dateRetired.format(formatter)}
        </Typography>
      )}
      {!justice.dateRetired && props.retireCallback &&(
        <Grid container justifyContent="flex-end">
          <Button size="small" color="primary" onClick={retireClick}>Retire</Button>
        </Grid>
      )}
    </Paper>
  );
};

export default JusticeCard;