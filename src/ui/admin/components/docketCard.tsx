import React, { useCallback, useState } from 'react';
import { Paper, Theme, Grid, Typography, IconButton, Button } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import ArrowRight from '@mui/icons-material/ArrowRight';
import ArrowDown from '@mui/icons-material/ArrowDropDown';
import { BareDocket, FullDocket } from '../../../stores/docketStore';
import { DateTimeFormatter } from '@js-joda/core';

const useStyles = makeStyles( (theme: Theme) => ({
  docketCard: {
    margin: theme.spacing(1),
    padding: theme.spacing(1),
    [theme.breakpoints.down('md')]: {
      maxWidth: 300,
    },
    [theme.breakpoints.up('md')]: {
      maxWidth: 350,
    },
    [theme.breakpoints.up('xl')]: {
      maxWidth: 450,
    },
  },
}));

interface Props {
  docket: BareDocket;
  onEditClick?: (docket: BareDocket) => void;
  getFullDocket?: () => Promise<FullDocket>;
  onCaseClick?: (caseId: number) => void;
}

const DocketCard = (props: Props) => {

  const [expanded, setExpanded] = useState(false);
  const [fullDocket, setFullDocket] = useState<FullDocket | null>(null);
  const [loading, setLoading] = useState(false);

  const toggleExpanded = useCallback(async () => {
    setExpanded(!expanded);
    if (!fullDocket && !loading && !!props.getFullDocket) {
      setLoading(true);
      setFullDocket(await props.getFullDocket());
      setLoading(false);
    }
  }, [expanded, fullDocket, loading, props]);

  const classes = useStyles();
  const formatter = DateTimeFormatter.ofPattern('MM/dd/yyyy');

  const editClick = useCallback(() => {
    props.onEditClick?.(props.docket);
  }, [props]);

  const caseClick = useCallback(() => {
    if (!!props.docket.caseId) {
      props.onCaseClick?.(props.docket.caseId);
    }
  }, [props]);

  return (
    <Paper className={classes.docketCard} variant="elevation">
      <Grid container direction="row" justifyContent="space-between" alignItems="center">
        <Typography color="textSecondary" variant="subtitle2">
          {props.docket.docketNumber}
        </Typography>
        <IconButton onClick={toggleExpanded} size="large">
          {expanded ? <ArrowDown /> : <ArrowRight />}
        </IconButton>
      </Grid>
      <Typography variant="h6">{props.docket.title}</Typography>
      {expanded &&
        <>
          <Grid container direction="row" justifyContent="space-between">
            <Typography color="textSecondary">
              {fullDocket ? fullDocket.lowerCourt.shortName : ''}
            </Typography>
            <Typography color="textSecondary">
              {props.docket.status}
            </Typography>
          </Grid>
          <Typography paragraph>{props.docket.lowerCourtRuling}</Typography>
          {!!fullDocket?.case && 
            <Grid container direction="row">
              {!!fullDocket?.case?.result ?
                <Typography color="textSecondary">
                  Result: {fullDocket.case.result} ({fullDocket.case.decisionDate?.format(formatter) ?? ''})
                  - {fullDocket.lowerCourtOverruled ? 'Reversed' : 'Affirmed'}
                </Typography>
                : !!fullDocket?.case?.argumentDate ?
                <Typography color="textSecondary">Argument scheduled for {fullDocket.case.argumentDate.format(formatter)}</Typography>
                :
                <Typography color="textSecondary">{fullDocket.case.status}</Typography>
              }
            </Grid>
          }
          <Grid container direction="row" justifyContent="flex-end" spacing={1}>
            {props.onEditClick &&
              <Button onClick={editClick} color="primary">Edit</Button>
            }
            {props.onCaseClick && props.docket.caseId &&
              <Button onClick={caseClick} color="secondary">View Case</Button>
            }
          </Grid>
        </>
      }
    </Paper>
  );
};

export default DocketCard;