Introduction
============

This is a Web application which embeds an XMPP server and allows users to chat using a web browser. It's basically a test I did to explore the integration of XMPP in a web application.

It uses [Vysper](http://mina.apache.org/vysper) and [Strophe.js](http://strophe.im/)

How to use it
-------------

* Compile Web XMPP using `mvn install`

* Deploy the generated web application in a [Jetty](http://jetty.codehaus.org/jetty) web server (version 7.x). You can find the WAR in the `target` directory, once the compilation is finished.

* Start the Jetty application server and go to the context root of the web application. If you deployed it using the `web-xmpp` context go to `http://127.0.0.1/web-xmpp/`

* Each tab that you will open to that page represent a user connecting to a multi-user chat.

* The user name for each page is automatically generated. If you want to connect using a specific user name, you can do it by specifying the `username` parameter in the query string (e.g., connecting to `http://127.0.0.1/web-xmpp/?username=cool_user_name`

* All the messages are sent by default to the group chat, thus, received by everyone connected at a given moment. If you want to send a private message to a user you can use the `<-` operator: if you write in the text area a message with the form `username@web-xmpp <- msg` this will send a private message to `username@web-xmpp`.

* The server also opens a standard TCP port listening for connection. You can use you favourite XMPP client to connect to the server and participate to the group chat. The multi-user chat room is called `web-xmpp`.

Have fun.
