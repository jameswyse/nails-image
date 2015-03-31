var gm = require('./gm');

module.exports = {
  name:     'image',
  type:     'service',
  register: function (app, options, next) {
    app.service.register('image', gm);
    return next();
  }
};
