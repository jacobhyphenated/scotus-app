import React, { Component } from 'react';
import { Grid, Typography, IconButton, TextField, Theme, Button, withStyles, MenuItem } from '@material-ui/core';
import BackIcon from '@material-ui/icons/ArrowBack';
import Autocomplete, { AutocompleteChangeReason, AutocompleteChangeDetails } from '@material-ui/lab/Autocomplete';
import { inject, observer } from 'mobx-react';
import { History } from 'history';
import { DocketStore, BareDocket } from '../../../stores/docketStore';
import { CaseStore, CaseStatus } from '../../../stores/caseStore';
import { autorun } from 'mobx';

const styleDecorator = withStyles((theme: Theme) => ({
  formContainer: {
    'margin-top': `${theme.spacing(2)}px`,
    [theme.breakpoints.down('sm')]: {
      maxWidth: 320,
    },
    [theme.breakpoints.up('md')]: {
      maxWidth: 450,
    },
  },
  chips: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  chip: {
    margin: 2,
  },
}));

interface State {
  title: string;
  shortSummary: string;
  termId: number;
  status: CaseStatus;
  dockets: BareDocket[];

  formError?: string;
  caseError?: string;
  shortSummaryError?: string;

  submitting: boolean;
}

interface Props {
  routing: History;
  docketStore: DocketStore;
  caseStore: CaseStore;
  classes: {[id: string]: string};
}

@inject('routing', 'caseStore', 'docketStore')
@observer
class CreateCasePage extends Component<Props, State> {

  state: State = {
    title: '',
    shortSummary: '',
    termId: 0,
    dockets: [],
    status: CaseStatus.GRANTED,
    submitting: false,
  }

  async componentDidMount() {
    autorun((reaction) => {
      if (this.props.caseStore.allTerms.length > 0) {
        this.setState({ termId: this.props.caseStore.allTerms[0].id});
        reaction.dispose();
      }
    });
  }

  back = () => {
    this.props.routing.goBack();
  };

  changeTitle = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ title: event.target.value, caseError: undefined });
  };

  changeShortSummary = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ shortSummary: event.target.value, shortSummaryError: undefined });
  };

  changeTermId = (event: React.ChangeEvent<{value: unknown}>) => {
    this.setState({ termId: event.target.value as number });
  };

  changeStatus = (event: React.ChangeEvent<{value: unknown}>) => {
    this.setState({ status: event.target.value as CaseStatus });
  };

  changeDockets = (event: React.ChangeEvent<{}>, value: BareDocket[], reason: AutocompleteChangeReason, details?: AutocompleteChangeDetails<BareDocket> | undefined) => {
    this.setState({ dockets: value});
  }

  submit = async () => {
    const { title, shortSummary, termId, status, dockets } = this.state;
    let valid = true;
    if (!title) {
      this.setState({ caseError: 'Case Title is required' });
      valid = false;
    }
    if (!shortSummary) {
      this.setState({ shortSummaryError: 'Short Summary is required' });
      valid = false;
    }

    if(!valid) {
      return;
    }

    this.setState({ submitting: true });
    try {
      await this.props.caseStore.createCase(title, shortSummary, status, termId, dockets.map(d => d.id));
      this.props.routing.push('/admin/cases');
    } catch (e) {
      console.log(e);
      this.setState({formError: e?.message ?? 'There was a problem creating this case'});
    } finally {
      this.setState({ submitting: false });
    }

  };

  render() {
    const unassignedDockets = this.props.docketStore.unassignedDockets;
    const allTerms = this.props.caseStore.allTerms;
    const { title, shortSummary, termId, dockets, status, submitting, formError, caseError, shortSummaryError } = this.state;

    return (
      <Grid container direction="column">
        <Grid item>
          <IconButton onClick={this.back}>
            <BackIcon color="action" />
          </IconButton>
        </Grid>
        <Grid item>
          <Typography variant="h4" component="h2">Create Case</Typography>
        </Grid>
        <Grid item>
          <form className={this.props.classes.formContainer} onSubmit={this.submit}>
            <Grid container direction="column" spacing={2}>
              {!!formError ? (
                <Grid item>
                  <Typography color="error">{formError}</Typography>
                </Grid>) 
                : ''
              }
              <Grid item>
                <TextField
                  id="create-case-title"
                  name="title"
                  size="small"
                  color="primary"
                  variant="outlined"
                  fullWidth
                  required
                  label="Title"
                  onChange={this.changeTitle}
                  value={title}
                  error={!!caseError}
                  helperText={caseError}
                />
              </Grid>
              <Grid item>
                <TextField
                  id="create-case-short-summary"
                  name="shortSummary"
                  size="small"
                  color="primary"
                  variant="outlined"
                  fullWidth
                  required
                  multiline
                  rows={2}
                  label="Short Summary"
                  onChange={this.changeShortSummary}
                  value={shortSummary}
                  error={!!shortSummaryError}
                  helperText={shortSummaryError}
                />
              </Grid>
              { allTerms && 
                <Grid item>
                  <TextField
                    id="create-case-term-select"
                    label="Term"
                    size="small"
                    color="primary"
                    variant="outlined"
                    required
                    fullWidth
                    select
                    value={termId}
                    onChange={this.changeTermId}
                  >
                    {allTerms.map(term => (
                      <MenuItem key={term.id} value={term.id}>{term.name}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
              }
              <Grid item>
                <TextField
                  id="create-case-status-select"
                  label="Status"
                  size="small"
                  color="primary"
                  variant="outlined"
                  required
                  fullWidth
                  select
                  value={status}
                  onChange={this.changeStatus}
                >
                  {Object.keys(CaseStatus).map(status => (
                    <MenuItem key={status} value={status}>{status}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item>
                <Autocomplete<BareDocket>
                  multiple
                  id="case-create-docket-autocomplete"
                  options={unassignedDockets}
                  // eslint-disable-next-line react/jsx-no-bind
                  getOptionLabel={(docket) => docket.title}
                  onChange={this.changeDockets}
                  value={dockets}
                  filterSelectedOptions
                  // eslint-disable-next-line react/jsx-no-bind
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="outlined"
                      label="Linked Dockets"
                    />
                  )}
                />
              </Grid>
              <Grid item>
                <Button 
                  disabled={ submitting || !!caseError || !!shortSummaryError }
                  color="primary"
                  variant="contained"
                  fullWidth
                  onClick={this.submit}
                >Create</Button>
              </Grid>
            </Grid>
          </form>
        </Grid>
      </Grid>
    );
  }
}

export default styleDecorator(CreateCasePage);
