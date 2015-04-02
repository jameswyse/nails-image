var fs      = require('fs');
var path    = require('path');
var gm      = require('gm');
var request = require('needle');
var fallbackStream = require('fallback-stream');

// Fetch - Start with a file or url string
gm.fetch = function fetchImage (options) {
  var stream;
  var format = options.format || options.filename;

  // URL
  if(options.url) {
    stream = fallbackStream([
      request
        .get(options.url)
        .on('headers', function (headers) {
          if(!headers['content-type'] || headers['content-type'].indexOf('image') === -1) {
            this.emit('error', 'fuck' );
          }
        }),
      fs.createReadStream(options.fallback)
    ])
      .on('error', function (err) {
        throw err;
      });
  }

  // Path
  else if(options.file) {
    stream = fallbackStream([
      fs.createReadStream(options.file),
      fs.createReadStream(options.fallback)
    ])
      .on('error', function (err) {
        console.error(err);
      });

    format = format || path.basename(options.file);
  }

  // Nothin'
  else {
    return this();
  }

  return format ? this(stream, format) : this(stream);
};

// Overlay an image
gm.prototype.overlay = function (options) {
  options.gravity = options.gravity || 'North';
  options.width   = options.width   || null;
  options.height  = options.height  || null;
  options.size    = options.size    || [options.width, options.height].join(',');

  var chain = this;

  if(options.trim !== false) {
    chain = chain.trim();
  }

  if(options.resize !== false) {
    options.resize = options.resize || '^';
    chain = chain.resize(options.width, options.height, options.resize);
  }

  if(options.background !== false) {
    options.background = options.background || 'transparent';
    chain = chain
      .gravity(options.gravity)
      .background(options.background)
      .extent(options.width, options.height, '!');
  }

  return chain
    .draw(['image Over 0,0 ' + options.size + ' ' + options.file])
    .enhance()
    .noProfile();
};

module.exports = gm;
