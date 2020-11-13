import logo from './logo.svg';
import './App.css';
import Home from './pages/Home';
import Header from './components/Header'
import Clock from './pages/Clock';
import Signup from './pages/Signup';
import Login from './pages/Login';
import { auth } from './services/firebase/firebase'
import {
  Route,
  BrowserRouter as Router,
  Switch,
  Redirect,
} from "react-router-dom";
import { Component } from 'react';

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
    };
  }

  componentDidMount() {
    auth().onAuthStateChanged((user) => {
      if (user) {
        this.setState({
          authenticated: true,
          loading: false,
        });
      } else {
        this.setState({
          authenticated: false,
          loading: false,
        });
      }
    })
  }

  render() {
    return (
      <div>
        <Header></Header>
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
