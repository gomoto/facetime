## tsconfig.json notes

- `"skipLibCheck": true` is needed because @types/webrtc which uses some undefined types. peerjs also specifies `"skipLibCheck": true`.
- `"esModuleInterop": true` is needed because peerjs has mismatched export types for the Peer class in lib/exports.ts and index.d.ts.
