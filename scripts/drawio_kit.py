"""Shared draw.io diagram builders for blog article figures.

Every article that ships diagrams keeps its own folder:

    src/content/blog/<series>/<article-slug>/
        <article-slug>.mdx
        images/        exported PNGs, referenced as ./images/<name>.png
        diagrams/      .drawio sources + generate.py + README.md

`generate.py` in that folder imports this module, declares its diagrams, and
writes .drawio files. A separate draw.io export turns those into the PNGs the
article references. Keeping the builders here rather than copying them per
article means a change to the house style lands everywhere at once.

Four shapes cover everything the articles have needed so far:

    architecture()  several callers fanning in to a stack of tiers
    chain()         a linear sequence of steps
    gated()         a vertical pipeline where work alternates with gates
    layered()       an input passing down through named layers
    fanout()        one hub delegating to parallel branches, then converging

plus the two standard notations, which follow their own conventions rather
than the house style:

    sequence()      UML: lifelines, solid calls, dashed returns, self-loops
    flowchart()     rounded terminators, rectangles, rhombus decisions

Two traps, both of which fail silently and cost an hour each:

  * **A raw `<` in a label is malformed XML.** draw.io drops that cell *and
    every cell after it*, with no error. Always pass label text through esc().
  * **Angle brackets inside a label get eaten.** With html=1 a label containing
    `&lt;token&gt;` renders as an unknown HTML tag and disappears. Write it
    without brackets.

And one in the CLI: flag order matters.

    drawio --export --format png --scale 2 --output OUT IN     # works
    drawio -x -f png -o OUT IN                                 # "input not found"

`--background` breaks the argument parsing entirely, which is why every
diagram gets a white backing rectangle baked in by wrap() instead. That also
means one asset reads correctly on both the light and dark site themes.
"""

from __future__ import annotations

import base64
import pathlib

# --- house palette ----------------------------------------------------------
# Kept to draw.io's own default families so the figures look like something a
# person drew in draw.io rather than something generated from a design system.
BLUE = "#4D9FDB"        # frames
ARROW = "#2E5C8A"       # connectors
TEXT = "#1F2933"
MUTED = "#6B7280"
FILL = "#DAE8FC"        # a normal box
STROKE = "#6C8EBF"
RED_F, RED_S, RED_T = "#F8CECC", "#B85450", "#A02C2C"   # the state you do not want
GRN_F, GRN_S = "#D5E8D4", "#82B366"                     # the state you do
AMB_F, AMB_S = "#FFF2CC", "#D6B656"                     # a decision
GREY_F, GREY_S = "#E1E4E8", "#6B7280"                   # start / neutral

ICON_ROOT = pathlib.Path("public/icons")

# Every shape records its bounds so wrap() can size the white backing.
BOUNDS: list[tuple[int, int, int, int]] = []


def _b(x, y, w, h):
    BOUNDS.append((x, y, x + w, y + h))


def esc(s: str) -> str:
    """Escape a label for an XML attribute, turning newlines into <br>."""
    return (str(s).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
            .replace('"', "&quot;").replace("\n", "&lt;br&gt;"))


def icon(rel: str) -> str:
    """Embed an icon from public/icons as base64 so diagrams are self-contained."""
    data = (ICON_ROOT / rel).read_bytes()
    return "data:image/svg+xml," + base64.b64encode(data).decode()


# --- primitives -------------------------------------------------------------

def box(i, label, x, y, w, h, fill=FILL, stroke=STROKE, size=12, align="center", bold_first=False,
        pad_left=None):
    """A labelled box. `pad_left` widens the left inset to clear an icon sitting
    inside the box, which is how layered() puts a product logo beside its name."""
    _b(x, y, w, h)
    val = esc(label)
    if bold_first and "&lt;br&gt;" in val:
        head, rest = val.split("&lt;br&gt;", 1)
        val = f"&lt;b&gt;{head}&lt;/b&gt;&lt;br&gt;&lt;font color='{MUTED}'&gt;{rest}&lt;/font&gt;"
    st = (f"rounded=1;arcSize=8;whiteSpace=wrap;html=1;fillColor={fill};strokeColor={stroke};"
          f"strokeWidth=2;fontSize={size};fontColor={TEXT};align={align};"
          f"{f'spacingLeft={pad_left or 14};' if align == 'left' else ''}")
    return (f'<mxCell id="{i}" value="{val}" style="{st}" vertex="1" parent="1">'
            f'<mxGeometry x="{x}" y="{y}" width="{w}" height="{h}" as="geometry"/></mxCell>')


def node(i, label, icon_rel, x, y, w=54, h=54):
    """An icon with its label underneath — the product name always travels with it."""
    _b(x, y, w, h + 34)
    st = (f"shape=image;html=1;verticalLabelPosition=bottom;verticalAlign=top;imageAspect=0;"
          f"aspect=fixed;image={icon(icon_rel)};fontSize=13;fontColor={TEXT};labelBackgroundColor=none;")
    return (f'<mxCell id="{i}" value="{esc(label)}" style="{st}" vertex="1" parent="1">'
            f'<mxGeometry x="{x}" y="{y}" width="{w}" height="{h}" as="geometry"/></mxCell>')


def frame(i, label, x, y, w, h, dashed=False, stroke=BLUE):
    """A grouping frame. Solid for things that exist, dashed for a grouping."""
    _b(x, y, w, h)
    st = (f"rounded=1;arcSize=6;whiteSpace=wrap;html=1;fillColor=none;strokeColor={stroke};"
          f"strokeWidth=2;{'dashed=1;dashPattern=8 6;' if dashed else ''}verticalAlign=top;"
          f"align=left;spacingLeft=12;spacingTop=4;fontSize=13;fontColor={TEXT};")
    return (f'<mxCell id="{i}" value="{esc(label)}" style="{st}" vertex="1" parent="1">'
            f'<mxGeometry x="{x}" y="{y}" width="{w}" height="{h}" as="geometry"/></mxCell>')


def text(i, label, x, y, w, h, size=13, color=None, align="left", bold=False):
    _b(x, y, w, h)
    st = (f"text;html=1;align={align};verticalAlign=middle;fontSize={size};"
          f"fontColor={color or TEXT};fontStyle={1 if bold else 0};")
    return (f'<mxCell id="{i}" value="{esc(label)}" style="{st}" vertex="1" parent="1">'
            f'<mxGeometry x="{x}" y="{y}" width="{w}" height="{h}" as="geometry"/></mxCell>')


def decision(i, label, x, y, w=280, h=96):
    _b(x, y, w, h)
    st = (f"rhombus;whiteSpace=wrap;html=1;fillColor={AMB_F};strokeColor={AMB_S};"
          f"strokeWidth=2;fontSize=12;fontColor={TEXT};")
    return (f'<mxCell id="{i}" value="{esc(label)}" style="{st}" vertex="1" parent="1">'
            f'<mxGeometry x="{x}" y="{y}" width="{w}" height="{h}" as="geometry"/></mxCell>')


def terminator(i, label, x, y, w, h, fill=GREY_F, stroke=GREY_S):
    _b(x, y, w, h)
    st = (f"rounded=1;arcSize=50;whiteSpace=wrap;html=1;fillColor={fill};strokeColor={stroke};"
          f"strokeWidth=2;fontSize=12;fontColor={TEXT};")
    return (f'<mxCell id="{i}" value="{esc(label)}" style="{st}" vertex="1" parent="1">'
            f'<mxGeometry x="{x}" y="{y}" width="{w}" height="{h}" as="geometry"/></mxCell>')


def edge(i, src, tgt, label="", exitX=None, exitY=None, entryX=None, entryY=None,
         lx=None, dashed=False, color=None, width=2):
    st = (f"html=1;rounded=0;strokeColor={color or ARROW};strokeWidth={width};fontSize=11;"
          f"fontColor={TEXT};labelBackgroundColor=#FFFFFF;endArrow=blockThin;endFill=1;endSize=6;"
          f"{'dashed=1;dashPattern=6 4;' if dashed else ''}")
    if exitX is not None:
        st += f"exitX={exitX};exitY={exitY};exitDx=0;exitDy=0;"
    if entryX is not None:
        st += f"entryX={entryX};entryY={entryY};entryDx=0;entryDy=0;"
    geo = (f'<mxGeometry relative="1" x="{lx}" as="geometry"/>' if lx is not None
           else '<mxGeometry relative="1" as="geometry"/>')
    return (f'<mxCell id="{i}" value="{esc(label)}" style="{st}" edge="1" parent="1" '
            f'source="{src}" target="{tgt}">{geo}</mxCell>')


def free_edge(i, x1, y1, x2, y2, label="", dashed=False, color=None, width=2,
              points=None, ret=False, align="center"):
    """An edge between two points rather than two shapes — for sequence diagrams."""
    st = (f"html=1;rounded=0;strokeColor={color or (MUTED if ret else ARROW)};"
          f"strokeWidth={1 if ret else width};endArrow={'openThin' if ret else 'blockThin'};"
          f"endFill={0 if ret else 1};endSize=6;"
          f"{'dashed=1;dashPattern=6 4;' if (dashed or ret) else ''}"
          f"fontSize=11;fontColor={TEXT};labelBackgroundColor=#FFFFFF;verticalAlign=bottom;"
          f"align={align};{'spacingLeft=6;' if align == 'left' else ''}")
    pts = ""
    if points:
        pts = "<Array as=\"points\">" + "".join(
            f'<mxPoint x="{px}" y="{py}"/>' for px, py in points) + "</Array>"
    _b(min(x1, x2), min(y1, y2) - 22, abs(x2 - x1) or 1, abs(y2 - y1) + 24)
    return (f'<mxCell id="{i}" value="{esc(label)}" style="{st}" edge="1" parent="1">'
            f'<mxGeometry relative="1" as="geometry">'
            f'<mxPoint x="{x1}" y="{y1}" as="sourcePoint"/>'
            f'<mxPoint x="{x2}" y="{y2}" as="targetPoint"/>{pts}</mxGeometry></mxCell>')


# --- composite shapes -------------------------------------------------------

def chain(cells, steps, cx=300, top=40, w=320, h=62, gap=30, prefix="c"):
    """A linear sequence. `steps` are (label, note) or (label, note, 'accent').

    `prefix` namespaces the cell ids. Two chains in one diagram with the same
    prefix produce duplicate ids, and a duplicate id makes draw.io fail the
    whole export with nothing but "Export failed" to go on.
    """
    y = top
    ids = []
    for n, s in enumerate(steps, 1):
        label, note = s[0], s[1]
        accent = len(s) > 2 and s[2] == "accent"
        i = f"{prefix}{n}"
        cells.append(box(i, f"{n}. {label}\n{note}", cx - w // 2, y, w, h,
                         GRN_F if accent else "#FFFFFF", GRN_S if accent else STROKE,
                         align="left", bold_first=True))
        ids.append(i)
        y += h + gap
    for n in range(len(ids) - 1):
        cells.append(edge(f"{prefix}e{n}", ids[n], ids[n + 1]))
    return ids, y


def gated(cells, steps, cx=300, top=40, w=330, gap=34, back_x=None):
    """A vertical pipeline where work alternates with gates.

    A step is a dict: {label, note?, gate?, back?, accent?}. A gate is drawn
    dashed with no fill and an eyebrow naming who or what does the checking,
    because a gate is a condition rather than work. `back` is the failure path,
    drawn as a red dashed arrow returning up the right-hand side.
    """
    back_x = back_x or cx + w // 2 + 150
    y = top
    ids = []
    for n, s in enumerate(steps, 1):
        i = f"g{n}"
        is_gate = bool(s.get("gate"))
        h = 62 if s.get("note") else 48
        if is_gate:
            _b(cx - w // 2, y, w, h)
            st = (f"rounded=1;arcSize=8;whiteSpace=wrap;html=1;fillColor=none;"
                  f"strokeColor={AMB_S};strokeWidth=2;dashed=1;dashPattern=8 6;"
                  f"fontSize=12;fontColor={TEXT};")
            val = (f"&lt;font color='{MUTED}'&gt;&lt;b&gt;{esc(s['gate']).upper()}&lt;/b&gt;"
                   f"&lt;/font&gt;&lt;br&gt;{esc(s['label'])}")
            cells.append(f'<mxCell id="{i}" value="{val}" style="{st}" vertex="1" parent="1">'
                         f'<mxGeometry x="{cx - w // 2}" y="{y}" width="{w}" height="{h}" as="geometry"/></mxCell>')
        else:
            accent = s.get("accent")
            label = s["label"] + ("\n" + s["note"] if s.get("note") else "")
            cells.append(box(i, label, cx - w // 2, y, w, h,
                             GRN_F if accent else FILL, GRN_S if accent else STROKE,
                             align="left", bold_first=bool(s.get("note"))))
        ids.append(i)
        if s.get("back"):
            cells.append(text(f"{i}bk", s["back"], cx + w // 2 + 16, y + h // 2 - 12, 250, 34,
                              size=11, color=RED_T))
        y += h + gap
    for n in range(len(ids) - 1):
        cells.append(edge(f"ge{n}", ids[n], ids[n + 1]))
    return ids, y


def layered(cells, layers, cx=300, top=40, fw=640, gap=34, vias=None, inner_h=58):
    """An input passing down through named layers, each holding one or more boxes.

    An item is `(label, note)` or `(label, note, icon_rel)`. With an icon, the
    logo sits inside the box at the left and the bold first line names the
    product beside it — the placement the Azure icon terms ask for, and one the
    frame-to-frame arrows can never cross because they run outside the boxes.

    `vias` labels those arrows: `vias[n]` rides the edge from layer n to layer
    n + 1. An unlabelled arrow only says "then"; a labelled one says what the
    next layer is handed.
    """
    y = top
    ids = []
    for n, (name, role, items) in enumerate(layers, 1):
        h = inner_h + 46
        fid = f"L{n}"
        cells.append(frame(fid, "", cx - fw // 2, y, fw, h, dashed=True))
        cells.append(text(f"{fid}n", name.upper(), cx - fw // 2 + 12, y + 4, fw - 24, 18,
                          size=10, color=TEXT, bold=True))
        if role:
            cells.append(text(f"{fid}r", role, cx - fw // 2 + 12, y + 21, fw - 24, 16,
                              size=10, color=MUTED))
        k = len(items)
        iw = (fw - 24 - (k - 1) * 10) // k
        for j, it in enumerate(items):
            lab, note = it[0], it[1]
            ic = it[2] if len(it) > 2 else None
            bx = cx - fw // 2 + 12 + j * (iw + 10)
            cells.append(box(f"{fid}i{j}", f"{lab}\n{note}" if note else lab,
                             bx, y + 42, iw, inner_h,
                             "#FFFFFF", STROKE, size=11, align="left", bold_first=bool(note),
                             pad_left=62 if ic else None))
            if ic:
                cells.append(node(f"{fid}c{j}", "", ic, bx + 12,
                                  y + 42 + (inner_h - 38) // 2, 38, 38))
        ids.append(fid)
        y += h + gap
    for n in range(len(ids) - 1):
        cells.append(edge(f"le{n}", ids[n], ids[n + 1],
                          (vias[n] if vias and n < len(vias) else "") or ""))
    return ids, y


def fanout(cells, hub, branches, join=None, result=None, cx=460, top=40, bw=230, bh=70):
    """One hub delegating to parallel branches, optionally converging again.

    Up to three branches sit in a row under the hub. Beyond that they stack in a
    column fed by a spine down the left, because a grid does not work here: with
    four boxes in two rows, every arrow to the second row has to cross a box in
    the first, and draw.io slices the labels it crosses. A spine with one stub
    per branch never crosses anything, at any branch count.
    """
    ids = {}
    cells.append(box("hub", f"{hub[0]}\n{hub[1]}" if hub[1] else hub[0],
                     cx - 170, top, 340, 62, FILL, STROKE, align="left", bold_first=bool(hub[1])))
    ids["hub"] = "hub"
    k = len(branches)
    hub_bottom = top + 62

    if k <= 3:
        total = k * bw + (k - 1) * 20
        x0 = cx - total // 2
        by = hub_bottom + 60
        for j, (lab, note) in enumerate(branches):
            bid = f"br{j}"
            cells.append(box(bid, f"{lab}\n{note}" if note else lab, x0 + j * (bw + 20), by, bw, bh,
                             "#FFFFFF", STROKE, size=11, align="left", bold_first=bool(note)))
            cells.append(edge(f"hb{j}", "hub", bid))
            ids[bid] = bid
        y = by + bh
    else:
        # A spine down the left, with a horizontal stub into each branch.
        spine_x = cx - 250
        by = hub_bottom + 54
        gap = 20
        for j, (lab, note) in enumerate(branches):
            bid = f"br{j}"
            y_j = by + j * (bh + gap)
            cells.append(box(bid, f"{lab}\n{note}" if note else lab, spine_x + 70, y_j, bw + 90, bh,
                             "#FFFFFF", STROKE, size=11, align="left", bold_first=bool(note)))
            cells.append(free_edge(f"hb{j}", spine_x, y_j + bh // 2, spine_x + 70, y_j + bh // 2))
            ids[bid] = bid
        last_mid = by + (k - 1) * (bh + gap) + bh // 2
        # The spine itself, from under the hub down to the last stub.
        cells.append(free_edge("spine", cx, hub_bottom, spine_x, last_mid, "",
                               points=[(spine_x, hub_bottom)], width=2))
        y = by + (k - 1) * (bh + gap) + bh
        # Remember the geometry so a join can mirror the spine on the right
        # instead of cutting diagonally back through the boxes.
        spine_geo = (spine_x + 70 + bw + 90, by, gap, bh)

    if join:
        jy = y + 66
        # The id is "jn", not "join": draw.io's headless exporter fails outright
        # on a cell whose id is the literal string "join", with only
        # "Export failed" to go on.
        cells.append(box("jn", f"{join[0]}\n{join[1]}" if join[1] else join[0],
                         cx - 170, jy, 340, 58, FILL, STROKE, align="left", bold_first=bool(join[1])))
        if k <= 3:
            for j in range(k):
                cells.append(edge(f"bj{j}", f"br{j}", "jn"))
        else:
            # Mirror the fan-out: a stub right out of each box onto a spine, and
            # one line down into the join. Anything else crosses the boxes below.
            right_x, by_, gap_, bh_ = spine_geo
            rx = right_x + 60
            for j in range(k):
                mid = by_ + j * (bh_ + gap_) + bh_ // 2
                cells.append(free_edge(f"bj{j}", right_x, mid, rx, mid, ""))
            first_mid = by_ + bh_ // 2
            cells.append(free_edge("rspine", rx, first_mid, cx, jy, "",
                                   points=[(rx, jy - 30), (cx, jy - 30)], width=2))
        y = jy + 58
    if result:
        ry = y + 66
        cells.append(box("res", f"{result[0]}\n{result[1]}" if result[1] else result[0],
                         cx - 190, ry, 380, 58, GRN_F, GRN_S, align="left", bold_first=bool(result[1])))
        if join:
            cells.append(edge("jr", "jn", "res"))
        elif k <= 3:
            # Without a join, a hub-to-result edge would be drawn straight down
            # THROUGH whichever branch sits under the hub. Converge from the
            # branches instead, which is also what the picture means.
            for j in range(k):
                cells.append(edge(f"jr{j}", f"br{j}", "res"))
        else:
            # Spine layout: mirror the fan-out on the right, exactly as a join
            # does, because diagonals here cut through every box they pass.
            right_x, by_, gap_, bh_ = spine_geo
            rx = right_x + 60
            for j in range(k):
                mid = by_ + j * (bh_ + gap_) + bh_ // 2
                cells.append(free_edge(f"jr{j}", right_x, mid, rx, mid, ""))
            cells.append(free_edge("rres", rx, by_ + bh_ // 2, cx, ry, "",
                                   points=[(rx, ry - 30), (cx, ry - 30)], width=2))
        y = ry + 58
    return ids, y


def lifeline(cells, i, label, cx, top, bottom, w=190, h=50):
    """A UML lifeline: the participant box plus its dashed line."""
    cells.append(box(f"{i}b", label, cx - w // 2, top, w, h, FILL, STROKE, size=12))
    st = "html=1;endArrow=none;strokeColor=#9AA5B1;strokeWidth=1;dashed=1;dashPattern=4 4;"
    cells.append(f'<mxCell id="{i}l" style="{st}" edge="1" parent="1">'
                 f'<mxGeometry relative="1" as="geometry">'
                 f'<mxPoint x="{cx}" y="{top + h}" as="sourcePoint"/>'
                 f'<mxPoint x="{cx}" y="{bottom}" as="targetPoint"/></mxGeometry></mxCell>')
    _b(cx - w // 2, top, w, bottom - top)


def selfmsg(cells, i, cx, y, label, drop=38, out=78):
    cells.append(free_edge(i, cx, y, cx, y + drop, label,
                           points=[(cx + out, y), (cx + out, y + drop)], align="left"))


def wrap(name, cells, pad=24):
    """Close the file, laying a white rectangle behind everything."""
    x0 = min(b[0] for b in BOUNDS) - pad
    y0 = min(b[1] for b in BOUNDS) - pad
    x1 = max(b[2] for b in BOUNDS) + pad
    y1 = max(b[3] for b in BOUNDS) + pad
    bg = (f'<mxCell id="bg" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#FFFFFF;'
          f'strokeColor=none;" vertex="1" parent="1">'
          f'<mxGeometry x="{x0}" y="{y0}" width="{x1 - x0}" height="{y1 - y0}" as="geometry"/></mxCell>')
    BOUNDS.clear()
    return ('<mxfile host="app.diagrams.net"><diagram name="' + esc(name) + '" id="'
            + esc(name).replace(" ", "") + '">'
            '<mxGraphModel dx="1200" dy="900" grid="0" gridSize="10" guides="1" tooltips="1" '
            'connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="850" '
            'pageHeight="1100" math="0" shadow="0"><root><mxCell id="0"/><mxCell id="1" parent="0"/>'
            + bg + "".join(cells) + '</root></mxGraphModel></diagram></mxfile>')


def write(out_dir, filename, name, cells):
    p = pathlib.Path(out_dir) / f"{filename}.drawio"
    p.write_text(wrap(name, cells))
    return p


# --- the share banner -------------------------------------------------------

BANNER_W, BANNER_H = 1200, 630

def banner(cells, eyebrow, headline, subhead, chain, vias=None, right_x=700, right_w=430):
    """A 1200x630 share card: words on the left, the thesis drawn on the right.

    `headline` and `subhead` are lists of lines — breaking them by hand beats
    trusting a wrap at this size, where one wrong break wastes a third of the
    card. `chain` is a list of (title, note, kind) with kind in bad / warn /
    good / plain, and `vias` labels the arrows between them.

    The layout is fixed on purpose. These cards are a set: the left column is
    identical across articles so the series is recognisable in a feed, and only
    the right-hand drawing changes.
    """
    PAL = {'bad': (RED_F, RED_S), 'warn': (AMB_F, AMB_S),
           'good': (GRN_F, GRN_S), 'plain': (GREY_F, GREY_S)}
    cells.append(box("canvas", "", 0, 0, BANNER_W, BANNER_H, "#FFFFFF", "none"))
    cells.append(text("eyebrow", eyebrow, 72, 96, 560, 24, size=17, color=BLUE, bold=True))
    y = 150
    for i, line in enumerate(headline):
        cells.append(text(f"h{i}", line, 72, y, 600, 62, size=52, bold=True))
        y += 62
    y += 26
    for i, line in enumerate(subhead):
        cells.append(text(f"s{i}", line, 72, y, 580, 34, size=23, color=MUTED))
        y += 34
    cells.append(box("rule", "", 72, max(y + 22, 402), 90, 4, BLUE, "none"))
    base = max(y + 22, 402) + 38
    cells.append(text("brand", "MSDEVBUILD", 72, base, 320, 28, size=19, bold=True))
    cells.append(text("byline", "Suthahar Jegatheesan", 72, base + 28, 320, 24, size=17, color=MUTED))

    n = len(chain)
    gap = 56 if n > 2 else 74
    bh = 72
    total = n * bh + (n - 1) * gap
    cy = (BANNER_H - total) // 2
    for i, (title, note, kind) in enumerate(chain):
        fill, stroke = PAL[kind]
        cells.append(box(f"r{i}", f"{title}\n{note}" if note else title,
                         right_x, cy + i * (bh + gap), right_w, bh,
                         fill, stroke, size=16, align="left", bold_first=bool(note)))
        if i:
            label = (vias or [])[i - 1] if vias and len(vias) >= i else ""
            colour = PAL[chain[i][2]][1] if chain[i][2] in ('bad', 'good') else ARROW
            y0 = cy + (i - 1) * (bh + gap) + bh
            cells.append(free_edge(f"rv{i}", right_x + right_w // 2, y0,
                                   right_x + right_w // 2, y0 + gap, label, color=colour))
    return cells


def flowchart(cells, start, steps, end, cx=300, top=30, reject_x=560):
    """A decision chain: rounded start, rhombus decisions, rounded end.

    `steps` is a list of either:
      ("decision text", "no-branch label", "kind")  -> a rhombus whose no path
          leaves right into a terminator, kind being bad / warn / plain
      ("process text", None, "process")             -> a plain rectangle

    Every branch is labelled, because an unlabelled fork makes the reader guess
    which way is which — the one thing a flowchart exists to remove.
    """
    PAL = {'bad': (RED_F, RED_S), 'warn': (AMB_F, AMB_S), 'plain': (GREY_F, GREY_S)}
    ids = []
    y = top
    cells.append(terminator("fc_start", start, cx - 130, y, 260, 48))
    ids.append("fc_start")
    y += 48 + 44
    for i, (label, no_label, kind) in enumerate(steps):
        i_id = f"fc{i}"
        if kind == 'process':
            cells.append(box(i_id, label, cx - 140, y, 280, 56, FILL, STROKE, size=12))
            h = 56
        else:
            cells.append(decision(i_id, label, cx - 140, y))
            h = 96
            fill, stroke = PAL.get(kind, PAL['bad'])
            r_id = f"fcr{i}"
            cells.append(terminator(r_id, no_label, reject_x, y + (h - 48) // 2, 190, 48, fill, stroke))
            cells.append(edge(f"fcn{i}", i_id, r_id, "no", exitX=1, exitY=0.5,
                              color=stroke, dashed=True))
        cells.append(edge(f"fce{i}", ids[-1], i_id, "" if i == 0 or steps[i-1][2] == 'process' else "yes"))
        ids.append(i_id)
        y += h + 44
    cells.append(terminator("fc_end", end, cx - 130, y, 260, 48, GRN_F, GRN_S))
    cells.append(edge("fce_end", ids[-1], "fc_end",
                      "" if steps[-1][2] == 'process' else "yes"))
    return ids, y + 48
