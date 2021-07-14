import React, { useCallback } from 'react';
import { makeStyles } from '@material-ui/styles';
import { Theme, Paper, Grid, Typography } from '@material-ui/core';
import { Case, CaseStatus } from '../../../stores/caseStore';
import { DateTimeFormatter } from '@js-joda/core';
import { Locale as JsJodaLocale } from "@js-joda/locale_en-us";

const useStyles = makeStyles( (theme: Theme) => ({
  paper: {
    margin: `${theme.spacing(1)}px`,
    padding: `${theme.spacing(1)}px`,
    cursor: 'pointer',
  },
}));

interface Props {
  case: Case
  onClick?: (scotusCase: Case) => void;
}

const CasePreviewCard = (props: Props) => {
  const classes = useStyles();
  const formatter = DateTimeFormatter.ofPattern('MMMM').withLocale(JsJodaLocale.US);

  const click = useCallback(() => {
    props.onClick?.(props.case);
  }, [props]);

  return (
    <Paper onClick={click} className={classes.paper}>
      <Grid container direction="column">
        <Grid container direction="row" justifyContent="space-between">
          <Typography color="textSecondary" variant="subtitle2">
            {props.case.status === CaseStatus.ARGUED && !!props.case.argumentDate ? 
              `${props.case.status} (${props.case.argumentDate.format(formatter)})`
            : props.case.status}{props.case.result && `: ${props.case.result}` }
          </Typography>
          <Typography color="textSecondary" variant="subtitle1" title="term">
            {props.case.term.name}
          </Typography>
        </Grid>
        <Typography variant="h6">
          {props.case.case}
        </Typography>
        <Typography paragraph>
          {props.case.decisionSummary ? props.case.decisionSummary : props.case.shortSummary}
        </Typography>
      </Grid>
    </Paper>
  );
};

export default CasePreviewCard;