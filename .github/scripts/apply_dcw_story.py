from pathlib import Path
import re

page_path = Path("index.html")
page = page_path.read_text(encoding="utf-8")
story = Path("dcw-our-story.html").read_text(encoding="utf-8").strip()
css = Path("dcw-our-story.css").read_text(encoding="utf-8").strip()

begin = '<div class="about-story">'
end = '</section><section class="categories" id="work">'
assert page.count(begin) == 1, "Expected one Our Story section"
start = page.index(begin)
stop = page.index(end, start)
page = page[:start] + story + page[stop:]

new_style = '<style id="dcw-story-layout">\n' + css + '\n</style>'
existing_style = r'<style id="dcw-story-layout">.*?</style>'
if re.search(existing_style, page, flags=re.S):
    page = re.sub(existing_style, lambda _: new_style, page, count=1, flags=re.S)
else:
    assert page.count("</head>") == 1
    page = page.replace("</head>", new_style + "\n</head>", 1)

assert page.count('One day, all we’ll have are the stories.') == 1
assert page.count('For us, DCW is our way of getting to know the world, together.') == 1
page_path.write_text(page, encoding="utf-8")
print("Updated Our Story while preserving the rest of the portfolio.")
