var should = require('chai').should();
var expect = require('chai').expect;
var LocalSongFrame = require('../index');

var test = {
  meta:{
    artist : ['Spor'],
    album : 'Nightlife, Vol 5.',
    albumartist : [ 'Andy C', 'Spor' ],
    title : 'Stronger',
    year : '2010',
    track : { no : 1, of : 44 },
    disk : { no : 1, of : 2 },
    genre : ['Drum & Bass'],
    duration : 302.41 // in seconds
  },
  image: new Buffer('this is a test buffer')
}

describe('LocalSongFrame', function() {
  describe('toFrame', function () {
    it('should generate frame', function () {
      var song = new LocalSongFrame(test.meta, test.image);
      var frame = song.toFrame();
      var metaBufferLength = frame.read(8).readDoubleBE(0);
      metaBufferLength.should.equal(202)
      var imageBufferLength = frame.read(8).readDoubleBE(0);
      imageBufferLength.should.equal(21)
      var meta = frame.read(metaBufferLength).toString();
      meta.should.equal(JSON.stringify(test.meta));
      var image = frame.read(imageBufferLength);
      image.should.equal(test.image);
    });
  });
  describe('fromFrame', function () {
    it('should generate instance from frame', function () {
      var song = new LocalSongFrame(test.meta, test.image);
      var frame = song.toFrame();
      LocalSongFrame.fromFrame(frame, (err, newSong) => {
        err.should.equal(null);
        JSON.stringify(newSong.meta).should.equal(JSON.stringify(test.meta));
        newSong.image.should.equal(test.image);
      });
    });
  });
  describe('fromFramePipe', function () {
    it('should generate meta data and image stream from frame', function () {
      var song = new LocalSongFrame(test.meta, test.image);
      var frame = song.toFrame();
      var ret = LocalSongFrame.fromFramePipe(frame);

      JSON.stringify(ret.meta).should.equal(JSON.stringify(test.meta));
      var image = ret.imageStream.read();
      image.should.equal(test.image);
    });
  });
});
