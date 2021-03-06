"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Client {
    constructor(server, connection) {
        this.server = server;
        this.connection = connection;
        this.usernameRegex = /^[a-zA-Z0-9]*$/;
        this.username = null;
        connection.on('message', (message) => this.onMessage(message.utf8Data));
        connection.on('close', () => server.removeClient(this));
        connection.on('close', () => server.broadcastUsersList());
        connection.on('close', () => server.broadcastUserConnection('disconnection', this.username));
    }
    sendMessage(type, data) {
        const message = { type: type, data: data };
        this.connection.send(JSON.stringify(message));
    }
    sendUsersList(content) {
        const users_list = content;
        this.sendMessage('users_list', users_list);
    }
    sendInstantMessage(content, author, date) {
        const instantMessage = { content: content, author: author, date: date };
        this.sendMessage('instant_message', instantMessage);
    }
    sendUserConnection(connection, username) {
        this.sendMessage(connection, username);
    }
    onInstantMessage(content) {
        if (!(typeof 'content' === 'string'))
            return;
        if (this.username == null)
            return;
        this.server.broadcastInstantMessage(content, this.username);
    }
    onUsername(username) {
        if (!(typeof 'username' === 'string'))
            return;
        if (!this.usernameRegex.test(username))
            return;
        this.username = username;
        this.sendMessage('login', 'ok');
        this.server.broadcastUsersList();
        this.server.broadcastUserConnection('connection', username);
    }
    onMessage(utf8Data) {
        const message = JSON.parse(utf8Data);
        switch (message.type) {
            case 'instant_message':
                this.onInstantMessage(message.data);
                break;
            case 'username':
                this.onUsername(message.data);
                break;
        }
    }
    getUserName() {
        return this.username;
    }
}
exports.Client = Client;
