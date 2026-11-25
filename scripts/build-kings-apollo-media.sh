#!/usr/bin/env bash
# Builds the Kings Apollo web media from the original walkthrough.
#
#   bash scripts/build-kings-apollo-media.sh            # encode only
#   TEASER_ONLY=1 bash scripts/build-kings-apollo-media.sh   # teaser only (minutes, not ~1.5 h)
#   UPLOAD=1 SUPABASE_SERVICE_ROLE_KEY=... bash scripts/build-kings-apollo-media.sh
#
# Run from the estate-edit root. Needs ffmpeg + ffprobe on PATH.
# Source (never served, never committed): media-source/KINGS_APOLLO_WALKTHROUGH.mp4
# Outputs:
#   public/videos/kings-apollo/teaser.mp4, teaser.webm   silent loop, < 3 MB each
#   public/videos/kings-apollo/poster-view.jpg (1920x1080), poster-view.webp (1280x720), og-view.jpg (1200x630)
#   media-source/build/kings-apollo-tour-720p.mp4         full tour, < 50 MB (Supabase free-plan file cap)
# The captions (public/videos/kings-apollo/kings-apollo-tour.en.vtt) are hand-written, not generated.
set -euo pipefail

# --- Teaser clips: "start_seconds  length_seconds  label". Adjust here. -------
# Property only: every window was checked frame by frame to keep the narrator
# and presenters out of shot. Re-check if you move one.
CLIPS=(
  "8    4    Apollo Tower title over the Kileleshwa view"
  "49   2.2  standby generator (narrator steps in at ~0:51.5)"
  "160  4    sauna"
  "166  3.5  steam room (cuts to the theatre presenter at 2:50)"
  "204  4    theatre seating"
  "225  4    jogging track & garden terrace"
  "281  4    12th-floor balcony view"
  "323  2.0  kitchen, 5-burner gas stove (narrator re-enters at ~5:25.2)"
  "398  4    bedroom view"
  "450  4    bathroom, walk-in shower"
  "463  4    panoramic city views"
)
FADE=0.5          # crossfade seconds (keep under the shortest clip)
POSTER_AT=285     # balcony view, no narrator in frame

SRC=media-source/KINGS_APOLLO_WALKTHROUGH.mp4
OUT=public/videos/kings-apollo
BUILD=media-source/build
TEASER_MAX=$((3 * 1024 * 1024))
FULL_MAX=$((50 * 1000 * 1000))
FULL_NAME=kings-apollo-tour-720p.mp4
SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL:-https://czvrsproxqlpcnvbaltq.supabase.co}

[[ -f $SRC ]] || { echo "Missing $SRC" >&2; exit 1; }
command -v ffmpeg >/dev/null || { echo "ffmpeg not found on PATH" >&2; exit 1; }
mkdir -p "$OUT" "$BUILD"
FF=(ffmpeg -hide_banner -loglevel error -y)
size() { stat -c %s "$1"; }

# --- a) teaser: one high-quality master, then the two web encodes ------------
inputs=() filter="" prev="" len=0
for i in "${!CLIPS[@]}"; do
  read -r start dur _ <<< "${CLIPS[$i]}"
  inputs+=(-ss "$start" -t "$dur" -i "$SRC")
  filter+="[$i:v]setpts=PTS-STARTPTS,scale=1280:720:force_original_aspect_ratio=increase,crop=1280:720,fps=30,format=yuv420p,settb=AVTB[v$i];"
  if [[ $i -eq 0 ]]; then
    prev="v0" len=$dur
  else
    offset=$(awk "BEGIN{print $len - $FADE}")
    filter+="[$prev][v$i]xfade=transition=fade:duration=$FADE:offset=$offset[x$i];"
    prev="x$i" len=$(awk "BEGIN{print $len + $dur - $FADE}")
  fi
done
echo "Teaser: ${#CLIPS[@]} clips, ${len}s"
"${FF[@]}" "${inputs[@]}" -filter_complex "${filter%;}" -map "[$prev]" -an \
  -c:v libx264 -crf 14 -preset medium "$BUILD/teaser-master.mp4"

crf=28
while :; do
  "${FF[@]}" -i "$BUILD/teaser-master.mp4" -an -c:v libx264 -crf $crf -preset veryfast \
    -pix_fmt yuv420p -movflags +faststart "$OUT/teaser.mp4"
  (( $(size "$OUT/teaser.mp4") <= TEASER_MAX || crf >= 40 )) && break
  crf=$((crf + 2)); echo "  teaser.mp4 over 3 MB, retrying at CRF $crf"
done

crf=45  # this footage has always needed ~48 to fit; lower it if the teaser gets simpler
while :; do
  "${FF[@]}" -i "$BUILD/teaser-master.mp4" -an -c:v libvpx-vp9 -crf $crf -b:v 0 \
    -row-mt 1 -deadline good -cpu-used 4 "$OUT/teaser.webm"
  (( $(size "$OUT/teaser.webm") <= TEASER_MAX || crf >= 50 )) && break
  crf=$((crf + 3)); echo "  teaser.webm over 3 MB, retrying at CRF $crf"
done

if [[ ${TEASER_ONLY:-} == 1 ]]; then
  for f in "$OUT"/teaser.mp4 "$OUT"/teaser.webm; do
    awk -v n="$f" -v b="$(size "$f")" 'BEGIN{printf "  %-55s %6.2f MB\n", n, b/1048576}'
  done
  exit 0
fi

# --- b) posters ---------------------------------------------------------------
"${FF[@]}" -ss $POSTER_AT -i "$SRC" -frames:v 1 -vf scale=1920:1080 -q:v 3 "$OUT/poster-view.jpg"
"${FF[@]}" -ss $POSTER_AT -i "$SRC" -frames:v 1 -vf scale=1280:720 -quality 80 "$OUT/poster-view.webp"
"${FF[@]}" -ss $POSTER_AT -i "$SRC" -frames:v 1 -vf "scale=1200:675,crop=1200:630" -q:v 3 "$OUT/og-view.jpg"

# --- c) full tour (NOT in public/: too big for Cloudflare static assets) ------
crf=27
while :; do
  "${FF[@]}" -i "$SRC" -vf scale=1280:720 -c:v libx264 -crf $crf -preset medium -pix_fmt yuv420p \
    -c:a aac -b:a 128k -movflags +faststart "$BUILD/$FULL_NAME"
  (( $(size "$BUILD/$FULL_NAME") <= FULL_MAX || crf >= 36 )) && break
  crf=$((crf + 1)); echo "  full tour over 50 MB, retrying at CRF $crf"
done

if [[ ${UPLOAD:-} == 1 ]]; then
  : "${SUPABASE_SERVICE_ROLE_KEY:?set SUPABASE_SERVICE_ROLE_KEY to upload}"
  curl -sf -X POST "$SUPABASE_URL/storage/v1/object/videos/kings-apollo/$FULL_NAME" \
    -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" -H "x-upsert: true" -H "Content-Type: video/mp4" \
    --data-binary "@$BUILD/$FULL_NAME" >/dev/null
  echo "Uploaded. Set NEXT_PUBLIC_KINGS_APOLLO_FULL_VIDEO_URL=$SUPABASE_URL/storage/v1/object/public/videos/kings-apollo/$FULL_NAME"
fi

echo; echo "Sizes:"
for f in "$OUT"/teaser.mp4 "$OUT"/teaser.webm "$OUT"/poster-view.jpg "$OUT"/poster-view.webp "$OUT"/og-view.jpg "$BUILD/$FULL_NAME"; do
  awk -v n="$f" -v b="$(size "$f")" 'BEGIN{printf "  %-55s %6.2f MB\n", n, b/1048576}'
done
(( $(size "$OUT/teaser.mp4") <= TEASER_MAX && $(size "$OUT/teaser.webm") <= TEASER_MAX )) || echo "WARNING: a teaser is still over 3 MB"
(( $(size "$BUILD/$FULL_NAME") <= FULL_MAX )) || echo "WARNING: full tour is still over 50 MB"
