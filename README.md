## OSUR + Pebble Watch

This is a Pebble watch application that enables controlling devices the 
[Open Source Universal Remote](http://opensourceuniversalremote.com) understands,
from your Pebble watch. This app allows you to control your TV, home theater system,
LED candles, or other IR devices from your watch (as long as you're on the same
wireless network as the remote software).

### How does this work?

At a high level:

* Pebble app communicates with [Open Source Universal Remote](http://opensourceuniversalremote.com) API to learn the trained remotes/commands.
* Pebble app generates the user interface based on what remotes are available, giving you menus to select remotes/commands to trigger.
* Clicking on a command executes an HTTP request to the API for the remote/command, triggering the IR transceiver to send the command.
* IR transceiver emits IR signals, which IR enabled devices react.

Components:

* RaspberryPi with [IR tranceiver expansion board](http://alexba.in/blog/2013/06/08/open-source-universal-remote-parts-and-pictures/)
* [LIRC](http://lirc.org), installed on the RaspberryPi
* [lirc_node](http://github.com/alexbain/lirc_node), to expose LIRC commands in nodejs land
* [lirc_web](https://github.com/alexbain/lirc_web), a web interface and API to control LIRC with
