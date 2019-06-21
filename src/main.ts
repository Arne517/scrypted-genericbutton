// https://developer.scrypted.app/#getting-started
import {
  ScryptedDeviceBase,
  HttpRequestHandler,
  HttpRequest,
  HttpResponse,
} from '@scrypted/sdk';

import sdk from '@scrypted/sdk';

const os = require('os');
const { log, deviceManager } = sdk;

const genericButtonEndpoint = 'genericbutton';

function getIP() {
  var ifaces = os.networkInterfaces();
  var ipAddress = '<ip>';

  Object.keys(ifaces).forEach(function(ifname) {
    ifaces[ifname].forEach(function(iface) {
      if (
        ipAddress !== '<ip>' ||
        'IPv4' !== iface.family ||
        iface.internal !== false
      ) {
        // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
        //   and don't continue if ipAddress is already set.
        return;
      }
      ipAddress = iface.address;
    });
  });

  return ipAddress;
}

var address = 'https://' + getIP() + ':9443/endpoint/' + genericButtonEndpoint;

log.i(`Turn button on: GET ${address}/on`);
log.i(`Turn button off: GET ${address}/off`);
log.i(`Toggle button: GET ${address}/toggle`);

class GenericButton extends ScryptedDeviceBase implements HttpRequestHandler {
  constructor() {
    super();
    let state = deviceManager.getDeviceState();

    this.on = state.on;
  }

  getEndpoint() {
    return genericButtonEndpoint;
  }

  onRequest(request: HttpRequest, response: HttpResponse) {
    let action = request.url.replace(request.rootPath, '');

    log.d('Action: ' + action);

    switch (action) {
      case '/on':
        this.turnOn();
        break;
      case '/off':
        this.turnOff();
        break;
      case '/toggle':
        this.toggle();
        break;
    }

    response.send({ code: 200 }, `{"state": {"on": ${this.on}}}`);
  }

  toggle(): void {
    this.on = !this.on;
  }

  turnOff(): void {
    this.on = false;
  }
  turnOn(): void {
    this.on = true;
  }
}

exports.default = new GenericButton();
