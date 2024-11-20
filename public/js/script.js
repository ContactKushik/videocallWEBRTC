const socket = io();
let local;
let remote;
let peerconnection;

const rtcSettings = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

const initialize = async () => {
  console.log("initialize function ran");
  socket.on("signalingMessage", handleSignalingMessage);


  //⚠️⚠️⚠️⚠️ code for getting local video stream⚠️⚠️⚠️⚠️⚠️⚠️⚠️
  local = await navigator.mediaDevices.getUserMedia({
    audio: true,
    video: true,
  });
  document.querySelector("#localVideo").srcObject = local;
  // ---------------------------------------


  initiateOffer();
};

const initiateOffer = async () => {
  await createPeerConnection();
  const offer = await peerconnection.createOffer();
  await peerconnection.setLocalDescription(offer);
  socket.emit("signalingMessage", JSON.stringify({ type: "offer", offer }));
};

const createPeerConnection = async () => {
  peerconnection = new RTCPeerConnection(rtcSettings);
  // remote is a MediaStream object to hold media (audio/video) received from the remote peer
  remote = new MediaStream();
  document.querySelector("#remoteVideo").srcObject = remote;


  local.getTracks().forEach((track) => peerconnection.addTrack(track, local));

  peerconnection.ontrack = (event) => {
    // console.log("Received remote track:", event.streams[0]);
    console.log(event);
    event.streams[0].getTracks().forEach((track) => remote.addTrack(track));
  };

  peerconnection.onicecandidate = (event) => {
    console.log("THIS IS THE SECTION INSIDE THE peeerconnection.onicecandidate :", event.candidate);
    if (event.candidate) {
      socket.emit(
        "signalingMessage",
        JSON.stringify({ type: "candidate", candidate: event.candidate })
      );
    }
  };
};

const handleSignalingMessage = async (message) => {
  const { type, offer, answer, candidate } = JSON.parse(message);

  if (type === "offer") handleOffer(offer);
  if (type === "answer") handleAnswer(answer);
  if (type === "candidate") peerconnection.addIceCandidate(candidate);
};

const handleOffer = async (offer) => {
  await createPeerConnection();
  await peerconnection.setRemoteDescription(offer);

  const answer = await peerconnection.createAnswer();
  await peerconnection.setLocalDescription(answer);

  socket.emit("signalingMessage", JSON.stringify({ type: "answer", answer }));
};
  
const handleAnswer = async (answer) => {
  await peerconnection.setRemoteDescription(answer);
};
// this function is a much needded for us to implement the webrtc without this nothing will happen
initialize();
