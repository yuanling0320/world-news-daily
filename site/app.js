const $$ = (selector) => document.querySelector(selector);
const el = (tag, className, content) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (content !== undefined) node.textContent = content;
  return node;
};
const time = (value) => {
  if (!value) return '時間未提供';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '時間未提供' : new Intl.DateTimeFormat('zh-TW', {
    timeZone:'Asia/Taipei', month:'numeric',day:'numeric', hour:'2-digit',minute:'2-digit',hour12:false
  }).format(d);
};
const date = () => new Intl.DateTimeFormat('zh-TW',{timeZone:'Asia/Taipei',year:'numeric',month:'long',day:'numeric',weekday:'long'}).format(new Date());
let all = [], selected = '全部';
$$('#today').textContent = date();

function render() {
  const list = $$('#list'); list.replaceChildren();
  const filtered = selected === '全部' ? all : all.filter(a => a.category === selected);
  $$('#counter').textContent = `共 ${filtered.length} 則`;
  if (!filtered.length) {
    list.append(el('div','empty',all.length ? '這個分類目前沒有新聞。' : '目前沒有資料。請先在 GitHub 執行第一次更新。'));
    return;
  }
  filtered.forEach((article,index) => {
    const card = el('article','card');
    const meta = el('div','card-meta');
    meta.append(el('span','',`${String(index + 1).padStart(2,'0')}  /  ${article.category || '重大事件'}`));
    const sources = Array.isArray(article.sources) ? article.sources : [];
    meta.append(el('span','',sources.length ? `${time(sources[0].published_at)} 刊登` : ''));
    card.append(meta,el('h3','',article.title),el('p','',article.summary));
    if (article.why_important) {
      const why = el('p','why');
      const strong = el('strong','','');strong.textContent='值得關注：';
      why.append(strong,document.createTextNode(article.why_important));card.append(why);
    }
    const origin = el('div','origins');origin.append(el('span','label','原文報導 / SOURCES'));
    sources.forEach((source) => {
      try {
        const url = new URL(source.url);
        if (url.protocol !== 'https:') return;
        const a = el('a','',`${source.source} · ${time(source.published_at)} ↗`);
        a.href = url.href;a.target='_blank';a.rel='noopener noreferrer';origin.append(a);
      } catch { /* ignore unsafe or invalid URLs */ }
    });
    card.append(origin);list.append(card);
  });
}

function filters() {
  const categories = ['全部',...new Set(all.map(a=>a.category).filter(Boolean))];
  const node = $$('#filters');node.replaceChildren();
  categories.forEach(category=>{
    const b = el('button',category===selected?'active':'',category);
    b.type='button';b.addEventListener('click',()=>{selected=category;filters();render()});node.append(b);
  });
}

async function loadNews() {
  $$('#status').textContent = '正在同步新聞資料⋯';
  try {
    const response = await fetch(`./news.json?ts=${Date.now()}`, {cache:'no-store'});
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    all = Array.isArray(data.articles) ? data.articles : [];
    selected = '全部';
    $$('#brief').textContent = data.brief || '暫無摘要';
    $$('#updated').textContent = data.generated_at ? `更新於 ${time(data.generated_at)}` : '尚未更新';
    const disclaimer = data.mode === 'rss_only' ? '測試模式：尚未啟用繁體中文 AI 新聞摘要。'
      : data.mode === 'pending' ? '尚未完成第一次更新。' : '';
    const ageHours = data.generated_at ? (Date.now()-new Date(data.generated_at).getTime())/36e5 : null;
    const stale = ageHours !== null && ageHours > 18 ? '資料已超過 18 小時未更新，請注意時效。' : '';
    $$('#status').textContent = [disclaimer,stale].filter(Boolean).join('　');
    filters();render();
  } catch (error) {
    $$('#status').textContent = `讀取失敗：${error.message}。請確認 GitHub Actions 是否部署完成。`;
    $$('#brief').textContent = '無法載入新聞摘要。';
  }
}
$$('#refresh').addEventListener('click',loadNews);
if ('serviceWorker' in navigator) window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
loadNews();
