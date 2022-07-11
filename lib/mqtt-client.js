import { connect } from 'mqtt';
import config from '../config.json' assert { type: 'json' };

const host = config['drogue.integration.mqtt.host'];
const port = config['drogue.integration.mqtt.port'];
const appName = `${config['drogue.application.name']}`;
const subTopic = `app/${config['drogue.application.name']}`;
const QOS_AT_LEAST_ONCE = 1;

const options = {
  clientId: 'mqttjs_' + Math.random().toString(8).substr(2, 4),
  username: config['drogue.api.user'],
  password: config['drogue.api.token'],
  port: config["drogue.integration.mqtt.port"],
};

function init(sse) {

  const client = connect(host, options);

  client.on('connect', () => {
    console.log(`Connected to ${host}`);

    client.subscribe(subTopic, (err) => {
      if (err) {
        console.error(`subscribe failed: ${err}`);
        client.end();
        process.exit(0);
      }
      console.log(`Subscribed to topic ${subTopic}`);
    })
  });

  client.on('message', (receiveTopic, message) => {
    const json = JSON.parse(message);
    const framePayload = Buffer.from(json.data.uplink_message.frm_payload, 'base64');

    const event = {
      deviceId: json.device,
      timestamp: json.time,
      payload: framePayload.toString('utf8')
    };
    sse.sendMessageEvent(event);

    if (event.payload.startsWith('ping')) {
      const command = {
        deviceId: event.deviceId,
        payload: getPayload(event, sse)
      };
      sse.updateResponse(sse.lastResponse);
      sse.sendCommandEvent(command);

      const sendTopic = `command/${appName}/${command.deviceId}/port:1`;
      const responsePayload = Buffer.from(command.payload, 'utf8');
      client.publish(sendTopic, responsePayload, {qos: QOS_AT_LEAST_ONCE });
    }
  });

  client.on('error', (error) => {
    console.log(`Unable to connect: ${error}`);
    process.exit(1);
  });

}

function getPayload(event, sse) {
  return sse.lastResponse.startsWith('pong') ?
    'pong' + event.payload.substring(event.payload.indexOf(':')) :
    sse.lastResponse;
}

export { init };
export default { init };
