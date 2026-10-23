from pathlib import Path
import html,re
root=Path(__file__).resolve().parent.parent
source=(root/'HUONG_DAN_SETUP.md').read_text()
def inline(s):
 s=html.escape(s)
 s=re.sub(r'`([^`]+)`',r'<code>\1</code>',s)
 s=re.sub(r'\*\*([^*]+)\*\*',r'<strong>\1</strong>',s)
 s=re.sub(r'\[([^\]]+)\]\((https://[^\s)]+)\)',r'<a href="\2" target="_blank" rel="noreferrer">\1 ↗</a>',s)
 return s
lines=source.splitlines();parts=[];toc=[];i=0;step=0
while i<len(lines):
 l=lines[i]
 if not l.strip():i+=1;continue
 if l.startswith('```'):
  i+=1;block=[]
  while i<len(lines) and not lines[i].startswith('```'):block.append(lines[i]);i+=1
  parts.append('<pre><code>'+html.escape('\n'.join(block))+'</code></pre>');i+=1;continue
 if l.startswith('|'):
  rows=[]
  while i<len(lines) and lines[i].startswith('|'):
   cells=[c.strip() for c in lines[i].strip('|').split('|')]
   if not all(re.fullmatch(r':?-+:?',c) for c in cells):rows.append(cells)
   i+=1
  parts.append('<div class="table-wrap"><table><thead><tr>'+''.join('<th>'+inline(c)+'</th>' for c in rows[0])+'</tr></thead><tbody>'+''.join('<tr>'+''.join('<td>'+inline(c)+'</td>' for c in row)+'</tr>' for row in rows[1:])+'</tbody></table></div>');continue
 if l.startswith('## '):
  step+=1;title=l[3:];toc.append('<a href="#step-'+str(step)+'">'+html.escape(title)+'</a>')
  parts.append('<h2 id="step-'+str(step)+'"><input type="checkbox" data-step="'+str(step)+'" aria-label="Đã đọc xong mục '+str(step)+'">'+inline(title)+'</h2>');i+=1;continue
 if l.startswith('### '):parts.append('<h3>'+inline(l[4:])+'</h3>');i+=1;continue
 if l.startswith('# '):i+=1;continue
 if re.match(r'^(?:\d+\. |- )',l):
  ordered=bool(re.match(r'^\d+\.',l));tag='ol' if ordered else 'ul';items=[]
  while i<len(lines) and re.match(r'^\d+\. ' if ordered else r'^- ',lines[i]):
   items.append('<li>'+inline(re.sub(r'^(?:\d+\. |- )','',lines[i]))+'</li>');i+=1
  parts.append('<'+tag+'>'+''.join(items)+'</'+tag+'>');continue
 paragraph=[]
 while i<len(lines) and lines[i].strip() and not re.match(r'^(#|\||```|\d+\. |- )',lines[i]):paragraph.append(lines[i]);i+=1
 if paragraph:parts.append('<p>'+inline(' '.join(paragraph))+'</p>')
 else:i+=1
css='''*{box-sizing:border-box}html{scroll-behavior:smooth;scroll-padding-top:24px}body{margin:0;background:#f4f7f2;color:#263f34;font:16px/1.8 system-ui,-apple-system,"Segoe UI",sans-serif}a{color:#216b59}aside{position:fixed;width:280px;padding:30px 20px;height:100vh;overflow:auto;border-right:1px solid #dce6da;background:#edf3e9}aside strong{font-size:18px}aside a{display:block;font-size:12px;text-decoration:none;line-height:1.5;padding:8px 0;color:#4b6656}main{margin-left:280px;max-width:1120px;padding:40px 52px 80px}header{background:#244e3e;color:#fff;border-radius:22px;padding:36px;margin-bottom:30px}header p{color:#c7ddcb}h1{font-size:38px;line-height:1.2;margin:15px 0}header small{letter-spacing:.14em;color:#cee4c9}h2{font-size:24px;line-height:1.5;border-top:1px solid #dce6d8;padding-top:34px;margin-top:45px;display:flex;align-items:baseline;gap:12px}h2 input{width:19px;height:19px;flex-shrink:0;accent-color:#287c68}h3{font-size:20px;margin-top:30px}p,li{color:#435b4d}li{padding:5px 0}code{background:#e8eee5;padding:2px 5px;border-radius:5px;font:13px/1.6 ui-monospace,Consolas,monospace;overflow-wrap:anywhere}pre{background:#203b2f;color:#e5f4df;padding:22px;border-radius:12px;overflow:auto}pre code{background:transparent;color:inherit;white-space:pre}table{width:100%;border-collapse:collapse;background:#fff;font-size:14px}th{text-align:left;background:#e6efdf;color:#284e3b}th,td{padding:13px 16px;border:1px solid #dce6d8;vertical-align:top}.table-wrap{overflow:auto;border-radius:12px;margin:24px 0}.badge{display:inline-block;border:1px solid #6b8c72;border-radius:40px;padding:4px 12px;font-size:12px}#progress{font-size:12px;color:#577360;margin:14px 0 22px}button{background:#fff;border:1px solid #b9cdbb;padding:8px 12px;color:#28523e;border-radius:8px;cursor:pointer}footer{margin-top:50px;font-size:13px;color:#71816d}@media(max-width:1000px){aside{display:none}main{margin:0;padding:20px;max-width:950px;margin:auto}h1{font-size:31px}header{padding:26px}h2{font-size:22px}}@media print{aside,button,h2 input{display:none}main{margin:0;padding:0;max-width:none}header{background:#fff;color:#244e3e;padding:0}header p,header small{color:#244e3e}table{font-size:11px}h2,h3{break-after:avoid}a{color:inherit}body{font-size:12px;background:#fff}}'''
js='''const inputs=[...document.querySelectorAll('[data-step]')];const key='phat-setup-github-v1';let saved=[];try{saved=JSON.parse(localStorage.getItem(key)||'[]')}catch{}function update(){document.querySelector('#progress').textContent=inputs.filter(x=>x.checked).length+' / '+inputs.length+' mục đã đánh dấu'}inputs.forEach(x=>{x.checked=saved.includes(x.dataset.step);x.addEventListener('change',()=>{try{localStorage.setItem(key,JSON.stringify(inputs.filter(x=>x.checked).map(x=>x.dataset.step)))}catch{}update()})});update();'''
page='<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Phát Workspace — Hướng dẫn setup</title><style>'+css+'</style></head><body><aside><strong>PHÁT WORKSPACE</strong><div id="progress"></div>'+''.join(toc)+'</aside><main><header><small>HƯỚNG DẪN TỪNG BƯỚC</small><h1>Hệ thống của bạn.<br>Công việc trong tầm tay.</h1><p>GitHub Pages · Supabase · Gmail<br>Setup một lần để tự quản lý công việc và email nhắc deadline.</p><span class="badge">Miễn phí trong hạn mức dịch vụ</span></header><p>Đọc theo thứ tự. Có thể đánh dấu ô cạnh mỗi mục để nhớ phần đã làm; dấu này chỉ lưu trên trình duyệt, không tự cấu hình dịch vụ.</p><button onclick="window.print()">In hoặc lưu hướng dẫn thành PDF</button>'+''.join(parts)+'<footer>Không nhập mật khẩu hay API key vào tài liệu này. Bí mật chỉ điền trong tài khoản dịch vụ của bạn.</footer></main><script>'+js+'</script></body></html>'
(root/'BAT_DAU_O_DAY.html').write_text(page)
print('Guide generated:',step,'sections')
