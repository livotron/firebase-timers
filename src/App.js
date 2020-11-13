import logo from './logo.svg';
import './App.css';
import Home from './pages/Home';
import Header from './components/Header'
import Clock from './pages/Clock';
import Signup from './pages/Signup';
import Login from './pages/Login';
import { auth, db } from './services/firebase/firebase';
import firebase from 'firebase';
import {
  Route,
  BrowserRouter as Router,
  Switch,
  Redirect,
} from "react-router-dom";
import { Component } from 'react';
// import { db } from "./services/firebase/firebase"

function PrivateRoute({ component: Component, authenticated, ...rest }) {
  return (
    <Route
      {...rest}
      render={(props) => authenticated === true
        ? <Component {...props} />
        : <Redirect to={{ pathname: '/login', state: { from: props.location } }} />}
    />
  )
}

export function PublicRoute({ component: Component, authenticated, ...rest }) {
  return (
    <Route
      {...rest}
      render={(props) => authenticated === false
        ? <Component {...props} />
        : <Redirect to='/clock' />}
    />
  )
}

class App extends Component {
  constructor() {
    super();
    this.state = {
      authenticated: false,
      loading: true,
      totalTime: 0
    };
  }

  componentDidMount() {

    auth().onAuthStateChanged((user) => {
      if (user) {
        this.setState({
          authenticated: true,
          loading: false,
        });
        db.goOnline();
        let userStatusDatabaseRef = db.ref('/status/' + user.uid);



        db.ref('.info/connected').on('value', (snapshot) => {
          console.log("Try to connect", snapshot.val())
          if (snapshot.val() == false) {
            return;
          };

          try {
            userStatusDatabaseRef.once('value', snapshot => {
              let lastStatus = snapshot.val();
              console.log("Got Last status ", lastStatus);
              let isOfflineForDatabase = {
                state: 'offline',
                last_changed: firebase.database.ServerValue.TIMESTAMP,
                total_time: (lastStatus.total_time || 0) + lastStatus.last_leave - lastStatus.last_entry,
                last_entry:  + Date.now(),
                last_leave: firebase.database.ServerValue.TIMESTAMP,
              };
              let isOnlineForDatabase = {
                state: 'online',
                last_changed: firebase.database.ServerValue.TIMESTAMP,
                total_time: (lastStatus.total_time || 0) + lastStatus.last_leave - lastStatus.last_entry,
                last_entry:  + Date.now(),
                last_leave: lastStatus.last_leave || firebase.database.ServerValue.TIMESTAMP,
              };
              console.log("set on disconnect")
              userStatusDatabaseRef.onDisconnect().set(isOfflineForDatabase).then(() => {

                console.log("set online")
                userStatusDatabaseRef.set(isOnlineForDatabase)
                this.setState({totalTime: isOnlineForDatabase.total_time / 1000})
                console.log("last session" , (lastStatus.last_leave - lastStatus.last_entry)/1000)
                // console.log(lastStatus.last_leave.toDate())
                // setInterval(myTimer, 1000);

              })
            })
          } catch (error) {
            this.setState({ readError: error.message });
          }
          db.ref('.info/connected').off();
        })

      } else {

        this.setState({
          authenticated: false,
          loading: false,
        });
      }
    })
    setInterval(() => {
      this.setState({ totalTime: this.state.totalTime + 1})
    }, 1000)

  }

  render() {
    return (
      <div>
        <Header>      
</Header>  {this.state.totalTime}
        {this.state.loading === true ? <h2>Loading...</h2> :
          <Router>
            <Switch>
              <Route exact path="/" component={Home}></Route>
              <PrivateRoute path="/clock" authenticated={this.state.authenticated} component={Clock}></PrivateRoute>
              <PublicRoute path="/signup" authenticated={this.state.authenticated} component={Signup}></PublicRoute>
              <PublicRoute path="/login" authenticated={this.state.authenticated} component={Login}></PublicRoute>
            </Switch>
          </Router>}
      </div>

    )

  }

}

export default App;
