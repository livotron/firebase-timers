import { Component } from "react";
import { Link } from 'react-router-dom';
import { signout } from '../helpers/auth'

export default class Home extends Component {

    handleSignOut() {
        console.log("Sign outing")
        signout();
    }
    render() {
       return <div>
           <button onClick={()=> this.handleSignOut()}>Sign Out</button>
       </div>

    };
}