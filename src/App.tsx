import * as React from 'react';
import Peer from 'peerjs';
const styles = require('./App.module.css');

interface AppProps {}

interface AppState {
  localId: string;
  isRemoteVisible: boolean;
}

class App extends React.Component<AppProps, AppState> {
  private _localVideo: React.RefObject<HTMLVideoElement>;
  private _remoteVideo: React.RefObject<HTMLVideoElement>;
  private _remoteId: React.RefObject<HTMLInputElement>;
  private _localStream?: MediaStream;
  private _remoteStream?: MediaStream;
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
    this._peer = new Peer({key: 'peerjs'});
  }

  async componentDidMount() {
    const localVideo = this._localVideo.current as HTMLVideoElement;
    this._localStream = await navigator.mediaDevices.getUserMedia({video: true, audio: true});
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
    });

    this._peer.on('error', (error) => {
      console.error(error);
    });
  }

  componentDidUpdate(): void {
    if (this._remoteStream) {
      const remoteVideo = this._remoteVideo.current as HTMLVideoElement;
      remoteVideo.srcObject = this._remoteStream;
    }
  }

  // used in template
  call = (event: React.FormEvent): void => {
    event.preventDefault();
    const remoteId = this._remoteId.current as HTMLInputElement;
    const call = this._peer.call(remoteId.value, this._localStream!);
    this.captureCallStream(call);
  }

  answer(call: Peer.MediaConnection): void {
    // answer call with local video stream
    call.answer(this._localStream);
    this.captureCallStream(call);
  }

  captureCallStream(call: Peer.MediaConnection): void {
    call.on('stream', (remoteStream) => {
      this._remoteStream = remoteStream;
      this.setState({isRemoteVisible: true});
    });
  }

  copyLocalIdToClipboard = (): void => {
    const input = document.createElement('input');
    const root = document.getElementById('root') as HTMLElement;
    root.appendChild(input);
    input.value = this._peer.id;
    input.select();
    document.execCommand('copy');
    root.removeChild(input);
  }

  render() {
    const remoteContent = this.state.isRemoteVisible ? (
      <video
        className={styles.remoteVideo}
        autoPlay={true}
        ref={this._remoteVideo}
      />
    ) : (
      <form
        className={styles.launchForm}
        onSubmit={this.call}
      >
        <div className={styles.launchFormGroup}>
          <label className={styles.launchFormLabel}>Call someone's ID:</label>
          <div className={styles.launchFormItem}>
            <input className={styles.launchFormId} type="text" ref={this._remoteId}/>
            <button className={styles.launchFormButton} type="submit" title="Start call">
              <i className={`material-icons ${styles.icon}`}>videocam</i>
            </button>
          </div>
        </div>
        <div className={styles.launchFormGroup}>
          <label className={styles.launchFormLabel}>Copy your ID:</label>
          <div className={styles.launchFormItem}>
            <span className={styles.launchFormId}>{this.state.localId}</span>
            <button className={styles.launchFormButton} type="button" title="Copy to clipboard" onClick={this.copyLocalIdToClipboard}>
              <i className={`material-icons ${styles.icon}`}>file_copy</i>
            </button>
          </div>
        </div>
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
            autoPlay={true}
            ref={this._localVideo}
          />
        </div>
      </div>
    );
  }
}

export { App };
