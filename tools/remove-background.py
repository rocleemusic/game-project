# Background removal for flat-color portrait art (Blender Python)
#
# Cuts a solid-color backdrop out of character portraits (the style used for
# cast reference art: bex-full.jpg, toby-bust.jpg, etc. — one flat color per
# image, not necessarily pure green) and writes transparent PNGs to a no-bg/
# subfolder next to the source images.
#
# Why Blender and not Photoshop/remove.bg: this keys off each image's own
# sampled corner color, so it works across a whole folder of differently
# colored backdrops in one pass, and it runs headless through blender-mcp.
#
# Two things this handles that a naive color-distance key does not:
#   1. Green-channel-excess keying instead of raw RGB distance — a plain
#      distance key overestimates alpha on thin/faint edges (hair wisps)
#      against a saturated backdrop, leaving a bright fringe. Keying off
#      (G - max(R,B)) isolates the actual spill channel and fixes that.
#   2. Despill — unmixes each edge pixel against the sampled background
#      color using the pixel's own alpha, so semi-transparent edges stop
#      carrying a tint of the backdrop color.
#
# Only tested on flat single-color backdrops. Do NOT run this on a photo or
# rendered scene with a real background — it will wreck it (color-keys the
# whole image). Check each source image first.
#
# GOTCHA (already handled below, noted so it doesn't regress): if you reuse
# the image datablock loaded from the source JPEG and call img.save(), the
# alpha channel silently does NOT persist to disk — img.save() drops it even
# though the in-memory pixel edit is correct and img.is_dirty is True. The
# saved PNG will report channels=4 but alpha=1.0 everywhere (fully opaque),
# which looks like transparency in a naive preview (background pixels get
# pushed to black RGB) but isn't. Fix: write the edited RGBA buffer into a
# *new* image created with bpy.data.images.new(..., alpha=True) and save
# that instead of the reused source image. Verify any change to this script
# by reloading the output and checking alpha actually varies (min==0,
# max==1), not just that the file looks right when previewed.
#
# HOW TO RUN
#   Option A — blender-mcp: open Blender with the addon connected, then have
#   Claude call mcp__blender__execute_blender_code with this file's contents
#   (edit SRC_DIR / FILES below first).
#   Option B — inside Blender: Scripting tab, open this file, edit SRC_DIR /
#   FILES, click Run.
#
# Outputs to <SRC_DIR>/no-bg/<name>.png

import bpy
import numpy as np
import os

SRC_DIR = r"C:\Users\rocle\Desktop\8-20-26"   # <-- edit per use
OUT_DIR = os.path.join(SRC_DIR, "no-bg")

FILES = [
    # "bex-bust.jpg", "bex-full.jpg", ...   # <-- edit per use
]


def remove_background(fname, src_dir=SRC_DIR, out_dir=OUT_DIR):
    os.makedirs(out_dir, exist_ok=True)
    path = os.path.join(src_dir, fname)

    img = bpy.data.images.load(path, check_existing=False)
    w, h = img.size
    flat = np.empty(w * h * 4, dtype=np.float32)
    img.pixels.foreach_get(flat)
    px = flat.reshape(h, w, 4)
    rgb = px[:, :, :3]
    bpy.data.images.remove(img)  # done with the source; write results into a fresh alpha-capable image

    # sample the backdrop color from the four corners
    patch = 10
    corners = np.concatenate([
        px[0:patch, 0:patch].reshape(-1, 4),
        px[0:patch, w-patch:w].reshape(-1, 4),
        px[h-patch:h, 0:patch].reshape(-1, 4),
        px[h-patch:h, w-patch:w].reshape(-1, 4),
    ], axis=0)
    bg_color = corners[:, :3].mean(axis=0)

    R, G, B = rgb[:, :, 0], rgb[:, :, 1], rgb[:, :, 2]
    d = G - np.maximum(R, B)  # green-dominance: high over backdrop, low/negative on skin+hair
    bg_d = bg_color[1] - max(bg_color[0], bg_color[2])

    # sample a patch assumed to be foreground (left-of-center, mid-height) to calibrate the low end
    cy, cx = h // 2, w // 3
    fg_patch = rgb[cy-20:cy+20, cx-20:cx+20].reshape(-1, 3)
    fg_d = np.percentile(fg_patch[:, 1] - np.maximum(fg_patch[:, 0], fg_patch[:, 2]), 75)

    lo = fg_d + 0.05 * (bg_d - fg_d)
    hi = bg_d - 0.15 * (bg_d - fg_d)
    alpha = 1.0 - np.clip((d - lo) / (hi - lo), 0.0, 1.0)

    # despill: unmix each pixel against the known background color using the estimated alpha
    alpha_safe = np.clip(alpha, 0.02, 1.0)[:, :, None]
    fg = (rgb - (1.0 - alpha_safe) * bg_color) / alpha_safe
    fg = np.clip(fg, 0.0, 1.0)

    out_px = np.empty((h, w, 4), dtype=np.float32)
    out_px[:, :, :3] = fg
    out_px[:, :, 3] = alpha

    # NOTE: must be a new alpha=True image, not the reused source — see GOTCHA above
    new_img = bpy.data.images.new(f"cutout_{fname}", width=w, height=h, alpha=True)
    new_img.pixels.foreach_set(out_px.ravel())
    new_img.file_format = 'PNG'
    out_name = os.path.splitext(fname)[0] + ".png"
    out_path = os.path.join(out_dir, out_name)
    new_img.filepath_raw = out_path
    new_img.save()
    bpy.data.images.remove(new_img)
    return out_path


if __name__ == "__main__":
    for fname in FILES:
        result = remove_background(fname)
        print("OK:", result)
