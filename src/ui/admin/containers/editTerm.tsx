import { useCallback, useContext, useEffect, useState } from 'react';
import { Grid, Typography, IconButton, Theme, FormControlLabel, FormControl, FormLabel, RadioGroup, Radio, makeStyles } from '@material-ui/core';
import BackIcon from '@material-ui/icons/ArrowBack';
import { observer } from 'mobx-react';
import { useNavigate, useParams } from 'react-router';
import ViewEditInputText from '../components/viewEditInputText';
import { CaseStoreContext, EditTermProps, Term } from '../../../stores/caseStore';
import { autorun } from 'mobx';

const useStyles = makeStyles((theme: Theme) => ({
  formContainer: {
    marginTop: theme.spacing(2),
    [theme.breakpoints.down('sm')]: {
      maxWidth: 320,
    },
    [theme.breakpoints.up('md')]: {
      maxWidth: 500,
    },
  },
  helperText: {
    fontSize: '.9rem',
    paddingLeft: theme.spacing(1),
  },
}));

const EditTermPage = () => {
  const [submitting, setSubmitting] = useState(false);
  const [term, setTerm] = useState<Term | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const caseStore = useContext(CaseStoreContext);
  const navigate = useNavigate();

  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    const termId = id;
    if (!termId || isNaN(Number(termId))) {
      console.warn('No term id in url params');
      navigate('/admin/term', { replace: true });
      return;
    }
    autorun((reaction) => {
      const allTerms = caseStore.allTerms;
      if (allTerms.length > 0) {
        reaction.dispose();
        const selectedTerm = allTerms.find(t => t.id === Number(termId));
        if (!selectedTerm) {
          console.warn(`No term found with id of ${termId}`);
          navigate('/admin/term', { replace: true });
        } else {
          document.title = `SCOTUS App | Admin | Edit Term ${selectedTerm.name}`;
          setTerm(selectedTerm);
        }
      }
    });
  }, [caseStore.allTerms, navigate, id]);

  const back = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const edit = useCallback(async (termEdit: EditTermProps) => {
    if (!term) {
      return;
    }
    setSubmitting(true);
    setFormError(null);
    try {
      const updatedTerm = await caseStore.editTerm(term.id, termEdit);
      setTerm(updatedTerm);
    } catch (e: any) {
      setFormError(e?.errorMessage ?? 'Failed to update term');
    } finally {
      setSubmitting(false);
    } 
  }, [caseStore, term]);

  const saveName = useCallback((name: string) => {
    if (!name) {
      setFormError('Name is required');
      return;
    }
    edit({ name });
  }, [edit]);

  const saveOtName = useCallback((otName: string) => {
    if (!otName) {
      setFormError('OT Name is required');
      return;
    }
    edit({ otName });
  }, [edit]);

  const changeInactive = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const inactive = event.target.value === 'true' ? true : false;
    edit({inactive});
  }, [edit]);

  const classes = useStyles();

  return (
    <>
      <Grid container direction="column">
        <Grid item>
          <IconButton onClick={back}>
            <BackIcon color="action" />
          </IconButton>
        </Grid>
        <Grid item>
          <Typography variant="h4" component="h2">Edit Docket</Typography>
        </Grid>
        <Grid item>
          {term &&
            <Grid className={classes.formContainer} container direction="row" spacing={2}>
              {!!formError && (
                <Grid item>
                  <Typography color="error">{formError}</Typography>
                </Grid>)
              }
              <Grid item xs={12}>
                <ViewEditInputText
                  id="term-edit-name"
                  fullWidth
                  required
                  disabled={submitting}
                  name="name"
                  label="Name"
                  value={term.name}
                  onSave={saveName}
                />
              </Grid>
              <Grid item xs={12}>
                <ViewEditInputText
                  id="term-edit-otname"
                  fullWidth
                  required
                  disabled={submitting}
                  name="otName"
                  label="OT Name"
                  value={term.otName}
                  onSave={saveOtName}
                />
                <Typography className={classes.helperText} variant="subtitle1" color="textSecondary">
                  October term notation
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <FormControl component="fieldset">
                  <FormLabel component="legend">Inactive</FormLabel>
                  <RadioGroup row aria-label="inactive" name="inactive"
                    value={term.inactive}
                    onChange={changeInactive}
                  >
                    <FormControlLabel value={true} control={<Radio />} label="Inactive" />
                    <FormControlLabel value={false} control={<Radio />} label="Active" />
                  </RadioGroup>
                </FormControl>
                <Typography className={classes.helperText} variant="subtitle1" color="textSecondary">
                  Inactive terms do not appear in the home screen drop down menu
                </Typography>
              </Grid>
            </Grid>
          }
        </Grid>
      </Grid>
    </>
  );
};

export default observer(EditTermPage);