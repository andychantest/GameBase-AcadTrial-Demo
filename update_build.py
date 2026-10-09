with open('C:/Dropbox/Opencode/Academic Trial GProject/Demo Game/stages/04-learning/index.html', 'r', encoding='utf-8', errors='replace') as f:
    s = f.read()
s = s.replace('v=20261008a', 'v=20261009a')
s = s.replace("window.APP_BUILD = '20261008a'", "window.APP_BUILD = '20261009a'")
with open('C:/Dropbox/Opencode/Academic Trial GProject/Demo Game/stages/04-learning/index.html', 'w', encoding='utf-8') as f:
    f.write(s)
print('Stage 4 updated')

with open('C:/Dropbox/Opencode/Academic Trial GProject/Demo Game/stages/03-meaning/index.html', 'r', encoding='utf-8', errors='replace') as f:
    s = f.read()
s = s.replace('v=20261008a', 'v=20261009a')
with open('C:/Dropbox/Opencode/Academic Trial GProject/Demo Game/stages/03-meaning/index.html', 'w', encoding='utf-8') as f:
    f.write(s)
print('Stage 3 updated')