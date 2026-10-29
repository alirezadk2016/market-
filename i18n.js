/* ------------------------------------------------------------------
   A.z — two languages, one page.

   Every string the visitor can read lives here, in both languages, and
   the page is written in English so that it still reads correctly before
   this file runs. Switching language rewrites the marked elements in
   place rather than loading a second page, which keeps one set of URLs,
   one catalogue and one admin panel.

   Marking up an element:
     data-i18n="key"            → its text
     data-i18n-html="key"       → its markup (line breaks in headlines)
     data-i18n-attr="aria-label:key, placeholder:other.key"

   Persian is not simply English set right-to-left. Three rules are held
   to throughout: the script never takes negative letter-spacing, it
   needs more leading than a Latin grotesque, and digits stay Western so
   that prices, sizes and dimensions match the photographs.
------------------------------------------------------------------- */
(() => {
  'use strict';

  const DICT = {
    en: {
      /* document */
      'doc.title': 'A.z · The Night Salon',
      'doc.description': 'Discover the A.z selection of bags, eyewear, timepieces and headwear, with personal guidance on every piece.',
      'doc.ogDescription': 'The A.z perspective: bags, eyewear, timepieces and headwear, with personal guidance on the piece and colour you choose.',

      /* chrome */
      'skip': 'Skip to the gallery',
      'brand.home': 'A.z home',
      'brand.descriptor': 'Curated accessories',
      'nav.main': 'Main navigation',
      'nav.collections': 'Collections',
      'nav.advisory': 'The Advisory',
      'nav.advisoryLower': 'The advisory',
      'nav.questions': 'Questions',
      'nav.enquiry': 'Private enquiry',
      'lang.switch': 'فارسی',
      'lang.label': 'Change language',

      /* hero */
      'hero.region': 'Cinematic collection gallery. Move to look, drag to turn, or choose an exhibit. Arrow keys choose collections. Enter opens the collection. Shift and arrow keys turn the view. Escape centres the view.',
      'hero.eyebrow': 'A.z / Private selection',
      'hero.title': 'The A.z<br>perspective.',
      'hero.lead': 'Bags, eyewear, timepieces and headwear.<br>Selected for a more personal wardrobe.',
      'hero.look': 'Look around',
      'hero.lookLabel': 'Interactive mouse view',
      'hero.on': 'On',
      'hero.off': 'Off',
      'hero.hint': 'Move to look. Drag to explore.',
      'hero.reset': 'Reset view',
      'hero.resetLabel': 'Reset gallery view',
      'hero.edit': 'The private edit',
      'hero.chooseLabel': 'Choose a featured collection',
      'hero.explore': 'Explore the collection',
      'hero.pause': 'Pause',
      'hero.pauseSuffix': ' autoplay',
      'hero.play': 'Play',
      'hero.pauseLabel': 'Pause automatic gallery motion',
      'hero.playLabel': 'Play automatic gallery motion',
      'hero.motionWord': 'Motion',
      'hero.motionOffSuffix': ' off',
      'hero.motionOffLabel': 'Gallery motion off. Reduced motion is enabled.',
      'hero.reducedNote': 'Automatic gallery motion is off because your device requests reduced motion. You can still choose any collection.',
      'hero.sceneFailed': 'That scene could not be loaded. You can still explore the current collection.',
      'hero.centred': 'Gallery view centred.',
      'det.askAdvisor': 'Ask your advisor',

      /* collections */
      'col.bags': 'Bags',
      'col.eyewear': 'Eyewear',
      'col.watches': 'Timepieces',
      'col.watchesShort': 'Watches',
      'col.headwear': 'Headwear',
      'col.bagsTitle': 'The Bags',
      'col.eyewearTitle': 'The Eyewear',
      'col.watchesTitle': 'The Timepieces',
      'col.headwearTitle': 'The Headwear',
      'col.bagsCopy': 'Shape, texture and proportion.',
      'col.eyewearCopy': 'A different point of view.',
      'col.watchesCopy': 'Every moment, considered.',
      'col.headwearCopy': 'An everyday signature.',
      'col.headwearCopyAlt': 'An understated signature.',

      'collections.kicker': 'A.z / The edit',
      'collections.title': 'The collections.',
      'collections.lead': 'Choose a collection.<br>Explore the original pieces, colours and closer views.',
      'collections.navLabel': 'Explore the four collections',
      'collections.browseLabel': 'Browse the A.z selection',
      'collections.browseBags': 'Browse the Bags collection',
      'collections.browseEyewear': 'Browse the Eyewear collection',
      'collections.browseWatches': 'Browse the Timepieces collection',
      'collections.browseHeadwear': 'Browse the Headwear collection',
      'collections.exploreShort': 'Explore collection',
      'collections.figures': 'Editorial studies.',
      'collections.figuresLead': 'Discover the original pieces inside each collection.',
      'col.bagsRole': 'Shoulder, crossbody & top-handle',
      'col.eyewearRole': 'Oval & rectangular frames',
      'col.watchesRole': 'A jewellery sensibility',
      'col.headwearRole': 'A sporting signature',
      'tp.kicker': 'A.z / A study in time',
      'tp.title': 'Beyond<br>the surface.',
      'tp.region': 'Interactive mechanical watch study. Scroll or choose a perspective. Use a mouse or arrow keys to turn the view.',
      'tp.c1n': '01 / Form',
      'tp.c1h': 'The silhouette.',
      'tp.c1p': 'A quiet exterior.<br>A more intricate world beneath.',
      'tp.c2n': '02 / Layers',
      'tp.c2h': 'Beneath the dial.',
      'tp.c2p': 'Glass, hands and dial part.<br>A new perspective opens.',
      'tp.c3n': '03 / Within',
      'tp.c3h': 'A world within.',
      'tp.c3p': 'Follow the wheels, bridges and bearings.<br>Every layer changes the view.',
      'tp.hint': 'Scroll to enter · Move or drag to look',
      'tp.phasesLabel': 'Choose a watch perspective',
      'tp.p1': 'Silhouette',
      'tp.p2': 'Layers',
      'tp.p3': 'Within',
      'tp.look': 'Mouse view',
      'tp.continue': 'Continue',
      'tp.note': 'An original mechanical concept.',
      'tp.browse': 'View the timepieces',
      'adv2.kicker': 'The advisory',
      'adv2.title': 'From selection to conversation.',
      'adv2.s1': 'Choose',
      'adv2.s1p': 'Compare original product photographs and colours. “Ask about this piece” adds your chosen model and colour to the note.',
      'adv2.s2': 'Review',
      'adv2.s2p': 'Read and edit your enquiry here. Then choose Gmail, an email app, copy or a text file.',
      'adv2.s3': 'Confirm',
      'adv2.s3p': 'Ask A.z about the current price, colour availability and next steps before you decide.',
      'adv2.action': 'Prepare your enquiry',
      'collections.groupLabel': 'The A.z collections',
      'collections.exploreBags': 'Explore the Bags collection',
      'collections.exploreEyewear': 'Explore the Eyewear collection',
      'collections.exploreWatches': 'Explore the Timepieces collection',
      'collections.exploreHeadwear': 'Explore the Headwear collection',

      /* material study */
      'material.kicker': 'The A.z perspective',
      'material.title': 'Details make<br>the difference.',
      'material.lead': 'A study of shape,<br>surface and proportion.',
      'material.mainAlt': 'An editorial study of dark texture and sculptural light',
      'material.mainCaption': 'Texture. Proportion. Detail.',
      'material.detailAlt': 'A close study of surface and material',
      'material.detailCaption': 'Another angle. A new perspective.',

      /* advisory */
      'advisory.kicker': 'Choosing with A.z',
      'advisory.title': 'An edited selection.<br>A personal decision.',
      'advisory.lead': 'A.z brings bags, eyewear, timepieces and headwear into one considered edit. Use the catalogue to look closely, then ask us about the piece and colour you have in mind.',
      'advisory.photoAlt': 'An atmospheric architectural study of a quiet salon',
      'advisory.statement': 'The piece.<br>The colour.<br>The details that matter to you.',
      'advisory.detail': 'The website is a catalogue. A listing helps you explore a piece; your conversation with A.z is where you confirm its current price, colour availability and how to proceed.',
      'advisory.start': 'Start your enquiry',
      'advisory.stepsLabel': 'How an A.z enquiry works',
      'advisory.step1Title': 'Choose a piece',
      'advisory.step1': 'Open a collection, compare the photographs and select a colour. “Ask about this piece” brings its name and colour into your note.',
      'advisory.step2Title': 'Review your enquiry',
      'advisory.step2': 'Read your note here first. Then choose Gmail in your browser, an email app, copy or a text download.',
      'advisory.step3Title': 'Confirm before deciding',
      'advisory.step3': 'Ask about the current price, colour availability and next steps. Preparing an enquiry does not place an order.',

      /* enquiry */
      'enq.kicker': 'A.z / Personal enquiries',
      'enq.title': 'The piece.<br>The colour.<br>Your questions.',
      'enq.lead': 'Start with a selection from the catalogue or tell us what you are looking for. Review your note on this page, then choose how to contact A.z.',
      'enq.expectation': 'Current price, colour availability and how to proceed are confirmed through conversation.',
      'enq.formTitle': 'Build your enquiry',
      'enq.collection': 'Collection',
      'enq.help': 'Help me choose',
      'enq.preferences': 'Piece, colour and questions',
      'enq.optional': '(optional)',
      'enq.placeholder': 'Tell us the piece or colour you are considering, and what you would like to know.',
      'enq.review': 'Review your enquiry',
      'enq.yourEnquiry': 'Your enquiry',
      'enq.edit': 'Edit note',
      'enq.to': 'To',
      'enq.subject': 'Subject',
      'enq.subjectValue': 'A.z private enquiry',
      'enq.note': 'This is your draft. Nothing has been sent and no order has been placed.',
      'enq.gmail': 'Open Gmail',
      'enq.gmailSub': 'Review and send in your browser',
      'enq.download': 'Download your note',
      'enq.downloadSub': 'Save an editable text file',
      'enq.mail': 'Open email app',
      'enq.copy': 'Copy enquiry',
      'enq.formNote': 'Choose an email app or copy your note. Review it here for Gmail and text-download options. You decide when to send it.',
      'enq.copied': 'Your enquiry has been copied.',
      'enq.copyFailed': 'Copying is unavailable. The text is selected below — copy it manually.',

      /* questions */
      'q.kicker': 'The practical details',
      'q.title': 'Choose with<br>a clear next step.',
      'q.q1': 'How do I check price and availability?',
      'q.a1': 'Select the piece and colour in the catalogue, then choose “Ask about this piece”. Its details are added to your enquiry. Use the conversation with A.z to confirm the current price, colour availability and how to proceed before you decide.',
      'q.q2': 'Can I compare different colours?',
      'q.a2': 'Yes. Use the colour options in the collection and product photographs to explore the colours shown. You can mention more than one colour in your enquiry.',
      'q.q3': 'Does reviewing an enquiry send a message or place an order?',
      'q.a3': 'No. Reviewing prepares your note on this page. You can edit it, choose how to contact A.z, and send it yourself when you are ready.',
      'q.q4': 'Do I need an installed email app?',
      'q.a4': 'No. Review your enquiry to open Gmail in your browser or download a text file. You can also copy the note into your preferred email service. An installed email app is an optional route.',

      /* catalogue */
      'cat.overline': 'A.z · The private selection',
      'cat.back': 'Back to the collection',
      'cat.close': 'Close',
      'cat.closeLabel': 'Close collection',
      'cat.browseLabel': 'Browse collections',
      'cat.find': 'Find your piece',
      'cat.searchPlaceholder': 'House, model or colour',
      'cat.clear': 'Clear',
      'cat.clearLabel': 'Clear search',
      'cat.refine': 'Refine selection',
      'cat.house': 'House',
      'cat.allHouses': 'All houses',
      'cat.colour': 'Colour',
      'cat.allColours': 'All colours',
      'cat.reset': 'Reset refinements',
      'cat.emptyOverline': 'The selection',
      'cat.emptyTitle': 'No pieces found.',
      'cat.emptyLead': 'Try another house, colour or search.',
      'cat.emptyReset': 'Reset the selection',
      'cat.serviceNote': 'A closer look, at your pace. Select a piece for photographs, colours and personal guidance.',
      'cat.photosLabel': 'Product photographs',
      'cat.chooseColour': 'Choose a colour',
      'cat.specs': 'Details & dimensions',
      'cat.enquire': 'Ask about this piece',
      'cat.enquireNote': 'For current price, availability and personal guidance.',
      'cat.retailer': 'Where A.z recommends buying it',
      'cat.viewPiece': 'View piece',
      'cat.photoUnavailable': 'Photograph unavailable',
      'cat.piece': 'piece',
      'cat.pieces': 'pieces',
      'cat.of': 'of',
      'cat.viewLarger': 'View larger',
      'cat.prev': 'Prev',
      'cat.next': 'Next',
      'cat.currentColour': 'Current colour',
      'cat.colours': 'colours',
      'cat.coloursFor': 'Colours for',
      'cat.discover': 'Discover',
      'cat.inColour': 'in',
      'cat.theCurrentColour': 'the current colour',
      'cat.view': 'view',
      'cat.viewPhoto': 'View photograph',
      'cat.thePiece': 'The piece',
      'cat.theRetailer': 'The retailer',
      'cat.theCollection': 'The collection',
      'cat.newTab': '— opens in a new tab',
      'menu.salon': 'The salon',
      'menu.close': 'Close',
      'menu.begin': 'Begin a private enquiry',
      'copy.done': 'Enquiry copied. Paste it into your preferred email service.',
      'copy.manual': 'Your enquiry is below. Select the text to copy it.',
      'photo.prevLabel': 'Previous product photograph',
      'photo.nextLabel': 'Next product photograph',
      'photo.enlargeLabel': 'Open full product photograph',
      'photo.missing': 'Photograph unavailable. Choose another view.',
      'photo.zoom': 'Zoom in',
      'photo.zoomLabel': 'Zoom product photograph',
      'photo.closeLabel': 'Close full product photograph',
      'photo.previous': 'Previous',
      'photo.prevFullLabel': 'Previous full product photograph',
      'photo.nextFullLabel': 'Next full product photograph',

      /* detail dialog */
      'det.closeLabel': 'Close piece details',
      'det.reference': 'The private selection',
      'det.colour': 'Colour',
      'det.service': 'Personal guidance on colour, availability and the next steps.',
      'det.enquire': 'Enquire about this piece',
      'det.back': 'Return to the salon',

      /* advice dialog */
      'adv.closeLabel': 'Close enquiry information',
      'adv.eyebrow': 'By appointment',
      'adv.title': 'A personal<br>consultation.',
      'adv.lead': 'Tell us which piece you are considering. We can help with colour, availability and the next steps.',
      'adv.write': 'Write to your advisor',
      'adv.brief': 'Prepare a detailed enquiry',
      'adv.note': 'Your email app opens an editable draft. Nothing is sent automatically.',

      /* footer */
      'foot.homeLabel': 'Return to A.z entrance',
      'foot.statement': 'The A.z edit.<br>Your choice to make.',
      'foot.navLabel': 'Footer navigation',

      /* drafted email */
      'mail.greeting': 'Hello A.z,',
      'mail.wants': 'I would like advice on',
      'mail.helpChoosing': 'help choosing a piece',
      'mail.considering': 'I am considering',
      'mail.inColour': 'in',

      /* status */
      'status.selected': 'selected.',
      'status.unavailable': 'That collection photograph is unavailable.'
    },

    fa: {
      /* document */
      'doc.title': 'A.z · سالنِ شب',
      'doc.description': 'مجموعهٔ A.z از کیف، عینک، ساعت و کلاه را ببینید، با راهنمایی شخصی دربارهٔ هر قطعه.',
      'doc.ogDescription': 'نگاهِ A.z: کیف، عینک، ساعت و کلاه، با راهنمایی شخصی دربارهٔ قطعه و رنگی که انتخاب می‌کنید.',

      /* chrome */
      'skip': 'رفتن به گالری',
      'brand.home': 'صفحهٔ نخست A.z',
      'brand.descriptor': 'اکسسوری‌های منتخب',
      'nav.main': 'منوی اصلی',
      'nav.collections': 'مجموعه‌ها',
      'nav.advisory': 'مشاوره',
      'nav.advisoryLower': 'مشاوره',
      'nav.questions': 'پرسش‌ها',
      'nav.enquiry': 'درخواست خصوصی',
      'lang.switch': 'English',
      'lang.label': 'تغییر زبان',

      /* hero */
      'hero.region': 'گالری سینمایی مجموعه‌ها. برای دیدن حرکت کنید، برای چرخاندن بکشید، یا یک مجموعه را انتخاب کنید. کلیدهای جهت‌دار مجموعه را عوض می‌کنند. Enter مجموعه را باز می‌کند. Shift به‌همراه کلیدهای جهت‌دار نما را می‌چرخاند. Escape نما را وسط می‌آورد.',
      'hero.eyebrow': 'A.z / انتخابِ خصوصی',
      'hero.title': 'نگاهِ<br>A.z',
      'hero.lead': 'کیف، عینک، ساعت و کلاه.<br>انتخاب‌شده برای کمدی شخصی‌تر.',
      'hero.look': 'گردشِ نما',
      'hero.lookLabel': 'نمای تعاملی با حرکت نشانگر',
      'hero.on': 'روشن',
      'hero.off': 'خاموش',
      'hero.hint': 'حرکت بدهید تا ببینید. بکشید تا بچرخانید.',
      'hero.reset': 'بازنشانی نما',
      'hero.resetLabel': 'بازنشانی نمای گالری',
      'hero.edit': 'گزینشِ خصوصی',
      'hero.chooseLabel': 'انتخاب مجموعهٔ شاخص',
      'hero.explore': 'دیدن مجموعه',
      'hero.pause': 'توقف',
      'hero.pauseSuffix': ' پخش خودکار',
      'hero.play': 'پخش',
      'hero.pauseLabel': 'توقف حرکت خودکار گالری',
      'hero.playLabel': 'پخش حرکت خودکار گالری',
      'hero.motionWord': 'حرکت',
      'hero.motionOffSuffix': ' خاموش',
      'hero.motionOffLabel': 'حرکت گالری خاموش است. حالت کاهش حرکت فعال است.',
      'hero.reducedNote': 'حرکت خودکار گالری خاموش است چون دستگاه شما کاهش حرکت را خواسته است. هنوز می‌توانید هر مجموعه‌ای را انتخاب کنید.',
      'hero.sceneFailed': 'این صحنه بارگذاری نشد. همچنان می‌توانید مجموعهٔ فعلی را ببینید.',
      'hero.centred': 'نمای گالری وسط آمد.',
      'det.askAdvisor': 'از مشاور خود بپرسید',

      /* collections */
      'col.bags': 'کیف',
      'col.eyewear': 'عینک',
      'col.watches': 'ساعت',
      'col.watchesShort': 'ساعت',
      'col.headwear': 'کلاه',
      'col.bagsTitle': 'کیف‌ها',
      'col.eyewearTitle': 'عینک‌ها',
      'col.watchesTitle': 'ساعت‌ها',
      'col.headwearTitle': 'کلاه‌ها',
      'col.bagsCopy': 'فرم، بافت و تناسب.',
      'col.eyewearCopy': 'زاویه‌ای دیگر.',
      'col.watchesCopy': 'هر لحظه، سنجیده.',
      'col.headwearCopy': 'امضایی هر روزه.',
      'col.headwearCopyAlt': 'امضایی بی‌ادعا.',

      'collections.kicker': 'A.z / گزینش',
      'collections.title': 'مجموعه‌ها.',
      'collections.lead': 'یک مجموعه را انتخاب کنید.<br>قطعه‌های اصل، رنگ‌ها و نماهای نزدیک را ببینید.',
      'collections.navLabel': 'دیدن چهار مجموعه',
      'collections.browseLabel': 'گشتن در انتخابِ A.z',
      'collections.browseBags': 'گشتن در مجموعهٔ کیف‌ها',
      'collections.browseEyewear': 'گشتن در مجموعهٔ عینک‌ها',
      'collections.browseWatches': 'گشتن در مجموعهٔ ساعت‌ها',
      'collections.browseHeadwear': 'گشتن در مجموعهٔ کلاه‌ها',
      'collections.exploreShort': 'دیدن مجموعه',
      'collections.figures': 'مطالعه‌های تصویری.',
      'collections.figuresLead': 'قطعه‌های اصلِ درونِ هر مجموعه را کشف کنید.',
      'col.bagsRole': 'دوشی، کراس‌بادی و تاپ‌هندل',
      'col.eyewearRole': 'فریم بیضی و مستطیلی',
      'col.watchesRole': 'حسی از جواهر',
      'col.headwearRole': 'امضایی ورزشی',
      'tp.kicker': 'A.z / مطالعه‌ای در زمان',
      'tp.title': 'فراتر از<br>سطح.',
      'tp.region': 'مطالعهٔ تعاملیِ ساعت مکانیکی. اسکرول کنید یا یک زاویه را انتخاب کنید. با نشانگر یا کلیدهای جهت‌دار نما را بچرخانید.',
      'tp.c1n': '01 / فرم',
      'tp.c1h': 'خطِ بیرونی.',
      'tp.c1p': 'بیرونی آرام.<br>جهانی پیچیده‌تر در زیر.',
      'tp.c2n': '02 / لایه‌ها',
      'tp.c2h': 'زیرِ صفحه.',
      'tp.c2p': 'شیشه، عقربه‌ها و صفحه از هم جدا می‌شوند.<br>نگاهی تازه باز می‌شود.',
      'tp.c3n': '03 / درون',
      'tp.c3h': 'جهانی در درون.',
      'tp.c3p': 'چرخ‌ها، پل‌ها و یاتاقان‌ها را دنبال کنید.<br>هر لایه نگاه را عوض می‌کند.',
      'tp.hint': 'برای ورود اسکرول کنید · برای دیدن حرکت دهید یا بکشید',
      'tp.phasesLabel': 'انتخاب زاویهٔ دید ساعت',
      'tp.p1': 'خطِ بیرونی',
      'tp.p2': 'لایه‌ها',
      'tp.p3': 'درون',
      'tp.look': 'نمای نشانگر',
      'tp.continue': 'ادامه',
      'tp.note': 'یک مفهوم مکانیکی اصیل.',
      'tp.browse': 'دیدن ساعت‌ها',
      'adv2.kicker': 'مشاوره',
      'adv2.title': 'از انتخاب تا گفت‌وگو.',
      'adv2.s1': 'انتخاب',
      'adv2.s1p': 'عکس‌های اصلِ محصول و رنگ‌ها را مقایسه کنید. «دربارهٔ این قطعه بپرسید» مدل و رنگِ انتخابی شما را به یادداشت می‌افزاید.',
      'adv2.s2': 'مرور',
      'adv2.s2p': 'درخواست خود را همین‌جا بخوانید و ویرایش کنید. بعد Gmail، برنامهٔ ایمیل، کپی یا فایل متنی را انتخاب کنید.',
      'adv2.s3': 'تأیید',
      'adv2.s3p': 'پیش از تصمیم، دربارهٔ قیمت روز، موجودی رنگ و گام‌های بعدی از A.z بپرسید.',
      'adv2.action': 'آماده‌کردن درخواست',
      'collections.groupLabel': 'مجموعه‌های A.z',
      'collections.exploreBags': 'دیدن مجموعهٔ کیف‌ها',
      'collections.exploreEyewear': 'دیدن مجموعهٔ عینک‌ها',
      'collections.exploreWatches': 'دیدن مجموعهٔ ساعت‌ها',
      'collections.exploreHeadwear': 'دیدن مجموعهٔ کلاه‌ها',

      /* material study */
      'material.kicker': 'نگاهِ A.z',
      'material.title': 'جزئیات‌اند که<br>تفاوت می‌سازند.',
      'material.lead': 'مطالعه‌ای در فرم،<br>سطح و تناسب.',
      'material.mainAlt': 'مطالعه‌ای تصویری از بافت تیره و نورِ مجسمه‌وار',
      'material.mainCaption': 'بافت. تناسب. جزئیات.',
      'material.detailAlt': 'مطالعه‌ای نزدیک از سطح و متریال',
      'material.detailCaption': 'زاویه‌ای دیگر. نگاهی تازه.',

      /* advisory */
      'advisory.kicker': 'انتخاب با A.z',
      'advisory.title': 'گزینشی سنجیده.<br>تصمیمی شخصی.',
      'advisory.lead': 'A.z کیف، عینک، ساعت و کلاه را در یک گزینشِ سنجیده کنار هم می‌آورد. با کاتالوگ از نزدیک ببینید، بعد دربارهٔ قطعه و رنگی که در ذهن دارید از ما بپرسید.',
      'advisory.photoAlt': 'مطالعه‌ای معمارانه و فضاساز از یک سالنِ آرام',
      'advisory.statement': 'قطعه.<br>رنگ.<br>جزئیاتی که برای شما مهم است.',
      'advisory.detail': 'این وب‌سایت یک کاتالوگ است. هر صفحه کمک می‌کند قطعه‌ای را بهتر بشناسید؛ قیمت روز، موجودی رنگ و شیوهٔ ادامهٔ کار در گفت‌وگوی شما با A.z تأیید می‌شود.',
      'advisory.start': 'شروع درخواست',
      'advisory.stepsLabel': 'درخواست در A.z چگونه پیش می‌رود',
      'advisory.step1Title': 'قطعه را انتخاب کنید',
      'advisory.step1': 'یک مجموعه را باز کنید، عکس‌ها را مقایسه کنید و رنگی را برگزینید. «دربارهٔ این قطعه بپرسید» نام و رنگ آن را به یادداشت شما می‌افزاید.',
      'advisory.step2Title': 'درخواست را مرور کنید',
      'advisory.step2': 'اول یادداشت خود را همین‌جا بخوانید. بعد Gmail در مرورگر، برنامهٔ ایمیل، کپی یا دانلود متنی را انتخاب کنید.',
      'advisory.step3Title': 'پیش از تصمیم، تأیید بگیرید',
      'advisory.step3': 'دربارهٔ قیمت روز، موجودی رنگ و گام‌های بعدی بپرسید. آماده‌کردن درخواست، سفارش ثبت نمی‌کند.',

      /* enquiry */
      'enq.kicker': 'A.z / درخواست‌های شخصی',
      'enq.title': 'قطعه.<br>رنگ.<br>پرسش‌های شما.',
      'enq.lead': 'با انتخابی از کاتالوگ شروع کنید یا بگویید دنبال چه هستید. یادداشت خود را در همین صفحه مرور کنید، بعد راه تماس با A.z را انتخاب کنید.',
      'enq.expectation': 'قیمت روز، موجودی رنگ و شیوهٔ ادامهٔ کار در گفت‌وگو تأیید می‌شود.',
      'enq.formTitle': 'درخواست خود را بسازید',
      'enq.collection': 'مجموعه',
      'enq.help': 'کمکم کنید انتخاب کنم',
      'enq.preferences': 'قطعه، رنگ و پرسش‌ها',
      'enq.optional': '(اختیاری)',
      'enq.placeholder': 'بگویید کدام قطعه یا رنگ را در نظر دارید و دوست دارید چه بدانید.',
      'enq.review': 'مرور درخواست',
      'enq.yourEnquiry': 'درخواست شما',
      'enq.edit': 'ویرایش یادداشت',
      'enq.to': 'به',
      'enq.subject': 'موضوع',
      'enq.subjectValue': 'درخواست خصوصی A.z',
      'enq.note': 'این پیش‌نویسِ شماست. هنوز چیزی ارسال نشده و سفارشی ثبت نشده است.',
      'enq.gmail': 'باز کردن Gmail',
      'enq.gmailSub': 'در مرورگر مرور و ارسال کنید',
      'enq.download': 'دانلود یادداشت',
      'enq.downloadSub': 'ذخیره به‌صورت فایل متنی قابل ویرایش',
      'enq.mail': 'باز کردن برنامهٔ ایمیل',
      'enq.copy': 'کپی درخواست',
      'enq.formNote': 'یک برنامهٔ ایمیل انتخاب کنید یا یادداشت را کپی کنید. برای Gmail و دانلود متنی، آن را همین‌جا مرور کنید. زمان ارسال را خودتان تعیین می‌کنید.',
      'enq.copied': 'درخواست شما کپی شد.',
      'enq.copyFailed': 'کپی در دسترس نیست. متن در پایین انتخاب شده است — دستی کپی کنید.',

      /* questions */
      'q.kicker': 'جزئیات عملی',
      'q.title': 'انتخاب کنید،<br>با گامِ بعدیِ روشن.',
      'q.q1': 'قیمت و موجودی را چطور بپرسم؟',
      'q.a1': 'قطعه و رنگ را در کاتالوگ انتخاب کنید، بعد «دربارهٔ این قطعه بپرسید» را بزنید. جزئیات آن به درخواست شما افزوده می‌شود. پیش از تصمیم، در گفت‌وگو با A.z قیمت روز، موجودی رنگ و شیوهٔ ادامهٔ کار را تأیید کنید.',
      'q.q2': 'می‌توانم رنگ‌های مختلف را مقایسه کنم؟',
      'q.a2': 'بله. از گزینه‌های رنگ در مجموعه و از عکس‌های محصول برای دیدن رنگ‌های موجود استفاده کنید. می‌توانید در درخواست خود بیش از یک رنگ را نام ببرید.',
      'q.q3': 'آیا مرور درخواست، پیامی می‌فرستد یا سفارشی ثبت می‌کند؟',
      'q.a3': 'نه. مرور فقط یادداشت شما را در همین صفحه آماده می‌کند. می‌توانید ویرایشش کنید، راه تماس با A.z را انتخاب کنید و هر وقت آماده بودید خودتان بفرستید.',
      'q.q4': 'به برنامهٔ ایمیلِ نصب‌شده نیاز دارم؟',
      'q.a4': 'نه. درخواست را مرور کنید تا Gmail در مرورگر باز شود یا فایل متنی دانلود شود. می‌توانید یادداشت را در سرویس ایمیل دلخواه خود هم کپی کنید. برنامهٔ ایمیلِ نصب‌شده فقط یکی از راه‌هاست.',

      /* catalogue */
      'cat.overline': 'A.z · انتخابِ خصوصی',
      'cat.back': 'بازگشت به مجموعه',
      'cat.close': 'بستن',
      'cat.closeLabel': 'بستن مجموعه',
      'cat.browseLabel': 'گشتن در مجموعه‌ها',
      'cat.find': 'قطعهٔ خود را پیدا کنید',
      'cat.searchPlaceholder': 'برند، مدل یا رنگ',
      'cat.clear': 'پاک کردن',
      'cat.clearLabel': 'پاک کردن جست‌وجو',
      'cat.refine': 'پالایش انتخاب',
      'cat.house': 'برند',
      'cat.allHouses': 'همهٔ برندها',
      'cat.colour': 'رنگ',
      'cat.allColours': 'همهٔ رنگ‌ها',
      'cat.reset': 'حذف فیلترها',
      'cat.emptyOverline': 'انتخاب',
      'cat.emptyTitle': 'قطعه‌ای یافت نشد.',
      'cat.emptyLead': 'برند، رنگ یا عبارت دیگری را امتحان کنید.',
      'cat.emptyReset': 'بازنشانی انتخاب',
      'cat.serviceNote': 'نگاهی نزدیک‌تر، با ریتمِ خودتان. یک قطعه را انتخاب کنید تا عکس‌ها، رنگ‌ها و راهنمایی شخصی را ببینید.',
      'cat.photosLabel': 'عکس‌های محصول',
      'cat.chooseColour': 'انتخاب رنگ',
      'cat.specs': 'جزئیات و ابعاد',
      'cat.enquire': 'دربارهٔ این قطعه بپرسید',
      'cat.enquireNote': 'برای قیمت روز، موجودی و راهنمایی شخصی.',
      'cat.retailer': 'جایی که A.z خرید آن را پیشنهاد می‌کند',
      'cat.viewPiece': 'دیدن قطعه',
      'cat.photoUnavailable': 'عکس در دسترس نیست',
      'cat.piece': 'قطعه',
      'cat.pieces': 'قطعه',
      'cat.of': 'از',
      'cat.viewLarger': 'بزرگ‌نمایی',
      'cat.prev': 'قبلی',
      'cat.next': 'بعدی',
      'cat.currentColour': 'رنگ فعلی',
      'cat.colours': 'رنگ',
      'cat.coloursFor': 'رنگ‌های',
      'cat.discover': 'دیدن',
      'cat.inColour': 'در رنگ',
      'cat.theCurrentColour': 'رنگ فعلی',
      'cat.view': 'نمای',
      'cat.viewPhoto': 'دیدن عکس',
      'cat.thePiece': 'این قطعه',
      'cat.theRetailer': 'این فروشگاه',
      'cat.theCollection': 'این مجموعه',
      'cat.newTab': '— در تبی تازه باز می‌شود',
      'menu.salon': 'سالن',
      'menu.close': 'بستن',
      'menu.begin': 'شروع یک درخواست خصوصی',
      'copy.done': 'درخواست کپی شد. در سرویس ایمیل دلخواهتان بچسبانید.',
      'copy.manual': 'درخواست شما در پایین است. متن را انتخاب کنید تا کپی شود.',
      'photo.prevLabel': 'عکس قبلی محصول',
      'photo.nextLabel': 'عکس بعدی محصول',
      'photo.enlargeLabel': 'باز کردن عکس کامل محصول',
      'photo.missing': 'عکس در دسترس نیست. نمای دیگری را انتخاب کنید.',
      'photo.zoom': 'بزرگ‌نمایی',
      'photo.zoomLabel': 'بزرگ‌نمایی عکس محصول',
      'photo.closeLabel': 'بستن عکس کامل محصول',
      'photo.previous': 'قبلی',
      'photo.prevFullLabel': 'عکس کامل قبلی محصول',
      'photo.nextFullLabel': 'عکس کامل بعدی محصول',

      /* detail dialog */
      'det.closeLabel': 'بستن جزئیات قطعه',
      'det.reference': 'انتخابِ خصوصی',
      'det.colour': 'رنگ',
      'det.service': 'راهنمایی شخصی دربارهٔ رنگ، موجودی و گام‌های بعدی.',
      'det.enquire': 'دربارهٔ این قطعه بپرسید',
      'det.back': 'بازگشت به سالن',

      /* advice dialog */
      'adv.closeLabel': 'بستن اطلاعات درخواست',
      'adv.eyebrow': 'با وقت قبلی',
      'adv.title': 'یک مشاورهٔ<br>شخصی.',
      'adv.lead': 'بگویید کدام قطعه را در نظر دارید. می‌توانیم در انتخاب رنگ، موجودی و گام‌های بعدی کمکتان کنیم.',
      'adv.write': 'به مشاور خود بنویسید',
      'adv.brief': 'آماده‌کردن درخواست کامل',
      'adv.note': 'برنامهٔ ایمیل شما یک پیش‌نویسِ قابل ویرایش باز می‌کند. چیزی خودکار ارسال نمی‌شود.',

      /* footer */
      'foot.homeLabel': 'بازگشت به ورودی A.z',
      'foot.statement': 'گزینشِ A.z.<br>تصمیم با شماست.',
      'foot.navLabel': 'منوی پانویس',

      /* drafted email */
      'mail.greeting': 'سلام A.z،',
      'mail.wants': 'برای این مورد مشاوره می‌خواهم:',
      'mail.helpChoosing': 'کمک در انتخاب یک قطعه',
      'mail.considering': 'این قطعه را در نظر دارم:',
      'mail.inColour': 'در رنگ',

      /* status */
      'status.selected': 'انتخاب شد.',
      'status.unavailable': 'عکس این مجموعه در دسترس نیست.'
    }
  };

  const LANGS = { en: { dir: 'ltr', name: 'English' }, fa: { dir: 'rtl', name: 'فارسی' } };
  const STORE = 'az-lang';

  function preferred() {
    const asked = new URLSearchParams(location.search).get('lang');
    if (LANGS[asked]) return asked;
    try {
      const saved = localStorage.getItem(STORE);
      if (LANGS[saved]) return saved;
    } catch (_) { /* private mode keeps no preference, which is not an error */ }
    return (navigator.languages || [navigator.language || 'en'])
      .some(tag => /^fa\b/i.test(tag || '')) ? 'fa' : 'en';
  }

  let current = preferred();

  const t = (key, lang) => {
    const table = DICT[lang || current];
    return (table && table[key] !== undefined) ? table[key] : (DICT.en[key] !== undefined ? DICT.en[key] : key);
  };

  function applyTo(root) {
    (root || document).querySelectorAll('[data-i18n]').forEach(node => {
      node.textContent = t(node.dataset.i18n);
    });
    // Only the dictionary above is ever written as markup, so that a headline
    // can keep the line break it was composed with.
    (root || document).querySelectorAll('[data-i18n-html]').forEach(node => {
      node.innerHTML = t(node.dataset.i18nHtml);
    });
    (root || document).querySelectorAll('[data-i18n-attr]').forEach(node => {
      node.dataset.i18nAttr.split(',').forEach(pair => {
        const [attr, key] = pair.split(':').map(part => part && part.trim());
        if (attr && key) node.setAttribute(attr, t(key));
      });
    });
  }

  function setLanguage(lang, options = {}) {
    if (!LANGS[lang]) return;
    current = lang;
    const root = document.documentElement;
    root.lang = lang;
    root.dir = LANGS[lang].dir;
    root.dataset.lang = lang;
    try { localStorage.setItem(STORE, lang); } catch (_) { /* nothing to persist to */ }

    document.title = t('doc.title');
    const described = document.querySelector('meta[name="description"]');
    if (described) described.content = t('doc.description');
    applyTo(document);

    const toggle = document.getElementById('languageToggle');
    if (toggle) {
      toggle.textContent = LANGS[lang === 'fa' ? 'en' : 'fa'].name;
      toggle.setAttribute('aria-label', t('lang.label'));
      toggle.setAttribute('lang', lang === 'fa' ? 'en' : 'fa');
    }
    if (!options.silent) {
      document.dispatchEvent(new CustomEvent('az:languagechange', { detail: { lang } }));
    }
  }

  window.AZ = {
    t,
    apply: applyTo,
    get lang() { return current; },
    set: setLanguage,
    toggle: () => setLanguage(current === 'fa' ? 'en' : 'fa'),
    dir: () => LANGS[current].dir,
    /* Persian prefers its own forms for a handful of catalogue words that are
       produced in script rather than written in the page. */
    plural: count => t(count === 1 ? 'cat.piece' : 'cat.pieces'),

    /* The catalogue stays one dataset. A piece carries its Persian in an `fa`
       block beside the English, so the admin panel still edits one record and
       a piece with no translation yet simply reads in English. */
    field: (record, key) => {
      if (!record) return '';
      if (current === 'fa' && record.fa && record.fa[key]) return record.fa[key];
      return record[key] || '';
    },
    colour: variant => {
      if (!variant) return '';
      if (current === 'fa' && variant.colorFa) return variant.colorFa;
      return variant.color || '';
    },
    details: record => {
      if (!record) return {};
      if (current === 'fa' && record.fa && record.fa.details) return record.fa.details;
      return record.details || {};
    }
  };

  // Set the language before first paint so the page is never seen in the
  // wrong direction, then again on DOMContentLoaded once the nodes exist.
  document.documentElement.lang = current;
  document.documentElement.dir = LANGS[current].dir;
  document.documentElement.dataset.lang = current;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setLanguage(current, { silent: true }), { once: true });
  } else setLanguage(current, { silent: true });

  document.addEventListener('click', event => {
    const toggle = event.target.closest('#languageToggle');
    if (!toggle) return;
    event.preventDefault();
    window.AZ.toggle();
  });
})();
