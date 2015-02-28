/**
 *
 * Open Source Universal Remote - for Pebble
 *
 */

// Load external libraries
var UI = require('ui'),
    ajax = require('ajax'),
    Vibe = require('ui/vibe'),
    Settings = require('settings'),
    Vector2 = require('vector2');

// Define configuration screen behavior
Settings.config(
  
  // External URL to load configuration screen from
  { url: 'http://abain.net/pebble-config.html' },
  
  // Callback function
  function(e) {
    
    console.log("Log callback!");
    console.log(e.options.ip);
    
    // Extract configuration options
    var ip = e.options.ip;
    
    // Ensure we have a trailing slash on the IP address
    if (ip.slice(-1) !== "/") {
      ip += "/";
    }
    
    // Save the IP address
    Settings.data('ip', ip);

    // Show the raw response if parsing failed
    if (e.failed) {
      console.log(e.response);
    }
  }
);

// If we don't have an IP address, show a message prompting user to run settings 
if (!Settings.data('ip')) {
  
  console.log("We don't have an IP address!");
  
  // Create the window
  var splashWindow = new UI.Window();

  // Define text element to inform user
  var text = new UI.Text({
    position: new Vector2(0, 0),
    size: new Vector2(144, 168),
    text: 'Please run settings on watch',
    font: 'GOTHIC_28_BOLD',
    color: 'black',
    textOverflow: 'wrap',
    textAlign: 'center',
    backgroundColor: 'white'
  });

  // Add the text to splashWindow, and show it
  splashWindow.add(text);
  splashWindow.show();

// If we already have a cached list of remotes, just show the UI
}/* else if (Settings.data('remotes')) {
  buildUI();
  
// We don't have any remotes, so we need to get them from API
}*/ else {
  
  console.log("We've got an IP address, hitting the API");

  // Fetch remotes information from API, then show the UI
  ajax({
    url: Settings.data('ip') + 'remotes.json',
    type: 'json',
    async: false,
    },
    function (data, status, request) {
      console.log("Got a response from the API!");
      Settings.data('remotes', data);
      buildUI();
    },
    function (error, status, request) {
      console.log("Error from the API!");
      console.log(Settings.data('ip'));
      console.log(error);
      console.log(status);
      console.log(request);
      
      // Create the window
      var errorWindow = new UI.Window();

      // Define text element to inform user
      var errorText = new UI.Text({
        position: new Vector2(0, 0),
        size: new Vector2(144, 168),
        text: 'Error from API. IP correct? Run Settings on phone.',
        font: 'GOTHIC_28_BOLD',
        color: 'black',
        textOverflow: 'wrap',
        textAlign: 'center',
        backgroundColor: 'white'
      });

      // Add the text to splashWindow, and show it
      errorWindow.add(errorText);
      errorWindow.show();
    }
  );  
}

// Build out the remotes / commands menus
function buildUI() { 
  console.log("Building the UI...");
  
  var remotes = Settings.data('remotes'),
      formattedRemotes = [],
      commandsMenu = {};

  // For each remote:
  // 1. Add it to formattedRemotes (for remotesMenu)
  // 2. Add the list of commands to comamndsMenu[remoteName]
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
  
  console.log("Formatted remotes:");
  console.log(formattedRemotes);
  
  // Define the menu used to display remotes
  var remotesMenu = new UI.Menu({
    sections: [{
      items: formattedRemotes
    }]
  });

  // Definte the menu used to display commands for a remote
  var commandMenu = new UI.Menu({
    sections: [{
      items: []
    }]
  });
  
  var activeRemote = null;
  
  remotesMenu.show();
  
  // When the user clicks on a remote, build the proper commands menu and show it
  remotesMenu.on('select', function(e) {
    activeRemote = e.item.title;
    commandMenu.items(0, commandsMenu[e.item.title]);
    commandMenu.show();
  });
  
  // When the user clicks on a command, hit the proper API endpoint and vibrate the watch
  commandMenu.on('select', function(e) {
    var url = Settings.data('ip') + 'remotes/' + activeRemote + '/' + e.item.title;
    
    ajax({
      url: url,
      method: 'POST'
    });
    
    Vibe.vibrate('short');
  });
}