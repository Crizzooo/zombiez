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
      height += parseInt($(this).height());
    });
    $('#messageDisplay').animate({scrollTop: height});
    //document.getElementById("game").focus();

    $('#createMessage').blur();
    //const textInput = document.getElementById("createMessage");
    //textInput.blur();
    console.log('enabled', ZG.game.input.enabled)
    $(".messageForm").blur();
    $("#createMessage").blur();
    $("#game").focus();
    console.log('was the chat active before it was changed on enter:', ZG.game.isInChat)
    ZG.game.isInChat = false;
    setTimeout(()=>{document.getElementsByClassName("container")[0].style.visibility = "hidden";},1000)
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
                <div className="messageForm" >
                  <input id="createMessage" autoComplete="off" placeholder="Talk some smack here..." onChange={this.handleChange} />

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
