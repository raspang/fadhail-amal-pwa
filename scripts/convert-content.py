# Converts the Android SahabaContent.java table of contents into public/data/content.json.
# Usage: python3 scripts/convert-content.py ../totolankomgasahaba/app/src/main/java/com/nzpenterprises/totolankomgasahaba/sahaba/SahabaContent.java public/data/content.json
import re, json, sys
src = open(sys.argv[1], encoding='utf-8').read()
STR = r'"((?:[^"\\]|\\.)*)"'
def unesc(s): return json.loads('"' + s + '"')
cats = []
for m in re.finditer(r'CATEGORIES\.add\(new Category\(' + STR + r', ' + STR + r', ' + STR + r', R\.drawable\.(\w+)(, Category\.LANG_(\w+))?\)\);', src):
    cats.append(dict(id=unesc(m[1]), name=unesc(m[2]), subtitle=unesc(m[3]), icon=m[4], lang='eng' if m[6]=='ENGLISH' else 'mrw'))
# load order
order = re.findall(r'^\s+(load\w+)\(\);', src.split('public static void loadCategory')[0], re.M)
bodies = {m[1]: m[2] for m in re.finditer(r'private static void (load\w+)\(\)\s*\{(.*?)\n    \}', src, re.S)}
items = []; counter = 0; unknown = []
for name in order:
    title = None
    for line in bodies[name].split('\n'):
        s = line.strip()
        if not s or s.startswith('//'): continue
        if s == 'String title;': continue
        if s.startswith('idCounter++;'): counter += 1; continue
        m = re.fullmatch(r'(?:String )?title = ' + STR + ';', s)
        if m: title = unesc(m[1]); continue
        m = re.fullmatch(r'addItem\((createItem|createSplitItem)\((.*)\)\);', s)
        if m:
            raw = re.findall(r'title|' + STR, m[2])
            toks = re.findall(r'(title)|' + STR, m[2])
            args = [title if t[0] else unesc(t[1]) for t in toks]
            chap, details = args[0], args[1]
            cat, f = ('sahabah', args[2]) if len(args) == 3 else (args[2], args[3])
            if m[1] == 'createItem':
                iid = str(counter); counter += 1
            else:
                iid = cat + '/' + f
            items.append(dict(id=iid, chapter=chap, title=details, cat=cat, file=cat + '/' + f + '.html'))
            continue
        unknown.append((name, s))
print('categories', len(cats), 'items', len(items), 'unknown', len(unknown), file=sys.stderr)
for u in unknown[:20]: print(u, file=sys.stderr)
json.dump(dict(categories=cats, items=items), open(sys.argv[2], 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
