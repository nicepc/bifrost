const socket = io();

const chatAreaId = document.getElementById("chatArea");

//TODO: Send message to dal. dal sends message to db. I lost my train of thot
// done! -- jtreed
//Adds message to chat area
socket.on("message", (message) => {
	addMessage(message);
  chatAreaId.scrollTop = chatAreaId.scrollHeight;
});

const messageInput = document.querySelector("#message-input");
messageInput.addEventListener("keypress", (evt) => {
  if (evt.key === 'Enter') {
    evt.preventDefault();
    let msg = messageInput.value;
    socket.emit("chatMessage", {
      channel_id: selectedChannelId,
			author_id: document.getElementById('currentUser').dataset.userId,
      body: msg
    });
  }
});
