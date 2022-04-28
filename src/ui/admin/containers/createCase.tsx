import React, { Component } from 'react';
import { Grid, Typography, IconButton, TextField, Theme, Button, withStyles, MenuItem, FormControlLabel, Checkbox } from '@material-ui/core';
import BackIcon from '@material-ui/icons/ArrowBack';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { inject, observer } from 'mobx-react';
import { History } from 'history';
import { DocketStore, BareDocket } from '../../../stores/docketStore';
import { CaseStore, FullCase } from '../../../stores/caseStore';
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
}));

interface State {
  title: string;
  shortSummary: string;
  termId: number;
  dockets: BareDocket[];
  important: boolean;

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
    important: false,
    submitting: false,
  };

  async componentDidMount() {
    document.title = 'SCOTUS App | Admin | Create Case';
    autorun((reaction) => {
      const allTerms = this.props.caseStore.allTerms;
      if (allTerms.length > 0) {
        this.setState({ termId: allTerms[0].id});
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

  changeDockets = (_: React.ChangeEvent<{}>, value: BareDocket[]) => {
    this.setState({ dockets: value});
  };

  changeImportant = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({important: event.target.checked});
  };

  submit = async (): Promise<FullCase | null> => {
    const { title, shortSummary, termId, dockets, important } = this.state;
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
      return Promise.resolve(null);
    }

    this.setState({ submitting: true });
    try {
      return this.props.caseStore.createCase(title, shortSummary, termId, important, dockets.map(d => d.id));
    } catch (e: any) {
      console.warn(e);
      this.setState({formError: e?.message ?? 'There was a problem creating this case', submitting: false});
      return null;
    }
  };

  save = async () => {
    const newCase = await this.submit();
    if (newCase) {
      this.props.routing.push('/admin/case');
    }
  };

  saveAndEdit = async () => {
    const newCase = await this.submit();
    if (newCase) {
      this.props.routing.push(`/admin/case/edit/${newCase.id}`);
    }
  };

  render() {
    const unassignedDockets = this.props.docketStore.unassignedDockets;
    const allTerms = this.props.caseStore.allTerms;
    const { title, shortSummary, termId, dockets, submitting, formError, caseError, shortSummaryError } = this.state;

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
                  minRows={2}
                  label="Short Summary"
                  onChange={this.changeShortSummary}
                  value={shortSummary}
                  error={!!shortSummaryError}
                  helperText={shortSummaryError}
                />
              </Grid>
              { termId > 0 && 
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
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={this.state.important}
                      onChange={this.changeImportant}
                      name="caseImportant"
                      color="primary"
                    />
                  }
                  label="Important?"
                />
              </Grid>
              <Grid item>
                <Autocomplete<BareDocket, true>
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
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Button 
                      disabled={ submitting || !!caseError || !!shortSummaryError }
                      color="primary"
                      variant="contained"
                      fullWidth
                      onClick={this.save}
                    >Create</Button>
                  </Grid>
                  <Grid item xs={6}>
                    <Button 
                      disabled={ submitting || !!caseError || !!shortSummaryError }
                      color="secondary"
                      variant="contained"
                      fullWidth
                      onClick={this.saveAndEdit}
                    >Create and Edit</Button>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </form>
        </Grid>
      </Grid>
    );
  }
}

export default styleDecorator(CreateCasePage);
