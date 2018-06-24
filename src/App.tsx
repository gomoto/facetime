import * as React from 'react';
import Peer = require('peerjs');

interface AppProps {}

interface AppState {}

class App extends React.Component<AppProps, AppState> {
  private _localVideo: React.RefObject<HTMLVideoElement>;
  private _remoteVideo: React.RefObject<HTMLVideoElement>;
  private _peer: Peer;

  constructor(props: AppProps) {
    super(props);
    this._localVideo = React.createRef();
    this._remoteVideo = React.createRef();
    this._peer = new Peer({}); // types?
  }

  async componentDidMount() {
    const localVideo = this._localVideo.current as HTMLVideoElement;
    const localStream = await navigator.mediaDevices.getUserMedia({video: true});
    localVideo.srcObject = localStream;

    // when remote calls
    this._peer.on('call', (call: Peer.MediaConnection) => {
      // answer call with local video stream
      call.answer(localStream);

      // capture remote video stream
      const remoteVideo = this._localVideo.current as HTMLVideoElement;
      call.on('stream', (remoteStream) => {
        remoteVideo.srcObject = remoteStream;
      });
    });
  }

  render() {
    return (
      <div>
        <video
          autoPlay
          ref={this._localVideo}
        ></video>
        <video
          autoPlay
          ref={this._remoteVideo}
        ></video>
      </div>
    );
  }
}

export { App };
