import React, { useCallback, useState, useMemo } from "react";
import {
  Typography,
  Paper,
  Button,
  TextField,
  Theme,
  MenuItem,
  FormControlLabel,
  FormControl,
  FormLabel,
  RadioGroup,
  Radio,
  Stack,
} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
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
  const { fullCase, onClose, editCase, createEditDocketOverruled } = props;
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
    return Boolean(resultStatus) && Boolean(decisionDate) && Boolean(decisionSummary);
  }, [decisionDate, decisionSummary, resultStatus]);

  const save = useCallback(async () => {
    setFormError(undefined);
    try {
      fullCase.dockets.forEach(docket => {
        // ensure all docket statuses are set to DONE
        createEditDocketOverruled(docket.docketId)(undefined);
      });
      const resultCase = await editCase(fullCase.id, {
        resultStatus: resultStatus || undefined,
        decisionDate: decisionDate ?? undefined,
        result: result || undefined,
        decisionLink,
        decisionSummary,
      });
      onClose(resultCase);
    } catch (e: any) {
      setFormError(e?.message ?? 'Failed to update case');
    }
  }, [editCase, fullCase, resultStatus, decisionDate, result, decisionLink, decisionSummary, onClose, createEditDocketOverruled]);

  const classes = useStyles();

  return (
    <Paper variant="elevation" className={classes.paper}>
      <Stack spacing={1}>
        <Typography variant="h5">Record Case Result</Typography>
        {!!formError &&
          <Typography color="error">{formError}</Typography>
        }
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
        <DatePicker
          fullWidth
          required
          clearable
          label="Decision Date"
          value={decisionDate}
          onChange={onDecisionDateChange}
        />
        <TextField
          id="case-result"
          variant="outlined"
          color="secondary"
          fullWidth
          name="result"
          label="Result"
          size="small"
          onChange={onResultChange}
          value={result}
        />
        <TextField
          id="case-result-decision-link"
          variant="outlined"
          color="secondary"
          fullWidth
          name="decision-link"
          label="Decision Link"
          size="small"
          onChange={onDecisionLinkChange}
          value={decisionLink ?? ''}
        />
        <TextField
          id="case-result-decisionSummary"
          variant="outlined"
          color="secondary"
          fullWidth
          required
          minRows={3}
          multiline
          name="decisionSummary"
          label="Decision Summary"
          onChange={onDecisionSummaryChange}
          value={decisionSummary}
        />
        {fullCase.dockets.map(docket => (
          <DocketResultForm
            key={docket.docketId}
            docket={docket}
            onSave={createEditDocketOverruled(docket.docketId)}
          />
        ))}
        <Button
          color="secondary"
          disabled={!enableSave}
          onClick={save}
        >Save</Button>
      </Stack>
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
      <Stack spacing={2}>
        {!!formError && 
          <Typography color="error">{formError}</Typography>
        } 
        <div>
          <Typography variant="subtitle1">{props.docket.title}</Typography>
          <Typography variant="subtitle2" color="textSecondary">{props.docket.docketNumber} - {props.docket.lowerCourt.shortName}</Typography>
        </div>
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
      </Stack>
    </Paper>
  );
};
