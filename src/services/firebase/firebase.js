
import config from './firebaseConfig.js';
import firebase from 'firebase';

firebase.initializeApp(config);
export const auth = firebase.auth;
export const db = firebase.database();