# Thoughts

## Two ways to launch external binary

### Using [Native message passing](http://developer.chrome.com/extensions/messaging.html#native-messaging-client)

We can place our executable into `/etc/opt/chrome/native-messaging-hosts/com.my_company.my_application.json`
and communicate with it using very simple API.

Disadvantage is that we need root privileges for this. Thus, we have to think
about special packages (deb, rpm, ebuild, etc.) for popular distros.

### Using [XHR](http://developer.chrome.com/extensions/xhr.html)

User starts `./server/run` with optional IP, port and router arguments.
Extension JavaScript communicates with the server via HTTP. The server accepts
a command like

	/usr/bin/gvim -f %f

## Possible server implementations

- C: need `libevent`. Otherwise should implement all the RFC damn stuff
- PHP: `php -S 127.0.0.1:8001 router.php`
- Perl: most sane is [HTTP::Daemon](http://search.cpan.org/~gaas/HTTP-Daemon-6.01/lib/HTTP/Daemon.pm)
- Python: `cd /some/dir; python -m SimpleHTTPServer 8001` will serve files in `/some/dir` as in doc root
