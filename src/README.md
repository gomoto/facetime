## tsconfig.json notes

`"skipLibCheck": true` is needed because @types/webrtc which uses some undefined types.

peerjs also specifies `"skipLibCheck": true`.
