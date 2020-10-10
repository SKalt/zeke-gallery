#!/usr/bin/env sh
python -c '
from webbrowser import open_new_tab
from time import sleep
sleep(1)
open_new_tab("127.0.0.1:8000/zeke/img/gallery.html")' &
python -m http.server
