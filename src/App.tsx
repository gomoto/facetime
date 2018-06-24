import * as React from 'react';
import Peer = require('peerjs');

interface AppProps {}

interface AppState {}

class App extends React.Component<AppProps, AppState> {
  private _localVideo: React.RefObject<HTMLVideoElement>;
  private _remoteVideo: React.RefObject<HTMLVideoElement>;
  private _localId: React.RefObject<HTMLInputElement>;
  private _remoteId: React.RefObject<HTMLInputElement>;
  private _localStream: MediaStream | null;
  private _peer: Peer | null;

  constructor(props: AppProps) {
    super(props);
    this._localVideo = React.createRef();
    this._remoteVideo = React.createRef();
    this._localId = React.createRef();
    this._remoteId = React.createRef();
    this._localStream = null;
    this._peer = null;
  }

  async componentDidMount() {
    const localVideo = this._localVideo.current as HTMLVideoElement;
    this._localStream = await navigator.mediaDevices.getUserMedia({video: true});
    localVideo.srcObject = this._localStream;
  }

  call(event: React.FormEvent): void {
    event.preventDefault();
    const remoteId = this._remoteId.current as HTMLInputElement;
    console.log(`calling ${remoteId.value}`);
    const peer = this._peer as Peer;
    const call = peer.call(remoteId.value, this._localStream);
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

  updateInfo(event: React.FormEvent) {
    event.preventDefault();

    if (this._peer) {
      this._peer.destroy();
    }

    const localId = this._localId.current as HTMLInputElement;

    if (!localId || !localId.value) {
      return;
    }

    // (re)connect with new peer info
    this._peer = new Peer(localId.value, {key: 'peerjs'});
    localId.value = '';

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
          <span>My name is {this._peer ? this._peer.id : ''}</span>
          <form onSubmit={this.updateInfo.bind(this)}>
            <input type="text" ref={this._localId}/>
            <button type="submit">Update name</button>
          </form>
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
