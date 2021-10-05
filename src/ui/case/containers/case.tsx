import { Component } from 'react';
import { withStyles, WithStyles, createStyles } from '@material-ui/styles';
import { Theme, Paper, Grid, Typography, IconButton, Button, Link } from '@material-ui/core';
import BackIcon from '@material-ui/icons/ArrowBack';
import { match } from 'react-router';
import { CaseStore, FullCase, CaseStatus } from '../../../stores/caseStore';
import { inject, observer } from 'mobx-react';
import { History } from 'history';
import { DateTimeFormatter, LocalDate } from '@js-joda/core';
import { Locale as JsJodaLocale } from '@js-joda/locale_en-us';
import { OpinionView } from '../components';
import { opinionSort } from '../../../stores/opinionStore';
import { UserStore } from '../../../stores/userStore';
import LinkableText from '../components/linkableText';

const styles = (theme: Theme) => createStyles({
  paper: {
    marginTop: theme.spacing(1),
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    padding: theme.spacing(2),
    height: `calc(100vh - ${theme.spacing(8)}px)`,
    overflow: 'scroll',
  },
  bold: {
    fontWeight: 'bold',
  },
  paragraph: {
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(5),
    whiteSpace: 'pre-wrap',
  },
  flexEnd: {
    marginRight: theme.spacing(2),
  },
});

interface Props extends WithStyles<typeof styles> {
  caseStore: CaseStore;
  routing: History;
  userStore: UserStore;
  match: match<{ id: string }>;
}

interface State {
  fullCase?: FullCase;
}

@inject('caseStore', 'routing', "userStore")
@observer
class CasePage extends Component<Props, State> {

  state: State = {

  };

  dateFormatter = DateTimeFormatter.ofPattern('MM/dd/yyyy').withLocale(JsJodaLocale.US);

  componentDidMount() {
    this.init();
  }

  componentDidUpdate() {
    // route change doesn't always result in a new component
    if (this.props.match.params.id !== `${this.state?.fullCase?.id ?? '' }`) {
      this.init();
    }
  }

  init = async () => {
    const caseId = this.props.match.params.id;
    if (!caseId || isNaN(Number(caseId))) {
      console.warn('No case id in url params');
      this.props.routing.push('/');
      return;
    }
    try {
      const fullCase = await this.props.caseStore.getCaseById(Number(caseId));
      if (!fullCase) {
        throw new Error(`No case found with id ${caseId}`);
      }
      document.title = `SCOTUS App | ${fullCase.case}`;
      this.setState({ fullCase });
    } catch (e) {
      console.warn(e);
      this.props.routing.push('/');
    }
  };

  courtStatusText: (fullCase: FullCase) => JSX.Element = fullCase => {
    let text: JSX.Element | null = null;
    switch(fullCase.status) {
      case CaseStatus.DISMISSED:
        text = <><span className={this.props.classes.bold}>Dismissed:</span> The court declined to review this case</>;
        break;
      case CaseStatus.DIG:
        text = <>
            <span className={this.props.classes.bold}>Dismissed as Improvidently Granted:</span>
            The court originally granted this case to hear arguments, but later decided that granting the case was a mistake. The case is dismissed.
          </>;
        break;
      case CaseStatus.GVR:
        text = <>
            <span className={this.props.classes.bold}>Grant, Vacate, and Remand: </span>
            The court granted this case and, without hearing arguments, vacates the ruling of the lower court and remands for further consideration.
            This happens when SCOTUS believes the lower court decided incorrectly and that arguments are not necessary for a ruling.
            GVRs can apply to petitions for certiorari, but are also used for petitions for a stay or preliminary injunction of a lower court ruling.
          </>;
        break;
    }
    return text ? 
      <Grid item>
        <Typography paragraph>{text}</Typography>
      </Grid>
    : <></>;
  };

  back = () => {
    this.props.routing.goBack();
  };

  editClick = () => {
    this.props.routing.push(`/admin/case/edit/${this.props.match.params.id}`);
  };

  render() {
    const { classes } = this.props;
    const { fullCase } = this.state;
    const isAdmin = this.props.userStore.isAdmin;

    const combinedWith = fullCase?.dockets.filter(d => d.title !== fullCase.case) ?? [];

    return (
      <Paper className={classes.paper}>
        {fullCase &&
          <Grid container direction="column" spacing={1}>
            <Grid item>
              <Grid container direction="row" alignItems="baseline" justifyContent="space-between">
                <Grid item>
                  <Grid container direction="row" justifyContent="flex-start" alignItems="baseline" spacing={2}>
                    <Grid item>
                      <IconButton onClick={this.back}>
                        <BackIcon color="action" />
                      </IconButton>
                    </Grid>
                    <Grid item>
                      <Typography color="textSecondary" variant="subtitle2">
                        {fullCase.status === CaseStatus.ARGUED && !!fullCase.sitting ? 
                          `${fullCase.status} (${fullCase.sitting})`
                        : fullCase.status}{fullCase.result && `: ${fullCase.result}` }
                      </Typography>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item className={classes.flexEnd}>
                  <Grid container direction="row" justifyContent="flex-start" alignItems="baseline" spacing={2}>
                    <Grid item>
                      <Typography color="textSecondary" variant="subtitle2">
                        Term: {fullCase.term.name}
                      </Typography>
                    </Grid>
                    {isAdmin && 
                      <Grid item>
                        <Button variant="text" color="secondary" onClick={this.editClick}>EDIT</Button>
                      </Grid>
                    }
                  </Grid>
                </Grid>
              </Grid>
              
            </Grid>
            <Grid item>
              <Typography variant="h4">{fullCase.case}</Typography>
            </Grid>
            {combinedWith.length > 0 &&
              <Grid item>
                <Typography variant="subtitle1">Combined With:</Typography>
                {combinedWith.map(d => (
                  <Typography key={d.docketId} color="textSecondary">
                    {d.title}
                  </Typography> 
                ))}
              </Grid>
            }
            {this.courtStatusText(fullCase)}
            <Grid item>
              <Typography className={classes.paragraph} paragraph color="textPrimary">
                <span className={classes.bold}>At Issue:</span>
                <LinkableText text={fullCase.shortSummary} />
              </Typography>
            </Grid>
            {fullCase.decisionSummary ?
              <Grid item>
                <Typography className={classes.paragraph} paragraph color="textPrimary">
                  <span className={classes.bold}>Ruling ({fullCase.result || 'opinion of the court'}):</span>
                  <LinkableText text={fullCase.decisionSummary} />
                </Typography>
              </Grid>
            :
              <Grid item>
                {fullCase.argumentDate &&
                  <Typography className={classes.paragraph} color="textPrimary">
                    {fullCase.argumentDate.isBefore(LocalDate.now()) ?
                      `This case was argued before the court on ${fullCase.argumentDate.format(this.dateFormatter)}. A ruling is expected before the end of the term.`
                    : 
                      `This case is currently scheduled to be argued before the court on ${fullCase.argumentDate.format(this.dateFormatter)}`
                    }
                  </Typography>
                }
              </Grid>
            }
            <Grid container direction="row" justifyContent="flex-start">
              {fullCase.decisionLink && 
                <Grid item xs={12}>
                  <Typography className={classes.paragraph}>
                    <Link color="secondary" href={fullCase.decisionLink} target="_blank" rel="noreferrer">View the full opinion</Link>
                  </Typography>
                </Grid>
              }
              {fullCase.opinions.sort(opinionSort).map(opinion => (
                <Grid item key={opinion.id} xs={12} sm={6} md={4} lg={3}>
                  <OpinionView opinion={opinion} />
                </Grid>
              ))}
            </Grid>
          </Grid>
        }
      </Paper>
    );
  }
}

export default withStyles(styles)(CasePage);