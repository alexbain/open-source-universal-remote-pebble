/**
 *
 * Open Source Universal Remote - for Pebble
 *
 * UI is dynamically built from the available remotes/commands from OSUR/lirc_web API.
 * 
 * opensourceuniversalremote.com
 * 
 * Alex Bain
 * http://alexba.in
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
  
  // External URL to load configuration screen HTML from
  { url: 'http://abain.net/pebble-config.html' },
  
  // Callback function
  function(e) {
    
    console.log("Settings saved callback");
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
    
    // Fetch remotes/commands from API
    fetchRemotes();
  }
);

// If we don't have an IP address, show a message prompting user to run settings 
if (!Settings.data('ip')) {
  
  console.log("No IP address found");
  
  // Create the window
  var splashWindow = new UI.Window();

  // Define text element to inform user
  var text = new UI.Text({
    position: new Vector2(0, 0),
    size: new Vector2(144, 168),
    text: 'Please run settings on phone.',
    font: 'GOTHIC_28_BOLD',
    color: 'black',
    textOverflow: 'wrap',
    textAlign: 'center',
    backgroundColor: 'white'
  });

  // Add the text to splashWindow, and show it
  splashWindow.add(text);
  splashWindow.show();

} else {
  
  console.log("We've got an IP address, hitting the API");
  fetchRemotes();
  
}

function fetchRemotes() {
  // Fetch remotes information from API, then show the UI
  ajax({
    url: Settings.data('ip') + 'remotes.json',
    type: 'json',
    async: false,
    },
    function (data, status, request) {
      console.log("Got a response from the API!");
      
      // Save the remote response
      Settings.data('remotes', data);
      
      // Build out the UI
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
  console.log("Building the UI");
  
  var remotes = Settings.data('remotes'),
      formattedRemotes = [],
      commandsMenu = {};

  // For each remote:
  // 1. Add it to formattedRemotes, used by the remotes menu
  // 2. Add the list of commands for each remmote to commandsMenu[remote]
  Object.keys(remotes).forEach(function(remote) {
    formattedRemotes.push({
      title: remote
    });
    
    commandsMenu[remote] = [];
    
    remotes[remote].forEach(function (command) {
      commandsMenu[remote].push({
        title: command
      });
    });
  });
  
  console.log("Formatted remotes, ready for Pebble Menu:");
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
      items: [] // Blank until user clicks on a remote
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
    
    // Vibrate immediately, even if API takes a second to respond
    Vibe.vibrate('short');
  });
}
