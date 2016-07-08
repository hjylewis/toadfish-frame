"use strict";
var Readable = require('stream').Readable;

class LocalSongFrame {
  constructor (meta, image) {
    this.meta = meta;
    this.image = image;
  }

  toFrame () {
    var stream = new Readable;
    var metaBuffer = new Buffer(JSON.stringify(this.meta));
    var metaBufferLength = new Buffer(8);
    metaBufferLength.writeDoubleBE(metaBuffer.length, 0);

    var imageBufferLength = new Buffer(8);
    imageBufferLength.writeDoubleBE(this.image.length, 0);

    stream.push(metaBufferLength);
    stream.push(imageBufferLength);
    stream.push(metaBuffer);
    stream.push(this.image);
    stream.push(null);

    return stream;
  }

  static fromFrame (frame, callback) {
    var bufferList = [];
    frame.on('data', (chunk) => {
      bufferList.push(chunk);
    });

    frame.on('err', (err) => {
      callback(err);
    })

    frame.on('end', () => {
      var buffer = Buffer.concat(bufferList);
      var metaBufferLength = buffer.slice(0,8).readDoubleBE(0);
      var imageBufferLength = buffer.slice(8,16).readDoubleBE(0);
      var meta = JSON.parse(buffer.slice(16,16 + metaBufferLength).toString());
      var image = buffer.slice(16 + metaBufferLength);
      callback(null, new LocalSongFrame(meta, image));
    })
  }

  static fromFramePipe (frame) {
    var metaBufferLength = frame.read(8).readDoubleBE(0);
    var imageBufferLength = frame.read(8).readDoubleBE(0);
    var meta = JSON.parse(frame.read(metaBufferLength).toString());
    return {
      meta: meta,
      imageStream: frame
    }
  }
}

module.exports = LocalSongFrame;
