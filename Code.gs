/*****************************************************
 * Persian Tools — شماره‌گذار (Ultra Fast Final Version)
 * ✅ Processes instantly (top → down)
 * ✅ Doesn’t alter alignment or RTL/LTR direction
 * ✅ Prefix/Suffix (default suffix ".")
 * ✅ One-click apply, no waiting spinner hang
 *****************************************************/

const PERSIAN_DIGITS = ['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹'];
const PERSIAN_ALPHA  = ['ا','ب','پ','ت','ث','ج','چ','ح','خ','د','ذ','ر','ز','ژ','س','ش','ص','ض','ط','ظ','ع','غ','ف','ق','ک','گ','ل','م','ن','و','ه','ی'];
const ARABIC_ALPHA   = ['الف','ب','ج','د','هـ','و','ز','ح','ط','ی','ک','ل','م','ن','س','ع','ف','ص','ق','ر','ش','ت','ث','خ','ذ','ض','ظ','غ'];

// === MENU ===
function onOpen() {
  DocumentApp.getUi()
    .createMenu('FA_Docs')
    .addItem('شماره‌گذار', 'openSidebar')
    .addToUi();
}

function openSidebar() {
  const html = HtmlService.createHtmlOutputFromFile('Sidebar')
    .setTitle('شماره‌گذار');
  DocumentApp.getUi().showSidebar(html);
}

// === HELPER: Collect all selected paragraphs (top→down) ===
function getSelectedParagraphs_() {
  const doc = DocumentApp.getActiveDocument();
  const body = doc.getBody();
  const sel = doc.getSelection();
  if (!sel) return [];

  const paras = [];
  const seen = new Set();

  sel.getRangeElements().forEach(re => {
    let el = re.getElement();
    while (el && el.getType() !== DocumentApp.ElementType.PARAGRAPH &&
           el.getType() !== DocumentApp.ElementType.LIST_ITEM) {
      el = el.getParent();
    }
    if (el && !seen.has(el)) {
      seen.add(el);
      paras.push(el);
    }
  });

  // Sort in document order
  paras.sort((a, b) => a.getParent().getChildIndex(a) - b.getParent().getChildIndex(b));
  return paras;
}

// === MAIN FUNCTION ===
function applyPersianNumbering(data) {
  const paras = getSelectedParagraphs_();
  if (paras.length === 0) return 'هیچ متنی انتخاب نشده است.';

  const makeNum = (n) => {
    if (data.style === 'persian') return String(n).replace(/\d/g, d => PERSIAN_DIGITS[d]);
    if (data.style === 'faAlpha') return PERSIAN_ALPHA[(n - 1) % PERSIAN_ALPHA.length];
    if (data.style === 'arAlpha') return ARABIC_ALPHA[(n - 1) % ARABIC_ALPHA.length];
    return String(n);
  };

  const prefix = data.prefix || '';
  const suffix = (data.suffix === '') ? '' : (data.suffix || '.');
  const RLM = '\u200F'; // keeps Persian digits displayed RTL if needed

  let count = 1;

  // Directly edit text of each paragraph — fastest method
  paras.forEach(p => {
    let text = p.getText().trim();
    if (text) {
      const num = makeNum(count++);
      p.setText(`${RLM}${prefix}${num}${suffix ? suffix + ' ' : ' '}${text}`);
    }
  });

  return 'انجام شد';
}

