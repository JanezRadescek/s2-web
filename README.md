# www-s2

This repository contains the source of webpage(s)  designed for online work with s2 files.

## Setup push to deploy on the client (development) machine
Note: replace \_server_name_ with the actual address of the server (here ommited for additional security).

Use the following commandline for setup:
`git remote add deploy ssh://_server_name_:/srv/git/www-s2.git`

Then each time you perform:
`git push deploy`
the files on server will be updated. For instance, you can check readme online: http://_server_name_/sandbox/www-s2/README.md
 
## Setup push to deploy on the server
Server is setup using the procedure described in:
https://gist.github.com/Nilpo/8ed5e44be00d6cf21f22

