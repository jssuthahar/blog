# In Python, a name is a sticker, not a box

Topic: How mutable and immutable variables work in Python
Runtime: ~21s across 8 stages (1080x1920)

## Caption

b = a does not copy your list.

Both names point at the same object, so b.append(4) changes what a shows. A string does the opposite — s += "!" cannot edit the string, so Python builds a new one and moves only s.

That single idea explains the mutable default argument bug too.

Which one caught you first?

#python #pythonprogramming #learnpython #coding #programming #softwareengineering #developer #codenewbie #pythontips #devcommunity #msdevbuild

## Stage breakdown

01. **You changed b, a changed too** (2500ms) — A list assigned to a second name is not a copy. Both names sit on one object.
02. **b = a copies the sticker** (2600ms) — The list is built once in memory. The second line just points another name at it.
03. **A list is mutable** (2800ms) — append edits the object itself. The id never changes, so both names show the new value.
04. **A string is immutable** (2900ms) — It cannot be edited, so += builds a new object and moves only that one name.
05. **Which types are which** (2400ms) — Numbers, strings and tuples cannot change. Lists, dicts and sets can.
06. **This is the classic bug** (2700ms) — A mutable default argument is created once, then quietly reused by every call.
07. **The fix is a fresh object** (2500ms) — Default to None and build the list inside, or copy before you mutate.
08. **Mutate or rebind** (2600ms) — Every confusing line in Python comes down to which of these two it is doing.

---
MSDevBuild · Multi-Stack Dev Build · by Suthahar
https://blog.msdevbuild.com/
