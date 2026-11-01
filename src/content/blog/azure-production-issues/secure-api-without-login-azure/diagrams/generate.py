import base64, pathlib, sys

ICON = pathlib.Path('public/icons')
def img(rel):
    return "data:image/svg+xml," + base64.b64encode((ICON / rel).read_bytes()).decode()

BLUE, ARROW, TEXT = "#4D9FDB", "#2E5C8A", "#1F2933"

# Every shape records its bounds so wrap() can lay a white rectangle behind the
# whole diagram. draw.io exports a transparent background by default, and the
# labels are near-black: on the site's dark theme that would be invisible. A
# baked-in white backing means one asset reads correctly in both themes.
BOUNDS = []
def _b(x, y, w, h):
    BOUNDS.append((x, y, x + w, y + h))
RED_F, RED_S, RED_T = "#F8CECC", "#B85450", "#A02C2C"
GRN_F, GRN_S = "#D5E8D4", "#82B366"

def node(i, label, icon, x, y, w=54, h=54):
    _b(x, y, w, h + 34)  # the label hangs below the icon
    st = (f"shape=image;html=1;verticalLabelPosition=bottom;verticalAlign=top;imageAspect=0;"
          f"aspect=fixed;image={img(icon)};fontSize=13;fontColor={TEXT};labelBackgroundColor=none;")
    return f'<mxCell id="{i}" value="{label}" style="{st}" vertex="1" parent="1"><mxGeometry x="{x}" y="{y}" width="{w}" height="{h}" as="geometry"/></mxCell>'

def frame(i, label, x, y, w, h, dashed=False, stroke=None):
    _b(x, y, w, h)
    st = (f"rounded=1;arcSize=6;whiteSpace=wrap;html=1;fillColor=none;strokeColor={stroke or BLUE};"
          f"strokeWidth=2;{'dashed=1;dashPattern=8 6;' if dashed else ''}verticalAlign=top;align=left;"
          f"spacingLeft=12;spacingTop=4;fontSize=14;fontColor={TEXT};")
    return f'<mxCell id="{i}" value="{label}" style="{st}" vertex="1" parent="1"><mxGeometry x="{x}" y="{y}" width="{w}" height="{h}" as="geometry"/></mxCell>'

def text(i, label, x, y, w, h, size=14, color=None, align="left", bold=False):
    _b(x, y, w, h)
    st = f"text;html=1;align={align};verticalAlign=middle;fontSize={size};fontColor={color or TEXT};fontStyle={1 if bold else 0};"
    return f'<mxCell id="{i}" value="{label}" style="{st}" vertex="1" parent="1"><mxGeometry x="{x}" y="{y}" width="{w}" height="{h}" as="geometry"/></mxCell>'

def box(i, label, x, y, w, h, fill, stroke, size=14):
    _b(x, y, w, h)
    st = f"rounded=1;arcSize=8;whiteSpace=wrap;html=1;fillColor={fill};strokeColor={stroke};strokeWidth=2;fontSize={size};fontColor={TEXT};"
    return f'<mxCell id="{i}" value="{label}" style="{st}" vertex="1" parent="1"><mxGeometry x="{x}" y="{y}" width="{w}" height="{h}" as="geometry"/></mxCell>'

def edge(i, src, tgt, label="", exitX=None, exitY=None, lx=None, dashed=False, color=None,
         entryX=None, entryY=None, ortho=False):
    st = ("edgeStyle=orthogonalEdgeStyle;" if ortho else "")
    st += (f"html=1;rounded=0;strokeColor={color or ARROW};strokeWidth=2;fontSize=12;fontColor={TEXT};"
          f"labelBackgroundColor=#FFFFFF;endArrow=blockThin;endFill=1;endSize=6;"
          f"{'dashed=1;' if dashed else ''}")
    if exitX is not None: st += f"exitX={exitX};exitY={exitY};exitDx=0;exitDy=0;"
    if entryX is not None: st += f"entryX={entryX};entryY={entryY};entryDx=0;entryDy=0;"
    geo = f'<mxGeometry relative="1" x="{lx}" as="geometry"/>' if lx is not None else '<mxGeometry relative="1" as="geometry"/>'
    return f'<mxCell id="{i}" value="{label}" style="{st}" edge="1" parent="1" source="{src}" target="{tgt}">{geo}</mxCell>'

def wrap(name, cells):
    pad = 24
    x0 = min(b[0] for b in BOUNDS) - pad
    y0 = min(b[1] for b in BOUNDS) - pad
    x1 = max(b[2] for b in BOUNDS) + pad
    y1 = max(b[3] for b in BOUNDS) + pad
    bg = (f'<mxCell id="bg" value="" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#FFFFFF;'
          f'strokeColor=none;" vertex="1" parent="1">'
          f'<mxGeometry x="{x0}" y="{y0}" width="{x1 - x0}" height="{y1 - y0}" as="geometry"/></mxCell>')
    cells = [bg] + list(cells)
    BOUNDS.clear()
    return ('<mxfile host="app.diagrams.net"><diagram name="' + name + '" id="' + name.replace(' ', '') + '">'
            '<mxGraphModel dx="1200" dy="900" grid="0" gridSize="10" guides="1" tooltips="1" connect="1" '
            'arrows="1" fold="1" page="1" pageScale="1" pageWidth="850" pageHeight="1100" math="0" shadow="0">'
            '<root><mxCell id="0"/><mxCell id="1" parent="0"/>' + ''.join(cells) + '</root></mxGraphModel></diagram></mxfile>')

def tier(cells, i, name, label, icon, y, h=128, reject=None):
    """A dashed tier frame with its name outside on the right, one node inside."""
    cells.append(frame(f'{i}f', '', 205, y, 270, h, dashed=True))
    cells.append(text(f'{i}n', name, 494, y + 40, 150, 24))
    cells.append(node(i, label, icon, 313, y + 22))
    if reject:
        cells.append(text(f'{i}r', reject, 494, y + 66, 250, 40, size=11, color=RED_T))

# ---------------------------------------------------------------- Figure 1 ---
c = []
c.append(frame('grp', 'Anyone on the internet', 60, 30, 560, 170))
c.append(node('app',  'Your Flutter app',        'material/smartphone.svg', 175, 85))
c.append(node('curl', 'curl, Postman, a script', 'material/terminal.svg',   455, 85))
tier(c, 'svc', 'Web tier',  'App Service', 'azure/app-service.svg', 262)
tier(c, 'db',  'Data tier', 'Cosmos DB',   'azure/cosmos-db.svg',   448)
c.append(box('bad', '200 OK &#8212; the whole catalogue,&lt;br&gt;internal fields included', 155, 622, 370, 62, RED_F, RED_S))
c.append(edge('e1', 'grp', 'svcf', 'GET /api/catalog/search', exitX=0.28, exitY=1, lx=-0.45))
c.append(edge('e2', 'grp', 'svcf', 'the same request, byte for byte', exitX=0.72, exitY=1, lx=0.15))
c.append(edge('e3', 'svcf', 'dbf',  'Unbounded query, no caller to attribute'))
c.append(edge('e4', 'dbf',  'bad', ''))
pathlib.Path(sys.argv[1] + '/public-api-without-login-insecure-architecture.drawio').write_text(wrap('Figure 1', c))

# ---------------------------------------------------------------- Figure 2 ---
c = []
c.append(frame('grp', 'Anyone on the internet', 60, 30, 560, 190))
c.append(node('app',  'Your Flutter app',       'material/smartphone.svg', 175, 75))
c.append(text('appn', 'guest JWT, 15 minutes',  105, 148, 200, 20, size=11, color=TEXT, align='center'))
c.append(node('curl', 'curl with a copied token','material/terminal.svg',  455, 75))
c.append(text('curln','expires, and every call is counted', 375, 148, 250, 20, size=11, color=RED_T, align='center'))
tier(c, 'pol', 'Policy tier', 'Fallback deny, then CatalogRead', 'material/lock.svg', 282,
     reject='&#10007; any route nobody explicitly opened')
tier(c, 'dto', 'Web tier',    'CatalogPublicDto',                'material/visibility-off.svg', 478)
tier(c, 'db',  'Data tier',   'Cosmos DB',                       'azure/cosmos-db.svg', 664)
c.append(box('ok', 'Catalogue JSON, public fields only&lt;br&gt;Abuse is now scoped, counted and visible', 145, 838, 390, 62, GRN_F, GRN_S))
c.append(edge('e1', 'grp', 'polf', 'Authorization: Bearer + guest JWT', exitX=0.28, exitY=1, lx=-0.5))
c.append(edge('e2', 'grp', 'polf', 'sub=guest:… , scope=catalog.read', exitX=0.72, exitY=1, lx=0.2))
c.append(edge('e3', 'polf', 'dtof', 'Authorised, 60 calls per minute per caller'))
c.append(edge('e4', 'dtof', 'dbf',  'Query filtered to released items only'))
c.append(edge('e5', 'dbf',  'ok',  ''))
pathlib.Path(sys.argv[1] + '/guest-token-authorization-policy-architecture.drawio').write_text(wrap('Figure 2', c))

# ---------------------------------------------------------------- Figure 3 ---
c = []
c.append(frame('grp', 'Anyone on the internet', 60, 30, 560, 190))
c.append(node('app',  'Your Flutter app',        'material/smartphone.svg', 175, 75))
c.append(text('appn', 'guest JWT + attestation', 105, 148, 200, 20, size=11, align='center'))
c.append(node('curl', 'curl, Postman, a script', 'material/terminal.svg',   455, 75))
c.append(text('curln','no attestation token it can obtain', 375, 148, 250, 20, size=11, color=RED_T, align='center'))
tier(c, 'fd',  'Edge tier',    'Front Door + WAF',   'azure/front-door.svg',     282,
     reject='&#10007; known bad agents, data-centre ranges')
tier(c, 'apim','Gateway tier', 'API Management',     'azure/api-management.svg', 478,
     reject='&#10007; curl: 401, no attestation header')
tier(c, 'svc', 'Policy tier',  'App Service',        'azure/app-service.svg',    664)
tier(c, 'db',  'Data tier',    'Cosmos DB',          'azure/private-link.svg',   850)
c.append(text('dbn2', 'private endpoint, no public path', 494, 916, 250, 20, size=11))
c.append(box('ok', 'Cached catalogue JSON, public fields only&lt;br&gt;A scraper now costs a CDN hit and shows on a dashboard', 125, 1024, 430, 62, GRN_F, GRN_S))
c.append(edge('e1', 'grp',  'fdf',  'Authorization + X-Firebase-AppCheck', exitX=0.28, exitY=1, lx=-0.5))
c.append(edge('e2', 'grp',  'fdf',  'one header short', exitX=0.72, exitY=1, lx=0.25, dashed=True, color=RED_S))
c.append(edge('e3', 'fdf',   'apimf','Cache miss only &#8212; repeats never get this far'))
c.append(edge('e4', 'apimf', 'svcf', 'Verified token, rate-limited by sub'))
c.append(edge('e5', 'svcf',  'dbf',  'One partition-scoped read'))
c.append(edge('e6', 'dbf',   'ok',  ''))
pathlib.Path(sys.argv[1] + '/secure-public-api-azure-front-door-apim-architecture.drawio').write_text(wrap('Figure 3', c))
print("3 .drawio files written")


# =============================================================== Figure 4 ====
# A UML sequence diagram: lifelines, solid call arrows, dashed returns, and
# self-calls drawn as loops. This is the shape for "who talks to whom, in what
# order" — the part a box-and-arrow architecture diagram cannot show.

def lifeline(cells, i, label, cx, top, bottom, w=190, h=50):
    cells.append(box(f'{i}b', label, cx - w // 2, top, w, h, "#DAE8FC", "#6C8EBF", size=12))
    st = f"html=1;endArrow=none;strokeColor=#9AA5B1;strokeWidth=1;dashed=1;dashPattern=4 4;"
    cells.append(f'<mxCell id="{i}l" style="{st}" edge="1" parent="1">'
                 f'<mxGeometry relative="1" as="geometry">'
                 f'<mxPoint x="{cx}" y="{top + h}" as="sourcePoint"/>'
                 f'<mxPoint x="{cx}" y="{bottom}" as="targetPoint"/></mxGeometry></mxCell>')
    _b(cx - w // 2, top, w, bottom - top)

def msg(cells, i, x1, x2, y, label, ret=False):
    st = (f"html=1;rounded=0;strokeColor={'#6B7280' if ret else ARROW};strokeWidth={1 if ret else 2};"
          f"endArrow={'openThin' if ret else 'blockThin'};endFill={0 if ret else 1};endSize=6;"
          f"{'dashed=1;dashPattern=6 4;' if ret else ''}"
          f"fontSize=11;fontColor={TEXT};labelBackgroundColor=#FFFFFF;verticalAlign=bottom;")
    cells.append(f'<mxCell id="{i}" value="{label}" style="{st}" edge="1" parent="1">'
                 f'<mxGeometry relative="1" as="geometry">'
                 f'<mxPoint x="{x1}" y="{y}" as="sourcePoint"/>'
                 f'<mxPoint x="{x2}" y="{y}" as="targetPoint"/></mxGeometry></mxCell>')
    _b(min(x1, x2), y - 22, abs(x2 - x1), 24)

def selfmsg(cells, i, cx, y, label, drop=38, out=78):
    st = (f"html=1;rounded=0;strokeColor={ARROW};strokeWidth=2;endArrow=blockThin;endFill=1;endSize=6;"
          f"fontSize=11;fontColor={TEXT};labelBackgroundColor=#FFFFFF;align=left;spacingLeft=6;")
    cells.append(f'<mxCell id="{i}" value="{label}" style="{st}" edge="1" parent="1">'
                 f'<mxGeometry relative="1" as="geometry">'
                 f'<mxPoint x="{cx}" y="{y}" as="sourcePoint"/>'
                 f'<mxPoint x="{cx}" y="{y + drop}" as="targetPoint"/>'
                 f'<Array as="points"><mxPoint x="{cx + out}" y="{y}"/>'
                 f'<mxPoint x="{cx + out}" y="{y + drop}"/></Array></mxGeometry></mxCell>')
    _b(cx, y - 18, out + 240, drop + 24)

c = []
APP, ATT, API, GW = 120, 400, 690, 980
BOT = 620
lifeline(c, 'app', 'Flutter app',                    APP, 30, BOT)
lifeline(c, 'att', 'Play Integrity / App Attest',    ATT, 30, BOT)
lifeline(c, 'api', 'Your API &#8212; /session/guest', API, 30, BOT)
lifeline(c, 'gw',  'API Management &#8212; /catalog', GW,  30, BOT)
msg(c, 'm1', APP, ATT, 132, '1. requestIntegrityToken()')
msg(c, 'm2', ATT, APP, 176, '2. attestation JWT, short-lived', ret=True)
msg(c, 'm3', APP, API, 236, '3. POST /api/session/guest &#8212; no credentials, attestation header only')
selfmsg(c, 'm4', API, 276, '4. verify attestation against Google JWKS')
msg(c, 'm5', API, APP, 356, '5. guest JWT &#8212; 15 min, sub=guest:…, scope=catalog.read', ret=True)
msg(c, 'm6', APP, GW,  416, '6. GET /api/catalog/search &#8212; Authorization + X-Firebase-AppCheck')
selfmsg(c, 'm7', GW, 456, '7. validate-jwt, then rate-limit by sub')
msg(c, 'm8', GW, APP, 536, '8. 200 &#8212; catalogue JSON, public fields only', ret=True)
c.append(text('note', 'The user never sees a login screen. Steps 1&#8211;5 happen at app start, before anyone taps anything.',
              80, 572, 760, 24, size=11, color="#6B7280"))
pathlib.Path(sys.argv[1] + '/guest-token-app-check-sequence-diagram.drawio').write_text(wrap('Figure 4', c))

# =============================================================== Figure 5 ====
# A flowchart in the standard shapes: rounded terminators, rectangles for work,
# rhombuses for decisions, every branch labelled.

def decision(cells, i, label, x, y, w=280, h=96):
    _b(x, y, w, h)
    st = f"rhombus;whiteSpace=wrap;html=1;fillColor=#FFF2CC;strokeColor=#D6B656;strokeWidth=2;fontSize=12;fontColor={TEXT};"
    return cells.append(f'<mxCell id="{i}" value="{label}" style="{st}" vertex="1" parent="1"><mxGeometry x="{x}" y="{y}" width="{w}" height="{h}" as="geometry"/></mxCell>')

def terminator(cells, i, label, x, y, w, h, fill, stroke):
    _b(x, y, w, h)
    st = f"rounded=1;arcSize=50;whiteSpace=wrap;html=1;fillColor={fill};strokeColor={stroke};strokeWidth=2;fontSize=12;fontColor={TEXT};"
    return cells.append(f'<mxCell id="{i}" value="{label}" style="{st}" vertex="1" parent="1"><mxGeometry x="{x}" y="{y}" width="{w}" height="{h}" as="geometry"/></mxCell>')

c = []
CX = 300
terminator(c, 'start', 'Anonymous request arrives', CX - 130, 30, 260, 48, "#E1E4E8", "#6B7280")
decision(c, 'd1', 'Attestation header&lt;br&gt;present and valid?', CX - 140, 118)
decision(c, 'd2', 'Guest token signed&lt;br&gt;and not expired?', CX - 140, 262)
decision(c, 'd3', 'scope includes&lt;br&gt;catalog.read?',        CX - 140, 406)
decision(c, 'd4', 'Under 60 calls a minute&lt;br&gt;for this sub?', CX - 140, 550)
c.append(box('work', 'Query released items, map to CatalogPublicDto', CX - 140, 700, 280, 56, "#DAE8FC", "#6C8EBF", size=12))
terminator(c, 'ok', '200 &#8212; public fields only', CX - 130, 806, 260, 48, GRN_F, GRN_S)
terminator(c, 'r1', '401 Unauthorized', 560, 142, 170, 48, RED_F, RED_S)
terminator(c, 'r2', '401 Unauthorized', 560, 286, 170, 48, RED_F, RED_S)
terminator(c, 'r3', '403 Forbidden',    560, 430, 170, 48, RED_F, RED_S)
terminator(c, 'r4', '429 Too Many Requests', 560, 574, 170, 48, RED_F, RED_S)
for i, (a, b) in enumerate([('start','d1'), ('d1','d2'), ('d2','d3'), ('d3','d4'), ('d4','work'), ('work','ok')]):
    c.append(edge(f'y{i}', a, b, '' if a in ('start','work') else 'yes'))
for i, (a, b) in enumerate([('d1','r1'), ('d2','r2'), ('d3','r3'), ('d4','r4')]):
    c.append(edge(f'n{i}', a, b, 'no', exitX=1, exitY=0.5, color=RED_S, dashed=True))
pathlib.Path(sys.argv[1] + '/anonymous-api-request-decision-flowchart.drawio').write_text(wrap('Figure 5', c))
print("5 .drawio files written")

# =============================================================== Figure 2 ====
# The bypass, as a step flow. Not an architecture and not a decision, so it is
# neither of the other two shapes: a numbered chain of things a person does,
# ending in the outcome.

def step(cells, i, n, label, note, y, x=190, w=320, h=62):
    _b(x, y, w, h)
    st = (f"rounded=1;arcSize=10;whiteSpace=wrap;html=1;fillColor=#FFFFFF;strokeColor=#6C8EBF;"
          f"strokeWidth=2;align=left;spacingLeft=14;verticalAlign=middle;fontSize=12;fontColor={TEXT};")
    val = f"&lt;b&gt;{n}. {label}&lt;/b&gt;&lt;br&gt;&lt;font color='#6B7280'&gt;{note}&lt;/font&gt;"
    cells.append(f'<mxCell id="{i}" value="{val}" style="{st}" vertex="1" parent="1">'
                 f'<mxGeometry x="{x}" y="{y}" width="{w}" height="{h}" as="geometry"/></mxCell>')

c = []
c.append(node('term', '', 'material/terminal.svg', 326, 40, 48, 48))
c.append(text('hdr', 'No tooling. Four minutes in a browser that was already open.',
              150, 104, 400, 22, size=11, color="#6B7280", align='center'))
step(c, 's1', 1, 'Open the web app',        'Developer tools, Network tab',                 150)
step(c, 's2', 2, 'Search for anything',     'Find the /api/catalog/search request',         242)
step(c, 's3', 3, 'Right-click, Copy as cURL','Every header comes along, X-Client-App too',  334)
step(c, 's4', 4, 'Paste into a terminal',   '200 OK and a JSON body. No session, no cookie', 426)
step(c, 's5', 5, 'Loop over the alphabet',  'Walk the entire catalogue, page by page',      518)
c.append(box('out', 'The app was never opened.&lt;br&gt;Nothing the server checked required it.',
             170, 626, 360, 60, RED_F, RED_S, size=12))
for i, (a, b) in enumerate([('s1','s2'), ('s2','s3'), ('s3','s4'), ('s4','s5'), ('s5','out')]):
    c.append(edge(f'a{i}', a, b, ''))
pathlib.Path(sys.argv[1] + '/attacker-copy-as-curl-bypass-steps.drawio').write_text(wrap('Figure 2', c))
print("6 .drawio files written")


# =============================================================== Figure 7 ====
# The middleware `if`, drawn as a flowchart. The condition is an OR, so it is
# two independent doors rather than one gate, and each door is opened by a
# header the caller sets. The colours are deliberately inverted: the allowed
# path is red, because reaching it is the bug, and the 403 is neutral grey
# because it is the one branch an attacker never lands on.

def sticky(cells, i, label, x, y, w=270, h=64):
    """A dashed white note that sits beside a shape without being part of the flow."""
    _b(x, y, w, h)
    st = ("rounded=1;arcSize=10;whiteSpace=wrap;html=1;fillColor=#FFFFFF;strokeColor=#9AA5B1;"
          "strokeWidth=1;dashed=1;dashPattern=4 4;align=center;verticalAlign=middle;"
          "fontSize=11;fontColor=#6B7280;")
    cells.append(f'<mxCell id="{i}" value="{label}" style="{st}" vertex="1" parent="1">'
                 f'<mxGeometry x="{x}" y="{y}" width="{w}" height="{h}" as="geometry"/></mxCell>')

c = []
CX = 490
GREY_F, GREY_S = "#E1E4E8", "#6B7280"
terminator(c, 'start', 'Request reaches the middleware', CX - 130, 30, 260, 48, GREY_F, GREY_S)
c.append(text('ornote', 'The condition is an &lt;b&gt;OR&lt;/b&gt;, so this is not one gate.&lt;br&gt;'
                        'Two independent doors, and either one alone opens it.',
              670, 30, 310, 48, size=12, color=TEXT))
decision(c, 'd1', 'Door 1&lt;br&gt;Origin header contains&lt;br&gt;msdevbuild.com?', CX - 150, 118, 300, 104)
decision(c, 'd2', 'Door 2&lt;br&gt;X-Client-App header equals&lt;br&gt;msdevbuild-mobile?', CX - 150, 310, 300, 104)
sticky(c, 'c1', 'Anyone can set this:&lt;br&gt;curl -H &quot;Origin: https://msdevbuild.com&quot;', 30, 138)
sticky(c, 'c2', 'Anyone can set this:&lt;br&gt;curl -H &quot;X-Client-App: msdevbuild-mobile&quot;', 30, 330)
terminator(c, 'allow', 'await next() &#8212; request allowed', 730, 232, 250, 64, RED_F, RED_S)
c.append(text('allown', '&#10007; The outcome you did not want.&lt;br&gt;Either door alone reaches it.',
              710, 304, 290, 40, size=11, color=RED_T, align='center'))
terminator(c, 'deny', '403 Forbidden', CX - 130, 500, 260, 48, GREY_F, GREY_S)
c.append(text('denyn', 'Only a caller who set neither header lands here,&lt;br&gt;which is to say: never an attacker.',
              CX - 170, 556, 340, 40, size=11, color=GREY_S, align='center'))
c.append(edge('e0', 'start', 'd1'))
c.append(edge('n1', 'd1', 'd2', 'no'))
c.append(edge('n2', 'd2', 'deny', 'no', color=GREY_S))
c.append(edge('y1', 'd1', 'allow', 'yes', exitX=1, exitY=0.5, entryX=0, entryY=0.25,
              color=RED_S, ortho=True, lx=-0.7))
c.append(edge('y2', 'd2', 'allow', 'yes', exitX=1, exitY=0.5, entryX=0, entryY=0.8,
              color=RED_S, ortho=True, lx=-0.7))
pathlib.Path(sys.argv[1] + '/origin-header-client-app-check-bypass-flowchart.drawio').write_text(
    wrap('Origin header check', c))
print("7 .drawio files written")
