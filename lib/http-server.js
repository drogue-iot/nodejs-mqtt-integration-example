import Fastify from 'fastify';
import fastifyCors from 'fastify-cors';
import fastifySse from 'fastify-sse';
import fastify_static from '@fastify/static';
import path from 'path';

const fastify = Fastify({ logger: false });

const streamReplies = new Map();
const responseReplies = new Map();
const commandReplies = new Map();;

const corsOptions = {
  origin: '*',
  methods: 'OPTION, GET, HEAD, PUT, PATCH, DELETE',
  preflightContinue: false,
  optionsSuccessStatus: 204,
  exposedHeaders: 'Authorization',
};

function handleStream(request, reply) {
  console.log(`handleStream id: ${request.id}`);
  addOnCloseHandler(request, streamReplies);
  addReplyToMap(request, streamReplies, reply);
}

function handleResponse(request, reply) {
  console.log(`handleResponse id: ${request.id}`);
  addOnCloseHandler(request, responseReplies);
  addReplyToMap(request, responseReplies, reply);
}

function handleCommand(request, reply) {
  console.log(`handleCommand id: ${request.id}`);
  addOnCloseHandler(request, commandReplies);
  addReplyToMap(request, commandReplies, reply);
}

function addReplyToMap(request, map, reply) {
  map.set(request.id, reply);
}

function addOnCloseHandler(request, map) {
  request.raw.on('close', () => {
    console.log(`Removing reply for ${request.id}`);
    map.delete(request.id);
  });
}

function sendMessageEvent(data) {
  sendReply(streamReplies, JSON.stringify(data));
}

function sendResponseEvent(str) {
  sendReply(responseReplies, str);
}

function sendCommandEvent(data) {
  sendReply(commandReplies, JSON.stringify(data));
}

function sendReply(map, data) {
  for (let reply of map.values()) {
    reply.sse(data, {});
  }
}

function handlePostResponse(request, reply) {
  console.log(`handlePostResponse id: ${request.id}, body: ${request.body}`);
  const command = request.body;
  this.updateResponse(command);
  reply.sse();
}

function handleLiveHealthCheck(request, reply) {
  console.log(`handleLiveHealthCheck: ${request.id}`);
  reply.send("live");
}

function handleReadyHealthCheck(request, reply) {
  console.log(`handleReadyHealthCheck: ${request.id}`);
  reply.send("ready");
}

function init(port, host, dir, sse) {
  fastify.register(fastifyCors, corsOptions);
  fastify.register(fastifySse);

  fastify.get('/events/stream', handleStream);
  fastify.get('/events/response', handleResponse);
  fastify.get('/events/commands', handleCommand);
  fastify.post('/response', handlePostResponse.bind(sse));
  fastify.get('/health/live', handleLiveHealthCheck);
  fastify.get('/health/ready', handleReadyHealthCheck);

  fastify.register(fastify_static, {
    root: dir,
  })

  fastify.listen(port, host, (err, address) => {
    if (err) {
      console.error(err);
      process.exit(1)
    }
    console.log(`Server listening on ${address}`);
  })
  sse.httpServer = this;
}

export { init, sendMessageEvent, sendResponseEvent, sendCommandEvent };
export default { init, sendMessageEvent, sendResponseEvent, sendCommandEvent };
