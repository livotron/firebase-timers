import React, { Component } from "react";
import { auth } from "../services/firebase/firebase";
import { db } from "../services/firebase/firebase"

export default class Clock extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: auth().currentUser,
      chats: [],
      content: '',
      readError: null,
      writeError: null,
      mobileTimer: {
        seconds: 0,
        minutes: 0,
        isOnline: false
      },
      webTimer: {
        seconds: 0,
        minutes: 0,
        isOnline: false
      }
    };
  }


  timer;
  interval = 1000;
  expected = Date.now() + this.interval;

  async componentDidMount() {
    try {
      db.ref("/statusWeb/" + this.state.user.uid).on('value', snapshot => {
        if (!snapshot.val()) {
          return;
        }

        console.log("From web clock ")
        console.log(snapshot.val())
        this.setState({
          webTimer: {
            seconds: Math.floor(snapshot.val().total_time / 1000) % 60,
            minutes: Math.floor(snapshot.val().total_time / 1000 / 60) % 60,
            isOnline: snapshot.val().isOnline
          }
        });
      });

    } catch (error) {
      this.setState({ readError: error.message });
    }
    try {
      db.ref("/statusMobile/" + this.state.user.uid).on('value', snapshot => {
        if (!snapshot.val()) {
          return;
        }
        let recountedTotal = snapshot.val().total_time + (snapshot.val().isOnline ?
          +Date.now() - snapshot.val().last_entry :
          snapshot.val().last_leave - snapshot.val().last_entry);
        console.log("From Mobile clock ")
        console.log(snapshot.val())
        this.setState({
          mobileTimer: {
            seconds: Math.floor(recountedTotal / 1000) % 60,
            minutes: Math.floor(recountedTotal / 1000 / 60) % 60,
            isOnline: snapshot.val().isOnline
          }
        });
      });

    } catch (error) {
      this.setState({ readError: error.message });
    }

    this.timer = setTimeout(this.updateTimer, this.interval);
  }

  componentWillUnmount() {
    clearTimeout(this.timer)
  }

  updateTimer = () => {

    let dt = Date.now() - this.expected; // the drift (positive for overshooting)

    let newState = {};
    if (this.state.mobileTimer.isOnline) {
      if (this.state.mobileTimer.seconds === 59) {
        newState.mobileTimer = {
          minutes: this.state.mobileTimer.minutes + 1,
          seconds: 0,
          isOnline: this.state.mobileTimer.isOnline
        }
      } else {
        newState.mobileTimer = {
          seconds: this.state.mobileTimer.seconds + 1,
          minutes: this.state.mobileTimer.minutes,
          isOnline: this.state.mobileTimer.isOnline
        }
      }
    }
    if (this.state.webTimer.isOnline) {
      if (this.state.webTimer.seconds === 59) {
        newState.webTimer = {
          minutes: this.state.webTimer.minutes + 1,
          seconds: 0,
          isOnline: this.state.webTimer.isOnline
        }
      } else {
        newState.webTimer = {
          seconds: this.state.webTimer.seconds + 1,
          minutes: this.state.webTimer.minutes,
          isOnline: this.state.webTimer.isOnline
        }
      }
    }
    this.setState(newState)

    this.expected += this.interval;
    this.timer = setTimeout(this.updateTimer, Math.max(0, this.interval - dt)); // take into account drift
  }

  addZero(time) {
    if (time < 10) {
      return '0' + time;
    } else {
      return time;
    }
  }



  render() {
    return (
      <div>
        <h1>{"Web: " + this.addZero(this.state.webTimer.minutes) +
          " : " + this.addZero(this.state.webTimer.seconds)}</h1>
        <h1>{"Mobile: " + this.addZero(this.state.mobileTimer.minutes) +
          " : " + this.addZero(this.state.mobileTimer.seconds)}</h1>
      </div>
    );
  }
}
