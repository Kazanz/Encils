/***
 * Entry point of the app that renders other containers with react router
 * @
 */
import React, { Component } from 'react';
import { Switch, Route } from 'react-router-dom';
import { withRouter } from 'react-router';

import { MuiThemeProvider, createMuiTheme } from 'material-ui/styles';
import { orange, blue } from 'material-ui/colors';

import Login from './Login';
import Classrooms from './Classrooms';
import Classroom from './Classroom';
import Assignments from './Assignments';
import Assignment from './Assignment';
import StudentsAdd from './StudentsAdd';
import AssignmentActive from './AssignmentActive';
import Grade from './Grade';
import Home from './Home';
import Reports from './Reports';
import Settings from './Settings';
import PasswordReset from './PasswordReset';
import PasswordResetConfirmation from './PasswordResetConfirmation';
import NotFound from './NotFound';
import ScrollToTop from './router/ScrollToTop';

const theme = createMuiTheme({
  palette: {
    primary: {...blue}, 
    accent: {...orange}
  },
  overrides: {
    MuiButton: {
      // Name of the styleSheet
      raisedAccent: {
        // Name of the rule
        color: 'white',
      },
      raised: {
        border: 0,
        height: 48,
        padding: '0 30px',
        boxShadow: '0 3px 5px 2px',
      }
    },
  },
});

class App extends Component {
  componentDidMount() {
    window.addEventListener("resize", () => this.forceUpdate());
  }
  componentWillUnmount() {
    window.removeEventListener("resize", () => this.forceUpdate());
  }

  render() {
    return (
      <div className="App">
        <MuiThemeProvider theme={theme}>
          <ScrollToTop>
            <Switch>
              <Route exact path='/' component={Home} />
              <Route exact path='/login' component={Login} />
              <Route exact path='/classrooms' component={Classrooms} />
              <Route exact path='/classrooms/:classroomPk' component={Classroom} />
              <Route exact path='/assignments' component={Assignments} />
              <Route exact path='/assignments/:assignmentPk' component={Assignment} />
              <Route exact path='/students-add/:classroomPk' component={StudentsAdd} />
              <Route exact path='/assignment-active/:classroomPk/:assignmentPk/:questionIndex' component={AssignmentActive} />
              <Route exact path='/grade/:classroomPk/:assignmentPk' component={Grade} />
              <Route exact path='/reports' component={Reports} />
              <Route exact path='/settings' component={Settings} />
              <Route exact path='/password-reset' component={PasswordReset} />
              <Route exact path='/password-reset-confirm/:uid/:token' component={PasswordResetConfirmation} />
              <Route exact path='*' component={NotFound} status={404} />
            </Switch>
          </ScrollToTop>
        </MuiThemeProvider>
      </div>
    );
  }
}

export default withRouter(App);
