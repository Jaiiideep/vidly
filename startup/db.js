const mongoose = require('mongoose');
mongoose.set('useNewUrlParser', true);
mongoose.set('useUnifiedTopology', true);
mongoose.set('useFindAndModify', false);
const config = require('config');
const winston = require('winston');

module.exports = function () {
  const db = config.get('db');
  mongoose.connect(db)
    .then(() => {
      winston.info(`Connected to ${db}...`);
    });
}