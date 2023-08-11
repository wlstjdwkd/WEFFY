import React, { Component } from "react";
import IconButton from "@mui/material/IconButton";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import ForwardToInboxOutlinedIcon from "@mui/icons-material/ForwardToInboxOutlined";
import DownloadIcon from "@mui/icons-material/Download";
import SimCardDownloadIcon from "@mui/icons-material/SimCardDownload";

import FileDownloadIcon from "@mui/icons-material/FileDownload";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import { connect } from "react-redux";

import "./ChatComponent.css";
import Tooltip from "@mui/material/Tooltip";
import { yellow } from "@mui/material/colors";
import SendIcon from "@mui/icons-material/Send";

import axios from "axios";

const mapStateToProps = (state) => {
  return {
    accessToken: state.user.accessToken,
    activeSessionId: state.conference.activeSessionId,
  };
};

// // If you need to dispatch actions to Redux, use this
// const mapDispatchToProps = (dispatch) => {
//   return {
//     // For example:
//     // setIdentification: (id) => dispatch(setIdentification(id))
//   };
// };

class ChatComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      messageList: [],
      message: "",
      // : "",
      // authorization: "",
    };
    this.chatScroll = React.createRef();

    this.handleChange = this.handleChange.bind(this);
    this.handlePressKey = this.handlePressKey.bind(this);
    this.fileDownload = this.fileDownload.bind(this);
    this.close = this.close.bind(this);
    this.sendMessage = this.sendMessage.bind(this);
    this.addFile = this.addFile.bind(this);
    this.getCurTimeStamp = this.getCurTimeStamp.bind(this);
  }

  getCurTimeStamp() {
    const now = new Date();
    let hours = now.getHours();
    let minutes = now.getMinutes();

    hours = hours < 10 ? "0" + hours : hours;
    minutes = minutes < 10 ? "0" + minutes : minutes;

    return hours + ":" + minutes;
  }

  componentDidMount() {
    this.props.user
      .getStreamManager()
      .stream.session.on("signal:chat", (event) => {
        const data = JSON.parse(event.data);

        // console.log(data.timestamp);
        let messageList = this.state.messageList;
        messageList.push({
          connectionId: event.from.connectionId,
          nickname: data.nickname,
          message: data.message,
          timestamp: this.getCurTimeStamp(),
        });
        this.setState({ messageList: messageList });
        this.scrollToBottom();
      });
  }

  handleChange(event) {
    this.setState({ message: event.target.value });
  }

  handlePressKey(event) {
    if (event.key === "Enter") {
      this.sendMessage();
    }
  }

  fileDownload() {
    console.log("다운로드 시도!");
  }

  sendMessage() {
    if (typeof this.state.message === "string") {
      if (this.props.user && this.state.message) {
        let message = this.state.message.replace(/ +(?= )/g, "");
        if (message !== "" && message !== " ") {
          const data = {
            message: message,
            nickname: this.props.user.getNickname(),
            streamId: this.props.user.getStreamManager().stream.streamId,
            timestamp: this.getCurTimeStamp(),
          };
          // console.log(data.timestamp);
          this.props.user.getStreamManager().stream.session.signal({
            data: JSON.stringify(data),
            type: "chat",
          });
        }
      }
    } else if (typeof this.state.message === "object") {
      // console.log("sned1");
      if (this.props.user) {
        const data = {
          message: {
            url: this.state.message.url,
            title: this.state.message.title,
          },
          nickname: this.props.user.getNickname(),
          streamId: this.props.user.getStreamManager().stream.streamId,
          timestamp: this.getCurTimeStamp(),
        };
        this.props.user.getStreamManager().stream.session.signal({
          data: JSON.stringify(data),
          type: "chat",
        });
      }
    }
  }

  addFile(event) {
    const file = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append("file", file);

      this.setState({ fileData: formData });
      // console.log(this.props.activeSessionId);
      axios({
        method: "post",
        url: `http://i9d107.p.ssafy.io:8081/api/v1/files/${this.props.activeSessionId}`,
        headers: {
          accept: "application/json",
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${this.props.accessToken}`,
        },
        data: formData,
      })
        .then((res) => {
          // console.log(res.data.data);

          const fileInfo = {
            url: res.data.data.url,
            title: res.data.data.title,
          };

          this.setState({ message: fileInfo }, () => {
            // console.log("전송!");
            this.sendMessage();
            this.setState({ message: "" });
          });
        })
        .catch((err) => {
          console.log(err);
          // Set the message state to the error message you want to display.
          this.setState({ message: "파일 전송에 실패했습니다" }, () => {
            this.sendMessage();
            this.setState({ message: "" });
          });
        });
    }
  }

  scrollToBottom() {
    setTimeout(() => {
      try {
        this.chatScroll.current.scrollTop =
          this.chatScroll.current.scrollHeight;
      } catch (err) {}
    }, 20);
  }

  close() {
    this.props.close(undefined);
  }

  render() {
    const styleChat = { display: this.props.chatDisplay };
    return (
      <div id="chatContainer">
        <div id="chatComponent" style={styleChat}>
          <div id="chatToolbar">
            <span style={{ fontFamily: "Agro", fontWeight: "400" }}>
              일반 채팅
            </span>
            <IconButton id="closeButton" onClick={this.close}>
              <CancelOutlinedIcon style={{ color: "red" }} />
            </IconButton>
          </div>
          <div className="message-wrap" ref={this.chatScroll}>
            {/* {console.log(this.state.messageList)} */}
            {this.state.messageList.map((data, i) => (
              <div
                key={i}
                id="remoteUsers"
                className={
                  "message" +
                  (data.connectionId !== this.props.user.getConnectionId()
                    ? " left"
                    : " right")
                }
              >
                <div className="msg-detail">
                  <div className="msg-info">
                    <p style={{ fontFamily: "Poppins", fontSize: "12px" }}>
                      {data.nickname}
                    </p>
                  </div>
                  <div className="content-with-timestamp">
                    <div className="msg-content">
                      <p className="text" style={{ fontFamily: "GmarketSans" }}>
                        <p
                          className="text"
                          style={{ fontFamily: "GmarketSans" }}
                        >
                          {data.message && typeof data.message === "object" ? (
                            <IconButton
                              className="downloadText"
                              onClick={this.fileDownload}
                            >
                              <SimCardDownloadIcon
                                style={{
                                  color: "orange",
                                }}
                              />
                              {data.message.title}

                              {/* <DownloadIcon
                                style={{
                                  backgroundColor: "black",
                                  color: "white",
                                  borderRadius: "3px",
                                }}
                              /> */}
                            </IconButton>
                          ) : (
                            data.message || ""
                          )}
                        </p>
                      </p>
                    </div>
                    <span className="timeStamp">{data.timestamp}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div id="fileContainer">
            <Tooltip title="파일 첨부" placement="top">
              <IconButton
                size="small"
                id="fileButton"
                onClick={() => document.getElementById("fileInput").click()}
                style={{ padding: "10px", margin: "4px" }}
              >
                <input
                  type="file"
                  id="fileInput"
                  style={{ display: "none" }}
                  onChange={this.addFile}
                />
                <AttachFileIcon />
              </IconButton>
            </Tooltip>
          </div>

          <div id="messageInput">
            <input
              placeholder="메시지를 입력해주세요."
              id="chatInput"
              value={this.state.message}
              onChange={this.handleChange}
              onKeyPress={this.handlePressKey}
              style={{ fontFamily: "GmarketSans" }}
            />
            <div style={{ display: "flex" }}>
              {/* <Tooltip title="전송" placement="top"> */}
              <IconButton
                size="small"
                id="sendButton"
                onClick={this.sendMessage}
                style={{ padding: "10px", margin: "4px" }}
              >
                <SendIcon style={{ color: "white" }} />
              </IconButton>
              {/* </Tooltip> */}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps)(ChatComponent);
