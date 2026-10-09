with open('C:/Dropbox/Opencode/Academic Trial GProject/Demo Game/index.html', 'rb') as f:
    data = f.read()

# English: "A game is a loop, not a pile of features." -> "The core loop: action \u2192 feedback \u2192 challenge \u2192 repeat"
old_en = b"head:'A game is a loop, not a pile of features.'"
new_en = b"head:'The core loop: action \xe2\x86\x92 feedback \xe2\x86\x92 challenge \xe2\x86\x92 repeat.'"
idx = data.find(old_en)
if idx >= 0:
    data = data[:idx] + new_en + data[idx+len(old_en):]
    print("Updated EN")
else:
    print("EN not found")

# Chinese: "一個遊戲是一個迴圈，不是一堆功能。" -> "核心迴圈：行動 \u2192 回饋 \u2192 挑戰 \u2192 重複"
old_zh = b"head:'\xe4\xb8\x80\xe5\x80\x8b\xe9\x81\x8a\xe6\x88\xb2\xe6\x98\xaf\xe4\xb8\x80\xe5\x80\x8b\xe8\xbf\xb4\xe5\x9c\x88\xef\xbc\x8c\xe4\xb8\x8d\xe6\x98\xaf\xe4\xb8\x80\xe5\xa0\x86\xe5\x8a\x9f\xe8\x83\xbd\xe3\x80\x82'"
new_zh = b"head:'\xe6\xa0\xb8\xe5\xbf\x83\xe8\xbf\xb4\xe5\x9c\x88\xef\xbc\x9a\xe8\xa1\x8c\xe5\x8b\x95 \xe2\x86\x92 \xe5\x9b\x9e\xe9\xa5\x8b \xe2\x86\x92 \xe6\x8c\x91\xe6\x88\xb0 \xe2\x86\x92 \xe9\x87\x8d\xe8\xa4\x87'"
idx = data.find(old_zh)
if idx >= 0:
    data = data[:idx] + new_zh + data[idx+len(old_zh):]
    print("Updated ZH")
else:
    print("ZH not found")

with open('C:/Dropbox/Opencode/Academic Trial GProject/Demo Game/index.html', 'wb') as f:
    f.write(data)

print("Done")