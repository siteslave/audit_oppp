'use strict';

var path = require('path'),
    fs = require('fs'),
    fe = require('fs-extra'),
    jf = require('jsonfile'),
    mkdirp = require('mkdirp'),
    gui = require('nw.gui'),
    win = gui.Window.get();

var appPath = gui.App.dataPath,
    tmpPath = path.join(appPath, 'tmp'),
    configFile = path.join(appPath, 'config.json'),
    hospitalsFile = path.join(appPath, 'hospitals.json');

// Check tmp path exist
fs.exists(tmpPath, function(exists) {
  if (!exists) {
    mkdirp(tmpPath, function(err) {
      if (err) console.log(err);
    });
  }
});

// Check configuration file exist
fs.exists(configFile, function (exists) {
  if (!exists) {
    jf.writeFileSync(configFile, {
      host: 'localhost',
      port: 3306,
      database: 'audit',
      user: 'audit',
      password: 'audit'
    });
  }
});
// Check configuration file exist
fs.exists(hospitalsFile, function (exists) {
  if (!exists) {
    jf.writeFileSync(hospitalsFile, []);
  }
});