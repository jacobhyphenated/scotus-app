import { LocalDate } from '@js-joda/core';
import { Locale as JsJodaLocale } from "@js-joda/locale_en-us";
import createJsJodaUtils from '@prinzdezibel/date-io-js-joda';
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';

interface Props {
  disableToolbar?: boolean;
  required?: boolean;
  value?: LocalDate | null;
  onChange: (date: LocalDate | null) => void;
  label?: string
  inputVariant?: "standard" | "outlined" | "filled";
  error?: boolean;
  helperText?: string | null;
  fullWidth?: boolean;
}

const dateUtils = createJsJodaUtils(LocalDate);

const DatePicker = (props: Props) => {

  return (
    <MuiPickersUtilsProvider utils={dateUtils} locale={JsJodaLocale.US}>
      <KeyboardDatePicker
        disableToolbar={props.disableToolbar}
        autoOk
        required={props.required}
        fullWidth={props.fullWidth}
        label={props.label}
        inputVariant={props.inputVariant ?? 'standard'}
        variant="inline"
        format="MM/dd/yyyy"
        margin="normal"
        size="small"
        value={props.value}
        error={props.error}
        helperText={props.helperText}
        onChange={props.onChange}
        KeyboardButtonProps={{
          'aria-label': 'change date',
        }}
      />
    </MuiPickersUtilsProvider>
  );
};

export default DatePicker;