import mqtt from './lib/mqtt-client.js';
import httpserver from './lib/http-server.js';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import path from 'path';

const httpDir = path.join(dirname(fileURLToPath(import.meta.url)), 'static');

class Sse {

  constructor(command) {
    this.lastResponse = command;
    this.httpServer = null;
  }

  sendMessageEvent(event) {
    this.httpServer.sendMessageEvent(event);
  }

  sendResponseEvent(event) {
    this.httpServer.sendResponseEvent(event);
  }

  sendCommandEvent(event) {
    this.httpServer.sendCommandEvent(event);
  }

  updateResponse(data) {
    this.lastResponse = data;
    this.sendResponseEvent(this.lastResponse);
  }

}

const sse = new Sse('pong');
httpserver.init(8080, '0.0.0.0', httpDir, sse);
mqtt.init(sse);
