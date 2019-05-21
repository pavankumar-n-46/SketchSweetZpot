var w;

var myCharacteristic;

var iput = 1;

function onStartButtonClick() {
  let serviceUuid = '0xffb0';
  if (serviceUuid.startsWith('0x')) {
    serviceUuid = parseInt(serviceUuid);
  }

  let characteristicUuid = '0xffb3';
  if (characteristicUuid.startsWith('0x')) {
    characteristicUuid = parseInt(characteristicUuid);
  }

  log('Requesting Bluetooth Device...');
  navigator.bluetooth.requestDevice({ filters: [{ services: [serviceUuid] }] })
    .then(device => {
      log('Connecting to GATT Server...');
      return device.gatt.connect();
    })
    .then(server => {
      log('Getting Service...');
      return server.getPrimaryService(serviceUuid);
    })
    .then(service => {
      log('Getting Characteristic...');
      return service.getCharacteristic(characteristicUuid);
    })
    .then(characteristic => {
      myCharacteristic = characteristic;
      return myCharacteristic.startNotifications().then(_ => {
        log('> Notifications started');
        myCharacteristic.addEventListener('characteristicvaluechanged',
          handleNotifications);
      });
    })
    .catch(error => {
      log('Argh! ' + error);
    });
}

function onStopButtonClick() {
  if (myCharacteristic) {
    myCharacteristic.stopNotifications()
      .then(_ => {
        log('> Notifications stopped');
        myCharacteristic.removeEventListener('characteristicvaluechanged',
          handleNotifications);
      })
      .catch(error => {
        log('Argh! ' + error);
      });
  }
}

function handleNotifications(event) {
  let value = event.target.value;
  let a = [];
  // Convert raw data bytes to hex values just for the sake of showing something.
  // In the "real" world, you'd use data.getUint8, data.getUint16 or even
  // TextDecoder to process raw data bytes.
  for (let i = 0; i < 1; i++) {
    a.push(value.getUint8(i).toString());
    iput = parseInt(value.getUint8(i).toString());
  }
  log('> ' + a.join(' '));

}

function setup() {
  createCanvas(windowWidth, windowHeight);
  w1 = new Wave(width / 2, height / 2, 1, 200, width);
}

function draw() {
  console.log(iput);
  background(0, 0, 0, 10);
  w1.barwid = map(mouseX, 0, width, 5, 1);
  w1.maxhei = map(iput, 0, height, height, 1);
  w1.display();
}

//Wave Object
function Wave(x, y, barwid, maxhei, amount) {
  //Initial Variables
  //Coords
  this.x = x;
  this.y = y;
  //Bar Properties
  this.maxhei = maxhei;
  this.amount = amount;
  this.barwid = barwid;
  //noStroke();
  rectMode(CENTER);
  //Display
  this.display = function () {
    for (this.i = 0; this.i < this.amount; this.i++) {
      //Time in milliseconds/600 for smoothe transitions
      this.time = 5;
      //millis() / 600;
      //Cycling colors depending on time
      this.r = map(sin(this.time + this.i / 90), -1, 1, 0, 255);
      this.g = map(sin(this.time + 22.5 + this.i / 90), -1, 1, 0, 255);
      this.b = map(sin(this.time + 45 + this.i / 90), -1, 1, 0, 255);
      fill(this.r, this.g, this.b);
      //Hight depending on time and i
      this.hei = map(sin(this.i / 90 + this.time), -1, 1, 0, this.maxhei);
      //Actual Draw
      strokeWeight(1);
      stroke(this.g, this.b, this.r);
      //rect(this.x + this.i * this.barwid - this.amount * this.barwid / 2, this.y, this.barwid + 2, iput);
      ellipse(this.x, this.y, iput * this.barwid, 2 * iput);

    }
  }
}