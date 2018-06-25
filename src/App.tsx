import * as React from 'react';
import Peer = require('peerjs');
const styles = require('./App.css');

interface AppProps {}

interface AppState {
  localId: string;
  isRemoteVisible: boolean;
}

class App extends React.Component<AppProps, AppState> {
  private _localVideo: React.RefObject<HTMLVideoElement>;
  private _remoteVideo: React.RefObject<HTMLVideoElement>;
  private _remoteId: React.RefObject<HTMLInputElement>;
  private _localStream: MediaStream | null;
  private _peer: Peer;

  constructor(props: AppProps) {
    super(props);

    // intial state
    this.state = {
      localId: '',
      isRemoteVisible: false
    };

    this._localVideo = React.createRef();
    this._remoteVideo = React.createRef();
    this._remoteId = React.createRef();
    this._localStream = null;
    this._peer = new Peer({key: 'peerjs'});
  }

  async componentDidMount() {
    const localVideo = this._localVideo.current as HTMLVideoElement;
    this._localStream = await navigator.mediaDevices.getUserMedia({video: true});
    localVideo.srcObject = this._localStream;

    this._peer.on('open', () => {
      this.setState({
        localId: this._peer.id
      });
    });

    // when remote calls
    this._peer.on('call', (call: Peer.MediaConnection) => {
      if (!window.confirm(`${call.peer} is calling. Answer call?`)) {
        return;
      }
      this.answer(call);
      this.setState({isRemoteVisible: true});
    });

    this._peer.on('error', (error) => {
      console.error(error);
    });
  }

  call(event: React.FormEvent): void {
    event.preventDefault();
    const remoteId = this._remoteId.current as HTMLInputElement;
    const call = this._peer.call(remoteId.value, this._localStream);
    this.captureCallStream(call);
  }

  answer(call: Peer.MediaConnection): void {
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
    const remoteContent = this.state.isRemoteVisible ? (
      <video
        className={styles.remoteVideo}
        autoPlay
        ref={this._remoteVideo}
      ></video>
    ) : (
      <form
        className={styles.callForm}
        onSubmit={this.call.bind(this)}>
        <input type="text" ref={this._remoteId}/>
        <button type="submit">Call</button>
      </form>
    );

    return (
      <div className={styles.app}>
        <div className={styles.remoteVideoContainer}>
          {remoteContent}
        </div>
        <div className={styles.localVideoContainer}>
          <video
            className={styles.localVideo}
            autoPlay
            ref={this._localVideo}
          ></video>
          <div className={styles.localId}>
            <span>{this.state.localId}</span>
            <button className={styles.localIdCopyButton} type="button">Copy</button>
          </div>
        </div>
      </div>
    );
  }
}

export { App };
