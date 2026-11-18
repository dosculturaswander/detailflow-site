from pathlib import Path
import re

page_path=Path('index.html')
page=page_path.read_text(encoding='utf-8')
gallery=Path('dcw-video-gallery.html').read_text(encoding='utf-8').strip()
css=Path('dcw-video-gallery.css').read_text(encoding='utf-8').strip()
js=Path('dcw-video-gallery.js').read_text(encoding='utf-8').strip()

old=r'<div id="hospitalityVideos" class="hospitality-panel" role="tabpanel" aria-labelledby="hospitalityVideosTab">.*?</div></div>(?=\s*<div id="hospitalityPhotos")'
new='<div id="hospitalityVideos" class="hospitality-panel" role="tabpanel" aria-labelledby="hospitalityVideosTab">\n'+gallery+'\n</div>'
page,n=re.subn(old,lambda m:new,page,count=1,flags=re.S)
assert n==1,'Could not find exactly one hospitality video gallery'

style='<style id="dcw-video-gallery-styles">\n'+css+'\n</style>'
if '<style id="dcw-video-gallery-styles">' in page:
 page=re.sub(r'<style id="dcw-video-gallery-styles">.*?</style>',lambda m:style,page,count=1,flags=re.S)
else:
 assert '</head>' in page
 page=page.replace('</head>',style+'\n</head>',1)

script='<script id="dcw-video-gallery-script">\n'+js+'\n</script>'
if '<script id="dcw-video-gallery-script">' in page:
 page=re.sub(r'<script id="dcw-video-gallery-script">.*?</script>',lambda m:script,page,count=1,flags=re.S)
else:
 assert '</body>' in page
 page=page.replace('</body>',script+'\n</body>',1)

assert 'One day, all we’ll have are the stories.' in page,'Our Story was unexpectedly removed'
assert page.count('id="dcwMontageTab"')==1
assert page.count('class="dcw-film-card')==8
page_path.write_text(page,encoding='utf-8')
print('Published hospitality Montage and UGC Style tabs; other page content preserved')

