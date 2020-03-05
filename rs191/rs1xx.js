function on_join(packet, deveui) {
  var join_message = { deveui: deveui, lora: packet, join: 1 };
  return join_message;
}
function on_uplink(packet, payload, deveui) {
  var up_message = {};
  let signed_payload = new Int8Array(payload);
  // temp and rh data notification
  if (payload[0] == 0x01) {
    up_message.options = payload[1];
    up_message.humidity = payload[2] / 100.0 + payload[3];
    up_message.temp = payload[4] / 100.0 + payload[5];
    up_message.battery = batteryTable[payload[6]];
    up_message.alarms = (payload[7] << 8) | payload[8];
    up_message.backlog = (payload[9] << 8) | payload[10];
  }
  // fw version notification
  if (payload[0] == 0x07) {
    up_message.options = payload[1];
    up_message.year = payload[2];
    up_message.month = payload[3];
    up_message.day = payload[4];
    up_message.versionMajor = payload[5];
    up_message.versionMinor = payload[6];
    up_message.partNumber =
      "0x" +
      createHexString([
        payload[7],
        payload[8],
        payload[9],
        payload[10]
      ]).toUpperCase();
  }
  return { deveui: deveui, lora: packet, data: up_message };
}
function on_downlink(message) {
  var downlink = null;
  if (message.msgType == 1) {
    // generic request
    downlink = new Uint8Array([message.msgType, message.options]);
  }
  return downlink;
}
var batteryTable = [0, 5, 20, 40, 60, 80];
function createHexString(arr) {
  var result = "";
  for (i in arr) {
    var str = arr[i].toString(16);
    str =
      str.length == 0
        ? "00"
        : str.length == 1
        ? "0" + str
        : str.length == 2
        ? str
        : str.substring(str.length - 2, str.length);
    result += str;
  }
  return result;
}
