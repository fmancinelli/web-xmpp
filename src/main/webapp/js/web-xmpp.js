/* 
 * Web XMPP
 * Copyright 2012 Fabio Mancinelli <fabio@mancinelli.me>
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Setup global variables.
 */

/** **** START OF MANUAL CONFIGURATION SECTION **** */

/* The BOSH endpoint. This is configured in the web application's web.xml */
var BOSH_ENDPOINT = '/web-xmpp/bosh';

/* The server domain as configured in the Vysper server startup code. */
var SERVER_DOMAIN = 'web-xmpp';

/* The room name to be used for group chat. */
var ROOM_NAME = 'web-xmpp';

/** **** END OF MANUAL CONFIGURATION SECTION **** */

/*
 * Get the user name from the URI query string. If it doesn't exist, generate
 * one
 */
var userName = getParameterByName('username');
if (userName == null) {
	userName = 'user' + new Date().getTime();
}

/* The full userId */
var userId = userName + '@' + SERVER_DOMAIN;

/* This is necessary to make things work. */
var roomId = ROOM_NAME + '@chat.' + SERVER_DOMAIN;

/* The variable storing the connection used by the application. */
var connection = null;

/** ************************************************************************** */

/**
 * Write a message in the main messages area, where all the communication is
 * logged.
 * 
 * @param msg
 *            The message to be logged.
 * @param cssClass
 *            The CSS class to be used. Can be null.
 */
function writeMessage(msg, cssClass) {
	if (cssClass != null) {
		$('messages').insert('<p class="' + cssClass + '">' + msg + '</p>');
	} else {
		$('messages').insert('<p>' + msg + '</p>');
	}

	/*
	 * Always scroll to the bottom of the window so that the last message is
	 * always visible.
	 */
	window.scrollTo(0, document.body.scrollHeight);
}

/**
 * This function is used to handle key presses in the message text area, so that
 * when ENTER is pressed, the current content is sent as a message.
 * 
 * @param event
 *            The keypress event.
 */
function handleKeyPress(event) {
	key = event.keyCode || event.which;
	if (key == 13) {
		var input = $('message_text');
		var text = input.value;

		/* Check if the user used the '<-' operator to send a private message */
		var components = text.split('<-');
		if (components.length == 2) {
			/*
			 * The user wants to send a private message. Build the corresponding
			 * stanza and send it.
			 */
			msg = $msg({
				from : connection.jid,
				to : components[0].trim(),
				type : 'chat'
			}).c('body', {
				xmlns : Strophe.NS.CLIENT
			}).t(components[1].trim());
			connection.send(msg);
			writeMessage(text, 'own_message');
		} else {
			connection.muc.groupchat(roomId, components[0]);
		}

		/*
		 * After sending the message clear the text area so that it's ready for
		 * another message.
		 */
		input.clear();
	}
}

/**
 * Callback for receive direct chat messages.
 * 
 * @param msg
 *            The received message.
 * @returns {Boolean} True if the callback should be kept registered.
 */
function onMessage(msg) {
	var type = msg.getAttribute('type');
	var from = msg.getAttribute('from');
	var elems = msg.getElementsByTagName('body');

	if (type == "chat" && elems.length > 0) {
		var body = elems[0];
		writeMessage('(' + type + ') ' + from + ': ' + Strophe.getText(body));
	}

	return true;
}

/**
 * The callback for receiving group chat messages.
 * 
 * @param msg
 *            The received message.
 * @returns {Boolean} True if the callback should be kept registered.
 */
function onMucMessage(msg) {
	var type = msg.getAttribute('type');
	var from = msg.getAttribute('from');
	var elems = msg.getElementsByTagName('body');

	if (type == "groupchat" && elems.length > 0) {
		var body = elems[0];
		var text = Strophe.getText(body);
		var cssClass = null;

		/*
		 * If the from attribute contains our userName, it's a message that we
		 * have sent to the multi-user chat, so we use a different highlighting
		 * for it.
		 */
		if (from.indexOf(userName) != -1) {
			cssClass = "own_message";
		}

		writeMessage('(' + type + ') ' + from + ': ' + text, cssClass);
	}

	return true;

}

/**
 * Callback for presence notifications.
 * 
 * @param pres
 *            The received presence message.
 * @returns {Boolean} True if the callback should be kept registered.
 */
function onPresence(pres) {
	var from = pres.getAttribute('from');
	var type = pres.getAttribute('type');
	var cssClass = "presence_message";

	if (type == "unavailable") {
		writeMessage(from + ' has left the chat', cssClass);
	} else {
		writeMessage(from + ' has joined the chat', cssClass);
	}

	return true;
}

/**
 * Callback for connection setup.
 * 
 * @param status
 *            The current connection status.
 */
function onConnect(status) {
	var cssClass = "system_message";

	if (status == Strophe.Status.CONNECTING) {
		writeMessage("Connecting...", cssClass);
	} else if (status == Strophe.Status.CONNFAIL) {
		writeMessage('Failed to connect.', cssClass);
	} else if (status == Strophe.Status.DISCONNECTING) {
		writeMessage('Disconnecting...', cssClass);
	} else if (status == Strophe.Status.DISCONNECTED) {
		writeMessage('Disconnected.', cssClass);
	} else if (status == Strophe.Status.CONNECTED) {
		writeMessage('Connected as ' + userId, cssClass);

		/*
		 * If we are successfully connected we add a callback for handling
		 * incoming chat messages and we join the multi-user chat room.
		 */
		connection.addHandler(onMessage, null, 'message', null, null, null);
		connection.send($pres().tree());
		connection.muc.join(roomId, userName, onMucMessage, onPresence);
	}
}

/**
 * This function is called when the document is loaded to connect to the XMPP
 * server.
 */
function connect() {
	date = new Date();
	connection = new Strophe.Connection(BOSH_ENDPOINT);
	connection.connect(userId, '********', onConnect);
}

/**
 * This function is called when the document is unloaded to leave the multi-user
 * chatroom and disconnect from the XMPP server.
 */
function disconnect() {
	connection.muc.leave(roomId, userName, null, null);
	/*
	 * This is important, otherwise the stanza with the leave operation might
	 * not be sent. This would result in a lot of stale users populating the
	 * multi-user chat room.
	 */
	connection.flush();
	connection.disconnect('bye');
}

/**
 * Function for retrieving the value of a parameter specified on the URI query
 * string.
 * 
 * Taken from
 * http://stackoverflow.com/questions/901115/get-query-string-values-in-javascript
 * 
 * @param name
 *            The parameter name.
 * @returns The parameter value. null if a parameter with that name doesn't
 *          exist.
 */
function getParameterByName(name) {
	name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
	var regexS = "[\\?&]" + name + "=([^&#]*)";
	var regex = new RegExp(regexS);
	var results = regex.exec(window.location.search);
	if (results == null)
		return null;
	else
		return decodeURIComponent(results[1].replace(/\+/g, " "));
}

/**
 * Hook callbacks to document events. Connect on page load, disconnect on page
 * unload.
 */
document.observe("dom:loaded", connect);
window.onbeforeunload = disconnect;
