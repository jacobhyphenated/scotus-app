import React, { Component } from 'react';
import { Grid, Typography, IconButton, Theme, withStyles, MenuItem, Paper, TextField, FormControlLabel, Checkbox, Button } from '@material-ui/core';
import BackIcon from '@material-ui/icons/ArrowBack';
import CloseIcon from '@material-ui/icons/Close';
import AddIcon from '@material-ui/icons/Add';
import { inject, observer } from 'mobx-react';
import { History } from 'history';
import { DocketStore, BareDocket } from '../../../stores/docketStore';
import { match } from 'react-router';
import ViewEditInputText from '../components/viewEditInputText';
import ViewEditDatePicker from '../components/viewEditDatePicker';
import ArgumentDateEditField from '../components/argumentDateEditField';
import { CaseStore, FullCase, EditCase, CaseStatus, CaseDocket, CaseSitting } from '../../../stores/caseStore';
import { LocalDate } from '@js-joda/core';
import { Autocomplete } from '@material-ui/lab';
import OpinionEditCard from '../components/opinionEditCard';
import OpinionCreateCard from '../components/createOpinionCard';
import { OpinionStore, Opinion, OpinionType, CreateOpinionJustice, opinionSort } from '../../../stores/opinionStore';
import { JusticeStore } from '../../../stores/justiceStore';
import AlternateTitleEditCard from '../components/alternateTitleEditCard';
import { whenDefined } from '../../../util/functional';

const styleDecorator = withStyles((theme: Theme) => ({
  formContainer: {
    marginTop: `${theme.spacing(2)}px`,
  },
  docketCard: {
    marginTop: `${theme.spacing(1)}px`,
    marginBottom: `${theme.spacing(1)}px`,
    paddingLeft: `${theme.spacing(1)}px`,
    paddingRight: `${theme.spacing(1)}px`,
  },
  border: {
    border: '1px solid rgba(0,0,0,0.12)',
    borderRadius: 4,
    marginRight: `${theme.spacing(1)}px`,
    marginLeft: `${theme.spacing(1)}px`,
  },
}));

interface State {
  case?: FullCase;
  formError?: string;
  submitting: boolean;
}

interface RouteParams {
  id: string;
}

interface Props {
  routing: History;
  docketStore: DocketStore;
  caseStore: CaseStore;
  opinionStore: OpinionStore;
  justiceStore: JusticeStore;
  classes: {[id: string]: string};
  match: match<RouteParams>;
}

@inject('routing', 'caseStore', 'docketStore', 'opinionStore', 'justiceStore')
@observer
class EditCasePage extends Component<Props, State> {

  state: State = {
    submitting: false,
  }

  async componentDidMount() {
    const caseId = this.props.match.params.id;
    if (!caseId || isNaN(Number(caseId))) {
      console.warn('No case id in url params');
      this.props.routing.push('/admin/case');
      return;
    }
    try {
      const fullCase = await this.props.caseStore.getCaseById(Number(caseId));
      if (!fullCase) {
        throw new Error(`No case found with id ${caseId}`);
      }
      document.title = `SCOTUS App | Admin | Edit Case ${fullCase.case}`;
      this.setState({ case: fullCase });
    } catch (e) {
      console.warn(e);
      this.props.routing.push('/admin/case');
    }
  }

  edit = async (caseEdit: EditCase) => {
    if (!this.state.case) {
      return;
    }
    this.setState({ submitting: true, formError: undefined });
    try {
      const fullCase = await this.props.caseStore.editCase(this.state.case!.id, caseEdit);
      this.setState({ case: fullCase });
    } catch (e) {
      this.setState({ formError: e?.message ?? 'Failed to update case'});
    } finally {
      this.setState({ submitting: false});
    } 
  }

  removeArgumentDate = async () => {
    if (!this.state.case) {
      return;
    }
    this.setState({ submitting: true, formError: undefined });
    try {
      const fullCase = await this.props.caseStore.removeArgumentDate(this.state.case.id);
      this.setState({ case: fullCase });
    } catch (e) {
      this.setState({ formError: e?.message ?? 'Failed to update case'});
    } finally {
      this.setState({ submitting: false});
    } 
  }

  saveTitle = async (title: string) => {
    if (!title) {
      this.setState({formError: 'Cannot have an empty case title'});
      return;
    }
    this.edit({case: title});
  }

  saveShortSummary = async (shortSummary: string) => {
    if (!shortSummary) {
      this.setState({formError: 'Cannot have an empty short summary'});
      return;
    }
    this.edit({shortSummary});
  }

  saveStatus = async (status: string) => {
    if (!status) {
      return;
    }
    if (!Object.keys(CaseStatus).some(key => key === status)) {
      this.setState({formError: 'Invalid Status'});
      return;
    }
    this.edit({resultStatus: status as CaseStatus});
  }

  saveTerm = async (termId: string) => {
    this.edit({termId: Number(termId)});
  };

  saveImportant = async (event: React.ChangeEvent<HTMLInputElement>) => {
    this.edit({important: event.target.checked});
  };

  saveArgumentDate = async (argumentDate: LocalDate | null, sitting: CaseSitting | undefined) => {
    if (!argumentDate) {
      this.removeArgumentDate();
    } else {
      this.edit({argumentDate, sitting});
    }
  };

  saveDecisionDate = async (date: LocalDate | null) => {
    whenDefined(date, (decisionDate) => {
      this.edit({decisionDate});
    });
  };

  saveResult = async (r: string) => {
    whenDefined(r, (result) => {
      this.edit({result});
    });
  }

  saveDecisionLink = (decisionLink: string) => {
    whenDefined(decisionLink, (decisionLink) => {
      this.edit({decisionLink});
    });
  }

  saveDecisionSummary = (summary: string) => {
    whenDefined(summary, (decisionSummary) => {
      this.edit({decisionSummary});
    });
  }

  saveAlternateTitles = (altTitles: string[]) => {
    whenDefined(altTitles, (alternateTitles => {
      this.edit({ alternateTitles });
    }));
  }

  onDeleteDocket = (docket: CaseDocket): () => void => {
    return async () => {
      try {
        await this.props.caseStore.removeDocket(this.state.case!.id, docket.docketId);
        const updatedCase =  {
          ...this.state.case!,
          dockets: this.state.case!.dockets.filter(d => d.docketId !== docket.docketId),
        };
        this.setState({case: updatedCase, formError: undefined});
      } catch (e) {
        this.setState({formError: e?.message ?? 'Something went wrong removing the docket'});
      }
    };
  };

  onClickDocket = (docket: CaseDocket): () => void => {
    return () => {
      this.props.routing.push(`/admin/docket/edit/${docket.docketId}`);
    };
  };

  assignDocket = async (_: React.ChangeEvent<{}>, value: BareDocket | null) => {
    if (!value) {
      return;
    }
    try {
      const result = await this.props.caseStore.assignDocket(this.state.case!.id, value.id);
      this.setState({case: result, formError: undefined});
    } catch (e) {
      this.setState({formError: e?.message ?? 'Something went wrong assigning the docket'});
    }
  }

  deleteOpinion = async (opinion: Opinion) => {
    try {
      await this.props.opinionStore.deleteOpinion(opinion.id);
      this.props.caseStore.revokeCaseCache(opinion.caseId);
      this.setState({formError: undefined, case: {
        ...this.state.case!,
        opinions: this.state.case!.opinions.filter(o => o.id !== opinion.id),
      }});
    } catch (e) {
      this.setState({formError: e?.message ?? 'An error occurred deleting the opinion'});
    }
  };

  editOpinionSummary = async (opinionId: number, summary: string) => {
    try {
      const opinion = await this.props.opinionStore.editOpinionSummary(opinionId, summary);
      this.props.caseStore.revokeCaseCache(opinion.caseId);
      this.setState({formError: undefined, case: {
        ...this.state.case!,
        opinions: this.state.case!.opinions.map(o => o.id !== opinion.id ? o : opinion),
      }});
    } catch (e) {
      this.setState({formError: e?.message ?? 'An error occurred editing the opinion summary'});
    }
  }

  onCreateOpinion = (opinion: Opinion) => {
    this.props.caseStore.revokeCaseCache(opinion.caseId);
    this.setState({case: {
      ...this.state.case!,
      opinions: [...this.state.case!.opinions, opinion],
    }});
  }

  createOpinion = (caseId: number, opinionType: OpinionType, summary: string, justices: CreateOpinionJustice[]): Promise<Opinion> => {
    return this.props.opinionStore.createOpinion(caseId, opinionType, summary, justices);
  }
  

  back = () => {
    this.props.routing.goBack();
  };

  newDocket = () => {
    this.props.routing.push('/admin/docket/create');
  }

  getAllJustices = () => {
    return this.props.justiceStore.getAllJustices();
  }

  render() {
    const allTerms = this.props.caseStore.allTerms;
    const unassignedDockets = this.props.docketStore.unassignedDockets.slice();
    const activeJustices = this.props.justiceStore.activeJustices;

    const opinions = this.state.case?.opinions.slice().sort(opinionSort);
    return (
      <Grid container direction="column">
        <Grid item>
          <IconButton onClick={this.back}>
            <BackIcon color="action" />
          </IconButton>
        </Grid>
        <Grid item>
          <Typography variant="h4" component="h2">Edit Case</Typography>
        </Grid>
        {!!this.state.case && 
          <Grid container className={this.props.classes.formContainer} direction="row" spacing={4}>
            <Grid item xs={12} md={6}>
              <Grid container direction="column" spacing={2}>
                {!!this.state.formError &&
                  <Grid item>
                    <Typography color="error">{this.state.formError}</Typography>
                  </Grid>
                }
                <Grid item xs={12}>
                  <ViewEditInputText
                    id="case-edit-title"
                    fullWidth
                    required
                    disabled={this.state.submitting}
                    name="title"
                    label="Case Title"
                    value={this.state.case.case}
                    onSave={this.saveTitle}
                  />
                </Grid>
                <Grid item xs={12}>
                  <AlternateTitleEditCard
                    existingTitles={this.state.case.alternateTitles}
                    onSave={this.saveAlternateTitles}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ViewEditInputText
                    id="case-edit-short-summary"
                    fullWidth
                    required
                    disabled={this.state.submitting}
                    name="shortSummary"
                    label="Short Summary"
                    multiline
                    rows={2}
                    value={this.state.case.shortSummary}
                    onSave={this.saveShortSummary}
                  />
                </Grid>
                <Grid className={this.props.classes.border} item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={!!this.state.case.important}
                        onChange={this.saveImportant}
                        name="caseImportant"
                        color="primary"
                      />
                    }
                    label="Important?"
                  />
                </Grid>
                <Grid item xs={12}>
                  <ViewEditInputText
                    id="case-edit-term"
                    fullWidth
                    required
                    disabled={this.state.submitting}
                    name="term"
                    label="Term"
                    select
                    value={`${this.state.case.term.id}`}
                    display={this.state.case.term.name}
                    onSave={this.saveTerm}
                  >
                    {allTerms.map((term, index) => (
                      <MenuItem key={index} value={`${term.id}`}>{term.name}</MenuItem>
                    ))}
                  </ViewEditInputText>
                </Grid>
                <Grid item xs={12}>
                  <ArgumentDateEditField
                    fullWidth
                    disabled={this.state.submitting}
                    argumentDate={this.state.case.argumentDate ?? null}
                    sitting={this.state.case.sitting}
                    onSave={this.saveArgumentDate}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ViewEditInputText
                    id="case-edit-status"
                    fullWidth
                    required
                    disabled={this.state.submitting}
                    name="status"
                    label="Result Status"
                    select
                    value={this.state.case.resultStatus ?? ''}
                    onSave={this.saveStatus}
                  >
                    <MenuItem value="">Select a result</MenuItem>
                    {Object.values(CaseStatus)
                    .filter(status => ![CaseStatus.ARGUED, CaseStatus.ARGUMENT_SCHEDULED, CaseStatus.GRANTED].includes(status))
                    .map((status, index) => (
                      <MenuItem key={index} value={status}>{status}</MenuItem>
                    ))}
                  </ViewEditInputText>
                </Grid>
                <Grid item xs={12}>
                  <ViewEditDatePicker
                    fullWidth
                    required
                    disabled={this.state.submitting}
                    label="Decision Date"
                    value={this.state.case.decisionDate ?? null}
                    onSave={this.saveDecisionDate}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ViewEditInputText
                    id="case-edit-result"
                    fullWidth
                    disabled={this.state.submitting}
                    name="result"
                    label="Result"
                    value={this.state.case.result ?? ''}
                    onSave={this.saveResult}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ViewEditInputText
                    id="case-edit-decision-link"
                    fullWidth
                    disabled={this.state.submitting}
                    name="decisionLink"
                    label="Decision Link"
                    value={this.state.case.decisionLink ?? ''}
                    onSave={this.saveDecisionLink}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ViewEditInputText
                    id="case-edit-decision-summary"
                    fullWidth
                    required
                    disabled={this.state.submitting}
                    name="decisionSummary"
                    label="Decision Summary"
                    multiline
                    rows={3}
                    value={this.state.case.decisionSummary ?? ''}
                    onSave={this.saveDecisionSummary}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12} md={6}>
              <Grid container direction="column" spacing={4}>
                <Grid item>
                  <Typography variant="h5" component="h4">Dockets</Typography>
                  {this.state.case.dockets?.map(docket => (
                    <Paper key={docket.docketId} variant="elevation" className={this.props.classes.docketCard}>
                      <Grid container direction="row" justifyContent="space-between" alignItems="center">
                        <Grid item>
                          <Button disableRipple color="primary" onClick={this.onClickDocket(docket)}>
                            {docket.docketNumber} {'\u2014'} {docket.lowerCourt.shortName}
                          </Button>
                        </Grid>
                        <Grid item>
                          <IconButton onClick={this.onDeleteDocket(docket)}><CloseIcon /></IconButton>
                        </Grid>
                      </Grid>
                    </Paper>
                  ))}
                  <Grid container direction="row" alignItems="center">
                    <Grid item xs={11}>
                      <Autocomplete<BareDocket>
                        id="case-create-docket-autocomplete"
                        // Tells component to re-render when docket list changes
                        key={this.state.case.dockets.map(d => d.docketId).reduce((l,r)=> l+r, 0)}
                        options={unassignedDockets}
                        // eslint-disable-next-line react/jsx-no-bind
                        getOptionLabel={(docket) => `${docket.docketNumber} \u2014 ${docket.title}`}
                        onChange={this.assignDocket}
                        filterSelectedOptions
                        selectOnFocus
                        clearOnEscape
                        // eslint-disable-next-line react/jsx-no-bind
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            size="small"
                            variant="outlined"
                            label="Assign Docket"
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={1}>
                      <IconButton onClick={this.newDocket}><AddIcon /></IconButton>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item>
                  <Typography variant="h5" component="h4">Opinions</Typography>
                  {opinions?.map(opinion => (
                    <OpinionEditCard
                      key={opinion.id}
                      opinion={opinion}
                      onDeleteOpinion={this.deleteOpinion}
                      editOpinionSummary={this.editOpinionSummary}
                    />),
                  )}
                  {(this.state.case && activeJustices && activeJustices.length > 0 ) && 
                    <OpinionCreateCard 
                      caseId={this.state.case.id}
                      createOpinion={this.createOpinion}
                      onCreateOpinion={this.onCreateOpinion}
                      activeJustices={activeJustices}
                      getAllJustices={this.getAllJustices}
                    />
                  }
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        }
      </Grid>
    );
  }
}

export default styleDecorator(EditCasePage);
