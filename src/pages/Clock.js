import React, { Component } from "react";
import { auth } from "../services/firebase/firebase";
import { db } from "../services/firebase/firebase"
import firebase from 'firebase';

export default class Clock extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: auth().currentUser,
      chats: [],
      content: '',
      readError: null,
      writeError: null,
      seconds: "00",
      minutes: "00"
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);

    
  }

  async componentDidMount() {
    // this.setState({ readError: null });
    try {
      db.ref("chats").on('value', snapshot => {
        let chats = [];
        snapshot.forEach((snap) => {
          chats.push(snap.val());
        });
        this.setState({ chats });
      });
    } catch (error) {
      this.setState({ readError: error.message });
    }
    try{
      db.ref("/status/" + this.state.user.uid).once('value', snapshot => {
        console.log("From clock component " + snapshot.val().total_time)
        let totalTime = new Date(snapshot.val().total_time);
        console.log(totalTime.getTime() / 1000)
      })
    } catch (error) {
      this.setState({ readError: error.message });
    }
    // this.setState({seconds:})
  }



  handleChange(event) {
    this.setState({
      content: event.target.value
    });
  }

  async handleSubmit(event) {
    event.preventDefault();
    this.setState({ writeError: null });
    try {
      await db.ref("chats").push({
        content: this.state.content,
        timestamp: Date.now(),
        uid: this.state.user.uid
      }).then(function (docRef) {
        console.log("Document written with ID: ", docRef.id)
      });
      this.setState({ content: '' });
    } catch (error) {
      this.setState({ writeError: error.message });
    }
  }


  render() {
    return (
      <div>
        <div className="chats">
          {this.state.chats.map(chat => {
            return <p key={chat.timestamp}>{chat.content}</p>
          })}
        </div>
        {/* {# message form #} */}
        <form onSubmit={this.handleSubmit}>
          <input onChange={this.handleChange} value={this.state.content}></input>
          {this.state.error ? <p>{this.state.writeError}</p> : null}
          <button type="submit">Send</button>
        </form>
        <div>
          Login in as: <strong>{this.state.user.email}</strong>
        </div>
      </div>
    );
  }
}
