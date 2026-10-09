with open('C:/Dropbox/Opencode/Academic Trial GProject/Demo Game/index.html', 'rb') as f:
    data = f.read()

# 1. Remove renderBars function
start = data.find(b'function renderBars()')
if start >= 0:
    next_func = data.find(b'function ', start+1)
    if next_func >= 0:
        data = data[:start] + data[next_func:]

# 2. Remove renderBars(); from select function
idx = data.find(b'renderTabs(); renderNotes(s); renderBars();')
if idx >= 0:
    data = data[:idx] + b'renderTabs(); renderNotes(s);' + data[idx+len(b'renderTabs(); renderNotes(s); renderBars();'):]

# 3. Remove growthCap from applyLang's m object
idx = data.find(b"growthCap:['Scale',")
if idx >= 0:
    comma_idx = data.find(b',', idx)
    prev_comma = data.rfind(b',', 0, idx)
    if prev_comma >= 0:
        data = data[:prev_comma] + data[comma_idx+1:]
    else:
        data = data[:idx] + data[comma_idx+1:]

# 4. Remove $('growthSub').textContent = ... line
idx = data.find(b"$('growthSub').textContent")
if idx >= 0:
    end = data.find(b';\r\n', idx)
    if end >= 0:
        data = data[:idx] + data[end+2:]

with open('C:/Dropbox/Opencode/Academic Trial GProject/Demo Game/index.html', 'wb') as f:
    f.write(data)

print("Done")