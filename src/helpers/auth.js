import { auth, db } from "../services/firebase/firebase";

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
