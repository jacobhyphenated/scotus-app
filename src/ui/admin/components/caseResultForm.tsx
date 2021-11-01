import React, { useCallback, useState, useMemo } from "react";
import { Typography, Paper, Grid, Button, TextField, Theme, makeStyles, MenuItem, FormControlLabel, FormControl, FormLabel, RadioGroup, Radio } from '@material-ui/core';
import { CaseDocket, CaseStatus, EditCase, FullCase } from "../../../stores/caseStore";
import { FullDocket } from "../../../stores/docketStore";
import { LocalDate } from "@js-joda/core";
import DatePicker from './datePicker';

const useStyles = makeStyles( (theme: Theme) => ({
  paper: {
    padding: theme.spacing(1),
    marginTop: theme.spacing(1),
  },
}));

interface Props {
  fullCase: FullCase;
  onClose: (c: FullCase) => void;
  editCase: (id: number, caseEdit: EditCase) => Promise<FullCase>;
  createEditDocketOverruled: (docketId: number) => (overruleLowerCourt: boolean | undefined) => Promise<FullDocket>;
}

const CaseResultForm = (props: Props) => {
  const { fullCase, onClose, editCase } = props;
  const [formError, setFormError] = useState<string>();
  const [resultStatus, setResultStatus] = useState<CaseStatus | ''>('');
  const [decisionDate, setDecisionDate] = useState<LocalDate | null>(null);
  const [result, setResult] = useState('');
  const [decisionLink, setDecisionLink] = useState<string>();
  const [decisionSummary, setDecisionSummary] = useState('');

  const onResultStatusChange = useCallback((event:  React.ChangeEvent<HTMLInputElement>) => {
    setResultStatus(event.target.value as CaseStatus);
  }, []);

  const onDecisionDateChange = useCallback((event: LocalDate | null) => {
    if (event && !(event instanceof LocalDate)){
      setDecisionDate(null);
    } else {
      setDecisionDate(event);
    }
  }, []);

  const onResultChange = useCallback((event:  React.ChangeEvent<HTMLInputElement>) => {
    setResult(event.target.value);
  }, []);

  const onDecisionLinkChange = useCallback((event:  React.ChangeEvent<HTMLInputElement>) => {
    setDecisionLink(!!event.target.value ? event.target.value : undefined);
  }, []);

  const onDecisionSummaryChange = useCallback((event:  React.ChangeEvent<HTMLInputElement>) => {
    setDecisionSummary(event.target.value);
  }, []);

  const enableSave = useMemo(() => {
    return Boolean(resultStatus) && Boolean(decisionDate) && Boolean(result) && Boolean(decisionSummary);
  }, [decisionDate, decisionSummary, result, resultStatus]);

  const save = useCallback(async () => {
    setFormError(undefined);
    try {
      const resultCase = await editCase(fullCase.id, {
        resultStatus: resultStatus || undefined,
        decisionDate: decisionDate ?? undefined,
        result,
        decisionLink,
        decisionSummary,
      });
      onClose(resultCase);
    } catch (e: any) {
      setFormError(e?.message ?? 'Failed to update case');
    }
  }, [editCase, fullCase.id, resultStatus, decisionDate, result, decisionLink, decisionSummary, onClose]);

  const classes = useStyles();

  return (
    <Paper variant="elevation" className={classes.paper}>
      <Grid container direction="column" spacing={1}>
        <Grid item>
          <Typography variant="h5">Record Case Result</Typography>
        </Grid>
        {!!formError &&
          <Grid item>
            <Typography color="error">{formError}</Typography>
          </Grid>
        }
        <Grid item>
          <TextField
            id="case-result-status"
            variant="outlined"
            color="secondary"
            fullWidth
            required
            name="result-status"
            label="Result Status"
            size="small"
            select
            onChange={onResultStatusChange}
            value={resultStatus ?? ''}
          >
            <MenuItem value="">Select a result</MenuItem>
            {Object.values(CaseStatus)
            .filter(status => ![CaseStatus.ARGUED, CaseStatus.ARGUMENT_SCHEDULED, CaseStatus.GRANTED].includes(status))
            .map((status, index) => (
              <MenuItem key={index} value={status}>{status}</MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item>
          <DatePicker
            fullWidth
            required
            label="Decision Date"
            value={decisionDate}
            onChange={onDecisionDateChange}
            inputVariant="outlined"
          />
        </Grid>
        <Grid item>
          <TextField
            id="case-result"
            variant="outlined"
            color="secondary"
            fullWidth
            required
            name="result"
            label="Result"
            size="small"
            onChange={onResultChange}
            value={result}
          />
        </Grid>
        <Grid item>
          <TextField
            id="case-result-decision-link"
            variant="outlined"
            color="secondary"
            fullWidth
            name="decision-link"
            label="Decision Link"
            size="small"
            onChange={onDecisionLinkChange}
            value={decisionLink}
          />
        </Grid>
        <Grid item>
          <TextField
            id="case-result-decisionSummary"
            variant="outlined"
            color="secondary"
            fullWidth
            required
            rows={3}
            multiline
            name="decisionSummary"
            label="Decision Summary"
            onChange={onDecisionSummaryChange}
            value={decisionSummary}
          />
        </Grid>
        {fullCase.dockets.map(docket => (
          <Grid item key={docket.docketId}>
            <DocketResultForm
              docket={docket}
              onSave={props.createEditDocketOverruled(docket.docketId)}
            />
          </Grid>
        ))}
        <Grid item>
          <Button
            color="secondary"
            disabled={!enableSave}
            onClick={save}
          >Save</Button>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default CaseResultForm;

interface DocketResultProps {
  docket: CaseDocket;
  onSave: (overruleLowerCourt: boolean | undefined) => Promise<FullDocket>;
}

const DocketResultForm = (props: DocketResultProps) => {
  const [radioValue, setRadioValue] = useState(props.docket.lowerCourtOverruled);
  const [formError, setFormError] = useState<string>();

  const changeLowerCourtOverruled = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormError(undefined);
    const lowerCourtOverruled = event.target.value === 'true' ? true : event.target.value === 'false' ? false : undefined;
    try {
      const result = await props.onSave(lowerCourtOverruled);
      setRadioValue(result.lowerCourtOverruled ?? undefined);
    } catch (e: any) {
      setFormError(e?.message ?? 'Error saving docket');
    }
  }, [props]);

  const classes = useStyles();
  return (
    <Paper className={classes.paper} variant="outlined">
      <Grid container direction="column" spacing={2}>
        {!!formError && 
          <Grid item>
            <Typography color="error">{formError}</Typography>
          </Grid>
        } 
        <Grid item>
          <Typography variant="subtitle1">{props.docket.title}</Typography>
          <Typography variant="subtitle2" color="textSecondary">{props.docket.docketNumber} - {props.docket.lowerCourt.shortName}</Typography>
        </Grid>
        <Grid item>
          <FormControl component="fieldset">
            <FormLabel component="legend">Lower Court Overruled?</FormLabel>
            <RadioGroup row aria-label="lower court overruled" name="lowerCourtOverruled"
              value={radioValue}
              onChange={changeLowerCourtOverruled}
            >
              <FormControlLabel value={true} control={<Radio />} label="Yes" />
              <FormControlLabel value={false} control={<Radio />} label="No" />
            </RadioGroup>
          </FormControl>
        </Grid>
      </Grid>
    </Paper>
  );
};
