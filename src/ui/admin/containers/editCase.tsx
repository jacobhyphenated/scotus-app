import React, { useCallback, useEffect, useState, useContext } from 'react';
import {
  Grid,
  Typography,
  IconButton,
  Theme,
  MenuItem,
  Paper,
  TextField,
  FormControlLabel,
  Checkbox,
  Button,
} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import BackIcon from '@mui/icons-material/ArrowBack';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import { observer } from 'mobx-react';
import { BareDocket, DocketStatus, DocketStoreContext } from '../../../stores/docketStore';
import { useNavigate, useParams } from 'react-router';
import ViewEditInputText from '../components/viewEditInputText';
import ViewEditDatePicker from '../components/viewEditDatePicker';
import ArgumentDateEditField from '../components/argumentDateEditField';
import { FullCase, EditCase, CaseStatus, CaseDocket, CaseSitting, CaseStoreContext } from '../../../stores/caseStore';
import { LocalDate } from '@js-joda/core';
import { Autocomplete } from '@mui/material';
import OpinionEditCard from '../components/opinionEditCard';
import OpinionCreateCard from '../components/createOpinionCard';
import { Opinion, OpinionType, CreateOpinionJustice, opinionSort, OpinionStoreContext } from '../../../stores/opinionStore';
import { JusticeStoreContext } from '../../../stores/justiceStore';
import AlternateTitleEditCard from '../components/alternateTitleEditCard';
import { whenDefined } from '../../../util/functional';
import CaseResultForm from '../components/caseResultForm';

const useStyles = makeStyles((theme: Theme) => ({
  formContainer: {
    marginTop: theme.spacing(2),
  },
  docketCard: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
  },
  border: {
    border: '1px solid rgba(0,0,0,0.12)',
    borderRadius: 4,
    marginRight: theme.spacing(1),
    marginLeft: theme.spacing(1),
  },
}));

const EditCasePage = () => {

  const [submitting, setSubmitting] = useState(false);
  const [fullCase, setFullCase] = useState<FullCase | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const justiceStore = useContext(JusticeStoreContext);
  const docketStore = useContext(DocketStoreContext);
  const opinionStore = useContext(OpinionStoreContext);
  const caseStore = useContext(CaseStoreContext);
  const navigate = useNavigate();
  
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    if (!id || isNaN(Number(id))) {
      console.warn('No case id in url params');
      navigate('/admin/case', { replace: true });
      return;
    }
    const loadCase = async () => {
      try {
        const fullCase = await caseStore.getCaseById(Number(id));
        if (!fullCase) {
          throw new Error(`No case found with id ${id}`);
        }
        document.title = `SCOTUS App | Admin | Edit Case ${fullCase.case}`;
        setFullCase(fullCase);
      } catch (e: any) {
        console.warn(e);
        navigate('/admin/case', { replace: true });
      }
    };
    loadCase();
  }, [id, caseStore, navigate]);

  const edit = useCallback(async (caseEdit: EditCase) => {
    if (!fullCase) {
      return;
    }
    setSubmitting(true);
    setFormError(null);
    try {
      const updatedCase = await caseStore.editCase(fullCase.id, caseEdit);
      setFullCase(updatedCase);
    } catch (e: any) {
      setFormError(e?.message ?? 'Failed to update case');
    } finally {
      setSubmitting(false);
    } 
  }, [fullCase, caseStore]);

  const removeArgumentDate = useCallback(async () => {
    if (!fullCase) {
      return;
    }
    setSubmitting(true);
    setFormError(null);
    try {
      const updatedCase = await caseStore.removeArgumentDate(fullCase.id);
      setFullCase(updatedCase);
    } catch (e: any) {
      setFormError(e?.message ?? 'Failed to update case');
    } finally {
      setSubmitting(false);
    } 
  }, [fullCase, caseStore]);

  const saveTitle = useCallback(async (title: string) => {
    if (!title) {
      setFormError('Cannot have an empty case title');
      return;
    }
    edit({case: title});
  }, [edit]);

  const saveShortSummary = useCallback(async (shortSummary: string) => {
    if (!shortSummary) {
      setFormError('Cannot have an empty short summary');
      return;
    }
    edit({shortSummary});
  }, [edit]);

  const saveStatus = useCallback(async (status: string) => {
    if (!status) {
      return;
    }
    if (!Object.keys(CaseStatus).some(key => key === status)) {
      setFormError('Invalid Status');
      return;
    }
    edit({resultStatus: status as CaseStatus});
  }, [edit]);

  const saveTerm = useCallback(async (termId: string) => {
    edit({termId: Number(termId)});
  }, [edit]);

  const saveImportant = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    edit({important: event.target.checked});
  }, [edit]);

  const saveArgumentDate = useCallback(async (argumentDate: LocalDate | null, sitting: CaseSitting | undefined) => {
    if (!argumentDate) {
      removeArgumentDate();
    } else {
      edit({argumentDate, sitting});
    }
  }, [edit, removeArgumentDate]);

  const saveDecisionDate = useCallback(async (date: LocalDate | null) => {
    whenDefined(date, (decisionDate) => {
      edit({decisionDate});
    });
  }, [edit]);

  const saveResult = useCallback(async (r: string) => {
    whenDefined(r, (result) => {
      edit({result});
    });
  }, [edit]);

  const saveDecisionLink = useCallback((decisionLink: string) => {
    whenDefined(decisionLink, (decisionLink) => {
      edit({decisionLink});
    });
  }, [edit]);

  const saveDecisionSummary = useCallback((summary: string) => {
    whenDefined(summary, (decisionSummary) => {
      edit({decisionSummary});
    });
  }, [edit]);

  const saveAlternateTitles = useCallback((altTitles: string[]) => {
    whenDefined(altTitles, (alternateTitles => {
      edit({ alternateTitles });
    }));
  }, [edit]);

  const onDeleteDocket = useCallback((docket: CaseDocket): () => void => {
    return async () => {
      try {
        await caseStore.removeDocket(fullCase!.id, docket.docketId);
        const updatedCase =  {
          ...fullCase!,
          dockets: fullCase!.dockets.filter(d => d.docketId !== docket.docketId),
        };
        setFullCase(updatedCase);
        setFormError(null);
      } catch (e: any) {
        setFormError(e?.message ?? 'Something went wrong removing the docket');
      }
    };
  }, [fullCase, caseStore]);

  const onClickDocket = useCallback((docket: CaseDocket): () => void => {
    return () => {
      navigate(`/admin/docket/edit/${docket.docketId}`);
    };
  }, [navigate]);

  const assignDocket = useCallback(async (_: React.ChangeEvent<{}>, value: BareDocket | null) => {
    if (!value) {
      return;
    }
    try {
      const result = await caseStore.assignDocket(fullCase!.id, value.id);
      setFullCase(result);
      setFormError(null);
    } catch (e: any) {
      setFormError(e?.message ?? 'Something went wrong assigning the docket');
    }
  }, [fullCase, caseStore]);

  const deleteOpinion = useCallback(async (opinion: Opinion) => {
    try {
      await opinionStore.deleteOpinion(opinion.id);
      caseStore.revokeCaseCache(opinion.caseId);
      setFormError(null);
      const updatedCase = {
        ...fullCase!,
        opinions: fullCase!.opinions.filter(o => o.id !== opinion.id),
      };
      setFullCase(updatedCase);
    } catch (e: any) {
      setFormError(e?.message ?? 'An error occurred deleting the opinion');
    }
  }, [fullCase, caseStore, opinionStore]);

  const editOpinionSummary = useCallback(async (opinionId: number, summary: string) => {
    try {
      const opinion = await opinionStore.editOpinionSummary(opinionId, summary);
      caseStore.revokeCaseCache(opinion.caseId);
      setFormError(null);
      const updatedCase = {
        ...fullCase!,
        opinions: fullCase!.opinions.map(o => o.id !== opinion.id ? o : opinion),
      };
      setFullCase(updatedCase);
    } catch (e: any) {
      setFormError(e?.message ?? 'An error occurred editing the opinion summary');
    }
  }, [fullCase, caseStore, opinionStore]);

  const onCreateOpinion = useCallback((opinion: Opinion) => {
    caseStore.revokeCaseCache(opinion.caseId);
    setFullCase({
      ...fullCase!,
      opinions: [...fullCase!.opinions, opinion],
    });
  }, [fullCase, caseStore]);

  const createOpinion = useCallback((caseId: number, opinionType: OpinionType, summary: string, justices: CreateOpinionJustice[]): Promise<Opinion> => {
    return opinionStore.createOpinion(caseId, opinionType, summary, justices);
  }, [opinionStore]);
  

  const back = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const newDocket = useCallback(() => {
    navigate('/admin/docket/create');
  }, [navigate]);

  const getAllJustices = useCallback(() => {
    return justiceStore.getAllJustices();
  }, [justiceStore]);

  const closeCaseResultForm = useCallback((c: FullCase) => {
    setFullCase(c);
  }, []);

  const createEditDocketOverrruled = useCallback((docketId: number) => {
    return (lowerCourtOverruled: boolean | undefined) => {
      return docketStore.editDocket(docketId, {
        lowerCourtOverruled,
        status: DocketStatus.DONE,
      });
    };
  }, [docketStore]);

  const caseResultEdit = useCallback((id: number, edit: EditCase) => {
    return caseStore.editCase(id, edit);
  }, [caseStore]);

  const classes = useStyles();

  const allTerms = caseStore.allTerms;
  const unassignedDockets = docketStore.unassignedDockets.slice();
  const activeJustices = justiceStore.activeJustices;

  const opinions = fullCase?.opinions.slice().sort(opinionSort);
  return (
    <Grid container direction="column">
      <Grid item>
        <IconButton onClick={back} size="large">
          <BackIcon color="action" />
        </IconButton>
      </Grid>
      <Grid item>
        <Typography variant="h4" component="h2">Edit Case</Typography>
      </Grid>
      {!!fullCase && 
        <Grid container className={classes.formContainer} direction="row" spacing={4}>
          <Grid item xs={12} md={6}>
            <Grid container direction="column" spacing={2}>
              {!!formError &&
                <Grid item>
                  <Typography color="error">{formError}</Typography>
                </Grid>
              }
              <Grid item xs={12}>
                <ViewEditInputText
                  id="case-edit-title"
                  fullWidth
                  required
                  disabled={submitting}
                  name="title"
                  label="Case Title"
                  value={fullCase.case}
                  onSave={saveTitle}
                />
              </Grid>
              <Grid item xs={12}>
                <AlternateTitleEditCard
                  existingTitles={fullCase.alternateTitles}
                  onSave={saveAlternateTitles}
                />
              </Grid>
              <Grid item xs={12}>
                <ViewEditInputText
                  id="case-edit-short-summary"
                  fullWidth
                  required
                  disabled={submitting}
                  name="shortSummary"
                  label="Short Summary"
                  multiline
                  minRows={2}
                  value={fullCase.shortSummary}
                  onSave={saveShortSummary}
                />
              </Grid>
              <Grid className={classes.border} item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={!!fullCase.important}
                      onChange={saveImportant}
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
                  disabled={submitting}
                  name="term"
                  label="Term"
                  select
                  value={`${fullCase.term.id}`}
                  display={fullCase.term.name}
                  onSave={saveTerm}
                >
                  {allTerms.map((term, index) => (
                    <MenuItem key={index} value={`${term.id}`}>{term.name}</MenuItem>
                  ))}
                </ViewEditInputText>
              </Grid>
              <Grid item xs={12}>
                <ArgumentDateEditField
                  fullWidth
                  disabled={submitting}
                  argumentDate={fullCase.argumentDate ?? null}
                  sitting={fullCase.sitting}
                  onSave={saveArgumentDate}
                />
              </Grid>
              { (!!fullCase.resultStatus || !!fullCase.decisionDate) ?
                <>
                <Grid item xs={12}>
                  <ViewEditInputText
                    id="case-edit-status"
                    fullWidth
                    required
                    disabled={submitting}
                    name="status"
                    label="Result Status"
                    select
                    value={fullCase.resultStatus ?? ''}
                    onSave={saveStatus}
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
                    disabled={submitting}
                    label="Decision Date"
                    value={fullCase.decisionDate ?? null}
                    onSave={saveDecisionDate}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ViewEditInputText
                    id="case-edit-result"
                    fullWidth
                    disabled={submitting}
                    name="result"
                    label="Result"
                    value={fullCase.result ?? ''}
                    onSave={saveResult}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ViewEditInputText
                    id="case-edit-decision-link"
                    fullWidth
                    disabled={submitting}
                    name="decisionLink"
                    label="Decision Link"
                    value={fullCase.decisionLink ?? ''}
                    onSave={saveDecisionLink}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ViewEditInputText
                    id="case-edit-decision-summary"
                    fullWidth
                    required
                    disabled={submitting}
                    name="decisionSummary"
                    label="Decision Summary"
                    multiline
                    minRows={3}
                    value={fullCase.decisionSummary ?? ''}
                    onSave={saveDecisionSummary}
                  />
                </Grid>
                </>
                : 
                <CaseResultForm 
                  fullCase={fullCase}
                  editCase={caseResultEdit}
                  onClose={closeCaseResultForm}
                  createEditDocketOverruled={createEditDocketOverrruled}
                />
              }
            </Grid>
          </Grid>
          <Grid item xs={12} md={6}>
            <Grid container direction="column" spacing={4}>
              <Grid item>
                <Typography variant="h5" component="h4">Dockets</Typography>
                {fullCase.dockets?.map(docket => (
                  <Paper key={docket.docketId} variant="elevation" className={classes.docketCard}>
                    <Grid container direction="row" justifyContent="space-between" alignItems="center">
                      <Grid item>
                        <Button disableRipple color="primary" onClick={onClickDocket(docket)}>
                          {docket.docketNumber} {'\u2014'} {docket.lowerCourt.shortName}
                        </Button>
                      </Grid>
                      <Grid item>
                        <IconButton onClick={onDeleteDocket(docket)} size="large"><CloseIcon /></IconButton>
                      </Grid>
                    </Grid>
                  </Paper>
                ))}
                <Grid container direction="row" alignItems="center">
                  <Grid item xs={11}>
                    <Autocomplete<BareDocket>
                      id="case-create-docket-autocomplete"
                      // Tells component to re-render when docket list changes
                      key={fullCase.dockets.map(d => d.docketId).reduce((l,r)=> l+r, 0)}
                      options={unassignedDockets}
                      // eslint-disable-next-line react/jsx-no-bind
                      getOptionLabel={(docket) => `${docket.docketNumber} \u2014 ${docket.title}`}
                      onChange={assignDocket}
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
                    <IconButton onClick={newDocket} size="large"><AddIcon /></IconButton>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item>
                <Typography variant="h5" component="h4">Opinions</Typography>
                {opinions?.map(opinion => (
                  <OpinionEditCard
                    key={opinion.id}
                    opinion={opinion}
                    onDeleteOpinion={deleteOpinion}
                    editOpinionSummary={editOpinionSummary}
                  />),
                )}
                {(fullCase && activeJustices && activeJustices.length > 0 ) && 
                  <OpinionCreateCard 
                    caseId={fullCase.id}
                    createOpinion={createOpinion}
                    onCreateOpinion={onCreateOpinion}
                    activeJustices={activeJustices}
                    getAllJustices={getAllJustices}
                  />
                }
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      }
    </Grid>
  );
};

export default observer(EditCasePage);
