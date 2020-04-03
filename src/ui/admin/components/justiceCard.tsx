import React from 'react';
import { Theme, Card, CardContent, Typography, CardActions, Button, makeStyles } from '@material-ui/core';
import { Justice } from '../../../stores/justiceStore';
import { DateTimeFormatter } from '@js-joda/core';

const useStyles = makeStyles( (theme: Theme) => ({
  justiceCard: {
    margin: `${theme.spacing(1)}px`,
    [theme.breakpoints.down('sm')]: {
      maxWidth: 300,
    },
    [theme.breakpoints.up('md')]: {
      maxWidth: 450,
    },
    [theme.breakpoints.up('xl')]: {
      maxWidth: 600,
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
  const formatter = DateTimeFormatter.ofPattern('MM/dd/yyyy');

  const cb = props.retireCallback ? () => { props.retireCallback!(justice) } : null;
  return (
    <Card className={styles.justiceCard}  key={justice.id}>
      <CardContent>
        <Typography color="textSecondary" gutterBottom>
          Confirmed: {justice.dateConfirmed.format(formatter)}
        </Typography>
        <Typography variant="h6">
          {justice.name}
        </Typography>
        {justice.dateRetired && (
          <Typography color="textSecondary">
            Retired: {justice.dateRetired.format(formatter)}
          </Typography>
        )}
      </CardContent>
      {!justice.dateRetired && cb &&(
        <CardActions>
          <Button size="small" color="primary" onClick={cb}>Retire</Button>
        </CardActions>
      )}
    </Card>
  )
}

export default JusticeCard;