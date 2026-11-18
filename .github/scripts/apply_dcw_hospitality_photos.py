from pathlib import Path
import re

p=Path("index.html")
page=p.read_text(encoding="utf-8")
markup=Path("dcw-hospitality-photos.html").read_text(encoding="utf-8").strip()
css=Path("dcw-hospitality-photos.css").read_text(encoding="utf-8").strip()
js=Path("dcw-hospitality-photos.js").read_text(encoding="utf-8").strip()

photos_pattern=r'<div id="hospitalityPhotos" class="hospitality-panel" role="tabpanel" aria-labelledby="hospitalityPhotosTab" hidden>.*?</div>(?=\s*</div></div>\s*<script id="hospitality-gallery-behavior">)'
page,n=re.subn(photos_pattern,lambda m:markup,page,count=1,flags=re.S)
assert n==1,f"Could not locate the Hospitality Photos panel (found {n})"
style='<style id="dcw-hospitality-photos-style">\n'+css+'\n</style>'
if '<style id="dcw-hospitality-photos-style">' in page:
 page=re.sub(r'<style id="dcw-hospitality-photos-style">.*?</style>',lambda m:style,page,count=1,flags=re.S)
else:
 assert page.count("</head>")==1
 page=page.replace("</head>",style+"\n</head>",1)
script='<script id="dcw-hospitality-photos-script">\n'+js+'\n</script>'
if '<script id="dcw-hospitality-photos-script">' in page:
 page=re.sub(r'<script id="dcw-hospitality-photos-script">.*?</script>',lambda m:script,page,count=1,flags=re.S)
else:
 assert page.count("</body>")==1
 page=page.replace("</body>",script+"\n</body>",1)
assert page.count('id="hospitalityPhotos"')==1
assert page.count('class="dcw-photo-card"')==10
assert 'One day, all we’ll have are the stories.' in page
assert 'dcwMontageTab' in page
p.write_text(page,encoding="utf-8")
print("Hospitality photography: 10 editorial photo cards, responsive gallery and image viewer")

