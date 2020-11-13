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

        };
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }


    async componentDidMount() {
        this.setState({ readError: null });
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

        let userStatusDatabaseRef = db.ref('/status/' + this.state.user.uid);


        db.ref('.info/connected').on('value',function(snapshot) {
            if (snapshot.val() == false) {
                return;
            };
            try{
              userStatusDatabaseRef.on('value', snapshot => {
                let lastStatus = snapshot.val();
                console.log("Last status ", lastStatus);
              })
            } catch (error) {
              this.setState({ readError: error.message });
            }

            let isOfflineForDatabase = {
                state: 'offline',
                last_changed: firebase.database.ServerValue.TIMESTAMP,
                last_left: firebase.database.ServerValue.TIMESTAMP,
            };
            let isOnlineForDatabase = {
                state: 'online',
                last_changed: firebase.database.ServerValue.TIMESTAMP,
                last_entered: firebase.database.ServerValue.TIMESTAMP
            };
            userStatusDatabaseRef.child("le").onDisconnect().set(isOfflineForDatabase).then(function() {
                userStatusDatabaseRef.set(isOnlineForDatabase)
                // setInterval(myTimer, 1000);
            })
        })
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
          }).then(function(docRef) {
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
