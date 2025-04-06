import { LocalDate } from '@js-joda/core';
import { LocalizationProvider , DatePicker } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import moment, { Moment } from 'moment';
import { useCallback, useMemo } from 'react';

interface Props {
  required?: boolean;
  value?: LocalDate | null;
  onChange: (date: LocalDate | null) => void;
  label?: string
  error?: boolean;
  helperText?: string | null;
  fullWidth?: boolean;
  clearable?: boolean;
}

/**
 * TODO:
 * The @mui/x-date-pickers library only supports adapters for the following date types:
 *    Dayjs
 *    Moment
 *    Luxon
 *    DateFns
 * 
 * This component uses JS Joda's LocalDate, but shims in Moment as the adapter for the Date Picker.
 * Long term, we want the ability to use a JS Joda adapter directly if that is ever supported.
 * https://github.com/mui/mui-x/issues/4703
 * https://github.com/mui/mui-x/issues/6470
 * 
 * Once complete, we can remove the `moment` dependency from the project
 * 
 */

const ScotusDatePicker = (props: Props) => {

  const onChange = props.onChange;

  const onDateChange = useCallback((date: Moment | null) => {
    if (!date) {
      onChange(null);
      return;
    }
    const format = date.format('YYYY-MM-DD');
    onChange(LocalDate.parse(format));
  }, [onChange]);

  const momentDate = useMemo(() => {
    if (!props.value) {
      return null;
    }
    return moment(props.value.toString());
  }, [props.value]);

  return (
    <LocalizationProvider dateAdapter={AdapterMoment} >
      <DatePicker 
        value = {momentDate}
        onChange={onDateChange}
        label={props.label}
        slotProps={{
          textField: {
            helperText: props.helperText,
            required: props.required,
            error: props.error,
            size: 'small',
            fullWidth: props.fullWidth,
          },
          field: {
            clearable: props.clearable,
          },
        }}
      />
    </LocalizationProvider>
  );
};

export default ScotusDatePicker;