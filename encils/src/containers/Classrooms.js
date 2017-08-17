import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { push } from 'react-router-redux';
import isUndefined from 'lodash/isUndefined';

import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Button from 'material-ui/Button';
import Card, { CardContent } from 'material-ui/Card';
import Grid from 'material-ui/Grid';
import IconButton from 'material-ui/IconButton';
import Tabs, { Tab } from 'material-ui/Tabs';
import Typography from 'material-ui/Typography';
import { grey } from 'material-ui/colors';
import DeleteIcon from 'material-ui-icons/Delete';
import EditIcon from 'material-ui-icons/Edit';

import AssignmentTable from '../components/AssignmentTable';
import Dashboard from '../components/Dashboard';
import FullScreenDialog from '../components/FullScreenDialog';
import SelectList from '../components/SelectList';
import StudentTable from '../components/StudentTable';

import ClassroomForm from './forms/ClassroomForm';

import { 
  getClassroom,
  getClassrooms,
  getClassroomStudents,
  createClassroom,
  editClassroom,
  deleteClassroom,
} from '../api-client/classrooms';

import { 
  getAssignments,
} from '../api-client/assignments';

import {
  getActiveItem,
  editActiveItem,
} from '../api-client/activeItems';


class Classrooms extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      classroomDialogOpen: false,
      classroomEdit: false,
      tabValue: 0
    }
  }

  componentWillMount() {
    const { dispatch } = this.props;
    dispatch(getClassrooms())
      .then((data) => { 
        if (data && data.length > 0) {
          this.getClassroom(data[0]);
          dispatch(getAssignments());
        }
      });
  }

  handleTabChange(event, tabValue) {
    this.setState({ tabValue });
  };

  getClassroom({pk}) {
    const { dispatch } = this.props;
    dispatch(getClassroom(pk))
      .then(dispatch(getClassroomStudents(pk)))
      .then(this.setState({}));
  }

  closeUpdateClassroomDialog() {
    this.setState({classroomDialogOpen: false});
  }

  submitClassroomForm(values) {
    const { dispatch, classroom } = this.props;
    const { classroomEdit } = this.state;
    const method = classroomEdit ? editClassroom(classroom.pk) : createClassroom;
    dispatch(method(values)).then((res) => {
      if (!isUndefined(res)) {
        this.closeUpdateClassroomDialog();
        dispatch(getClassrooms());
        this.getClassroom(res);
      };
    });
  }

  deleteClassroom() {
    const { dispatch, classroom } = this.props;
    dispatch(deleteClassroom(classroom.pk))
      .then(() => {
        dispatch(getClassrooms())
          .then((data) => { 
            if (data && data.length > 0) this.getClassroom(data[0]);
          });
      });
  }

  goToAddStudents() {
    const { dispatch, classroom } = this.props;
    dispatch(editActiveItem({classroom: classroom.pk, question: null}))
      .then(() => dispatch(push('/students-add')));
  }

  render() {
    const {
      assignments,
      classroom,
      classrooms,
      classroomStudents,
      dispatch,
    } = this.props;
    
    const { 
      classroomDialogOpen,
      classroomEdit,
      tabValue,
    } = this.state;

    return (
        <Dashboard>
          <div style={{padding:40}}>
            <Grid container>
              <Grid item md={3} sm={12} xs={12}>
                <Card style={{background: grey[100]}}>
                  <CardContent>
                    <SelectList 
                      title="Classrooms"
                      items={classrooms}
                      selected={classroom}
                      primaryField="name"
                      secondaryField="school"
                      onClick={this.getClassroom.bind(this)} />
                    <Button style={{width: '100%'}} raised color="primary"
                      onClick={() => this.setState({classroomDialogOpen: true, classroomEdit: false})}>
                      Create Classroom
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item md={9} sm={12} xs={12}>
                <AppBar position="static">
                   <Toolbar>
                     <Typography type="title" color="inherit" style={{flex: 1}}>
                       {classroom.name}
                     </Typography>
                     <Button color="contrast" onClick={this.goToAddStudents.bind(this)}>Start Assignment</Button>
                     <Button color="contrast" onClick={this.goToAddStudents.bind(this)}>Add Students</Button>
                     <Button color="contrast" onClick={() => this.setState({classroomDialogOpen: true, classroomEdit: true})}>Edit</Button>
                     <Button color="contrast" onClick={this.deleteClassroom.bind(this)}>Delete</Button>
                   </Toolbar>
                 </AppBar>
                <br />

                <AppBar position="static">
                  <Tabs value={tabValue} onChange={this.handleTabChange.bind(this)}>
                    <Tab style={tabValue === 0 ? {opacity: 1} : {}} label="Students" />
                    <Tab style={tabValue === 1 ? {opacity: 1} : {}} label="Completed Assignments" />
                    <Tab style={tabValue === 2 ? {opacity: 1} : {}} label="Reports" />
                  </Tabs>
                </AppBar>
                {tabValue === 0 && 
                 <Card style={{background: grey[100]}}>
                  <CardContent>
                    <StudentTable students={classroomStudents} />
                  </CardContent>
                </Card>
                }
                {tabValue === 1 && 
                <Card style={{background: grey[100]}}>
                  <CardContent>
                    <AssignmentTable assignments={assignments} />
                  </CardContent>
                </Card>
                }
                {tabValue === 2 && 
                <Card style={{background: grey[100]}}>
                  <CardContent>
                  </CardContent>
                </Card>
                }
              </Grid>
            </Grid>
          </div>

          <FullScreenDialog title="Create Classoom" open={classroomDialogOpen} onClose={this.closeUpdateClassroomDialog.bind(this)}>
            <ClassroomForm dispatch={dispatch} onSubmit={this.submitClassroomForm.bind(this)} initialValues={classroomEdit ? classroom : {}} />
          </FullScreenDialog>
        </Dashboard>
    );
  }
}

const mapStateToProps = state => ({
  routing: state.routing,
  assignment: state.apiReducer.assignment,
  assignments: state.apiReducer.assignments,
  classroom: state.apiReducer.classroom,
  classrooms: state.apiReducer.classrooms,
  classroomStudents: state.apiReducer.classroomStudents,
})

const mapDispatchToProps = (dispatch) => ({
  dispatch: dispatch
});

export default connect(mapStateToProps, mapDispatchToProps)(Classrooms)
