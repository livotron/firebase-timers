import { auth, db } from "../services/firebase/firebase";
import { Route, Redirect } from 'react-router-dom';
export function signup(email, password) {
    return auth().createUserWithEmailAndPassword(email, password);
}

export function signin(email, password) {
    return auth().signInWithEmailAndPassword(email,password);
}

export function signout(){
    db.goOffline();
    auth().signOut();
}

export const user = auth().currentUser;


export function PrivateRoute({ component: Component, authenticated, ...rest }) {
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