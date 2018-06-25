import * as React from 'react';
import Peer = require('peerjs');

interface AppProps {}

interface AppState {}

class App extends React.Component<AppProps, AppState> {
  private _localVideo: React.RefObject<HTMLVideoElement>;
  private _remoteVideo: React.RefObject<HTMLVideoElement>;
  private _remoteId: React.RefObject<HTMLInputElement>;
  private _localStream: MediaStream | null;
  private _peer: Peer;

  constructor(props: AppProps) {
    super(props);
    this._localVideo = React.createRef();
    this._remoteVideo = React.createRef();
    this._remoteId = React.createRef();
    this._localStream = null;
    this._peer = new Peer({key: 'peerjs'}); // types?
  }

  async componentDidMount() {
    const localVideo = this._localVideo.current as HTMLVideoElement;
    this._localStream = await navigator.mediaDevices.getUserMedia({video: true});
    localVideo.srcObject = this._localStream;

    this._peer.on('open', () => {
      this.setState({}); // to render peer id
    });

    // when remote calls
    this._peer.on('call', (call: Peer.MediaConnection) => {
      if (!window.confirm(`${call.peer} is calling. Answer call?`)) {
        return;
      }
      this.answer(call);
    });

    this._peer.on('error', (error) => {
      console.error(error);
    });
  }

  call(event: React.FormEvent): void {
    event.preventDefault();
    const remoteId = this._remoteId.current as HTMLInputElement;
    console.log(`calling ${remoteId.value}`);
    const call = this._peer.call(remoteId.value, this._localStream);
    this.captureCallStream(call);
  }

  answer(call: Peer.MediaConnection): void {
    console.log('answer()');
    // answer call with local video stream
    call.answer(this._localStream);
    this.captureCallStream(call);
  }

  captureCallStream(call: Peer.MediaConnection): void {
    // capture remote video stream
    const remoteVideo = this._remoteVideo.current as HTMLVideoElement;
    call.on('stream', (remoteStream) => {
      remoteVideo.srcObject = remoteStream;
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
        <div className="controls">
          <span>{this._peer.id}</span>
          <form onSubmit={this.call.bind(this)}>
            <input type="text" ref={this._remoteId}/>
            <button type="submit">Call</button>
          </form>
        </div>
      </div>
    );
  }
}

export { App };
