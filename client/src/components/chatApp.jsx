import React from 'react';
import { connect } from 'react-redux'

const self = this;
class ChatApp extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      messageToSend: ''
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }


  handleChange(evt) {
    console.log(evt.target.value);
    this.setState({ messageToSend: evt.target.value });
  }

  handleSubmit(evt) {
    evt.preventDefault();
    console.log('emitted message:', this.state.messageToSend);
    if (this.props.currentLobbyer.name) {
      socket.emit('newChatMessage', {message: this.state.messageToSend, name: this.props.currentLobbyer.name })
    } else {
      socket.emit('newChatMessage', {message: this.state.messageToSend, name: 'Spectator'})
    }
    this.setState({ messageToSend: ''});
    $('#createMessage').val('');
    let height = 0;
    $('.messageText').each( function(i, value){
      console.log('is this the error', this);
      height += parseInt($(this).height());
    });
    console.log('or is this the error');
    $('#messageDisplay').animate({scrollTop: height});
  }

  render() {
    return (
        <div className="chatComponents">
            <div id="messageDisplay">
              <ul className="messageList">
              {
                this.props.messageObjects && this.props.messageObjects.map( (msgObj, i) => {
                  return (
                  <li key={msgObj.name + i}>
                    <h6 className="messageText">
                      <b>{msgObj.name}:</b> {msgObj.message}
                      </h6>
                  </li>
                );
                })
              }
              </ul>
            </div>
            <div className="chatFooter">
              <form onSubmit={this.handleSubmit} id="chatForm">
                <div className="messageForm">
                  <input id="createMessage" autoComplete="off" placeholder="Talk some smack here..." onChange={this.handleChange} />
                  {
                    this.state.messageToSend && this.state.messageToSend.length >= 1 ?
                    <button type="submit" id="sendMessage" className="btn btn-primary btn-sm">
                      Send!
                    </button>
                    :
                    <button type="submit" id="sendMessage" className="btn btn-primary btn-sm" disabled>
                      Send!
                    </button>
                  }
                </div>
              </form>
            </div>
        </div>
      );
  }

}

const mapState = state => ({
  messageObjects: state.chatApp.allMessages,
  currentLobbyer: state.lobby.currentLobbyer
});

export default connect(mapState)(ChatApp);
