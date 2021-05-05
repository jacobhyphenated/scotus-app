import { Component } from 'react';
import { Grid, Typography, IconButton, Theme, withStyles, FormControlLabel, FormControl, FormLabel, RadioGroup, Radio, WithStyles, createStyles } from '@material-ui/core';
import BackIcon from '@material-ui/icons/ArrowBack';
import { inject, observer } from 'mobx-react';
import { History } from 'history';
import { match } from 'react-router';
import ViewEditInputText from '../components/viewEditInputText';
import { CaseStore, EditTermProps, Term } from '../../../stores/caseStore';
import { autorun } from 'mobx';

const styles = (theme: Theme) => createStyles(({
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

interface State {
  term?: Term;
  formError?: string;
  submitting: boolean;
}

interface RouteParams {
  id: string;
}

interface Props extends WithStyles<typeof styles> {
  routing: History;
  caseStore: CaseStore;
  match: match<RouteParams>;
}

@inject('routing', 'caseStore')
@observer
class EditTermPage extends Component<Props, State> {
  state: State = {
    submitting: false,
  };

  componentDidMount() {
    const termId = this.props.match.params.id;
    if (!termId || isNaN(Number(termId))) {
      console.warn('No term id in url params');
      this.props.routing.replace('/admin/term');
      return;
    }
    autorun((reaction) => {
      const allTerms = this.props.caseStore.allTerms;
      if (allTerms.length > 0) {
        reaction.dispose();
        const term = allTerms.find(t => t.id === Number(termId));
        if (!term) {
          console.warn(`No term found with id of ${termId}`);
          this.props.routing.push('/admin/term');
        } else {
          this.setState({ term });
        }
      }
    });
  }

  back = () => {
    this.props.routing.goBack();
  };

  edit = async (termEdit: EditTermProps) => {
    if (!this.state.term) {
      return;
    }
    this.setState({ submitting: true, formError: undefined });
    try {
      const term = await this.props.caseStore.editTerm(this.state.term.id, termEdit);
      this.setState({ term });
    } catch (e) {
      this.setState({ formError: e?.errorMessage ?? 'Failed to update term'});
    } finally {
      this.setState({ submitting: false});
    } 
  }

  saveName = (name: string) => {
    if (!name) {
      this.setState({ formError: 'Name is required' });
      return;
    }
    this.edit({ name });
  }

  saveOtName = (otName: string) => {
    if (!otName) {
      this.setState({ formError: 'OT Name is required' });
      return;
    }
    this.edit({ otName });
  }

  changeLowerCourtOverruled = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inactive = event.target.value === 'true' ? true : false;
    this.edit({inactive});
  }

  render() {
    return (
      <>
        <Grid container direction="column">
          <Grid item>
            <IconButton onClick={this.back}>
              <BackIcon color="action" />
            </IconButton>
          </Grid>
          <Grid item>
            <Typography variant="h4" component="h2">Edit Docket</Typography>
          </Grid>
          <Grid item>
            {this.state.term &&
              <Grid className={this.props.classes.formContainer} container direction="row" spacing={2}>
                {!!this.state.formError && (
                  <Grid item>
                    <Typography color="error">{this.state.formError}</Typography>
                  </Grid>)
                }
                <Grid item xs={12}>
                  <ViewEditInputText
                    id="term-edit-name"
                    fullWidth
                    required
                    disabled={this.state.submitting}
                    name="name"
                    label="Name"
                    value={this.state.term.name}
                    onSave={this.saveName}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ViewEditInputText
                    id="term-edit-otname"
                    fullWidth
                    required
                    disabled={this.state.submitting}
                    name="otName"
                    label="OT Name"
                    value={this.state.term.otName}
                    onSave={this.saveOtName}
                  />
                  <Typography className={this.props.classes.helperText} variant="subtitle1" color="textSecondary">
                    October term notation
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <FormControl component="fieldset">
                    <FormLabel component="legend">Inactive</FormLabel>
                    <RadioGroup row aria-label="inactive" name="inactive"
                      value={this.state.term.inactive}
                      onChange={this.changeLowerCourtOverruled}
                    >
                      <FormControlLabel value={true} control={<Radio />} label="Inactive" />
                      <FormControlLabel value={false} control={<Radio />} label="Active" />
                    </RadioGroup>
                  </FormControl>
                  <Typography className={this.props.classes.helperText} variant="subtitle1" color="textSecondary">
                    Inactive terms do not appear in the home screen drop down menu
                  </Typography>
                </Grid>
              </Grid>
            }
          </Grid>
        </Grid>
      </>
    );
  }
}

export default withStyles(styles)(EditTermPage);