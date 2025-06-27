
import AgoraRTC from "agora-rtc-sdk-ng";

let rtcClient;
let audioTracks = {
  localAudioTrack: null,
  remoteAudioTracks: {},
};
const token = null;
const rtcUid = Math.floor(Math.random() * 2032);
const appid = "e901cbd05d454f8eaff9a6986bf9a700";
//let roomId = "main";

export const initRtc = async (roomId) => {
  rtcClient = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
  rtcClient.on('user-joined', handleUserJoined);
  rtcClient.on("user-published", handleUserPublished);
  rtcClient.on("user-left", handleUserLeft);
  
  await rtcClient.join(appid, roomId, token, rtcUid);
  audioTracks.localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
  await rtcClient.publish(audioTracks.localAudioTrack);
};

const handleUserJoined = async (user) => {
  console.log('USER:', user);
};

const handleUserPublished = async (user, mediaType) => {
  await rtcClient.subscribe(user, mediaType);
  if (mediaType == "audio") {
    audioTracks.remoteAudioTracks[user.uid] = [user.audioTrack];
    user.audioTrack.play();
  }
};

const handleUserLeft = async (user) => {
  delete audioTracks.remoteAudioTracks[user.uid];

};  

export const enterVoiceRoom = async (roomId) => {
  await initRtc(roomId);

};

export const leaveVoiceRoom = async () => {
  audioTracks.localAudioTrack.stop();
  audioTracks.localAudioTrack.close();
  rtcClient.unpublish();
  rtcClient.leave();
};
