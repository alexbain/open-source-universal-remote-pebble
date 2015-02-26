/**
 * Welcome to Pebble.js!
 *
 * This is where you write your app.
 */

var UI = require('ui');
var ajax = require('ajax');
var Vibe = require('ui/vibe');
var Settings = require('settings');

// Fetch remotes information
ajax({
  url: 'http://192.168.1.115/remotes.json',
  type: 'json',
  async: false,
  },
  function (data, status, request) {
    Settings.data('remotes', data);
    console.log(Settings.data('remotes'));
    buildUI();
  }
);

function buildUI() {
  var remotes = Settings.data('remotes');
  var formattedRemotes = [];
  var commandsMenu = {};

  Object.keys(remotes).forEach(function(key) {
    formattedRemotes.push({
      title: key
    });
    
    commandsMenu[key] = [];
    remotes[key].forEach(function (command) {
      commandsMenu[key].push({
        title: command
      });
    });
  });

  var remotesMenu = new UI.Menu({
    sections: [{
      items: formattedRemotes
    }]
  });

  var commandMenu = new UI.Menu({
    sections: [{
      items: []
    }]
  });
  
  var activeRemote = null;
  
  remotesMenu.show();
  
  remotesMenu.on('select', function(e) {
    activeRemote = e.item.title;
    commandMenu.items(0, commandsMenu[e.item.title]);
    commandMenu.show();
  });
  
  commandMenu.on('select', function(e) {
    var url = 'http://192.168.1.115/remotes/' + activeRemote + '/' + e.item.title;
    
    ajax({
      url: url,
      method: 'POST'
    });
    
    Vibe.vibrate('short');
  });
}