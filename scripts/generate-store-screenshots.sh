#!/bin/zsh

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
OUT_DIR="$ROOT_DIR/docs/images/store-screenshots"
DESKTOP_SRC="$ROOT_DIR/docs/images/miniscreen-desktop.png"
BOOKMARK_SRC="$ROOT_DIR/docs/images/miniscreen-bookmarks.png"
FONT_BOLD="/System/Library/Fonts/Supplemental/Arial Bold.ttf"
FONT_REG="/System/Library/Fonts/Supplemental/Arial.ttf"

mkdir -p "$OUT_DIR"

ffmpeg -y \
  -i "$DESKTOP_SRC" \
  -filter_complex "\
    [0:v]scale=1600:1000[base]; \
    [base]drawbox=x=0:y=0:w=860:h=1000:color=#08111f:t=fill, \
      drawbox=x=0:y=0:w=1600:h=170:color=#11213b@0.22:t=fill, \
      drawbox=x=60:y=96:w=560:h=4:color=#35c2ff:t=fill, \
      drawtext=fontfile='$FONT_BOLD':text='A floating browser':x=72:y=150:fontsize=60:fontcolor=white, \
      drawtext=fontfile='$FONT_BOLD':text='above any page':x=72:y=222:fontsize=60:fontcolor=white, \
      drawtext=fontfile='$FONT_REG':text='Keep a second web view open while you work in your main tab.':x=76:y=320:fontsize=28:fontcolor=white@0.82, \
      drawtext=fontfile='$FONT_REG':text='Open pages quickly. Compare layouts. Browse without tab switching.':x=76:y=364:fontsize=28:fontcolor=white@0.82, \
      drawtext=fontfile='$FONT_BOLD':text='FLOATING OVERLAY':x=76:y=88:fontsize=24:fontcolor=#9ddfff \
  " \
  -frames:v 1 "$OUT_DIR/store-01-overview.png"

ffmpeg -y \
  -i "$DESKTOP_SRC" \
  -filter_complex "\
    [0:v]scale=1600:1000[base]; \
    [base]drawbox=x=0:y=0:w=880:h=1000:color=#0a1628:t=fill, \
      drawbox=x=0:y=760:w=1600:h=240:color=#153663@0.32:t=fill, \
      drawtext=fontfile='$FONT_BOLD':text='Switch between mobile':x=72:y=170:fontsize=58:fontcolor=white, \
      drawtext=fontfile='$FONT_BOLD':text='and desktop view':x=72:y=238:fontsize=58:fontcolor=white, \
      drawtext=fontfile='$FONT_REG':text='Preview narrow layouts or open a wider web view depending on the task.':x=76:y=320:fontsize=28:fontcolor=white@0.82, \
      drawtext=fontfile='$FONT_REG':text='A single click changes the frame width for responsive checks and browsing.':x=76:y=362:fontsize=28:fontcolor=white@0.82, \
      drawtext=fontfile='$FONT_BOLD':text='VIEW MODES':x=76:y=106:fontsize=24:fontcolor=#9ddfff \
  " \
  -frames:v 1 "$OUT_DIR/store-02-view-modes.png"

ffmpeg -y \
  -i "$BOOKMARK_SRC" \
  -filter_complex "\
    [0:v]scale=1600:1000[base]; \
    [base]drawbox=x=0:y=0:w=880:h=1000:color=#111d32:t=fill, \
      drawtext=fontfile='$FONT_BOLD':text='Save bookmarks':x=76:y=170:fontsize=58:fontcolor=white, \
      drawtext=fontfile='$FONT_BOLD':text='inside the mini screen':x=76:y=238:fontsize=58:fontcolor=white, \
      drawtext=fontfile='$FONT_REG':text='Keep frequently used pages close and reopen them from one panel.':x=76:y=320:fontsize=28:fontcolor=white@0.82, \
      drawtext=fontfile='$FONT_REG':text='Bookmarks are stored with chrome storage so your quick links stay ready.':x=76:y=362:fontsize=28:fontcolor=white@0.82, \
      drawtext=fontfile='$FONT_BOLD':text='BOOKMARKS':x=76:y=106:fontsize=24:fontcolor=#9ddfff \
  " \
  -frames:v 1 "$OUT_DIR/store-03-bookmarks.png"

ffmpeg -y \
  -i "$DESKTOP_SRC" \
  -filter_complex "\
    color=c=#09131f:s=1600x1000:d=1[bg]; \
    [bg]drawbox=x=0:y=0:w=1600:h=1000:color=#09131f:t=fill, \
        drawbox=x=0:y=690:w=1600:h=310:color=#0d223c@0.62:t=fill, \
        drawbox=x=880:y=132:w=560:h=170:color=black@0.20:t=fill, \
        drawbox=x=880:y=350:w=560:h=330:color=black@0.20:t=fill[bgfx]; \
    [0:v]crop=760:80:640:34,scale=560:-1[topbar]; \
    [0:v]crop=860:420:690:188,scale=560:-1[body]; \
    [bgfx][topbar]overlay=x=900:y=110[tmp]; \
    [tmp][body]overlay=x=900:y=330, \
      drawtext=fontfile='$FONT_BOLD':text='Search, navigate,':x=72:y=170:fontsize=58:fontcolor=white, \
      drawtext=fontfile='$FONT_BOLD':text='and stay in flow':x=72:y=238:fontsize=58:fontcolor=white, \
      drawtext=fontfile='$FONT_REG':text='Type a URL or a search term, jump to a page, go back, or return home.':x=76:y=320:fontsize=28:fontcolor=white@0.82, \
      drawtext=fontfile='$FONT_REG':text='The mini screen keeps quick browsing tools close to your main work.':x=76:y=362:fontsize=28:fontcolor=white@0.82, \
      drawtext=fontfile='$FONT_BOLD':text='SMART CONTROLS':x=76:y=106:fontsize=24:fontcolor=#9ddfff \
  " \
  -frames:v 1 "$OUT_DIR/store-04-navigation.png"

ffmpeg -y \
  -i "$DESKTOP_SRC" \
  -i "$BOOKMARK_SRC" \
  -filter_complex "\
    color=c=#08111f:s=1600x1000:d=1[bg]; \
    [bg]drawbox=x=0:y=0:w=1600:h=1000:color=#08111f:t=fill, \
        drawbox=x=0:y=0:w=1600:h=1000:color=#132948@0.08:t=fill, \
        drawbox=x=930:y=118:w=260:h=590:color=black@0.22:t=fill, \
        drawbox=x=1230:y=230:w=240:h=500:color=black@0.20:t=fill[bgfx]; \
    [0:v]crop=720:760:760:30,scale=260:-1[leftshot]; \
    [1:v]crop=500:840:860:40,scale=240:-1[rightshot]; \
    [bgfx][leftshot]overlay=x=950:y=96[tmp]; \
    [tmp][rightshot]overlay=x=1245:y=200, \
      drawtext=fontfile='$FONT_BOLD':text='Built for QA, research,':x=72:y=170:fontsize=56:fontcolor=white, \
      drawtext=fontfile='$FONT_BOLD':text='and side by side work':x=72:y=236:fontsize=56:fontcolor=white, \
      drawtext=fontfile='$FONT_REG':text='Use MINISCREEN for responsive checks, reference browsing, and quick page comparison.':x=76:y=320:fontsize=28:fontcolor=white@0.82, \
      drawtext=fontfile='$FONT_REG':text='Keep a second site open without losing your current page context.':x=76:y=362:fontsize=28:fontcolor=white@0.82, \
      drawtext=fontfile='$FONT_BOLD':text='WORKFLOWS':x=76:y=106:fontsize=24:fontcolor=#9ddfff \
  " \
  -frames:v 1 "$OUT_DIR/store-05-workflows.png"

echo "Generated store screenshots in $OUT_DIR"
