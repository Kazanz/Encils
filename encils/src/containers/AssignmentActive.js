import React from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import filter from 'lodash/filter';
import isUndefined from 'lodash/isUndefined';

import AppBar from 'material-ui/AppBar';
import Button from 'material-ui/Button';
import Card, { CardContent } from 'material-ui/Card';
import Grid from 'material-ui/Grid';
import { CircularProgress } from 'material-ui/Progress';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';
import { FormControlLabel } from 'material-ui/Form';
import Switch from 'material-ui/Switch';
import LeftIcon from 'material-ui-icons/KeyboardArrowLeft';
import RightIcon from 'material-ui-icons/KeyboardArrowRight';

import StillThereDialog from '../components/StillThereDialog';
import StudentCount from '../components/StudentCount';

import phoneFormatter from 'phone-formatter';
import ReactInterval from 'react-interval';

import balloons from '../images/hot-air-balloon.jpeg'

import { requestLimit } from '../utils';

import { getProfile } from '../api-client/auth';
import { getClassroom, getClassroomStudents } from '../api-client/classrooms';
import { editActiveItem } from '../api-client/activeItems';
import { 
  getAssignment,
  getAssignmentQuestions,
  getQuestionAnswers,
  resetQuestionAnswers,
} from '../api-client/assignments';

const style = {
  backgroundImage: `url('${balloons}')`,
  backgroundSize: 'cover',
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  width: '100%',
  height: '100%',
}

const waitingStyle = {
  position: 'fixed',
  bottom: '1em',
  left: '1em',
  width: '20em'
};

const blurryStyle = {
  color: 'transparent',
  textShadow: '0 0 10px rgba(0,0,0,0.5)',
  paddingTop: 5,
}

class AssignmentActive extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      waitingOnIndex: -1,
      requestCount: 0,
      hideAnswers: true,
      oneByOne: false,
      answerIndex: 0,
      blockAnswers: false,
      initialLoad: true,
    }
  }

  componentWillMount() {
    const { dispatch } = this.props;
    resetQuestionAnswers(dispatch);
    dispatch(getProfile());
    dispatch(getAssignment(this.props.match.params.assignmentPk))
      .then((assignment) => { 
        this.setState({
          hideAnswers: assignment.hide_answers,
          oneByOne: assignment.on_at_a_time
        })
      });
    dispatch(getClassroomStudents(this.props.match.params.classroomPk));
    dispatch(getAssignmentQuestions(this.props.match.params.assignmentPk))
      .then((questions) => {
        dispatch(getClassroom(this.props.match.params.classroomPk))
          .then((classroom) => {
              const questionPk = questions[this.props.match.params.questionIndex].pk;
              dispatch(editActiveItem({classroom: classroom.pk, question: questionPk}));
          });
      });
  }

  updateWaitingOnIndex() {
    const { waitingOnIndex } = this.state;
    const students = this.unAnsweredStudents();
    const index = waitingOnIndex >= students.length - 1 ? 0 : waitingOnIndex + 1;
    this.setState({ waitingOnIndex: index });
  }

  unAnsweredStudents() {
    const { questionAnswers, classroomStudents } = this.props;
    const answeredPks = questionAnswers.map((ans) => ans.student.pk);
    return filter(classroomStudents, (s) => answeredPks.indexOf(s.pk) === -1);
  }

  getAnswers() {
    const { dispatch, assignmentQuestions, classroom } = this.props;
    const { requestCount, blockAnswers } = this.state;
    if (assignmentQuestions.length && requestCount < requestLimit && !blockAnswers) {
      const questionPk = assignmentQuestions[this.props.match.params.questionIndex].pk;
      dispatch(getQuestionAnswers(questionPk, classroom.pk))
        .then(() => {
          if(this.state.initialLoad) {
            this.setState({ initialLoad: false });
          }
        });
      this.setState({ requestCount: requestCount + 1 });
    }
  }

  renderWaitingOnName() {
    const { waitingOnIndex } = this.state;
    const students = this.unAnsweredStudents();
    const student = students[waitingOnIndex];
    if (!isUndefined(student)) {
      return student.name;
    }
  }

  finish() { 
    const { dispatch } = this.props
    dispatch(editActiveItem({classroom: null, question: null}))
      .then(() => dispatch(push('/')));
  }

  newQuestion(index) {
    const { dispatch, classroom, assignment, assignmentQuestions } = this.props;
    dispatch(editActiveItem({classroom: classroom.pk, question: assignmentQuestions[index].pk}))
      .then(() => {
        dispatch(push(`/assignment-active/${classroom.pk}/${assignment.pk}/${index}`));
        this.setState({ requestCount: 0, answerIndex: 0, hideAnswers: assignment.hide_answers, blockAnswers: false, initialLoad: true });
      });
  }

  renderAnswer(answer, index) {
    const { questionAnswers } = this.props;
    const { hideAnswers, oneByOne, answerIndex } = this.state;
    if (oneByOne) {
      if (answerIndex === index) {
        return ( 
          <Grid container style={{ position: 'absolute', top: '50%', marginTop: -200 }} justify="center">
            <Grid item>
              <Card style={{minWidth: 400}}>
                <CardContent>
                  <Typography type="headline">{answer.student.name}</Typography>
                  <Typography type="subheading" style={hideAnswers ? blurryStyle : {paddingTop: 5}}>{answer.text}</Typography>
                </CardContent>
              </Card>
              <br />
              <Grid container justify="center">
                <Grid item xs={4}>
                  <Button
                    disabled={answerIndex === 0}
                    onClick={() => this.setState({answerIndex: answerIndex - 1})}
                    style={{width: '100%'}}
                  >
                    <LeftIcon />Previous
                  </Button>
                </Grid>
                <Grid item xs={4}><center><Typography style={{padding: 10}}>{answerIndex + 1} of {questionAnswers.length}</Typography></center></Grid>
                <Grid item xs={4}>
                  <Button 
                    disabled={answerIndex === questionAnswers.length - 1}
                    onClick={() => this.setState({answerIndex: answerIndex + 1})}
                    style={{width: '100%'}}
                  >
                    Next<RightIcon />
                  </Button>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        )
      }
    } else {
      return (
        <Grid key={index} item xs={12} sm={6} md={3} lg={3} xl={2}>
          <Card>
            <CardContent>
              <Typography type="headline">{answer.student.name}</Typography>
              <Typography type="subheading" style={hideAnswers ? blurryStyle : {paddingTop: 5}}>{answer.text}</Typography>
            </CardContent>
          </Card>
        </Grid>
      )
    }
  }

  render() {
    const { 
      classroomStudents, 
      assignment,
      assignmentQuestions,
      profile,
      questionAnswers,
    } = this.props;
    const { requestCount, hideAnswers, blockAnswers, initialLoad } = this.state;

    const questionIndex = parseInt(this.props.match.params.questionIndex, 10)
    const question = assignmentQuestions && assignmentQuestions[questionIndex];

    return (
      <div style={style}>
        <AppBar position="static" color="primary" style={{color: 'white'}}>
          <Toolbar>
            <Typography type='headline' style={{flex: 1, color: 'white'}}>
              { question ? `Q${questionIndex+1}: ${question.text}` : 'Loading...' }
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={blockAnswers}
                  onChange={(event, checked) => this.setState({ blockAnswers: !blockAnswers })}
                />
              }
              label="Block answers" />
            {assignment.hide_answers ? 
            <FormControlLabel
              control={
                <Switch
                  checked={!hideAnswers}
                  onChange={(event, checked) => this.setState({ hideAnswers: !checked })}
                />
              }
              label="Show answers"
            /> : null}
            <StudentCount  count={questionAnswers.length} max={classroomStudents.length} />
            <Button color="contrast" disabled={questionIndex === 0} onClick={() => this.newQuestion(questionIndex - 1)}><LeftIcon />Previous</Button>
            <Typography style={{padding: 10, color: 'white'}}>{questionIndex+1} of {assignmentQuestions.length}</Typography>
            {questionIndex === assignmentQuestions.length - 1 ?
              <Button color="contrast" onClick={this.finish.bind(this)}>Done</Button> :
              <Button color="contrast" onClick={() => this.newQuestion(questionIndex + 1)}>Next<RightIcon /></Button>
            }
          </Toolbar>
        </AppBar>

        <div style={{padding: 25}}>
          <Grid container direction='row' justify='flex-start'>
            {initialLoad ? <div><Typography>Preparing to receive answers...</Typography><CircularProgress /></div> : questionAnswers.map(this.renderAnswer.bind(this))} 
          </Grid>
        </div>

        <div style={waitingStyle}>
          <Card>
            <CardContent>
              {blockAnswers ?
              <div>
                <Typography type="headline">Answering blocked.</Typography>
                <Typography type="subheading">No more answers accepted at this time.</Typography>
              </div>
              :
              <div>
                <Typography type='subheading'>Text answers to: {profile.sms && phoneFormatter.format(profile.sms, "(NNN) NNN-NNNN")}</Typography>
                <Typography>Waiting on...</Typography>
                <Typography type="headline">{this.renderWaitingOnName()}</Typography>
              </div>
              }
              <ReactInterval timeout={1000} enabled={true} callback={this.updateWaitingOnIndex.bind(this)} />
              <ReactInterval timeout={3000} enabled={true} callback={this.getAnswers.bind(this)} />
            </CardContent>
          </Card>
        </div>

        <StillThereDialog open={requestCount >= requestLimit} onClose={() => this.setState({ requestCount: 0 })} />
      </div>
    );
  }
}

const mapStateToProps = state => ({
  routing: state.routing,
  assignment: state.apiReducer.assignment,
  assignmentQuestions: state.apiReducer.assignmentQuestions,
  classroom: state.apiReducer.classroom,
  classroomStudents: state.apiReducer.classroomStudents,
  profile: state.apiReducer.profile,
  questionAnswers: state.apiReducer.questionAnswers,
})

const mapDispatchToProps = (dispatch) => ({
  dispatch: dispatch
});

export default connect(mapStateToProps, mapDispatchToProps)(AssignmentActive)
