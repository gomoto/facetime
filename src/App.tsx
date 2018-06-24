import * as React from 'react';

interface AppProps {}

interface AppState {}

class App extends React.Component<AppProps, AppState> {
  private _videoRef: React.RefObject<HTMLVideoElement>;

  constructor(props: AppProps) {
    super(props);
    this._videoRef = React.createRef();
  }

  async componentDidMount() {
    const video = this._videoRef.current as HTMLVideoElement;
    const stream = await navigator.mediaDevices.getUserMedia({video: true});
    video.srcObject = stream;
  }

  render() {
    return (
      <video
        autoPlay
        ref={this._videoRef}
      ></video>
    );
  }
}

export { App };
