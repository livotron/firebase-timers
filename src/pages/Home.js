import { Component } from "react";
import { Link } from 'react-router-dom';
export default class Home extends Component {
    render() {
       return <div>
           <Link to="/signup" className="btn btn-primary">Sign up</Link>
           <Link to="/login" className="btn btn-primary">Log in</Link>
       </div>

    };
}