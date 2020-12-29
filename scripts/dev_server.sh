#!/usr/bin/env sh
python -c '
from webbrowser import open_new_tab
from time import sleep
sleep(1)
open_new_tab("localhost:8000/zeke/")' &
python -m http.server
