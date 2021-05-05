import React, { useCallback, useState } from 'react';
import { Paper, makeStyles, Theme, Grid, Typography, IconButton, Button } from '@material-ui/core';
import ArrowRight from '@material-ui/icons/ArrowRight';
import ArrowDown from '@material-ui/icons/ArrowDropDown';
import { DateTimeFormatter } from '@js-joda/core';
import { Case } from '../../../stores/caseStore';

const useStyles = makeStyles( (theme: Theme) => ({
  caseCard: {
    margin: `${theme.spacing(1)}px`,
    padding: `${theme.spacing(1)}px`,
    [theme.breakpoints.down('xs')]: {
      maxWidth: 300,
    },
    [theme.breakpoints.down('sm')]: {
      maxWidth: 400,
    },
    [theme.breakpoints.up('md')]: {
      maxWidth: 450,
    },
    [theme.breakpoints.up('lg')]: {
      maxWidth: 600,
    },
  },
}));

interface Props {
  case: Case
  onEditCase?: (scotusCase: Case) => void;
}

const CaseCard = (props: Props) => {
  const [expanded, setExpanded] = useState(false);

  const toggleExpanded = useCallback(() => setExpanded(!expanded), [expanded]);

  const editButton = useCallback(() => {
    props.onEditCase!(props.case);
  }, [props.onEditCase, props.case]);

  const classes = useStyles();
  const formatter = DateTimeFormatter.ofPattern('MM/dd/yyyy');

  return (
    <Paper className={classes.caseCard}>
      <Grid container direction="row" justify="space-between" alignItems="center">
        <Typography color="textSecondary" variant="subtitle2">
          {props.case.status}{props.case.result && `: ${props.case.result}`}
        </Typography>
        <IconButton onClick={toggleExpanded}>
          {expanded ? <ArrowDown /> : <ArrowRight />}
        </IconButton>
      </Grid>
      <Typography variant="h6">{props.case.case}</Typography>
      {expanded &&
        <Grid container direction="column">
          <Typography color="textSecondary">
            {props.case.decisionDate ? `Decision date: ${props.case.decisionDate.format(formatter)}`
            :
              props.case.argumentDate && `Scheduled: ${props.case.argumentDate.format(formatter)}`
            }
          </Typography>
          <Typography paragraph>
            {props.case.decisionSummary ? props.case.decisionSummary : props.case.shortSummary}
          </Typography>
          {props.onEditCase &&
            <Grid container justify="flex-end">
              <Button color="primary" onClick={editButton}>Edit</Button>
            </Grid>
          }
        </Grid>
      }
    </Paper>
  );

};

export default CaseCard;