// app.js - Core application logic
// ES modules are strict by default

  const STORAGE_PREFIX = 'universal_trip_plan_v1_';
  const PLAN_CACHE_KEY = STORAGE_PREFIX + 'last_good_plan';
  const STATE_KEY = STORAGE_PREFIX + 'state';
  const LEGACY_LOCAL_KEY = STORAGE_PREFIX + 'api_key';
  const LEGACY_SESSION_KEY = STORAGE_PREFIX + 'session_api_key';
  const PROXY_TOKEN_LOCAL_KEY = STORAGE_PREFIX + 'proxy_token';
  const THEME_KEY = STORAGE_PREFIX + 'theme_mode';
  const LAYOUT_V27_KEY = STORAGE_PREFIX + 'layout_v2_7_initialized';
  const HISTORY_KEY = 'travel_planner_plan_history';
  const MAX_HISTORY = 20;

  const PROVIDERS = {
    deepseek: {
      label: 'DeepSeek',
      endpoint: 'https://api.deepseek.com/chat/completions',
      model: 'deepseek-v4-flash',
      models: ['deepseek-v4-flash', 'deepseek-v4-pro']
    },
    mimo: {
      label: 'MiMo-V2.5',
      endpoint: 'https://api.xiaomimimo.com/v1',
      model: 'mimo-v2.5',
      models: ['mimo-v2.5', 'mimo-v2.5-pro']
    }
  };
  const POPULAR_DESTINATIONS = [
    ['千岛湖', '浙江杭州', 29.62, 119.02, ['湖景', '亲子', '自驾'], ['中心湖区', '天屿山观景台', '环湖绿道']],
    ['广德太极洞', '安徽宣城', 30.89, 119.42, ['溶洞', '竹海', '自驾'], ['太极洞', '卢湖竹海', '横山国家森林公园']],
    ['杭州西湖', '浙江杭州', 30.25, 120.15, ['湖景', '城市漫游'], ['西湖', '灵隐寺', '河坊街']],
    ['西溪湿地', '浙江杭州', 30.27, 120.06, ['湿地', '亲子', '慢游'], ['西溪国家湿地公园', '深潭口', '河渚街']],
    ['杭州宋城', '浙江杭州', 30.16, 120.09, ['演艺', '亲子', '夜游'], ['宋城景区', '宋城千古情', '主题街区']],
    ['良渚古城遗址', '浙江杭州', 30.39, 119.99, ['遗址', '博物馆', '亲子'], ['良渚古城遗址公园', '良渚博物院', '美地农场']],
    ['湘湖', '浙江杭州', 30.16, 120.23, ['湖景', '亲子', '轻松'], ['湘湖景区', '跨湖桥遗址', '湖山广场']],
    ['临安天目山', '浙江杭州', 30.34, 119.44, ['山林', '避暑', '自驾'], ['西天目山', '天目大峡谷', '禅源寺']],
    ['桐庐富春江', '浙江杭州', 29.80, 119.69, ['江景', '自驾', '亲子'], ['富春江', '严子陵钓台', '大奇山']],
    ['建德新安江', '浙江杭州', 29.48, 119.28, ['江景', '避暑', '自驾'], ['新安江水电站', '七里扬帆', '梅城古镇']],
    ['上海迪士尼', '上海浦东', 31.14, 121.66, ['乐园', '亲子'], ['上海迪士尼乐园', '迪士尼小镇']],
    ['上海外滩', '上海黄浦', 31.24, 121.49, ['城市', '夜景', '步行'], ['外滩', '南京东路', '豫园']],
    ['上海豫园', '上海黄浦', 31.23, 121.49, ['园林', '老城厢', '美食'], ['豫园', '城隍庙', '九曲桥']],
    ['上海海昌海洋公园', '上海浦东', 30.91, 121.93, ['海洋馆', '亲子', '乐园'], ['海昌海洋公园', '滴水湖', '临港新城']],
    ['上海欢乐谷', '上海松江', 31.10, 121.22, ['乐园', '亲子', '刺激'], ['上海欢乐谷', '佘山', '月湖雕塑公园']],
    ['朱家角古镇', '上海青浦', 31.11, 121.05, ['古镇', '水乡', '短途'], ['朱家角古镇', '放生桥', '课植园']],
    ['崇明岛', '上海崇明', 31.63, 121.40, ['海岛', '生态', '自驾'], ['东平国家森林公园', '西沙湿地', '长江大桥']],
    ['苏州园林', '江苏苏州', 31.30, 120.62, ['园林', '古城'], ['拙政园', '狮子林', '平江路']],
    ['苏州平江路', '江苏苏州', 31.31, 120.63, ['古城', '步行', '美食'], ['平江路', '观前街', '拙政园']],
    ['苏州金鸡湖', '江苏苏州', 31.32, 120.70, ['城市湖景', '夜景', '亲子'], ['金鸡湖', '诚品书店', '苏州中心']],
    ['周庄古镇', '江苏苏州', 31.12, 120.85, ['古镇', '水乡', '夜游'], ['周庄古镇', '双桥', '沈厅']],
    ['同里古镇', '江苏苏州', 31.16, 120.72, ['古镇', '水乡', '慢游'], ['同里古镇', '退思园', '三桥']],
    ['甪直古镇', '江苏苏州', 31.27, 120.87, ['古镇', '小众', '水乡'], ['甪直古镇', '保圣寺', '古桥群']],
    ['太湖西山岛', '江苏苏州', 31.08, 120.27, ['太湖', '自驾', '采摘'], ['西山岛', '明月湾古村', '林屋洞']],
    ['无锡鼋头渚', '江苏无锡', 31.53, 120.22, ['太湖', '赏花', '亲子'], ['鼋头渚', '太湖仙岛', '蠡园']],
    ['无锡灵山', '江苏无锡', 31.43, 120.10, ['祈福', '太湖', '亲子'], ['灵山大佛', '拈花湾', '太湖']],
    ['宜兴竹海', '江苏无锡', 31.15, 119.76, ['竹海', '山林', '自驾'], ['宜兴竹海', '张公洞', '善卷洞']],
    ['常州中华恐龙园', '江苏常州', 31.81, 119.99, ['乐园', '亲子', '主题'], ['中华恐龙园', '恐龙谷温泉', '环球港']],
    ['扬州瘦西湖', '江苏扬州', 32.40, 119.42, ['湖景', '园林', '慢游'], ['瘦西湖', '个园', '东关街']],
    ['镇江金山寺', '江苏镇江', 32.21, 119.41, ['历史', '江景', '短途'], ['金山寺', '西津渡', '北固山']],
    ['南京夫子庙', '江苏南京', 32.02, 118.79, ['历史', '夜游'], ['夫子庙', '秦淮河', '老门东']],
    ['南京中山陵', '江苏南京', 32.06, 118.85, ['历史', '山林', '亲子'], ['中山陵', '明孝陵', '美龄宫']],
    ['南京玄武湖', '江苏南京', 32.07, 118.80, ['湖景', '城市', '亲子'], ['玄武湖', '鸡鸣寺', '南京城墙']],
    ['南京牛首山', '江苏南京', 31.91, 118.78, ['建筑', '祈福', '摄影'], ['牛首山', '佛顶宫', '佛顶塔']],
    ['南通狼山', '江苏南通', 31.95, 120.89, ['江景', '祈福', '短途'], ['狼山', '濠河', '南通博物苑']],
    ['连云港花果山', '江苏连云港', 34.65, 119.29, ['山海', '亲子', '神话'], ['花果山', '连岛', '海上云台山']],
    ['盐城大丰麋鹿保护区', '江苏盐城', 32.99, 120.82, ['生态', '亲子', '湿地'], ['大丰麋鹿保护区', '黄海湿地', '荷兰花海']],
    ['泰州溱湖湿地', '江苏泰州', 32.61, 120.09, ['湿地', '亲子', '慢游'], ['溱湖国家湿地公园', '溱潼古镇', '水上森林']],
    ['徐州云龙湖', '江苏徐州', 34.23, 117.15, ['湖景', '城市', '历史'], ['云龙湖', '云龙山', '徐州博物馆']],
    ['黄山', '安徽黄山', 30.13, 118.17, ['山岳', '摄影'], ['黄山风景区', '云谷寺', '玉屏楼']],
    ['宏村', '安徽黄山', 30.00, 117.99, ['古村', '摄影'], ['宏村', '南湖', '月沼']],
    ['乌镇', '浙江嘉兴', 30.75, 120.49, ['古镇', '夜景'], ['西栅', '东栅', '乌镇大剧院']],
    ['西塘古镇', '浙江嘉兴', 30.95, 120.89, ['古镇', '水乡', '夜景'], ['西塘古镇', '烟雨长廊', '送子来凤桥']],
    ['南湖景区', '浙江嘉兴', 30.76, 120.76, ['湖景', '历史', '城市'], ['南湖', '月河历史街区', '梅花洲']],
    ['莫干山', '浙江湖州', 30.61, 119.87, ['山居', '避暑'], ['莫干山风景区', '庾村', '民宿区']],
    ['南浔古镇', '浙江湖州', 30.88, 120.43, ['古镇', '水乡', '慢游'], ['南浔古镇', '小莲庄', '百间楼']],
    ['安吉云上草原', '浙江湖州', 30.47, 119.61, ['山地', '亲子', '度假'], ['云上草原', '安吉竹博园', '中南百草原']],
    ['安吉竹博园', '浙江湖州', 30.63, 119.68, ['竹林', '亲子', '自然'], ['中国竹子博览园', '中南百草原', 'Hello Kitty乐园']],
    ['湖州太湖龙之梦', '浙江湖州', 30.89, 120.10, ['乐园', '亲子', '太湖'], ['太湖龙之梦乐园', '太湖古镇', '动物世界']],
    ['普陀山', '浙江舟山', 29.97, 122.39, ['海岛', '祈福'], ['普济寺', '南海观音', '法雨寺']],
    ['舟山朱家尖', '浙江舟山', 29.92, 122.39, ['海岛', '沙滩', '亲子'], ['南沙', '大青山', '乌石塘']],
    ['嵊泗列岛', '浙江舟山', 30.73, 122.45, ['海岛', '度假', '摄影'], ['基湖沙滩', '枸杞岛', '嵊山岛']],
    ['绍兴鲁迅故里', '浙江绍兴', 30.00, 120.58, ['历史', '古城', '亲子'], ['鲁迅故里', '沈园', '仓桥直街']],
    ['绍兴安昌古镇', '浙江绍兴', 30.15, 120.49, ['古镇', '年味', '水乡'], ['安昌古镇', '师爷馆', '古街']],
    ['宁波东钱湖', '浙江宁波', 29.78, 121.63, ['湖景', '亲子', '自驾'], ['东钱湖', '韩岭老街', '小普陀']],
    ['宁波象山影视城', '浙江宁波', 29.48, 121.86, ['影视', '亲子', '海边'], ['象山影视城', '石浦古城', '松兰山']],
    ['宁波雪窦山', '浙江宁波', 29.69, 121.21, ['山林', '祈福', '避暑'], ['雪窦山', '溪口古镇', '蒋氏故居']],
    ['台州神仙居', '浙江台州', 28.70, 120.61, ['山岳', '栈道', '摄影'], ['神仙居', '淡竹原始森林', '皤滩古镇']],
    ['温岭石塘', '浙江台州', 28.28, 121.61, ['海边', '渔村', '摄影'], ['石塘镇', '小箬村', '千年曙光碑']],
    ['温州雁荡山', '浙江温州', 28.37, 121.08, ['山岳', '瀑布', '摄影'], ['雁荡山', '灵峰', '大龙湫']],
    ['温州楠溪江', '浙江温州', 28.30, 120.69, ['江景', '古村', '亲水'], ['楠溪江', '丽水古街', '苍坡古村']],
    ['丽水古堰画乡', '浙江丽水', 28.27, 119.77, ['江景', '摄影', '慢游'], ['古堰画乡', '通济堰', '瓯江帆影']],
    ['缙云仙都', '浙江丽水', 28.65, 120.09, ['山水', '摄影', '古风'], ['仙都景区', '鼎湖峰', '朱潭山']],
    ['衢州江郎山', '浙江衢州', 28.53, 118.57, ['山岳', '世界遗产', '自驾'], ['江郎山', '廿八都古镇', '清漾村']],
    ['金华横店影视城', '浙江金华', 29.16, 120.32, ['影视', '亲子', '演艺'], ['横店影视城', '秦王宫', '梦幻谷']],
    ['金华双龙洞', '浙江金华', 29.18, 119.63, ['溶洞', '避暑', '亲子'], ['双龙洞', '冰壶洞', '黄大仙祖宫']],
    ['厦门鼓浪屿', '福建厦门', 24.45, 118.07, ['海岛', '步行'], ['鼓浪屿', '中山路', '环岛路']],
    ['三亚', '海南三亚', 18.25, 109.51, ['海滩', '度假'], ['亚龙湾', '天涯海角', '椰梦长廊']],
    ['桂林阳朔', '广西桂林', 24.78, 110.50, ['山水', '竹筏'], ['漓江', '遇龙河', '西街']],
    ['张家界', '湖南张家界', 29.12, 110.48, ['山岳', '玻璃桥'], ['武陵源', '天门山', '大峡谷']],
    ['成都', '四川成都', 30.66, 104.06, ['美食', '亲子'], ['宽窄巷子', '熊猫基地', '锦里']],
    ['重庆', '重庆', 29.56, 106.55, ['山城', '夜景'], ['洪崖洞', '解放碑', '长江索道']],
    ['西安', '陕西西安', 34.34, 108.94, ['历史', '美食'], ['兵马俑', '城墙', '大唐不夜城']],
    ['北京故宫', '北京', 39.91, 116.40, ['历史', '博物馆'], ['故宫', '景山', '天安门']],
    ['青岛', '山东青岛', 36.07, 120.38, ['海滨', '城市'], ['栈桥', '八大关', '五四广场']],
    ['长沙', '湖南长沙', 28.23, 112.94, ['美食', '夜游'], ['橘子洲', '岳麓山', '五一广场']],
    ['武汉', '湖北武汉', 30.59, 114.30, ['江景', '历史'], ['黄鹤楼', '东湖', '江汉路']],
    ['洛阳', '河南洛阳', 34.62, 112.45, ['古都', '石窟'], ['龙门石窟', '白马寺', '洛邑古城']],
    ['丽江', '云南丽江', 26.87, 100.23, ['古城', '雪山'], ['丽江古城', '玉龙雪山', '束河古镇']],
    ['大理', '云南大理', 25.61, 100.27, ['洱海', '古城'], ['洱海', '大理古城', '喜洲古镇']],
    ['拉萨', '西藏拉萨', 29.65, 91.12, ['高原', '人文'], ['布达拉宫', '大昭寺', '八廓街']],
    ['敦煌', '甘肃酒泉', 40.14, 94.66, ['沙漠', '石窟'], ['莫高窟', '鸣沙山月牙泉', '敦煌夜市']],
    ['呼伦贝尔', '内蒙古呼伦贝尔', 49.21, 119.76, ['草原', '自驾'], ['额尔古纳湿地', '莫日格勒河', '满洲里']],
    ['哈尔滨', '黑龙江哈尔滨', 45.80, 126.53, ['冰雪', '城市'], ['中央大街', '索菲亚教堂', '太阳岛']],
    ['长白山', '吉林延边', 42.02, 128.07, ['山岳', '温泉'], ['长白山天池', '瀑布', '温泉区']]
  ].map(([name, region, lat, lon, tags, attractions]) => ({ name, region, lat, lon, tags, attractions }));

  const WEEKDAY = ['周日','周一','周二','周三','周四','周五','周六'];
  const WMO_MAP = {
    0:{desc:'晴天',icon:'☀️'},1:{desc:'晴间多云',icon:'🌤️'},2:{desc:'多云',icon:'⛅'},3:{desc:'阴天',icon:'☁️'},
    45:{desc:'雾',icon:'🌫️'},48:{desc:'大雾',icon:'🌫️'},51:{desc:'小毛毛雨',icon:'🌦️'},53:{desc:'毛毛雨',icon:'🌦️'},
    55:{desc:'大毛毛雨',icon:'🌦️'},61:{desc:'小雨',icon:'🌧️'},63:{desc:'中雨',icon:'🌧️'},65:{desc:'大雨',icon:'🌧️'},
    71:{desc:'小雪',icon:'🌨️'},73:{desc:'中雪',icon:'🌨️'},75:{desc:'大雪',icon:'🌨️'},80:{desc:'阵雨',icon:'🌦️'},
    81:{desc:'中阵雨',icon:'🌦️'},82:{desc:'大阵雨',icon:'🌦️'},95:{desc:'雷暴',icon:'⛈️'},96:{desc:'雷暴加冰雹',icon:'⛈️'},99:{desc:'雷暴加大冰雹',icon:'⛈️'}
  };

  const els = {
    headerTitle: document.getElementById('headerTitle'),
    updateTime: document.getElementById('updateTime'),
    themeToggle: document.getElementById('themeToggle'),
    editToggle: document.getElementById('editToggle'),
    editTrack: document.getElementById('editTrack'),
    departureCity: document.getElementById('departureCity'),
    destinationInput: document.getElementById('destinationInput'),
    destinationList: document.getElementById('destinationList'),
    startDate: document.getElementById('startDate'),
    tripDays: document.getElementById('tripDays'),
    transportMode: document.getElementById('transportMode'),
    travelers: document.getElementById('travelers'),
    generateBtn: document.getElementById('generateBtn'),
    cancelGenerateBtn: document.getElementById('cancelGenerateBtn'),
    resetBtn: document.getElementById('resetBtn'),
    printBtn: document.getElementById('printBtn'),
    statusBox: document.getElementById('statusBox'),
    aiProvider: document.getElementById('aiProvider'),
    aiModel: document.getElementById('aiModel'),
    callMode: document.getElementById('callMode'),
    proxyBase: document.getElementById('proxyBase'),
    proxyToken: document.getElementById('proxyToken'),
    rememberProxyToken: document.getElementById('rememberProxyToken'),
    apiKey: document.getElementById('apiKey'),
    apiEndpoint: document.getElementById('apiEndpoint'),
    rememberKey: document.getElementById('rememberKey'),
    testAiBtn: document.getElementById('testAiBtn'),
    clearKeyBtn: document.getElementById('clearKeyBtn'),
    aiStatusBox: document.getElementById('aiStatusBox'),
    introContent: document.getElementById('introContent'),
    forecastGrid: document.getElementById('forecastGrid'),
    weatherAdvice: document.getElementById('weatherAdvice'),
    trafficContent: document.getElementById('trafficContent'),
    overviewContent: document.getElementById('overviewContent'),
    dailyContent: document.getElementById('dailyContent'),
    budgetContent: document.getElementById('budgetContent'),
    tipsContent: document.getElementById('tipsContent'),
    dayEditorBackdrop: document.getElementById('dayEditorBackdrop'),
    dayEditorSheet: document.getElementById('dayEditorSheet'),
    dayEditorClose: document.getElementById('dayEditorClose'),
    dayEditorCancel: document.getElementById('dayEditorCancel'),
    dayEditorSave: document.getElementById('dayEditorSave'),
    dayEditorAdd: document.getElementById('dayEditorAdd'),
    dayEditorKicker: document.getElementById('dayEditorKicker'),
    dayEditorDayTitle: document.getElementById('dayEditorDayTitle'),
    dayEditorDate: document.getElementById('dayEditorDate'),
    dayEditorItems: document.getElementById('dayEditorItems'),
    hotelName: document.getElementById('hotelName'),
    checkinDate: document.getElementById('checkinDate'),
    checkoutDate: document.getElementById('checkoutDate'),
    departTicketNo: document.getElementById('departTicketNo'),
    returnTicketNo: document.getElementById('returnTicketNo'),
    ticketNote: document.getElementById('ticketNote')
  };

  let isEditing = false;
  let currentAbort = null;
  let elapsedTimer = null;
  let generationStartedAt = 0;
  let currentSignature = '';
  let currentPlan = null;
  let activeProvider = 'deepseek';
  let activeDayIndex = 0;
  let overviewRouteRenderId = 0;
  let editingDayIndex = -1;
  let activeAppTab = 'home';
  let appSwipers = {};
  let appPageRegistry = {};

  class MiniSwiper {
    constructor(el, options = {}) {
      this.el = el;
      this.wrapper = el?.querySelector(options.wrapperSelector || '.mini-swiper-wrapper');
      this.slideSelector = options.slideSelector || '.mini-swiper-slide';
      this.options = options;
      this.activeIndex = Math.max(0, Number(options.initialSlide) || 0);
      this.startX = 0;
      this.startY = 0;
      this.deltaX = 0;
      this.lastMoveX = 0;
      this.lastMoveTime = 0;
      this.velocityX = 0;
      this.dragging = false;
      this.lockedAxis = '';
      this.pointerId = null;
      this.swiped = false;
      this.suppressClick = false;
      this.isAnimating = false;
      this.pendingSettledIndex = null;
      this.settleTimer = null;
      this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      this.onPointerDown = this.onPointerDown.bind(this);
      this.onPointerMove = this.onPointerMove.bind(this);
      this.onPointerUp = this.onPointerUp.bind(this);
      this.onClickCapture = this.onClickCapture.bind(this);
      this.onResize = this.onResize.bind(this);
      this.onTransitionEnd = this.onTransitionEnd.bind(this);
      this.onWindowBlur = this.onWindowBlur.bind(this);
      this.bind();
      this.update();
      this.slideTo(this.activeIndex, false);
    }

    get slides() {
      return this.wrapper ? Array.from(this.wrapper.querySelectorAll(this.slideSelector)) : [];
    }

    bind() {
      if (!this.el || !this.wrapper) return;
      this.el.addEventListener('pointerdown', this.onPointerDown);
      this.el.addEventListener('pointermove', this.onPointerMove);
      this.el.addEventListener('pointerup', this.onPointerUp);
      this.el.addEventListener('pointercancel', this.onPointerUp);
      this.el.addEventListener('click', this.onClickCapture, true);
      this.wrapper.addEventListener('transitionend', this.onTransitionEnd);
      window.addEventListener('pointerup', this.onPointerUp);
      window.addEventListener('pointercancel', this.onPointerUp);
      window.addEventListener('resize', this.onResize);
      window.addEventListener('blur', this.onWindowBlur);
    }

    destroy() {
      if (!this.el) return;
      this.clearSettleTimer();
      this.el.removeEventListener('pointerdown', this.onPointerDown);
      this.el.removeEventListener('pointermove', this.onPointerMove);
      this.el.removeEventListener('pointerup', this.onPointerUp);
      this.el.removeEventListener('pointercancel', this.onPointerUp);
      this.el.removeEventListener('click', this.onClickCapture, true);
      this.wrapper?.removeEventListener('transitionend', this.onTransitionEnd);
      window.removeEventListener('pointerup', this.onPointerUp);
      window.removeEventListener('pointercancel', this.onPointerUp);
      window.removeEventListener('resize', this.onResize);
      window.removeEventListener('blur', this.onWindowBlur);
    }

    update() {
      this.width = Math.max(1, this.el?.clientWidth || 1);
      this.count = this.slides.length;
      this.activeIndex = Math.min(Math.max(this.activeIndex, 0), Math.max(0, this.count - 1));
      this.applyTranslate(-this.activeIndex * this.width, false);
      this.syncSlides();
    }

    onResize() {
      this.update();
    }

    isInteractiveTarget(target) {
      return !!target.closest('[contenteditable="true"],[data-no-swiper]');
    }

    onPointerDown(event) {
      if (this.count <= 1 || event.button !== 0 || this.isInteractiveTarget(event.target)) return;
      this.pointerId = event.pointerId;
      this.startX = event.clientX;
      this.startY = event.clientY;
      this.deltaX = 0;
      this.lastMoveX = event.clientX;
      this.lastMoveTime = performance.now();
      this.velocityX = 0;
      this.dragging = true;
      this.lockedAxis = '';
      this.swiped = false;
      this.clearSettleTimer();
      this.wrapper.classList.add('no-transition');
      this.el.classList.add('is-dragging');
    }

    onPointerMove(event) {
      if (!this.dragging || event.pointerId !== this.pointerId) return;
      const dx = event.clientX - this.startX;
      const dy = event.clientY - this.startY;
      const absX = Math.abs(dx);
      const absY = Math.abs(dy);
      const now = performance.now();
      const elapsed = Math.max(16, now - this.lastMoveTime);
      this.velocityX = (event.clientX - this.lastMoveX) / elapsed;
      this.lastMoveX = event.clientX;
      this.lastMoveTime = now;
      if (!this.lockedAxis && (absX > 8 || absY > 8)) {
        if (absX >= 8 && absX >= absY * .62) {
          this.lockedAxis = 'x';
        } else if (absY >= 14 && absY >= absX * 1.45) {
          this.lockedAxis = 'y';
        }
        if (this.lockedAxis === 'x') {
          this.el.classList.add('is-swiping-x');
          try { this.el.setPointerCapture(event.pointerId); } catch {}
        }
      }
      if (this.lockedAxis !== 'x') return;
      event.preventDefault();
      const atStart = this.activeIndex === 0 && dx > 0;
      const atEnd = this.activeIndex === this.count - 1 && dx < 0;
      this.deltaX = (atStart || atEnd) ? dx * .32 : dx;
      if (Math.abs(this.deltaX) > 10) this.swiped = true;
      this.applyTranslate((-this.activeIndex * this.width) + this.deltaX, false);
    }

    onPointerUp(event) {
      if (!this.dragging || event.pointerId !== this.pointerId) return;
      this.dragging = false;
      this.wrapper.classList.remove('no-transition');
      this.el.classList.remove('is-dragging', 'is-swiping-x');
      const didSwipe = this.lockedAxis === 'x' && this.swiped;
      const swipeDistance = Math.abs(this.deltaX);
      const swipeThreshold = Math.min(56, this.width * .15);
      const flicked = swipeDistance > 24 && Math.abs(this.velocityX) > .45;
      if (this.lockedAxis === 'x') {
        void this.wrapper.offsetWidth;
      }
      if (this.lockedAxis === 'x' && (swipeDistance > swipeThreshold || flicked)) {
        this.slideTo(this.activeIndex + (this.deltaX < 0 ? 1 : -1), true);
      } else {
        this.slideTo(this.activeIndex, true);
      }
      if (didSwipe) {
        this.suppressClick = true;
        setTimeout(() => { this.suppressClick = false; }, 0);
      }
      this.deltaX = 0;
      this.lockedAxis = '';
      this.swiped = false;
      try { this.el.releasePointerCapture(event.pointerId); } catch {}
      this.pointerId = null;
    }

    onClickCapture(event) {
      if (!this.suppressClick) return;
      event.preventDefault();
      event.stopPropagation();
      this.suppressClick = false;
    }

    onWindowBlur() {
      if (!this.dragging) return;
      this.dragging = false;
      this.pointerId = null;
      this.wrapper.classList.remove('no-transition');
      this.el.classList.remove('is-dragging', 'is-swiping-x');
      void this.wrapper.offsetWidth;
      this.slideTo(this.activeIndex, true);
      this.deltaX = 0;
      this.lockedAxis = '';
      this.swiped = false;
    }

    applyTranslate(value, animate) {
      if (!this.wrapper) return;
      if (animate === false || this.reducedMotion) {
        this.wrapper.classList.add('no-transition');
      } else {
        this.wrapper.classList.remove('no-transition');
      }
      this.wrapper.style.transform = `translate3d(${value}px,0,0)`;
    }

    slideTo(index, animate = true) {
      const next = Math.min(Math.max(Number(index) || 0, 0), Math.max(0, this.count - 1));
      const changed = next !== this.activeIndex;
      this.activeIndex = next;
      this.applyTranslate(-next * this.width, animate);
      this.syncSlides();
      this.scheduleSettled(next, animate, changed);
      if (changed && typeof this.options.onChange === 'function') this.options.onChange(next, this);
    }

    clearSettleTimer() {
      if (this.settleTimer) {
        clearTimeout(this.settleTimer);
        this.settleTimer = null;
      }
      this.pendingSettledIndex = null;
      this.isAnimating = false;
    }

    scheduleSettled(index, animate, notify = true) {
      this.clearSettleTimer();
      if (!notify) return;
      if (animate === false || this.reducedMotion) {
        this.notifySettled(index);
        return;
      }
      this.isAnimating = true;
      this.pendingSettledIndex = index;
      this.settleTimer = setTimeout(() => this.flushSettled(), 650);
    }

    onTransitionEnd(event) {
      if (event.target !== this.wrapper || event.propertyName !== 'transform') return;
      this.flushSettled();
    }

    flushSettled() {
      if (this.pendingSettledIndex === null) return;
      const index = this.pendingSettledIndex;
      if (this.settleTimer) clearTimeout(this.settleTimer);
      this.settleTimer = null;
      this.pendingSettledIndex = null;
      this.isAnimating = false;
      this.notifySettled(index);
    }

    notifySettled(index) {
      this.isAnimating = false;
      if (typeof this.options.onSettled === 'function') this.options.onSettled(index, this);
    }

    syncSlides() {
      this.slides.forEach((slide, index) => {
        slide.classList.toggle('active', index === this.activeIndex);
        slide.setAttribute('aria-hidden', index === this.activeIndex ? 'false' : 'true');
      });
    }
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, (ch) => ({
      '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'
    }[ch]));
  }

  function formatDate(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  function addDays(dateText, days) {
    const d = new Date(dateText + 'T00:00:00');
    d.setDate(d.getDate() + days);
    return formatDate(d);
  }

  function weatherDisplayDates(state) {
    const startDate = state.startDate || todayText();
    const dayCount = Math.max(1, Number(state.days) || 1);
    const includePreviousDay = daysBetween(todayText(), startDate) > 0;
    const beforeDays = includePreviousDay ? 1 : 0;
    return Array.from({ length: dayCount + beforeDays + 1 }, (_, i) => addDays(startDate, i - beforeDays));
  }

  function displayDate(dateText) {
    const d = new Date(dateText + 'T00:00:00');
    return `${d.getMonth() + 1}月${d.getDate()}日 ${WEEKDAY[d.getDay()]}`;
  }

  function formatDateTime(value) {
    const d = value ? new Date(value) : new Date();
    if (Number.isNaN(d.getTime())) return '';
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${y}/${m}/${day} ${hh}:${mm}`;
  }

  function todayText() {
    return formatDate(new Date());
  }

  function daysBetween(a, b) {
    const da = new Date(a + 'T00:00:00');
    const db = new Date(b + 'T00:00:00');
    return Math.round((db - da) / 86400000);
  }

  function windDesc(speed) {
    if (speed < 5) return '微风';
    if (speed < 15) return '和风';
    if (speed < 25) return '清风';
    if (speed < 35) return '强风';
    return '大风';
  }

  function setBox(el, message, type = '') {
    el.textContent = message || '';
    el.className = 'status-box' + (message ? ' show' : '') + (type ? ' ' + type : '');
  }

  function providerKey(provider) {
    return PROVIDERS[provider] ? provider : 'deepseek';
  }

  function apiLocalKey(provider) {
    return `${STORAGE_PREFIX}api_key_${providerKey(provider)}`;
  }

  function apiSessionKey(provider) {
    return `${STORAGE_PREFIX}session_api_key_${providerKey(provider)}`;
  }

  function migrateLegacyApiKey() {
    const legacyLocal = localStorage.getItem(LEGACY_LOCAL_KEY);
    const legacySession = sessionStorage.getItem(LEGACY_SESSION_KEY);
    if (legacyLocal && !localStorage.getItem(apiLocalKey('deepseek'))) {
      localStorage.setItem(apiLocalKey('deepseek'), legacyLocal);
    }
    if (legacySession && !sessionStorage.getItem(apiSessionKey('deepseek'))) {
      sessionStorage.setItem(apiSessionKey('deepseek'), legacySession);
    }
    localStorage.removeItem(LEGACY_LOCAL_KEY);
    sessionStorage.removeItem(LEGACY_SESSION_KEY);
  }

  function storedDirectApiKey(provider = els.aiProvider.value) {
    const key = providerKey(provider);
    return localStorage.getItem(apiLocalKey(key)) || sessionStorage.getItem(apiSessionKey(key)) || '';
  }

  function setApiKeyControlForProvider(provider = els.aiProvider.value) {
    const key = providerKey(provider);
    const localKey = localStorage.getItem(apiLocalKey(key));
    const sessionKey = sessionStorage.getItem(apiSessionKey(key));
    els.apiKey.value = localKey || sessionKey || '';
    els.rememberKey.checked = Boolean(localKey);
  }

  function saveProviderApiKey(provider = els.aiProvider.value) {
    const key = providerKey(provider);
    const value = els.apiKey.readOnly ? storedDirectApiKey(key) : els.apiKey.value.trim();
    if (value) {
      sessionStorage.setItem(apiSessionKey(key), value);
    } else {
      sessionStorage.removeItem(apiSessionKey(key));
    }
    if (els.rememberKey.checked && value) {
      localStorage.setItem(apiLocalKey(key), value);
    } else {
      localStorage.removeItem(apiLocalKey(key));
    }
  }

  function clearAllProviderApiKeys() {
    Object.keys(PROVIDERS).forEach(provider => {
      localStorage.removeItem(apiLocalKey(provider));
      sessionStorage.removeItem(apiSessionKey(provider));
    });
    localStorage.removeItem(LEGACY_LOCAL_KEY);
    sessionStorage.removeItem(LEGACY_SESSION_KEY);
  }

  function normalizeProxyBase(value) {
    const raw = String(value || '').trim();
    if (!raw) return '';
    const withScheme = /^[a-z][a-z\d+\-.]*:\/\//i.test(raw) ? raw : `https://${raw}`;
    try {
      return new URL(withScheme).origin;
    } catch {
      return raw
        .replace(/\/(?:v1\/)?(?:deepseek|mimo)\/chat\/completions\/?$/i, '')
        .replace(/\/v1\/?$/i, '')
        .replace(/\/+$/, '');
    }
  }

  function normalizeProxyField(showMessage = false) {
    const normalized = normalizeProxyBase(els.proxyBase.value);
    const current = els.proxyBase.value.trim();
    if (normalized && normalized !== current) {
      els.proxyBase.value = normalized;
      if (showMessage) setBox(els.aiStatusBox, '已自动修正代理域名。');
    }
    return normalized;
  }

  function updateTime() {
    const now = new Date();
    els.updateTime.textContent = `更新于 ${now.getFullYear()}/${String(now.getMonth()+1).padStart(2,'0')}/${String(now.getDate()).padStart(2,'0')}`;
  }

  function fillDestinations() {
    els.destinationList.innerHTML = POPULAR_DESTINATIONS
      .map(d => `<option value="${escapeHtml(d.name)}">${escapeHtml(d.region)} · ${escapeHtml(d.tags.join(' / '))}</option>`)
      .join('');
  }

  function fillModelOptions(provider) {
    const cfg = PROVIDERS[provider] || PROVIDERS.deepseek;
    els.aiModel.innerHTML = (cfg.models || [cfg.model])
      .map(model => `<option value="${escapeHtml(model)}">${escapeHtml(model)}</option>`)
      .join('');
  }

  function setDestinationControl(destination) {
    els.destinationInput.value = String(destination || '千岛湖').trim() || '千岛湖';
  }

  function defaultState() {
    return {
      departureCity: '杭州',
      destination: '千岛湖',
      startDate: todayText(),
      days: 2,
      transportMode: '自驾',
      travelers: '两大人+一岁婴儿，节奏轻松，优先好停车、少排队、可随时休息',
      provider: 'deepseek',
      callMode: 'proxy',
      proxyBase: '',
      proxyToken: '',
      apiKey: '',
      endpoint: PROVIDERS.deepseek.endpoint,
      model: PROVIDERS.deepseek.model,
      coordinates: { lat: 29.62, lon: 119.02 },
      hotelInfo: null,
      ticketInfo: null
    };
  }

  function getHotelInfo() {
    const name = els.hotelName.value.trim();
    const checkin = els.checkinDate.value;
    const checkout = els.checkoutDate.value;
    // Only treat as valid hotel info if at least checkin date is filled;
    // otherwise return null so AI doesn't get confused by empty dates.
    if (!checkin && !checkout) return null;
    return { name, checkinDate: checkin, checkoutDate: checkout };
  }

  function getTicketInfo() {
    const departNo = els.departTicketNo.value.trim();
    const returnNo = els.returnTicketNo.value.trim();
    const note = els.ticketNote.value.trim();
    if (!departNo && !returnNo && !note) return null;
    return { departNo, returnNo, note };
  }

  function getState() {
    const provider = els.aiProvider.value || 'deepseek';
    const cfg = PROVIDERS[provider] || PROVIDERS.deepseek;
    return {
      departureCity: els.departureCity.value.trim() || '杭州',
      destination: els.destinationInput.value.trim() || '千岛湖',
      startDate: els.startDate.value || todayText(),
      days: Number(els.tripDays.value || 2),
      transportMode: els.transportMode.value || '自驾',
      travelers: els.travelers.value.trim(),
      provider,
      callMode: els.callMode.value || 'proxy',
      proxyBase: normalizeProxyBase(els.proxyBase.value),
      proxyToken: els.proxyToken.value.trim(),
      apiKey: (els.callMode.value || 'proxy') === 'direct' ? els.apiKey.value.trim() : '',
      endpoint: els.apiEndpoint.value.trim() || cfg.endpoint,
      model: els.aiModel.value.trim() || cfg.model,
      coordinates: null,
      hotelInfo: getHotelInfo(),
      ticketInfo: getTicketInfo()
    };
  }

  function setControls(state) {
    const provider = providerKey(state.provider);
    const cfg = PROVIDERS[provider] || PROVIDERS.deepseek;
    els.departureCity.value = state.departureCity;
    setDestinationControl(state.destination);
    els.startDate.value = state.startDate;
    els.tripDays.value = String(state.days);
    els.transportMode.value = state.transportMode || '自驾';
    els.travelers.value = state.travelers;
    els.aiProvider.value = provider;
    fillModelOptions(provider);
    els.aiModel.value = state.model || cfg.model;
    if (!els.aiModel.value) els.aiModel.value = cfg.model;
    els.callMode.value = state.callMode || 'proxy';
    els.proxyBase.value = normalizeProxyBase(state.proxyBase || '');
    els.proxyToken.value = state.proxyToken || '';
    els.apiEndpoint.value = state.endpoint;
    if (els.hotelName) {
      const h = state.hotelInfo || {};
      els.hotelName.value = h.name || '';
      els.checkinDate.value = h.checkinDate || '';
      els.checkoutDate.value = h.checkoutDate || '';
    }
    if (els.departTicketNo) {
      const t = state.ticketInfo || {};
      els.departTicketNo.value = t.departNo || '';
      els.returnTicketNo.value = t.returnNo || '';
      els.ticketNote.value = t.note || '';
    }
  }

  function stateForStorage(state) {
    return { ...state, apiKey: '', proxyToken: '' };
  }

  function saveState(state) {
    localStorage.setItem(STATE_KEY, JSON.stringify(stateForStorage(state)));
  }

  function buildHistorySummary(plan, state) {
    // Build a clean summary without intro info
    const parts = [];
    if (plan.destination || state.destination) {
      parts.push(`${state.departureCity || ''} → ${plan.destination || state.destination}`);
    }
    if (state.startDate) {
      parts.push(displayDate(state.startDate));
    }
    if (state.days) {
      parts.push(`${state.days}天`);
    }
    if (state.transportMode) {
      parts.push(state.transportMode);
    }
    // Add 1-2 overview items if available
    if (plan.overview && plan.overview.length) {
      const first = plan.overview[0];
      if (first && first.plan) parts.push(first.plan.slice(0, 40));
    }
    if (plan.traffic && plan.traffic.distance) {
      parts.push(plan.traffic.distance);
    }
    // Add hotel/ticket hints
    if (state.hotelInfo && state.hotelInfo.name) {
      parts.push('酒店: ' + state.hotelInfo.name.slice(0, 20));
    }
    if (state.ticketInfo && (state.ticketInfo.departNo || state.ticketInfo.returnNo)) {
      parts.push('车票已填');
    }
    return parts.filter(Boolean).join(' | ') || (plan.title || '旅游计划');
  }

  function savePlanToHistory(plan, state, weather) {
    const history = loadPlanHistory();
    const item = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
      title: plan.title || (state.destination + '旅游计划'),
      destination: state.destination,
      departureCity: state.departureCity,
      startDate: state.startDate,
      tripDays: state.days,
      transportMode: state.transportMode || '自驾',
      travelers: state.travelers || '',
      hotelInfo: state.hotelInfo || null,
      ticketInfo: state.ticketInfo || null,
      createdAt: new Date().toISOString(),
      summary: buildHistorySummary(plan, state),
      planData: plan
    };
    history.unshift(item);
    if (history.length > MAX_HISTORY) history.length = MAX_HISTORY;
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    } catch {
      // Storage full, remove oldest and retry
      history.pop();
      try { localStorage.setItem(HISTORY_KEY, JSON.stringify(history)); } catch {}
    }
  }

  function loadPlanHistory() {
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      localStorage.removeItem(HISTORY_KEY);
      return [];
    }
  }

  function deletePlanHistoryItem(id) {
    const history = loadPlanHistory().filter(item => item.id !== id);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    return history;
  }

  function sanitizePlanCacheSecrets() {
    try {
      const cached = JSON.parse(localStorage.getItem(PLAN_CACHE_KEY) || 'null');
      if (cached?.state?.apiKey || cached?.state?.proxyToken) {
        cached.state = stateForStorage(cached.state);
        localStorage.setItem(PLAN_CACHE_KEY, JSON.stringify(cached));
      }
    } catch {
      localStorage.removeItem(PLAN_CACHE_KEY);
    }
  }

  // ---- Custom background (IndexedDB) ----
  const BG_DB_NAME = 'travel_planner_bg';
  const BG_STORE = 'backgrounds';
  const BG_KEY = 'custom_bg';
  const BG_MAX_SIZE = 1_000_000; // 1MB

  function openBgDB() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(BG_DB_NAME, 1);
      req.onupgradeneeded = () => { req.result.createObjectStore(BG_STORE); };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async function saveBgToDB(dataUrl, alpha) {
    const db = await openBgDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(BG_STORE, 'readwrite');
      tx.objectStore(BG_STORE).put({ dataUrl, alpha, updatedAt: Date.now() }, BG_KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async function loadBgFromDB() {
    try {
      const db = await openBgDB();
      return new Promise((resolve) => {
        const tx = db.transaction(BG_STORE, 'readonly');
        const req = tx.objectStore(BG_STORE).get(BG_KEY);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => resolve(null);
      });
    } catch { return null; }
  }

  async function clearBgFromDB() {
    try {
      const db = await openBgDB();
      return new Promise((resolve) => {
        const tx = db.transaction(BG_STORE, 'readwrite');
        tx.objectStore(BG_STORE).delete(BG_KEY);
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      });
    } catch { /* ignore */ }
  }

  function compressImage(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          const maxW = 1080;
          let w = img.width;
          let h = img.height;
          if (w > maxW) { h = Math.round(h * maxW / w); w = maxW; }
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, w, h);
          // Try jpeg at quality 0.75, reduce if > 1MB
          let quality = 0.75;
          let dataUrl = canvas.toDataURL('image/jpeg', quality);
          while (dataUrl.length > BG_MAX_SIZE && quality > 0.25) {
            quality -= 0.1;
            dataUrl = canvas.toDataURL('image/jpeg', quality);
          }
          if (dataUrl.length > BG_MAX_SIZE * 1.5) {
            reject(new Error('too_large'));
          } else {
            resolve(dataUrl);
          }
        };
        img.onerror = () => reject(new Error('load_error'));
        img.src = reader.result;
      };
      reader.onerror = () => reject(new Error('read_error'));
      reader.readAsDataURL(file);
    });
  }

  function clampBgAlpha(alpha) {
    const value = Number(alpha);
    if (!Number.isFinite(value)) return 0.7;
    return Math.min(0.7, Math.max(0, value));
  }

  function syncCustomBackgroundGlass(alpha, active = document.body.classList.contains('custom-bg')) {
    const clamped = clampBgAlpha(alpha);
    const ratio = clamped / 0.7;
    const isTransparent = active && clamped <= 0;

    document.body.classList.toggle('custom-bg-transparent', isTransparent);
    if (!active) {
      document.body.style.removeProperty('--custom-card-blur');
      document.body.style.removeProperty('--custom-sub-card-blur');
      return;
    }

    if (isTransparent) {
      document.body.style.setProperty('--custom-card-blur', 'none');
      document.body.style.setProperty('--custom-sub-card-blur', 'none');
      return;
    }

    const cardBlur = Math.round(30 * ratio);
    const subBlur = Math.round(16 * ratio);
    document.body.style.setProperty(
      '--custom-card-blur',
      `blur(${cardBlur}px) saturate(${(1 + 0.72 * ratio).toFixed(2)}) contrast(${(1 + 0.03 * ratio).toFixed(2)})`
    );
    document.body.style.setProperty(
      '--custom-sub-card-blur',
      `blur(${subBlur}px) saturate(${(1 + 0.42 * ratio).toFixed(2)})`
    );
  }

  function applyCustomBackground(dataUrl, alpha) {
    let layer = document.getElementById('customBgLayer');
    if (dataUrl) {
      if (!layer) {
        layer = document.createElement('div');
        layer.id = 'customBgLayer';
        document.body.prepend(layer);
      }
      layer.style.backgroundImage = `url(${dataUrl})`;
      const safeAlpha = clampBgAlpha(alpha);
      const pct = Math.round(safeAlpha * 100);
      document.body.style.setProperty('--card-alpha', pct + '%');
      document.body.classList.add('custom-bg');
      syncCustomBackgroundGlass(safeAlpha, true);
    } else {
      if (layer) layer.remove();
      document.body.style.removeProperty('--card-alpha');
      document.body.classList.remove('custom-bg');
      syncCustomBackgroundGlass(0, false);
    }
  }

  async function restoreCustomBackground() {
    const saved = await loadBgFromDB();
    if (saved && saved.dataUrl) {
      applyCustomBackground(saved.dataUrl, saved.alpha ?? 0.7);
    }
  }

  function createCustomBgCard() {
    const card = createAppCard('景', 'theme', '自定义背景', `
      <div class="bg-upload-preview" id="bgPreview">点击下方按钮上传背景图片</div>
      <div class="btn-row">
        <input type="file" id="bgFileInput" accept="image/jpeg,image/png,image/webp" style="display:none">
        <button class="primary" type="button" id="bgUploadBtn">上传图片</button>
        <button type="button" id="bgRestoreBtn">恢复默认</button>
      </div>
      <div class="bg-toggle-row">
        <span class="bg-blur-label">卡片透明度</span>
        <input type="range" id="bgAlphaSlider" min="0" max="70" value="70" step="5">
        <span id="bgAlphaValue">70%</span>
      </div>
    `);

    const preview = card.querySelector('#bgPreview');
    const fileInput = card.querySelector('#bgFileInput');
    const uploadBtn = card.querySelector('#bgUploadBtn');
    const restoreBtn = card.querySelector('#bgRestoreBtn');
    const alphaSlider = card.querySelector('#bgAlphaSlider');
    const alphaValue = card.querySelector('#bgAlphaValue');

    uploadBtn.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', async () => {
      const file = fileInput.files[0];
      if (!file) return;
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        setBox(els.statusBox, '仅支持 JPG、PNG、WebP 格式图片。', 'error');
        return;
      }
      setBox(els.statusBox, '正在压缩图片...');
      try {
        const dataUrl = await compressImage(file);
        const alpha = Number(alphaSlider.value) / 100;
        await saveBgToDB(dataUrl, alpha);
        applyCustomBackground(dataUrl, alpha);
        preview.style.backgroundImage = `url(${dataUrl})`;
        preview.classList.add('has-bg');
        preview.textContent = '';
        setBox(els.statusBox, '背景图片已更新。');
      } catch (err) {
        setBox(els.statusBox, '背景图片设置失败，请换一张较小的图片。', 'error');
      }
      fileInput.value = '';
    });

    alphaSlider.addEventListener('input', async () => {
      const val = Number(alphaSlider.value);
      alphaValue.textContent = val + '%';
      document.body.style.setProperty('--card-alpha', val + '%');
      syncCustomBackgroundGlass(val / 100);
      const saved = await loadBgFromDB();
      if (saved && saved.dataUrl) {
        await saveBgToDB(saved.dataUrl, val / 100);
      }
    });

    restoreBtn.addEventListener('click', async () => {
      await clearBgFromDB();
      applyCustomBackground(null, 0.7);
      preview.style.backgroundImage = '';
      preview.classList.remove('has-bg');
      preview.textContent = '点击下方按钮上传背景图片';
      alphaSlider.value = 70;
      alphaValue.textContent = '70%';
      setBox(els.statusBox, '已恢复默认背景。');
    });

    // Load current state into preview and slider
    loadBgFromDB().then(saved => {
      if (saved && saved.dataUrl) {
        preview.style.backgroundImage = `url(${saved.dataUrl})`;
        preview.classList.add('has-bg');
        preview.textContent = '';
        const pct = Math.round(clampBgAlpha(saved.alpha) * 100);
        const safePct = Math.min(70, Math.max(0, pct));
        alphaSlider.value = safePct;
        alphaValue.textContent = safePct + '%';
      }
    });

    return card;
  }

  function cachePlan(plan, state, weather) {
    localStorage.setItem(PLAN_CACHE_KEY, JSON.stringify({
      plan,
      state: stateForStorage(state),
      weather: weather || null,
      generatedAt: new Date().toISOString(),
      signature: signature(state)
    }));
  }

  function loadPlanCache() {
    try {
      return JSON.parse(localStorage.getItem(PLAN_CACHE_KEY) || 'null');
    } catch {
      localStorage.removeItem(PLAN_CACHE_KEY);
      return null;
    }
  }

  function loadState() {
    try {
      const saved = JSON.parse(localStorage.getItem(STATE_KEY) || 'null');
      const state = { ...defaultState(), ...(saved || {}) };
      if (state.provider === 'mimo' && /api\.mimo-v2\.com/i.test(state.endpoint || '')) {
        state.endpoint = PROVIDERS.mimo.endpoint;
      }
      state.proxyBase = normalizeProxyBase(state.proxyBase);
      state.proxyToken = localStorage.getItem(PROXY_TOKEN_LOCAL_KEY) || '';
      saveState(state);
      return state;
    } catch {
      return defaultState();
    }
  }

  function syncKeyStorage() {
    const proxyToken = els.proxyToken.value.trim();
    if (els.rememberProxyToken.checked && proxyToken) {
      localStorage.setItem(PROXY_TOKEN_LOCAL_KEY, proxyToken);
    } else {
      localStorage.removeItem(PROXY_TOKEN_LOCAL_KEY);
    }

    if ((els.callMode.value || 'proxy') === 'direct') {
      saveProviderApiKey(els.aiProvider.value);
    }
  }

  function hydrateStoredSecrets() {
    migrateLegacyApiKey();
    const proxyToken = localStorage.getItem(PROXY_TOKEN_LOCAL_KEY);
    if (proxyToken) {
      els.proxyToken.value = proxyToken;
      els.rememberProxyToken.checked = true;
    } else {
      els.rememberProxyToken.checked = false;
    }

    setApiKeyControlForProvider(els.aiProvider.value);
  }

  function updateAiModeUI() {
    const proxyMode = (els.callMode.value || 'proxy') === 'proxy';
    document.querySelectorAll('.proxy-field').forEach(el => el.classList.toggle('hidden', !proxyMode));
    document.querySelectorAll('.direct-field').forEach(el => el.classList.toggle('hidden', proxyMode));
    if (proxyMode) {
      els.apiKey.type = 'text';
      els.apiKey.value = '由云端代理托管';
      els.apiKey.readOnly = true;
      els.apiKey.setAttribute('aria-readonly', 'true');
    } else {
      els.apiKey.type = 'password';
      els.apiKey.readOnly = false;
      els.apiKey.removeAttribute('aria-readonly');
      setApiKeyControlForProvider(els.aiProvider.value);
    }
  }

  function applyTheme(mode) {
    const theme = mode || localStorage.getItem(THEME_KEY) || 'light';
    document.documentElement.dataset.theme = theme;
    const labelMap = { dark: '暗色', light: '亮色', pastel: '柔彩' };
    const label = labelMap[theme] || '亮色';
    els.themeToggle.textContent = label;
    document.querySelectorAll('[data-theme-toggle]').forEach(button => {
      button.textContent = `切换主题：${label}`;
    });
    localStorage.setItem(THEME_KEY, theme);
  }

  function cycleTheme() {
    const current = localStorage.getItem(THEME_KEY) || 'light';
    const order = ['light', 'dark', 'pastel'];
    const idx = order.indexOf(current);
    const next = order[(idx + 1) % order.length];
    applyTheme(next);
  }

  function signature(state) {
    return `${state.departureCity}_${state.destination}_${state.startDate}_${state.days}_${state.transportMode || '自驾'}`.replace(/\s+/g, '_');
  }

  function editableKey(key) {
    return `${STORAGE_PREFIX}content_v2_7_${currentSignature}_${key}`;
  }

  function restoreEditedContent() {
    document.querySelectorAll('[data-editable="true"]').forEach(el => {
      const key = el.dataset.saveKey;
      if (!key) return;
      const saved = localStorage.getItem(editableKey(key));
      if (saved) el.innerHTML = saved;
    });
  }

  function saveEditedContent(el) {
    const key = el.dataset.saveKey;
    if (!key) return;
    localStorage.setItem(editableKey(key), el.innerHTML);
  }

  function setEditing(on) {
    isEditing = on;
    document.body.classList.toggle('editing', on);
    els.editTrack.classList.toggle('active', on);
    els.editToggle.setAttribute('aria-checked', on ? 'true' : 'false');
    document.querySelectorAll('[data-editable="true"]').forEach(el => {
      el.contentEditable = on ? 'true' : 'false';
    });
    localStorage.setItem(STORAGE_PREFIX + 'editMode', on ? 'true' : 'false');
  }

  function clearEditedContent() {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(STORAGE_PREFIX + 'content_')) localStorage.removeItem(key);
    });
  }

  function setupCards() {
    document.querySelectorAll('.card-header[data-target]').forEach(header => {
      const body = document.getElementById(header.dataset.target);
      if (body) body.hidden = false;
    });

    // Collapse toggle for hotel/ticket cards
    document.querySelectorAll('.card-collapse-toggle').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const card = btn.closest('.card');
        const body = card?.querySelector('.card-body');
        if (!body) return;
        const collapsed = body.classList.toggle('collapsed-body');
        btn.classList.toggle('collapsed', collapsed);
        // Rotate SVG icon, preserve any existing content
        const svg = btn.querySelector('svg');
        if (svg) {
          svg.style.transform = collapsed ? 'rotate(-90deg)' : '';
          svg.style.transition = 'transform .26s ease';
        }
      });
    });
  }

  function createAppCard(iconText, iconClass, title, bodyHtml) {
    const section = document.createElement('section');
    section.className = 'card glass-card app-created-card';
    section.innerHTML = `
      <div class="card-header">
        <div class="card-header-left">
          <div class="card-icon ${iconClass}">${escapeHtml(iconText)}</div>
          <span class="card-title">${escapeHtml(title)}</span>
        </div>
      </div>
      <div class="card-body">${bodyHtml}</div>
    `;
    return section;
  }

  function makeAppSlide(card, label) {
    const slide = document.createElement('div');
    slide.className = 'mini-swiper-slide app-page';
    slide.dataset.pageLabel = label || '';
    const scroll = document.createElement('div');
    scroll.className = 'app-page-scroll';
    const cards = Array.isArray(card) ? card.filter(Boolean) : [card].filter(Boolean);
    scroll.classList.toggle('app-card-stack', cards.length > 1);
    cards.forEach(item => scroll.appendChild(item));
    slide.appendChild(scroll);
    return slide;
  }

  function buildAppSwiper(tabId, pages) {
    const panel = document.createElement('section');
    panel.className = `app-tab-panel${tabId === activeAppTab ? ' active' : ''}`;
    panel.id = `app-panel-${tabId}`;
    panel.dataset.tabPanel = tabId;
    panel.setAttribute('role', 'tabpanel');

    const dots = document.createElement('div');
    dots.className = 'app-page-dots';
    dots.dataset.pageDots = tabId;
    pages.forEach((page, index) => {
      const dot = document.createElement('button');
      dot.className = `app-page-dot${index === 0 ? ' active' : ''}`;
      dot.type = 'button';
      dot.dataset.pageIndex = String(index);
      dot.setAttribute('aria-label', page.label || `第${index + 1}页`);
      dots.appendChild(dot);
    });

    const swiper = document.createElement('div');
    swiper.className = 'mini-swiper app-swiper';
    swiper.dataset.appSwiper = tabId;
    const wrapper = document.createElement('div');
    wrapper.className = 'mini-swiper-wrapper';
    pages.forEach(page => wrapper.appendChild(makeAppSlide(page.cards || page.card, page.label)));
    swiper.appendChild(wrapper);

    panel.appendChild(dots);
    panel.appendChild(swiper);
    return panel;
  }

  function replaceAppSwiperPages(tabId, pages, activeIndex = 0) {
    const panel = document.querySelector(`[data-tab-panel="${tabId}"]`);
    if (!panel) return;
    const dots = panel.querySelector('[data-page-dots]');
    const swiperEl = panel.querySelector('[data-app-swiper]');
    const wrapper = swiperEl?.querySelector('.mini-swiper-wrapper');
    if (!dots || !swiperEl || !wrapper) return;

    if (appSwipers[tabId]) {
      appSwipers[tabId].destroy();
      delete appSwipers[tabId];
    }

    dots.innerHTML = '';
    pages.forEach((page, index) => {
      const dot = document.createElement('button');
      dot.className = 'app-page-dot';
      dot.type = 'button';
      dot.dataset.pageIndex = String(index);
      dot.setAttribute('aria-label', page.label || `第${index + 1}页`);
      dots.appendChild(dot);
    });

    wrapper.innerHTML = '';
    pages.forEach(page => wrapper.appendChild(makeAppSlide(page.cards || page.card, page.label)));
    const safeIndex = Math.min(Math.max(activeIndex, 0), Math.max(0, pages.length - 1));
    appSwipers[tabId] = new MiniSwiper(swiperEl, {
      initialSlide: safeIndex,
      onChange(index) {
        handleAppSwiperChange(tabId, index);
      },
      onSettled(index, swiper) {
        handleAppSwiperSettled(tabId, index, swiper);
      }
    });
    appSwipers[tabId].slideTo(safeIndex, false);
    handleAppSwiperChange(tabId, safeIndex);
  }

  function splitTrafficCard(weatherCard) {
    const weatherTitle = weatherCard?.querySelector('.card-title');
    if (weatherTitle) weatherTitle.textContent = '天气预报';
    const body = document.getElementById('body-weather');
    const trafficContent = els.trafficContent;
    if (!body || !trafficContent) return null;
    const subtitles = Array.from(body.querySelectorAll('.section-subtitle'));
    const trafficTitle = subtitles.find(el => /交通/.test(el.textContent || ''));
    const trafficCard = createAppCard('交', 'overview', '交通概览', '<div id="trafficSlot"></div>');
    const slot = trafficCard.querySelector('#trafficSlot');
    if (trafficTitle) slot.replaceWith(trafficTitle);
    trafficCard.querySelector('.card-body').appendChild(trafficContent);
    return trafficCard;
  }

  function createExportCard() {
    const card = createAppCard('PDF', 'pdf', '导出 PDF', `
      <p>导出会调用浏览器打印流程，请在系统界面选择保存为 PDF。</p>
      <div class="btn-row app-export-actions"></div>
    `);
    const actions = card.querySelector('.app-export-actions');
    if (els.printBtn) actions.appendChild(els.printBtn);
    return card;
  }

  function expandAppCards() {
    document.querySelectorAll('.card-header[data-target]').forEach(header => {
      const body = document.getElementById(header.dataset.target);
      if (body) body.hidden = false;
    });
  }

  function initAppShell() {
    const main = document.querySelector('main.container');
    if (!main || main.dataset.appShell === 'ready') return;
    main.dataset.appShell = 'ready';
    const tripCard = document.querySelector('.trip-controls');
    const hotelCard = document.getElementById('card-hotel');
    const ticketCard = document.getElementById('card-ticket');
    const settingsCard = document.getElementById('card-settings');
    const weatherCard = document.getElementById('body-weather')?.closest('.card');
    const overviewCard = document.getElementById('body-overview')?.closest('.card');
    const budgetCard = document.getElementById('body-budget')?.closest('.card');
    const tipsCard = document.getElementById('body-tips')?.closest('.card');
    const footerNote = main.querySelector('.footer-note');
    const trafficCard = splitTrafficCard(weatherCard);
    const customBgCard = createCustomBgCard();
    const exportCard = createExportCard();
    const dailyCard = document.getElementById('body-daily')?.closest('.card');
    const historySection = createHistorySection();

    const settingsTitle = settingsCard?.querySelector('.card-title');
    if (settingsTitle) settingsTitle.textContent = 'API 设置';
    if (footerNote) exportCard.querySelector('.card-body').appendChild(footerNote);
    appPageRegistry = { overviewCard, dailyCard, settingsCard, exportCard };

    const panels = document.createElement('div');
    panels.className = 'app-tab-panels';
    // Home tab: trip params, hotel, ticket stacked vertically
    panels.appendChild(buildAppSwiper('home', [
      { label: '旅游参数', cards: [tripCard, hotelCard, ticketCard].filter(Boolean) }
    ].filter(page => page.cards && page.cards.length)));
    panels.appendChild(buildAppSwiper('trip', [
      { label: '天气', card: weatherCard },
      { label: '交通', card: trafficCard },
      { label: '预算参考', card: budgetCard },
      { label: '温馨提醒', card: tipsCard }
    ].filter(page => page.card)));
    panels.appendChild(buildAppSwiper('plan', [
      { label: '行程总览', card: overviewCard }
    ].filter(page => page.card)));
    // Mine tab: settings, history, custom bg, export stacked vertically
    panels.appendChild(buildAppSwiper('mine', [
      { label: '设置', cards: [settingsCard, historySection, customBgCard, exportCard].filter(Boolean) }
    ].filter(page => page.cards && page.cards.length)));

    main.innerHTML = '';
    main.classList.add('app-main');
    main.appendChild(panels);

    const nav = document.createElement('nav');
    nav.className = 'app-tabbar';
    nav.setAttribute('aria-label', '底部导航');
    nav.innerHTML = [
      ['home', '首页'],
      ['trip', '规划'],
      ['plan', '行程'],
      ['mine', '我的']
    ].map(([id, label]) => `
      <button class="app-tab-btn${id === activeAppTab ? ' active' : ''}" type="button" data-app-tab="${id}" aria-controls="app-panel-${id}" aria-selected="${id === activeAppTab ? 'true' : 'false'}">${label}</button>
    `).join('');
    document.body.appendChild(nav);
    document.body.classList.add('app-ready');

    nav.addEventListener('click', event => {
      const button = event.target.closest('[data-app-tab]');
      if (button) switchTab(button.dataset.appTab);
    });

    main.addEventListener('click', event => {
      const dot = event.target.closest('.app-page-dot');
      if (!dot) return;
      const tabId = dot.closest('[data-page-dots]')?.dataset.pageDots;
      const swiper = appSwipers[tabId];
      if (swiper) swiper.slideTo(Number(dot.dataset.pageIndex), true);
    });

    main.addEventListener('click', event => {
      const themeButton = event.target.closest('[data-theme-toggle]');
      if (themeButton) cycleTheme();
    });

    main.addEventListener('click', event => {
      handleHistoryAction(event);
    });

    expandAppCards();
    initInnerSwipers();
  }

  function syncAppDots(tabId, index) {
    document.querySelectorAll(`[data-page-dots="${tabId}"] .app-page-dot`).forEach((dot, dotIndex) => {
      dot.classList.toggle('active', dotIndex === index);
    });
  }

  function handleAppSwiperChange(tabId, index) {
    syncAppDots(tabId, index);
    if (tabId === 'plan' && index > 0) {
      activeDayIndex = index - 1;
      const isAnimating = appSwipers.plan?.isAnimating === true;
      syncDayUi(activeDayIndex, { animate: true, deferRoute: isAnimating });
    }
  }

  function handleAppSwiperSettled(tabId, index) {
    if (tabId === 'plan' && index > 0) {
      activeDayIndex = index - 1;
      syncDayUi(activeDayIndex, { animate: true });
    }
  }

  function switchTab(tabId) {
    if (!tabId || !document.querySelector(`[data-tab-panel="${tabId}"]`)) return;
    activeAppTab = tabId;
    document.querySelectorAll('[data-tab-panel]').forEach(panel => {
      panel.classList.toggle('active', panel.dataset.tabPanel === tabId);
    });
    document.querySelectorAll('[data-app-tab]').forEach(button => {
      const active = button.dataset.appTab === tabId;
      button.classList.toggle('active', active);
      button.setAttribute('aria-selected', active ? 'true' : 'false');
    });
    refreshAppLayout();
  }

  function initInnerSwipers() {
    Object.values(appSwipers).forEach(swiper => swiper.destroy());
    appSwipers = {};
    document.querySelectorAll('[data-app-swiper]').forEach(el => {
      const tabId = el.dataset.appSwiper;
      appSwipers[tabId] = new MiniSwiper(el, {
        onChange(index) {
          handleAppSwiperChange(tabId, index);
        },
        onSettled(index, swiper) {
          handleAppSwiperSettled(tabId, index, swiper);
        }
      });
    });
  }

  function refreshAppLayout() {
    requestAnimationFrame(() => {
      Object.values(appSwipers).forEach(swiper => swiper.update());
    });
  }

  function findBuiltinDestination(name) {
    const n = name.trim().toLowerCase();
    return POPULAR_DESTINATIONS.find(d => d.name.toLowerCase() === n)
      || POPULAR_DESTINATIONS.find(d => d.name.toLowerCase().includes(n) || n.includes(d.name.toLowerCase()))
      || null;
  }

  function manualDestinationInfo(state, reason = '目的地未定位') {
    return {
      name: state.destination,
      region: '用户输入目的地',
      lat: null,
      lon: null,
      tags: ['自定义目的地', '未定位'],
      attractions: [],
      source: 'manual',
      reason
    };
  }

  async function geocodeDestination(state) {
    const builtin = findBuiltinDestination(state.destination);
    if (builtin) {
      return {
        name: builtin.name,
        region: builtin.region,
        lat: builtin.lat,
        lon: builtin.lon,
        tags: builtin.tags,
        attractions: builtin.attractions,
        source: 'builtin'
      };
    }

    try {
      const url = 'https://geocoding-api.open-meteo.com/v1/search?' + new URLSearchParams({
        name: state.destination,
        count: '5',
        language: 'zh',
        format: 'json'
      });
      const res = await fetch(url);
      if (!res.ok) return manualDestinationInfo(state, '目的地定位失败');
      const data = await res.json();
      const results = data.results || [];
      const cn = results.find(item => item.country_code === 'CN') || results[0];
      if (!cn) return manualDestinationInfo(state, '未找到目的地坐标');
      return {
        name: cn.name || state.destination,
        region: [cn.admin1, cn.country].filter(Boolean).join(' '),
        lat: cn.latitude,
        lon: cn.longitude,
        tags: ['自定义目的地'],
        attractions: [],
        source: 'geocoding'
      };
    } catch {
      return manualDestinationInfo(state, '目的地定位服务暂不可用');
    }
  }

  async function queryWeather(coords, state) {
    if (!coords || !Number.isFinite(Number(coords.lat)) || !Number.isFinite(Number(coords.lon))) {
      return { unavailable: true, reason: '目的地未定位，实时天气暂不可用；计划仍可正常生成，请出发前手动确认天气。' };
    }
    const startOffset = daysBetween(todayText(), state.startDate);
    if (startOffset < 0 || startOffset > 15) {
      return { unavailable: true, reason: '实时天气暂不可用，请临近出发再查。计划仍可正常生成。' };
    }

    const forecastDays = Math.min(16, Math.max(3, startOffset + state.days + 1));
    const params = new URLSearchParams({
      latitude: coords.lat,
      longitude: coords.lon,
      current: 'temperature_2m,precipitation,weather_code,wind_speed_10m',
      daily: 'temperature_2m_max,temperature_2m_min,weather_code,precipitation_sum,precipitation_probability_max,wind_speed_10m_max',
      timezone: 'Asia/Shanghai',
      forecast_days: String(forecastDays)
    });
    const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
    if (!res.ok) throw new Error('天气查询失败');
    return await res.json();
  }

  function fallbackPlan(state = defaultState(), reason = '') {
    const start = state.startDate || todayText();
    const end = addDays(start, Math.max(1, state.days) - 1);
    return {
      source: 'fallback',
      reason,
      title: '杭州出发千岛湖亲子轻松游',
      destination: '千岛湖',
      intro: [
        '这是一份内置兜底计划，用于未配置 API Key、AI 接口失败或返回内容无法解析时保持页面可读。',
        `行程按 ${displayDate(start)} 出发、${Math.max(1, state.days)} 天安排，默认从杭州前往千岛湖，交通方式为${state.transportMode || '自驾'}，适合亲子、周末和轻松慢游。`,
        '核心原则是少折腾、方便休息和随时调整；出发前仍需核对天气、班次、门票和路况。'
      ],
      tags: ['兜底模板', '杭州出发', '亲子友好', state.transportMode || '自驾'],
      traffic: {
        mode: state.transportMode || '自驾',
        distance: '约170公里',
        duration: state.transportMode === '自驾' ? '约2.5小时' : '请按官方平台确认',
        route: state.transportMode === '自驾' ? '杭州 → 长深高速/杭新景高速 → 千岛湖' : `杭州 → 千岛湖（${state.transportMode || '交通'}）`,
        toll: state.transportMode === '自驾' ? '约70元，按车型和路线浮动' : '票价/班次以12306、航司或官方平台为准',
        note: state.transportMode === '自驾'
          ? '高速服务区较多，适合安排一次喂奶、换尿布或休息。'
          : '当前为兜底模板，未查询到真实车次/航班；请在12306、航司或官方平台核验后再购票。',
        options: [
          { type: state.transportMode || '自驾', depart: '出发前确认', arrive: '出发前确认', duration: '以官方为准', note: '兜底模板不编造车次/航班' }
        ]
      },
      overview: [
        { time: 'Day 1 上午', plan: '杭州出发，抵达千岛湖镇', focus: '错峰出城，先到酒店或城区午餐' },
        { time: 'Day 1 下午', plan: '入住休息，湖边慢逛', focus: '宝宝午睡优先，天屿山或湖滨绿道二选一' },
        { time: 'Day 2 上午', plan: '中心湖区短线游船', focus: '天气和人流合适再上船，不合适就换绿道' },
        { time: 'Day 2 下午', plan: '午餐补给后返程杭州', focus: '错开晚高峰，服务区休息一次' }
      ],
      days: Array.from({ length: Math.max(1, Number(state.days || 2)) }, (_, i) => i === 0 ? {
        title: `第${i + 1}天：杭州出发与湖边慢逛`,
        date: addDays(start, i),
        items: [
          { time: '09:00', title: '杭州出发', desc: '早餐后出发，导航先设酒店或千岛湖镇中心。' },
          { time: '11:30', title: '抵达午餐', desc: '选择停车方便的鱼头餐厅，宝宝可用自带辅食。' },
          { time: '13:30', title: '入住午睡', desc: '确认停车、热水、婴儿用品，下午留足休息。' },
          { time: '16:30', title: '湖边散步或天屿山观景', desc: '天气好去观景台，状态一般就在酒店附近散步。' },
          { time: '18:30', title: '晚餐后早休息', desc: '不排队、不吃太晚，整理第二天随身包。' }
        ]
      } : {
        title: `第${i + 1}天：轻松游览与返程`,
        date: addDays(start, i),
        items: [
          { time: '08:30', title: '早餐与退房准备', desc: '把大件行李放车上，随身带水、奶、薄毯和换洗衣物。' },
          { time: '09:30', title: '中心湖区或绿道', desc: '天气好选择短线游船，风大或人多就改湖边绿道。' },
          { time: '12:30', title: '午餐补给', desc: '简单用餐，补齐湿巾、温水和零食。' },
          { time: '14:00', title: '返程杭州', desc: '把午睡留在车上，遇到拥堵就在服务区多休息。' }
        ]
      }),
      budget: [
        { item: '油费与高速', amount: '约300-450元', note: '按车型和路线浮动' },
        { item: '住宿一晚', amount: '约600-1400元', note: '亲子房/湖景房差异较大' },
        { item: '餐饮', amount: '约350-700元', note: '鱼头餐厅和酒店早餐影响较大' },
        { item: '游船/门票', amount: '约0-500元', note: '按是否上船和实际政策确认' }
      ],
      tips: [
        'API 未配置或生成失败时，页面会保留这份千岛湖兜底计划，不会空白。',
        '天气、门票、船班、停车和路况以出发当天官方信息为准。',
        '带老人或孩子时，每天只安排一个核心活动，保留午睡和临时撤退时间。',
        '遇到下雨、风大、人多或孩子状态不好，直接把游船改为酒店附近散步。'
      ],
      fallbacks: ['无 Key 或 AI 失败时显示此模板', '目的地无效时可改选热门目的地']
    };
  }

  function normalizePlan(raw, state, destinationInfo) {
    const plan = raw && typeof raw === 'object' ? raw : {};
    const safeDays = Array.isArray(plan.days) && plan.days.length ? plan.days : fallbackPlan(state).days;
    return {
      source: plan.source || 'ai',
      title: plan.title || `${state.departureCity}出发${state.destination}旅游计划`,
      destination: plan.destination || destinationInfo.name || state.destination,
      intro: Array.isArray(plan.intro) ? plan.intro.slice(0, 4) : fallbackPlan(state).intro,
      tags: Array.isArray(plan.tags) ? plan.tags.slice(0, 8) : (destinationInfo.tags || []),
      traffic: {
        mode: plan.traffic?.mode || state.transportMode || '自驾',
        distance: plan.traffic?.distance || '请按导航确认',
        duration: plan.traffic?.duration || '请按导航确认',
        route: plan.traffic?.route || `${state.departureCity} → ${state.destination}`,
        toll: plan.traffic?.toll || '按交通方式和官方平台确认',
        note: plan.traffic?.note || '请以导航、12306、航司或官方平台实时信息为准。',
        options: Array.isArray(plan.traffic?.options) ? plan.traffic.options.slice(0, 8) : []
      },
      overview: Array.isArray(plan.overview) ? plan.overview.slice(0, 8) : fallbackPlan(state).overview,
      days: safeDays.slice(0, state.days).map((day, index) => ({
        title: day.title || `第${index + 1}天`,
        date: day.date || addDays(state.startDate, index),
        items: Array.isArray(day.items) ? day.items.slice(0, 8) : []
      })),
      budget: Array.isArray(plan.budget) ? plan.budget.slice(0, 8) : fallbackPlan(state).budget,
      tips: Array.isArray(plan.tips) ? plan.tips.slice(0, 10) : fallbackPlan(state).tips,
      fallbacks: Array.isArray(plan.fallbacks) ? plan.fallbacks.slice(0, 6) : []
    };
  }

  function renderIntro(plan) {
    els.introContent.innerHTML = `
      ${plan.intro.map(p => `<p>${escapeHtml(p)}</p>`).join('')}
      <div class="tag-group">${(plan.tags || []).map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}</div>
    `;
  }

  function itemLabel(item) {
    return [item?.time, dayItemTitle(item)].filter(Boolean).join(' ');
  }

  function mapMode(state) {
    const mode = state?.transportMode || '自驾';
    if (/自驾|驾车|开车/.test(mode)) return { baidu: 'driving', apple: 'd', amap: 'car' };
    if (/步行/.test(mode)) return { baidu: 'walking', apple: 'w', amap: 'walk' };
    return { baidu: 'transit', apple: 'r', amap: 'bus' };
  }

  function routeText(value, fallback) {
    return String(value || fallback || '').replace(/\s+/g, ' ').trim();
  }

  function buildMapLinks(origin, destination, state = getState()) {
    const start = routeText(origin, state.departureCity || '当前位置');
    const end = routeText(destination, state.destination || '目的地');
    const mode = mapMode(state);
    const baiduWeb = 'https://api.map.baidu.com/direction?' + new URLSearchParams({
      origin: start,
      destination: end,
      mode: mode.baidu,
      region: '中国',
      output: 'html',
      src: 'universal_trip_plan'
    }).toString();
    const baiduNative = 'baidumap://map/direction?' + new URLSearchParams({
      origin: `name:${start}`,
      destination: `name:${end}`,
      mode: mode.baidu,
      src: 'universal_trip_plan'
    }).toString();
    const appleNative = 'maps://?' + new URLSearchParams({
      saddr: start,
      daddr: end,
      dirflg: mode.apple
    }).toString();
    const appleWeb = 'https://maps.apple.com/?' + new URLSearchParams({
      saddr: start,
      daddr: end,
      dirflg: mode.apple
    }).toString();
    const coordinates = state.coordinates && Number.isFinite(Number(state.coordinates.lon)) && Number.isFinite(Number(state.coordinates.lat))
      ? `${state.coordinates.lon},${state.coordinates.lat},${end}`
      : '';
    const amapWeb = coordinates
      ? 'https://uri.amap.com/navigation?' + new URLSearchParams({
        to: coordinates,
        mode: mode.amap,
        policy: '1',
        src: 'universal_trip_plan',
        callnative: '1'
      }).toString()
      : 'https://uri.amap.com/search?' + new URLSearchParams({
        keyword: end,
        src: 'universal_trip_plan',
        callnative: '1'
      }).toString();
    const amapNativeParams = new URLSearchParams({
      sourceApplication: 'universal_trip_plan',
      sname: start,
      dname: end,
      dev: '0',
      t: mode.amap === 'car' ? '0' : mode.amap === 'walk' ? '2' : '1'
    });
    if (state.coordinates && Number.isFinite(Number(state.coordinates.lon)) && Number.isFinite(Number(state.coordinates.lat))) {
      amapNativeParams.set('dlat', String(state.coordinates.lat));
      amapNativeParams.set('dlon', String(state.coordinates.lon));
    }
    const amapNative = 'amapuri://route/plan/?' + amapNativeParams.toString();
    const systemNative = state.coordinates && Number.isFinite(Number(state.coordinates.lat)) && Number.isFinite(Number(state.coordinates.lon))
      ? `geo:${state.coordinates.lat},${state.coordinates.lon}?q=${encodeURIComponent(end)}`
      : `geo:0,0?q=${encodeURIComponent(end)}`;
    return {
      native: { system: systemNative, baidu: baiduNative, amap: amapNative, apple: appleNative },
      web: { system: baiduWeb, baidu: baiduWeb, amap: amapWeb, apple: appleWeb },
      start,
      end
    };
  }

  const STATIC_MAP_SIZE = {
    width: 520,
    height: 410,
    routeFill: .82,
    minZoom: 4,
    maxZoom: 16
  };

  function staticMapSpanPx(points, zoom) {
    const world = 256 * Math.pow(2, zoom);
    const lonSpan = Math.abs(points[0].lon - points[1].lon) / 360 * world;
    const ySpan = Math.abs(mercatorY(points[0].lat) - mercatorY(points[1].lat)) / (Math.PI * 2) * world;
    return { x: lonSpan, y: ySpan };
  }

  function staticMapZoom(departure, destination) {
    const points = [validCoord(departure), validCoord(destination)].filter(Boolean);
    if (points.length < 2) return 10;
    const maxX = STATIC_MAP_SIZE.width * STATIC_MAP_SIZE.routeFill;
    const maxY = STATIC_MAP_SIZE.height * STATIC_MAP_SIZE.routeFill;
    for (let zoom = STATIC_MAP_SIZE.maxZoom; zoom >= STATIC_MAP_SIZE.minZoom; zoom--) {
      const span = staticMapSpanPx(points, zoom);
      if (span.x <= maxX && span.y <= maxY) return zoom;
    }
    return STATIC_MAP_SIZE.minZoom;
  }

  function baiduStaticMapImage(start, end, departure, destination) {
    const safeStart = routeText(start, '出发地');
    const safeEnd = routeText(end, '目的地');
    const startCoord = validCoord(departure);
    const endCoord = validCoord(destination);
    const center = startCoord && endCoord
      ? `${((startCoord.lon + endCoord.lon) / 2).toFixed(5)},${((startCoord.lat + endCoord.lat) / 2).toFixed(5)}`
      : safeEnd || safeStart || '中国';
    const params = new URLSearchParams({
      center,
      width: String(STATIC_MAP_SIZE.width),
      height: String(STATIC_MAP_SIZE.height),
      zoom: String(staticMapZoom(departure, destination))
    });
    return `https://api.map.baidu.com/staticimage?${params.toString()}`;
  }

  function renderMapActions(origin, destination, state = getState()) {
    const links = buildMapLinks(origin, destination, state);
    return `
      <div class="map-action-row">
        <a class="map-link" href="${escapeHtml(links.native.amap)}" data-map-native data-fallback-url="${escapeHtml(links.web.amap)}">高德导航</a>
        <a class="map-link" href="${escapeHtml(links.native.apple)}" data-map-native data-fallback-url="${escapeHtml(links.web.apple)}">iPhone地图</a>
      </div>
    `;
  }

  function handleNativeMapClick(event) {
    const link = event.target.closest('[data-map-native]');
    if (!link) return;
    event.preventDefault();
    const nativeUrl = link.getAttribute('href');
    const fallbackUrl = link.dataset.fallbackUrl;
    if (!nativeUrl) return;
    let pageHidden = false;
    const markHidden = () => { pageHidden = true; };
    document.addEventListener('visibilitychange', markHidden, { once: true });
    window.addEventListener('pagehide', markHidden, { once: true });
    window.location.href = nativeUrl;
    if (fallbackUrl) {
      setTimeout(() => {
        document.removeEventListener('visibilitychange', markHidden);
        window.removeEventListener('pagehide', markHidden);
        if (!pageHidden && document.visibilityState === 'visible') {
          window.location.href = fallbackUrl;
        }
      }, 900);
    }
  }

  function findFirstMatching(items, pattern) {
    return items.find(item => pattern.test([item?.time, dayItemTitle(item), dayItemDesc(item)].join(' '))) || items[0] || null;
  }

  function findLastMatching(items, pattern) {
    for (let i = items.length - 1; i >= 0; i--) {
      const item = items[i];
      if (pattern.test([item?.time, dayItemTitle(item), dayItemDesc(item)].join(' '))) return item;
    }
    return items[items.length - 1] || null;
  }

  function trafficAlignment(plan) {
    const days = Array.isArray(plan.days) ? plan.days : [];
    const firstItems = dayItems(days[0]);
    const lastItems = dayItems(days[days.length - 1]);
    const depart = findFirstMatching(firstItems, /出发|启程|前往|车站|机场|高铁|自驾|打车|抵达|到达/);
    const arrive = firstItems.find(item => /抵达|到达|入住|酒店|景区|车站|机场/.test([dayItemTitle(item), dayItemDesc(item)].join(' '))) || firstItems[1] || depart;
    const returnStart = findLastMatching(lastItems, /返程|返回|回程|离开|退房|出发|前往/);
    const returnEnd = findLastMatching(lastItems, /到家|抵达|到达|返回|回到|结束/);
    return {
      outbound: [depart, arrive].filter(Boolean).filter((item, index, arr) => arr.indexOf(item) === index).map(itemLabel).join(' → ') || '按 D1 每日行程首项校准',
      inbound: [returnStart, returnEnd].filter(Boolean).filter((item, index, arr) => arr.indexOf(item) === index).map(itemLabel).join(' → ') || '按最后一天每日行程末项校准'
    };
  }

  function renderTraffic(plan) {
    const t = plan.traffic || {};
    const sync = trafficAlignment(plan);
    const options = Array.isArray(t.options) && t.options.length ? `
      <div class="section-subtitle">候选交通</div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>类型/班次</th><th>出发</th><th>到达</th><th>耗时</th><th>说明</th></tr></thead>
          <tbody>${t.options.map(item => `
            <tr>
              <td>${escapeHtml(item.type || item.name || '')}</td>
              <td>${escapeHtml(item.depart || '')}</td>
              <td>${escapeHtml(item.arrive || '')}</td>
              <td>${escapeHtml(item.duration || '')}</td>
              <td>${escapeHtml(item.note || '')}</td>
            </tr>
          `).join('')}</tbody>
        </table>
      </div>
    ` : '';
    els.trafficContent.innerHTML = `
      <div class="traffic-sync">
        <div class="traffic-sync-card">
          <div class="label">去程校准</div>
          <div class="value">${escapeHtml(sync.outbound)}</div>
          <div class="note">按 D1 每日行程推导</div>
        </div>
        <div class="traffic-sync-card">
          <div class="label">返程校准</div>
          <div class="value">${escapeHtml(sync.inbound)}</div>
          <div class="note">按最后一天每日行程推导</div>
        </div>
      </div>
      <div class="info-grid">
        <div class="info-item"><div class="label">交通</div><div class="value">${escapeHtml(t.mode || '请确认')}</div></div>
        <div class="info-item"><div class="label">距离/耗时</div><div class="value">${escapeHtml(t.distance || t.duration || '请按官方确认')}</div></div>
        <div class="info-item"><div class="label">路线</div><div class="value">${escapeHtml(t.route || '')}</div></div>
        <div class="info-item"><div class="label">费用/票价</div><div class="value">${escapeHtml(t.toll || '按实际确认')}</div></div>
      </div>
      <p>${escapeHtml(t.note || '')}</p>
      ${options}
    `;
  }

  const CITY_COORDS = {
    '\u676d\u5dde': { lat: 30.2741, lon: 120.1551 },
    '\u4e0a\u6d77': { lat: 31.2304, lon: 121.4737 },
    '\u5357\u4eac': { lat: 32.0603, lon: 118.7969 },
    '\u82cf\u5dde': { lat: 31.2989, lon: 120.5853 },
    '\u5b81\u6ce2': { lat: 29.8683, lon: 121.5440 },
    '\u5317\u4eac': { lat: 39.9042, lon: 116.4074 },
    '\u5e7f\u5dde': { lat: 23.1291, lon: 113.2644 },
    '\u6df1\u5733': { lat: 22.5431, lon: 114.0579 },
    '\u6210\u90fd': { lat: 30.5728, lon: 104.0668 },
    '\u6b66\u6c49': { lat: 30.5928, lon: 114.3055 }
  };

  function finiteCoord(value) {
    const num = Number(value);
    return Number.isFinite(num) ? num : null;
  }

  function coordFromState(state) {
    const coords = state?.coordinates || defaultState().coordinates;
    const lat = finiteCoord(coords?.lat);
    const lon = finiteCoord(coords?.lon);
    if (lat === null || lon === null) return defaultState().coordinates;
    return { lat, lon };
  }

  function validCoord(point) {
    const lat = finiteCoord(point?.lat);
    const lon = finiteCoord(point?.lon);
    return lat === null || lon === null ? null : { lat, lon };
  }

  function cityCoord(name) {
    const text = String(name || '').trim();
    if (!text) return null;
    const exact = CITY_COORDS[text];
    if (exact) return exact;
    const partial = Object.keys(CITY_COORDS).find(key => text.includes(key));
    return partial ? CITY_COORDS[partial] : null;
  }

  function knownPlaceCoord(name, preferredCoord = null) {
    const preferred = validCoord(preferredCoord);
    if (preferred) return preferred;
    const city = cityCoord(name);
    if (city) return city;
    const builtin = findBuiltinDestination(String(name || ''));
    return validCoord(builtin);
  }

  function mercatorY(lat) {
    const clamped = Math.max(-85, Math.min(85, Number(lat)));
    const rad = clamped * Math.PI / 180;
    return Math.log(Math.tan(Math.PI / 4 + rad / 2));
  }

  function latFromMercatorY(y) {
    return (2 * Math.atan(Math.exp(y)) - Math.PI / 2) * 180 / Math.PI;
  }

  function mapBounds(points) {
    const usable = points.map(validCoord).filter(Boolean);
    if (!usable.length) {
      return {
        minLat: 30,
        maxLat: 42,
        minLon: 103,
        maxLon: 123
      };
    }
    const lats = usable.map(point => point.lat);
    const lons = usable.map(point => point.lon);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLon = Math.min(...lons);
    const maxLon = Math.max(...lons);
    const latSpan = Math.max(.001, maxLat - minLat);
    const lonSpan = Math.max(.001, maxLon - minLon);
    const latPad = Math.max(.06, latSpan * .26);
    const lonPad = Math.max(.08, lonSpan * .26);
    const bounds = {
      minLat: minLat - latPad,
      maxLat: maxLat + latPad,
      minLon: minLon - lonPad,
      maxLon: maxLon + lonPad
    };
    const targetRatio = 320 / 220;
    let minY = mercatorY(bounds.minLat);
    let maxY = mercatorY(bounds.maxLat);
    let xSpan = (bounds.maxLon - bounds.minLon) * Math.PI / 180;
    let ySpan = Math.max(.000001, maxY - minY);
    const currentRatio = xSpan / ySpan;
    if (currentRatio > targetRatio) {
      const neededY = xSpan / targetRatio;
      const centerY = (minY + maxY) / 2;
      minY = centerY - neededY / 2;
      maxY = centerY + neededY / 2;
      bounds.minLat = Math.max(-85, latFromMercatorY(minY));
      bounds.maxLat = Math.min(85, latFromMercatorY(maxY));
    } else {
      const neededX = ySpan * targetRatio * 180 / Math.PI;
      const centerLon = (bounds.minLon + bounds.maxLon) / 2;
      bounds.minLon = centerLon - neededX / 2;
      bounds.maxLon = centerLon + neededX / 2;
    }
    return bounds;
  }

  function bboxParam(bounds) {
    return [bounds.minLon, bounds.minLat, bounds.maxLon, bounds.maxLat]
      .map(value => Number(value).toFixed(5))
      .join('%2C');
  }

  function projectMapPoint(point, bounds) {
    const minY = mercatorY(bounds.minLat);
    const maxY = mercatorY(bounds.maxLat);
    const y = mercatorY(point.lat);
    const xRange = Math.max(.000001, bounds.maxLon - bounds.minLon);
    const yRange = Math.max(.000001, maxY - minY);
    return {
      x: ((point.lon - bounds.minLon) / xRange) * 320,
      y: ((maxY - y) / yRange) * 220
    };
  }

  function routePathForPoints(points, bounds) {
    const projected = points.map(point => projectMapPoint(point, bounds));
    if (projected.length < 2) return '';
    if (projected.length === 2) {
      const [a, b] = projected;
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const curve = Math.min(46, Math.max(18, Math.hypot(dx, dy) * .16));
      const nx = -dy / Math.max(1, Math.hypot(dx, dy));
      const ny = dx / Math.max(1, Math.hypot(dx, dy));
      const c1 = { x: a.x + dx * .34 + nx * curve, y: a.y + dy * .34 + ny * curve };
      const c2 = { x: a.x + dx * .66 + nx * curve, y: a.y + dy * .66 + ny * curve };
      return `M${a.x.toFixed(1)} ${a.y.toFixed(1)} C${c1.x.toFixed(1)} ${c1.y.toFixed(1)} ${c2.x.toFixed(1)} ${c2.y.toFixed(1)} ${b.x.toFixed(1)} ${b.y.toFixed(1)}`;
    }
    const sampled = projected.filter((_, index) => index % Math.ceil(projected.length / 120) === 0);
    if (sampled[sampled.length - 1] !== projected[projected.length - 1]) sampled.push(projected[projected.length - 1]);
    return sampled.map((point, index) => `${index ? 'L' : 'M'}${point.x.toFixed(1)} ${point.y.toFixed(1)}`).join(' ');
  }

  function endpointPin(point, type, label) {
    const attr = type === 'start' ? 'data-map-start' : 'data-map-end';
    const transform = point ? `translate(${point.x.toFixed(1)} ${point.y.toFixed(1)})` : 'translate(0 0)';
    const hidden = point ? '' : ' style="display:none"';
    return `
      <g ${attr} class="map-endpoint ${type}"${hidden} transform="${transform}">
        <circle class="map-pin-circle" r="15"></circle>
        <text class="map-pin-text" y="1">${label}</text>
      </g>
    `;
  }

  function overviewMapData(state, routeCoords = null, endpoints = {}) {
    const destination = validCoord(endpoints.destination) || knownPlaceCoord(state?.destination, state?.coordinates) || coordFromState(state) || { lat: 34.6197, lon: 112.454 };
    const departure = validCoord(endpoints.departure) || knownPlaceCoord(state?.departureCity);
    const routePoints = Array.isArray(routeCoords) && routeCoords.length
      ? routeCoords.map(coord => ({ lon: Number(coord[0]), lat: Number(coord[1]) })).map(validCoord).filter(Boolean)
      : [departure, destination].filter(Boolean);
    const bounds = mapBounds([departure, destination, ...routePoints].filter(Boolean));
    const mapLinks = buildMapLinks(state?.departureCity, state?.destination, state);
    const embedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bboxParam(bounds)}&layer=mapnik`;
    const openUrl = departure
      ? `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${departure.lat.toFixed(5)}%2C${departure.lon.toFixed(5)}%3B${destination.lat.toFixed(5)}%2C${destination.lon.toFixed(5)}`
      : `https://www.openstreetmap.org/?mlat=${destination.lat.toFixed(5)}&mlon=${destination.lon.toFixed(5)}#map=11/${destination.lat.toFixed(5)}/${destination.lon.toFixed(5)}`;
    const title = `${mapLinks.start} 到 ${mapLinks.end} 路线地图`;
    return {
      departure,
      destination,
      embedUrl,
      openUrl,
      fallbackImage: baiduStaticMapImage(mapLinks.start, mapLinks.end, departure, destination),
      title,
      routePath: routePathForPoints(routePoints, bounds),
      startPoint: departure ? projectMapPoint(departure, bounds) : null,
      endPoint: projectMapPoint(destination, bounds)
    };
  }

  async function geocodeMapPlace(name, preferredCoord = null) {
    const known = knownPlaceCoord(name, preferredCoord);
    if (known) return known;
    const text = String(name || '').trim();
    if (!text) return null;
    try {
      const url = 'https://geocoding-api.open-meteo.com/v1/search?' + new URLSearchParams({
        name: text,
        count: '5',
        language: 'zh',
        format: 'json'
      });
      const res = await fetch(url);
      if (!res.ok) return null;
      const data = await res.json();
      const results = data.results || [];
      const hit = results.find(item => item.country_code === 'CN') || results[0];
      return validCoord({ lat: hit?.latitude, lon: hit?.longitude });
    } catch {
      return null;
    }
  }

  async function routeGeometry(start, end) {
    if (!start || !end) return null;
    try {
      const coords = `${start.lon.toFixed(6)},${start.lat.toFixed(6)};${end.lon.toFixed(6)},${end.lat.toFixed(6)}`;
      const url = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`;
      const res = await fetch(url);
      if (!res.ok) return null;
      const data = await res.json();
      const route = data.routes && data.routes[0];
      const geometry = route?.geometry?.coordinates;
      return Array.isArray(geometry) && geometry.length > 1 ? geometry : null;
    } catch {
      return null;
    }
  }

  function applyOverviewMapData(mapId, map, isRealRoute = false) {
    const root = document.getElementById(mapId);
    if (!root) return;
    const frame = root.querySelector('iframe');
    const fallbackImage = root.querySelector('.real-map-fallback-image');
    const link = root.querySelector('.map-open-link');
    const route = root.querySelector('.map-route');
    const start = root.querySelector('[data-map-start]');
    const end = root.querySelector('[data-map-end]');
    if (frame) {
      frame.onload = () => root.classList.add('map-loaded');
      if (frame.getAttribute('src') !== map.embedUrl) {
        root.classList.remove('map-loaded');
        frame.setAttribute('src', map.embedUrl);
      }
      frame.setAttribute('title', map.title || '路线地图');
    }
    if (fallbackImage) {
      if (fallbackImage.getAttribute('src') !== map.fallbackImage) fallbackImage.setAttribute('src', map.fallbackImage);
      fallbackImage.setAttribute('alt', `${map.title || '路线地图'}备用图`);
    }
    if (link) link.href = map.openUrl;
    if (route) {
      route.setAttribute('d', map.routePath);
      route.classList.toggle('loading', !isRealRoute);
    }
    if (start) {
      start.style.display = map.startPoint ? '' : 'none';
      if (map.startPoint) start.setAttribute('transform', `translate(${map.startPoint.x.toFixed(1)} ${map.startPoint.y.toFixed(1)})`);
    }
    if (end && map.endPoint) end.setAttribute('transform', `translate(${map.endPoint.x.toFixed(1)} ${map.endPoint.y.toFixed(1)})`);
  }

  async function hydrateOverviewRouteMap(mapId, renderId, state) {
    const [departure, destination] = await Promise.all([
      geocodeMapPlace(state.departureCity),
      geocodeMapPlace(state.destination, state.coordinates)
    ]);
    if (renderId !== overviewRouteRenderId) return;
    const baseMap = overviewMapData(state, null, { departure, destination });
    applyOverviewMapData(mapId, baseMap, false);
    const geometry = await routeGeometry(baseMap.departure, baseMap.destination);
    if (renderId !== overviewRouteRenderId || !geometry) return;
    applyOverviewMapData(mapId, overviewMapData(state, geometry, {
      departure: baseMap.departure,
      destination: baseMap.destination
    }), true);
  }

  function overviewDayLabel(day, index) {
    const ignored = /出发|抵达|到达|入住|酒店|早餐|午餐|晚餐|返程|返回|退房|休息|准备|补给/;
    const labels = dayItems(day)
      .map(item => dayItemTitle(item))
      .filter(title => title && !ignored.test(title))
      .slice(0, 2);
    const fallback = dayItems(day).map(item => dayItemTitle(item)).filter(Boolean).slice(0, 2);
    const chosen = labels.length ? labels : fallback;
    return chosen.join(' + ') || day.title || `第${index + 1}天`;
  }

  function renderOverview(plan, state = getState()) {
    const days = Array.isArray(plan.days) && plan.days.length ? plan.days : [];
    const renderId = ++overviewRouteRenderId;
    const mapId = `overviewRealMap_${renderId}`;
    const mapState = { ...state, destination: plan.destination || state.destination };
    const map = overviewMapData(mapState);
    const pins = [
      endpointPin(map.startPoint, 'start', '\u8d77'),
      endpointPin(map.endPoint, 'end', '\u7ec8')
    ].join('');
    const legend = days.map((day, index) => `
      <div class="overview-day-legend-item">
        <strong>Day${index + 1}</strong>
        <span>${escapeHtml(overviewDayLabel(day, index))}</span>
      </div>
    `).join('');
    els.overviewContent.innerHTML = `
      <div class="overview-map-shell">
        <div class="overview-map real-map-view" id="${mapId}" data-no-swiper aria-label="${escapeHtml(map.title)}">
          <img class="real-map-fallback-image" src="${escapeHtml(map.fallbackImage)}" alt="${escapeHtml(map.title)}备用图">
          <div class="real-map-frame">
            <iframe src="${escapeHtml(map.embedUrl)}" title="${escapeHtml(map.title)}" referrerpolicy="no-referrer-when-downgrade" onload="this.closest('.overview-map').classList.add('map-loaded')"></iframe>
          </div>
          <svg class="real-map-overlay" viewBox="0 0 320 220" preserveAspectRatio="none" focusable="false" aria-hidden="true">
            <path class="map-route loading" d="${escapeHtml(map.routePath)}"></path>
            ${pins}
          </svg>
          <div class="map-static-shield" aria-hidden="true"></div>
        </div>
        <div class="overview-day-legend">${legend}</div>
        ${renderMapActions(mapState.departureCity, mapState.destination, mapState)}
      </div>
    `;
    hydrateOverviewRouteMap(mapId, renderId, mapState);
  }

  function dayItems(day) {
    return Array.isArray(day?.items) ? day.items : [];
  }

  function dayItemTitle(item) {
    return item?.title || item?.activity || '待安排';
  }

  function dayItemDesc(item) {
    return item?.desc || item?.note || '';
  }

  function dayDateText(day, index, state = getState()) {
    return day?.date || addDays(state.startDate, index);
  }

  function compactDaySummary(day) {
    const items = dayItems(day).slice(0, 3).map(item => dayItemTitle(item)).filter(Boolean);
    return items.length ? items.join(' · ') : '本日安排待生成或待编辑。';
  }

  function renderRouteNodes(items) {
    const positions = [[8,66], [34,23], [50,48], [64,74], [88,34]];
    const timeValue = (item, index) => {
      const match = String(item?.time || '').match(/(\d{1,2})(?::?(\d{2}))?/);
      return match ? Number(match[1]) * 60 + Number(match[2] || 0) : 10000 + index;
    };
    const visible = items.length
      ? items
          .map((item, index) => ({ item, index }))
          .sort((a, b) => timeValue(a.item, a.index) - timeValue(b.item, b.index))
          .slice(0, 5)
          .map(entry => entry.item)
      : [{ time: '' }];
    return visible.map((item, index) => {
      const pos = positions[index] || positions[positions.length - 1];
      return `<div class="route-node" style="left:${pos[0]}%;top:${pos[1]}%;">${escapeHtml(item.time ? String(item.time).slice(0, 2) : String(index + 1))}</div>`;
    }).join('');
  }

  function renderRouteMap(items) {
    return `
      <div class="route-map" aria-label="当天静态路线示意">
        <svg viewBox="0 0 320 96" preserveAspectRatio="none" focusable="false">
          <path class="route-shadow" d="M18 70 C74 15 120 18 158 58 S245 106 302 34"></path>
          <path class="route-line" d="M18 70 C74 15 120 18 158 58 S245 106 302 34"></path>
        </svg>
        ${renderRouteNodes(items)}
        <div class="route-traveler"></div>
      </div>
    `;
  }

  function renderAllDaysTimeline(days, state = getState()) {
    return days.map((day, index) => `
      <div class="day-label"><span class="badge">D${index + 1}</span>${escapeHtml(day.title || `第${index + 1}天`)} · ${escapeHtml(displayDate(dayDateText(day, index, state)))}</div>
      <div class="timeline">
        ${dayItems(day).map(item => `
          <div class="timeline-item">
            <div class="timeline-time">${escapeHtml(item.time || '')}</div>
            <div class="timeline-content"><strong>${escapeHtml(dayItemTitle(item))}</strong></div>
            <div class="timeline-desc">${escapeHtml(dayItemDesc(item))}</div>
          </div>
        `).join('')}
      </div>
    `).join('');
  }

  function renderDayCardMarkup(day, index, days, state) {
    const items = dayItems(day);
    const dateText = dayDateText(day, index, state);
    const itemHtml = items.length ? items.map(item => `
      <div class="day-event">
        <div class="day-event-time">${escapeHtml(item.time || '--')}</div>
        <div>
          <div class="day-event-title">${escapeHtml(dayItemTitle(item))}</div>
          <div class="day-event-desc">${escapeHtml(dayItemDesc(item) || '按现场和体力灵活调整。')}</div>
        </div>
      </div>
    `).join('') : '<div class="day-event"><div class="day-event-time">--</div><div><div class="day-event-title">待安排</div><div class="day-event-desc">重新生成或编辑本日后显示详细安排。</div></div></div>';
    return `
      <div class="day-card" data-day-page-index="${index}">
        <div class="day-card-head">
          <div>
            <div class="day-card-kicker"><span>D${index + 1}</span><span>${escapeHtml(displayDate(dateText).split(' ')[1] || '')}</span></div>
            <div class="day-card-title">${escapeHtml(day.title || `第${index + 1}天`)}</div>
          </div>
          <div class="day-card-date">${escapeHtml(displayDate(dateText).split(' ')[0])}</div>
        </div>
        <div class="day-summary">${escapeHtml(compactDaySummary(day))}</div>
        ${renderRouteMap(items)}
        <div class="day-event-list">${itemHtml}</div>
        <div class="day-actions">
          <button type="button" data-day-action="prev" ${index === 0 ? 'disabled' : ''}>上一天</button>
          <button type="button" data-day-action="edit" data-day-index="${index}">编辑本日</button>
          <button type="button" data-day-action="next" ${index === days.length - 1 ? 'disabled' : ''}>下一天</button>
        </div>
      </div>
    `;
  }

  function createDayAppCard(day, index, days, state) {
    const section = document.createElement('section');
    section.className = 'card glass-card day-app-card';
    section.innerHTML = `<div class="card-body">${renderDayCardMarkup(day, index, days, state)}</div>`;
    return section;
  }

  function renderDaily(plan) {
    const state = getState();
    const days = Array.isArray(plan.days) ? plan.days : [];
    const overviewCard = appPageRegistry.overviewCard || document.getElementById('body-overview')?.closest('.card');
    if (!days.length) {
      const emptyCard = createAppCard('程', 'daily', '每日行程', '<div class="status-box show">暂无每日行程，请重新生成计划。</div>');
      replaceAppSwiperPages('plan', [
        { label: '行程总览', card: overviewCard },
        { label: '每日行程', card: emptyCard }
      ].filter(page => page.card), 0);
      return;
    }
    activeDayIndex = Math.min(Math.max(activeDayIndex, 0), days.length - 1);
    const currentPlanPage = appSwipers.plan?.activeIndex || 0;
    const activePageIndex = currentPlanPage > 0 ? Math.min(activeDayIndex + 1, days.length) : 0;
    const dayPages = days.map((day, index) => ({
      label: `D${index + 1}`,
      card: createDayAppCard(day, index, days, state)
    }));
    replaceAppSwiperPages('plan', [
      { label: '行程总览', card: overviewCard },
      ...dayPages
    ].filter(page => page.card), activePageIndex);
  }

  function syncDayUi(next, options = {}) {
    const slides = Array.from(document.querySelectorAll('[data-day-page-index]'));
    slides.forEach(slide => {
      const slideIndex = Number(slide.dataset.dayPageIndex ?? -1);
      const active = slideIndex === next;
      const route = slide.querySelector('.route-map');
      if (route && (!active || options.deferRoute === true)) {
        route.classList.remove('run');
      }
      slide.classList.toggle('active', active);
      if (active) {
        if (!route || options.deferRoute === true) return;
        if (options.animate !== false) {
          route.classList.remove('run');
          void route.offsetWidth;
          route.classList.add('run');
        } else {
          route.classList.add('run');
        }
      }
    });
  }

  function setActiveDay(index, options = {}) {
    const days = Array.isArray(currentPlan?.days) ? currentPlan.days : [];
    if (!days.length) return;
    const next = Math.min(Math.max(Number(index) || 0, 0), days.length - 1);
    const shouldAnimate = options.animate !== false;
    activeDayIndex = next;
    if (appSwipers.plan) {
      appSwipers.plan.slideTo(next + 1, shouldAnimate);
    }
    syncDayUi(next, { ...options, deferRoute: shouldAnimate });
  }

  function handleDailyClick(event) {
    const button = event.target.closest('[data-day-action]');
    if (!button) return;
    const action = button.dataset.dayAction;
    if (action === 'go') {
      setActiveDay(Number(button.dataset.dayIndex), { animate: true });
    } else if (action === 'prev') {
      setActiveDay(activeDayIndex - 1, { animate: true });
    } else if (action === 'next') {
      setActiveDay(activeDayIndex + 1, { animate: true });
    } else if (action === 'edit') {
      openDayEditor(Number(button.dataset.dayIndex));
    }
  }

  function dayEditorRowTemplate(item = {}, index = 0) {
    return `
      <div class="day-editor-row" data-editor-row>
        <div class="day-editor-row-head">
          <div class="day-editor-row-title">安排 ${index + 1}</div>
          <button class="day-editor-remove" type="button" data-editor-action="remove">删除</button>
        </div>
        <div class="form-grid">
          <div class="field">
            <label>时间</label>
            <input class="day-editor-time" value="${escapeHtml(item.time || '')}" autocomplete="off" placeholder="09:00">
          </div>
          <div class="field">
            <label>标题</label>
            <input class="day-editor-item-title" value="${escapeHtml(dayItemTitle(item) === '待安排' ? '' : dayItemTitle(item))}" autocomplete="off">
          </div>
          <div class="field full">
            <label>说明</label>
            <textarea class="day-editor-desc">${escapeHtml(dayItemDesc(item))}</textarea>
          </div>
        </div>
      </div>
    `;
  }

  function refreshDayEditorRowLabels() {
    Array.from(els.dayEditorItems.querySelectorAll('[data-editor-row]')).forEach((row, index) => {
      const title = row.querySelector('.day-editor-row-title');
      if (title) title.textContent = `安排 ${index + 1}`;
    });
  }

  function openDayEditor(index) {
    const days = Array.isArray(currentPlan?.days) ? currentPlan.days : [];
    const day = days[index];
    if (!day) return;
    editingDayIndex = index;
    const dateText = dayDateText(day, index);
    els.dayEditorKicker.textContent = `D${index + 1} · ${displayDate(dateText)}`;
    els.dayEditorDayTitle.value = day.title || `第${index + 1}天`;
    els.dayEditorDate.value = dateText;
    const items = dayItems(day);
    els.dayEditorItems.innerHTML = (items.length ? items : [{ time: '', title: '', desc: '' }])
      .map((item, itemIndex) => dayEditorRowTemplate(item, itemIndex))
      .join('');
    els.dayEditorBackdrop.hidden = false;
    els.dayEditorSheet.hidden = false;
    document.body.classList.add('sheet-open');
    setTimeout(() => els.dayEditorDayTitle.focus(), 0);
  }

  function closeDayEditor() {
    editingDayIndex = -1;
    els.dayEditorBackdrop.hidden = true;
    els.dayEditorSheet.hidden = true;
    document.body.classList.remove('sheet-open');
  }

  function addDayEditorItem(item = {}) {
    els.dayEditorItems.insertAdjacentHTML('beforeend', dayEditorRowTemplate(item, els.dayEditorItems.querySelectorAll('[data-editor-row]').length));
    refreshDayEditorRowLabels();
  }

  function persistCurrentPlan() {
    if (!currentPlan) return;
    const state = getState();
    const existing = loadPlanCache();
    const sameSignature = existing?.signature === signature(state);
    localStorage.setItem(PLAN_CACHE_KEY, JSON.stringify({
      plan: currentPlan,
      state: stateForStorage(state),
      weather: sameSignature ? (existing.weather || null) : null,
      generatedAt: existing?.generatedAt || new Date().toISOString(),
      signature: signature(state)
    }));
  }

  function saveDayEditor() {
    if (!currentPlan || editingDayIndex < 0) return;
    const rows = Array.from(els.dayEditorItems.querySelectorAll('[data-editor-row]'));
    const items = rows.map(row => ({
      time: row.querySelector('.day-editor-time')?.value.trim() || '',
      title: row.querySelector('.day-editor-item-title')?.value.trim() || '',
      desc: row.querySelector('.day-editor-desc')?.value.trim() || ''
    })).filter(item => item.time || item.title || item.desc);
    const fallbackTitle = `第${editingDayIndex + 1}天`;
    currentPlan.days[editingDayIndex] = {
      ...(currentPlan.days[editingDayIndex] || {}),
      title: els.dayEditorDayTitle.value.trim() || fallbackTitle,
      date: els.dayEditorDate.value || addDays(getState().startDate, editingDayIndex),
      items: items.length ? items : [{ time: '', title: '待安排', desc: '请补充当天安排。' }]
    };
    persistCurrentPlan();
    const keepIndex = editingDayIndex;
    renderDaily(currentPlan);
    setActiveDay(keepIndex, { animate: false });
    closeDayEditor();
    setBox(els.statusBox, `已保存 D${keepIndex + 1} 的本地修改。`);
  }

  function handleDayEditorClick(event) {
    const action = event.target.closest('[data-editor-action]')?.dataset.editorAction;
    if (action === 'remove') {
      const row = event.target.closest('[data-editor-row]');
      if (row) row.remove();
      if (!els.dayEditorItems.querySelector('[data-editor-row]')) addDayEditorItem();
      refreshDayEditorRowLabels();
    }
  }

  function renderBudget(plan) {
    const rows = (plan.budget || []).map(item => `
      <tr>
        <td>${escapeHtml(item.item || '')}</td>
        <td>${escapeHtml(item.amount || '')}</td>
        <td>${escapeHtml(item.note || '')}</td>
      </tr>
    `).join('');
    els.budgetContent.innerHTML = `
      <p>以下为保守估算，实际费用会随日期、平台、人数和车型变化。</p>
      <div class="table-wrap">
        <table>
          <thead><tr><th>项目</th><th>预算</th><th>说明</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    `;
  }

  function renderTips(plan) {
    const fallbackHtml = (plan.fallbacks || []).length
      ? `<div class="section-subtitle">备选方案</div><ul class="tip-list">${plan.fallbacks.map(t => `<li>${escapeHtml(t)}</li>`).join('')}</ul>`
      : '';
    els.tipsContent.innerHTML = `
      <ul class="tip-list">${(plan.tips || []).map(t => `<li>${escapeHtml(t)}</li>`).join('')}</ul>
      ${fallbackHtml}
    `;
  }

  function renderWeather(weather, state) {
    if (!weather) {
      els.forecastGrid.innerHTML = '<div class="forecast-card"><div class="forecast-date"><div class="day">--</div><div class="weekday">--</div></div><div class="forecast-icon">--</div><div class="forecast-info"><div class="forecast-desc">天气加载中</div><div class="forecast-temp">请稍候</div></div></div>';
      els.weatherAdvice.textContent = '正在查询天气。';
      return;
    }
    if (weather.unavailable) {
      els.forecastGrid.innerHTML = `
        <div class="forecast-card highlight">
          <div class="forecast-date"><div class="day">${escapeHtml(displayDate(state.startDate).split(' ')[0])}</div><div class="weekday">${escapeHtml(displayDate(state.startDate).split(' ')[1] || '')}</div></div>
          <div class="forecast-icon">--</div>
          <div class="forecast-info"><div class="forecast-desc">暂无实时预报</div><div class="forecast-temp">${escapeHtml(weather.reason)}</div></div>
        </div>
      `;
      els.weatherAdvice.textContent = weather.reason;
      return;
    }
    const daily = weather.daily || {};
    const dates = daily.time || [];
    const startDate = state.startDate || todayText();
    const tripDayCount = Math.max(1, Number(state.days) || 1);
    const tripDates = new Set(Array.from({ length: tripDayCount }, (_, i) => addDays(startDate, i)));
    const visibleDates = weatherDisplayDates(state)
      .map(date => ({ date, i: dates.indexOf(date) }));
    let maxRain = 0;
    let maxWind = 0;
    const html = visibleDates.map(({ date, i }) => {
      const d = new Date(date + 'T00:00:00');
      const hasData = i >= 0;
      const code = hasData ? daily.weather_code?.[i] : undefined;
      const w = hasData ? (WMO_MAP[code] || { desc: '天气变化', icon: '❔' }) : { desc: '暂无预报', icon: '--' };
      const high = hasData ? Math.round(daily.temperature_2m_max?.[i] ?? 0) : null;
      const low = hasData ? Math.round(daily.temperature_2m_min?.[i] ?? 0) : null;
      const rainProb = hasData ? (daily.precipitation_probability_max?.[i] ?? 0) : 0;
      const rain = hasData ? (daily.precipitation_sum?.[i] ?? 0) : 0;
      const wind = hasData ? (daily.wind_speed_10m_max?.[i] ?? 0) : 0;
      if (hasData && tripDates.has(date)) {
        maxRain = Math.max(maxRain, rainProb);
        maxWind = Math.max(maxWind, wind);
      }
      return `
        <div class="forecast-card${tripDates.has(date) ? ' highlight' : ''}">
          <div class="forecast-date"><div class="day">${d.getMonth() + 1}/${d.getDate()}</div><div class="weekday">${WEEKDAY[d.getDay()]}</div></div>
          <div class="forecast-icon">${w.icon}</div>
          <div class="forecast-info"><div class="forecast-desc">${w.desc}</div><div class="forecast-temp">${hasData ? `<span class="high">${high}°</span> / <span class="low">${low}°</span>` : '暂无实时数据'}</div></div>
          <div class="forecast-extras">${hasData ? `降水 ${Math.round(rainProb)}%<br>${Number(rain).toFixed(1)}mm · ${windDesc(wind)}` : '临近出发<br>再确认'}</div>
        </div>
      `;
    }).join('');
    els.forecastGrid.innerHTML = html;
    if (maxRain >= 70 || maxWind >= 35) {
      els.weatherAdvice.textContent = '行程日降雨或风力风险偏高，建议减少户外停留，保留室内、酒店和短距离备选。';
    } else if (maxRain >= 40 || maxWind >= 25) {
      els.weatherAdvice.textContent = '天气有一定变化，建议带雨具、防风外套，并把户外项目做成可替换安排。';
    } else {
      els.weatherAdvice.textContent = '行程日天气风险暂时不高，适合按轻松节奏出行；临近出发仍需再确认。';
    }
  }

  function renderPlan(plan, state, options = {}) {
    currentPlan = plan;
    const nextSignature = signature(state);
    if (currentSignature !== nextSignature) activeDayIndex = 0;
    currentSignature = nextSignature;
    els.headerTitle.textContent = '旅游计划书';
    renderTraffic(plan);
    renderOverview(plan, state);
    renderDaily(plan);
    renderBudget(plan);
    renderTips(plan);
    if (!options.skipRestore) restoreEditedContent();
    setEditing(isEditing);
    refreshAppLayout();
  }

  function buildPrompt(state, destinationInfo, weatherSummary) {
    const coordinatesText = Number.isFinite(Number(destinationInfo.lat)) && Number.isFinite(Number(destinationInfo.lon))
      ? `${destinationInfo.lat},${destinationInfo.lon}`
      : '未定位';
    const manualLocationNote = destinationInfo.source === 'manual'
      ? '目的地未定位：仍需按用户输入名称生成可执行的保守计划；不要编造实时天气、精确车次/航班、门票、开放时间或坐标。'
      : '';
    const schema = {
      title: '字符串',
      destination: '字符串',
      intro: ['2-4段中文简介'],
      tags: ['短标签'],
      traffic: {
        mode: '自驾/高铁/飞机/组合公共交通',
        distance: '字符串',
        duration: '字符串',
        route: '字符串',
        toll: '字符串',
        note: '字符串',
        options: [{ type: '车次/航班/线路名', depart: '出发时间和站点', arrive: '到达时间和站点', duration: '耗时', note: '来源或确认提示' }]
      },
      overview: [{ time: 'Day 1 上午', plan: '安排', focus: '重点' }],
      days: [{ title: '第1天标题', date: 'YYYY-MM-DD', items: [{ time: '09:00', title: '活动', desc: '说明' }] }],
      budget: [{ item: '项目', amount: '预算', note: '说明' }],
      tips: ['提醒'],
      fallbacks: ['备选方案']
    };
    const hotelLines = state.hotelInfo ? [
      '\u9152\u5e97\u4fe1\u606f\uff08\u5df2\u786e\u8ba4\uff0c\u8bf7\u6839\u636e\u9152\u5e97\u540d\u79f0\u81ea\u884c\u641c\u7d22\u5730\u5740\u5e76\u6309\u6b64\u5b89\u6392\u4f4f\u5bbf\u548c\u8def\u7ebf\uff09\uff1a',
      `  \u540d\u79f0\uff1a${state.hotelInfo.name || '\u672a\u586b'}`,
      `  \u5165\u4f4f\u65e5\u671f\uff1a${state.hotelInfo.checkinDate || '\u672a\u586b'}`,
      `  \u79bb\u5e97\u65e5\u671f\uff1a${state.hotelInfo.checkoutDate || '\u672a\u586b'}`
    ].join('\n') : '';

    const ticketLines = state.ticketInfo ? [
      '\u8f66\u7968/\u4ea4\u901a\u7968\u4fe1\u606f\uff08\u5df2\u786e\u8ba4\uff0c\u8bf7\u6309\u6b64\u5b89\u6392\u51fa\u53d1\u548c\u8fd4\u7a0b\uff09\uff1a',
      `  \u53bb\u7a0b\u8f66\u6b21/\u822a\u73ed\uff1a${state.ticketInfo.departNo || '\u672a\u586b'}`,
      `  \u8fd4\u7a0b\u8f66\u6b21/\u822a\u73ed\uff1a${state.ticketInfo.returnNo || '\u672a\u586b'}`,
      `  \u5907\u6ce8\uff1a${state.ticketInfo.note || '\u65e0'}`
    ].join('\n') : '';

    const hotelPrompt = hotelLines ? '\n' + hotelLines + '\n\u9152\u5e97\u8981\u6c42\uff1a\u884c\u7a0b\u5929\u6570\u4ee5\u4e0a\u65b9\u201c\u884c\u7a0b\u5929\u6570\u201d\u4e3a\u51c6\uff0c\u4e0d\u8981\u6839\u636e\u9152\u5e97\u65e5\u671f\u7f29\u51cf\u5929\u6570\uff1b\u53c2\u8003\u9152\u5e97\u4f4d\u7f6e\u5b89\u6392\u6bcf\u5929\u8def\u7ebf\uff0c\u4ee5\u9152\u5e97\u4e3a\u4f4f\u5bbf\u4e2d\u5fc3\uff1b\u8003\u8651\u5165\u4f4f\u548c\u79bb\u5e97\u65f6\u95f4\u5b89\u6392\u7b2c\u4e00\u5929\u548c\u6700\u540e\u4e00\u5929\u884c\u7a0b\u3002' : '';
    const ticketPrompt = ticketLines ? '\n' + ticketLines + '\n\u8f66\u7968\u8981\u6c42\uff1a\u6839\u636e\u53bb\u7a0b\u8f66\u6b21/\u822a\u73ed\u5b89\u6392\u7b2c\u4e00\u5929\u884c\u7a0b\uff0c\u62b5\u8fbe\u540e\u4e0d\u8981\u592a\u8d76\uff1b\u6839\u636e\u8fd4\u7a0b\u8f66\u6b21/\u822a\u73ed\u5b89\u6392\u6700\u540e\u4e00\u5929\u884c\u7a0b\uff0c\u5efa\u8bae\u63d0\u524d2\u5c0f\u65f6\u7ed3\u675f\u884c\u7a0b\u8d76\u8f66/\u8d76\u673a\uff1b\u907f\u514d\u65f6\u95f4\u8fc7\u7d27\u3002' : '';

    return [
      '\u8bf7\u53ea\u8fd4\u56de\u4e25\u683c JSON\uff0c\u4e0d\u8981 Markdown\uff0c\u4e0d\u8981\u4ee3\u7801\u5757\uff0c\u4e0d\u8981\u89e3\u91ca\u3002',
      '使用中文，生成一份手机端旅游计划书内容。',
      `出发地：${state.departureCity}`,
      `目的地：${state.destination}（定位参考：${destinationInfo.name || state.destination}，${destinationInfo.region || ''}，坐标 ${coordinatesText}）`,
      manualLocationNote,
      `出发日期：${state.startDate}`,
      `行程天数：${state.days}天`,
      `交通工具：${state.transportMode || '自驾'}`,
      `同行人/偏好（最高优先级，必须逐条落实到行程安排、节奏、餐饮、住宿、备选方案中）：${state.travelers || '轻松游'}`,
      `热门景点参考：${(destinationInfo.attractions || []).join('、') || '请按目的地常规热门景点安排'}`,
      `天气摘要：${weatherSummary || '实时天气暂不可用，请给出保守方案'}`,
      hotelPrompt,
      ticketPrompt,
      '交通要求：如果交通工具是自驾，计划中要包含停车、服务区/充电加油、错峰和导航确认提醒；如果是高铁，给出往返候选车次/出发到达站/时间/耗时，并说明以12306实时查询为准；如果是飞机，给出往返候选航班或航线/机场/时间窗，并说明以航司或机场实时查询为准；如果是组合公共交通，给出分段换乘方案。所有车次、航班和时间必须尽量使用真实可核验信息，不能确认时必须写“需官方查询确认”，不要编造。',
      '交通和每日行程一致性要求：traffic.options 中的去程出发/到达时间必须能对应 days[0].items 的前两个交通相关安排；返程出发/到达时间必须能对应最后一天 items 的返程相关安排。若无法确认真实班次，请在 traffic.options 和每日行程里都写同一个“需官方查询确认”的时间窗，不要互相矛盾。',
      '行程要求：每天不要过满；严格跟进同行人/偏好里的需求；不要编造精确门票、营业时间、班次；对天气、拥堵、老人孩子、雨天方案给保守提醒；费用用区间或“以官方/导航为准”。',
      '输出长度要求：为避免 JSON 被截断，内容必须紧凑。intro 最多2段；traffic.options 2-4项；overview 每天2-3项；days 每天4-6项，每项 desc 不超过60字；budget 4-6项；tips 和 fallbacks 各不超过6条。',
      'JSON 格式要求：字符串内部不要直接使用英文双引号，如必须使用请转义；不要输出注释、换行代码块、尾随逗号或 JSON 以外的文字。',
      `JSON 结构示例：${JSON.stringify(schema)}`
    ].join('\n');
  }

  function weatherSummary(weather, state) {
    if (!weather || weather.unavailable) return weather?.reason || '实时天气暂不可用';
    const daily = weather.daily || {};
    const lines = [];
    for (let i = 0; i < state.days; i++) {
      const date = addDays(state.startDate, i);
      const idx = (daily.time || []).indexOf(date);
      if (idx >= 0) {
        const w = WMO_MAP[daily.weather_code[idx]] || { desc: '天气变化' };
        lines.push(`${date}: ${w.desc}, ${Math.round(daily.temperature_2m_min[idx])}-${Math.round(daily.temperature_2m_max[idx])}°C, 降水概率${daily.precipitation_probability_max[idx]}%, 风速${Math.round(daily.wind_speed_10m_max[idx])}km/h`);
      }
    }
    return lines.join('；') || '未命中行程日期天气';
  }

  function extractJsonText(text) {
    const cleaned = String(text || '').trim()
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```$/i, '')
      .trim();
    const start = cleaned.indexOf('{');
    if (start < 0) return cleaned;
    let depth = 0;
    let inString = false;
    let escaped = false;
    for (let i = start; i < cleaned.length; i++) {
      const ch = cleaned[i];
      if (inString) {
        if (escaped) {
          escaped = false;
        } else if (ch === '\\') {
          escaped = true;
        } else if (ch === '"') {
          inString = false;
        }
        continue;
      }
      if (ch === '"') inString = true;
      if (ch === '{') depth++;
      if (ch === '}') depth--;
      if (depth === 0) return cleaned.slice(start, i + 1);
    }
    return cleaned.slice(start);
  }

  function softRepairJsonText(text) {
    return text
      .replace(/[“”]/g, '"')
      .replace(/[‘’]/g, "'")
      .replace(/,\s*([}\]])/g, '$1')
      .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, ' ');
  }

  function parseAiJson(text) {
    const candidate = extractJsonText(text);
    const attempts = [candidate, softRepairJsonText(candidate)];
    let lastError = null;
    for (const item of attempts) {
      try {
        return JSON.parse(item);
      } catch (err) {
        lastError = err;
      }
    }
    const err = new Error(`AI 返回 JSON 格式错误：${lastError?.message || '无法解析'}`);
    err.rawContent = candidate;
    throw err;
  }

  function isAbortError(err) {
    const message = String(err?.message || err || '');
    return err?.name === 'AbortError' || /aborted|abort/i.test(message);
  }

  function readableErrorDetail(text) {
    const raw = String(text || '').trim();
    if (!raw) return '';
    try {
      const data = JSON.parse(raw);
      if (typeof data.error === 'string') return data.error;
      if (data.error?.message) return data.error.message;
      if (data.message) return data.message;
      if (data.detail) return data.detail;
    } catch {}
    return raw;
  }

  function friendlyError(err, state) {
    const message = String(err?.message || err || '');
    if (isAbortError(err)) {
      return '已取消本次生成，当前计划保持不变。';
    }
    if (/Unauthorized proxy token|AI 接口返回 401/i.test(message)) {
      return '代理访问码不正确，或 Worker 中的 PROXY_TOKEN 与页面填写的不一致。请重新核对后再测试。';
    }
    if (/Missing .* API key secret|Missing DEEPSEEK API key secret|Missing MIMO API key secret/i.test(message)) {
      return 'Worker Secrets 缺少当前服务商的 API Key。请在 Worker 中配置 DEEPSEEK_API_KEY 或 MIMO_API_KEY 后重新部署。';
    }
    if (/Upstream request timeout|AI 接口返回 504|timeout/i.test(message)) {
      return `${PROVIDERS[state.provider]?.label || 'AI'} 上游响应超时。pro 模型生成更慢，建议稍后重试、降低输出长度，或先用 flash/普通模型生成。`;
    }
    if (/Upstream request failed|AI 接口返回 502/i.test(message)) {
      return `${PROVIDERS[state.provider]?.label || 'AI'} 上游连接失败。Worker 已收到请求，但无法连到模型服务，请检查服务商网络、额度或稍后重试。`;
    }
    if (/AI 接口返回 400/i.test(message)) {
      return `${PROVIDERS[state.provider]?.label || 'AI'} 返回参数或模型错误。请检查模型名是否可用，pro 模型是否已开通，以及接口参数是否匹配。`;
    }
    if (/AI 接口返回 402|AI 接口返回 429|quota|rate limit|insufficient/i.test(message)) {
      return `${PROVIDERS[state.provider]?.label || 'AI'} 额度不足或触发限流。请检查账户余额、并发限制或稍后重试。`;
    }
    if (/AI 接口返回 404/i.test(message)) {
      if (state.callMode === 'proxy') {
        return `${PROVIDERS[state.provider]?.label || 'AI'} 代理返回 404。请确认代理域名只填 Worker 根域名，并重新部署支持 /v1/deepseek/chat/completions 和 /v1/mimo/chat/completions 的最新版 Worker。`;
      }
      return `${PROVIDERS[state.provider]?.label || 'AI'} 直连返回 404。请检查接口地址是否正确。`;
    }
    if (/failed to fetch|networkerror|load failed/i.test(message)) {
      if (state.callMode === 'proxy') {
        const proHint = /pro/i.test(state.model || '') ? '如果只在 pro 模型出现，请确认 Worker 已更新到 v4；v4 已改为无预检代理请求，可避开本地文件/手机浏览器的 CORS preflight 问题。' : '';
        return `${PROVIDERS[state.provider]?.label || 'AI'} 代理请求没有拿到浏览器可用的响应。请确认 HTML 是通过 HTTPS 页面打开、Worker 根路径可访问且已重新部署。${proHint || '如果大陆移动网络无法访问 workers.dev，可换网络/VPN，或后续迁移到国内代理/自定义域名。'}`;
      }
      return `${PROVIDERS[state.provider]?.label || 'AI'} 直连失败。iPhone/Safari/微信 WebView 可能会拦截跨域请求，建议切换为云端代理。`;
    }
    return message || '请求失败。';
  }

  function formatElapsed(ms) {
    const total = Math.max(0, Math.floor(ms / 1000));
    const hours = Math.floor(total / 3600);
    const minutes = Math.floor((total % 3600) / 60);
    const seconds = total % 60;
    const mm = String(minutes).padStart(2, '0');
    const ss = String(seconds).padStart(2, '0');
    if (!hours) return `${mm}:${ss}`;
    return `${String(hours).padStart(2, '0')}:${mm}:${ss}`;
  }

  function updateElapsedButton() {
    if (!generationStartedAt) return;
    els.cancelGenerateBtn.textContent = `取消生成 ${formatElapsed(Date.now() - generationStartedAt)}`;
  }

  function startElapsedButton() {
    generationStartedAt = Date.now();
    els.cancelGenerateBtn.hidden = false;
    els.cancelGenerateBtn.disabled = false;
    updateElapsedButton();
    clearInterval(elapsedTimer);
    elapsedTimer = setInterval(updateElapsedButton, 1000);
  }

  function stopElapsedButton() {
    clearInterval(elapsedTimer);
    elapsedTimer = null;
    generationStartedAt = 0;
    els.cancelGenerateBtn.textContent = '取消生成 00:00';
    els.cancelGenerateBtn.disabled = true;
    els.cancelGenerateBtn.hidden = true;
  }

  function cancelGeneration() {
    if (!currentAbort) return;
    els.cancelGenerateBtn.disabled = true;
    setBox(els.statusBox, '正在取消本次生成...');
    currentAbort.abort();
  }

  function maxTokensForModel(state) {
    if (state.provider === 'mimo') {
      return /pro/i.test(state.model || '') ? 12000 : 9000;
    }
    return /pro/i.test(state.model || '') ? 6500 : 4500;
  }

  function chatEndpoint(state) {
    if (state.callMode === 'proxy') {
      const base = normalizeProxyBase(state.proxyBase);
      const providerPath = state.provider === 'mimo' ? 'mimo' : 'deepseek';
      return `${base}/v1/${providerPath}/chat/completions`;
    }
    const raw = (state.endpoint || '').trim().replace(/\/+$/, '');
    if (/\/chat\/completions$/i.test(raw)) return raw;
    if (/\/v1$/i.test(raw)) return `${raw}/chat/completions`;
    if (/deepseek\.com$/i.test(raw)) return `${raw}/chat/completions`;
    return raw;
  }

  function requestHeaders(state) {
    if (state.callMode === 'proxy') {
      return {
        'Content-Type': 'text/plain;charset=utf-8'
      };
    }
    if (state.provider === 'mimo') {
      return {
        'Content-Type': 'application/json',
        'api-key': state.apiKey
      };
    }
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${state.apiKey}`
    };
  }

  function requestBody(state, messages) {
    const body = {
      model: state.model,
      messages,
      temperature: state.provider === 'mimo' ? 0.25 : 0.45,
      stream: false
    };
    if (state.provider === 'mimo') {
      body.top_p = 0.95;
      body.max_completion_tokens = maxTokensForModel(state);
      body.thinking = { type: 'disabled' };
    } else {
      body.max_tokens = maxTokensForModel(state);
      body.response_format = { type: 'json_object' };
    }
    return body;
  }

  function requestPayload(state, body) {
    if (state.callMode === 'proxy') {
      return JSON.stringify({
        proxyToken: state.proxyToken,
        payload: body
      });
    }
    return JSON.stringify(body);
  }

  async function requestChatContent(state, messages, signal, retryWithoutJson = false) {
    const body = requestBody(state, messages);
    if (retryWithoutJson) delete body.response_format;

    const res = await fetch(chatEndpoint(state), {
      method: 'POST',
      headers: requestHeaders(state),
      body: requestPayload(state, body),
      signal
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      const readable = readableErrorDetail(detail);
      if (!retryWithoutJson && /response_format|json/i.test(readable || detail)) {
        return requestChatContent(state, messages, signal, true);
      }
      throw new Error(`AI 接口返回 ${res.status}${readable ? '：' + readable.slice(0, 180) : ''}`);
    }
    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error('AI 没有返回内容');
    return content;
  }

  async function repairJsonWithModel(state, rawContent, signal) {
    const repairMessages = [
      { role: 'system', content: '你是 JSON 修复器。只返回严格 JSON 对象，不要解释，不要 Markdown，不要代码块。' },
      { role: 'user', content: [
        '下面是一段格式有误的 JSON 风格文本。请在不改变语义的前提下修复为严格合法 JSON。',
        '要求：所有 key 必须用双引号；字符串中的双引号必须转义；数组和对象不能有尾随逗号；只输出 JSON 对象。',
        extractJsonText(rawContent).slice(0, 18000)
      ].join('\n\n') }
    ];
    const repaired = await requestChatContent(state, repairMessages, signal);
    return parseAiJson(repaired);
  }

  async function fetchChatCompletion(state, messages, signal, retryWithoutJson = false) {
    const content = await requestChatContent(state, messages, signal, retryWithoutJson);
    try {
      return parseAiJson(content);
    } catch (parseErr) {
      try {
        return await repairJsonWithModel(state, content, signal);
      } catch (repairErr) {
        throw new Error(`${parseErr.message}；已尝试自动修复但仍失败：${repairErr.message}`);
      }
    }
  }

  async function generateAiPlan(state, destinationInfo, weather, signal) {
    if (state.callMode === 'proxy') {
      if (!state.proxyBase) {
        throw new Error('未填写代理域名。iPhone 推荐使用云端代理；填写 Worker 域名和代理访问码后可生成计划。');
      }
      if (!state.proxyToken) {
        throw new Error('未填写代理访问码。请填写 Worker 中配置的 PROXY_TOKEN。');
      }
    } else if (!state.apiKey) {
      throw new Error('未填写 API Key。已显示千岛湖兜底模板；填写 Key 后可使用 API直连。');
    }
    const prompt = buildPrompt(state, destinationInfo, weatherSummary(weather, state));
    const messages = [
      { role: 'system', content: '你是严谨的中文旅游计划助手。必须只输出符合用户要求的 JSON 对象。' },
      { role: 'user', content: prompt }
    ];
    const raw = await fetchChatCompletion(state, messages, signal);
    return normalizePlan(raw, state, destinationInfo);
  }

  function setLoading(on) {
    els.generateBtn.disabled = on;
    els.testAiBtn.disabled = on;
    els.generateBtn.textContent = on ? '生成中...' : '重新生成';
    if (on) {
      startElapsedButton();
    } else {
      stopElapsedButton();
    }
  }

  async function regenerate() {
    if (currentAbort) return;
    const state = getState();
    syncKeyStorage();
    saveState(state);
    currentSignature = signature(state);
    currentAbort = new AbortController();
    const controller = currentAbort;
    setLoading(true);
    setBox(els.statusBox, '正在生成天气和旅游计划...');

    try {
      if (state.callMode === 'proxy' && (!state.proxyBase || !state.proxyToken)) {
        const fallbackState = { ...state, destination: '千岛湖', coordinates: { lat: 29.62, lon: 119.02 } };
        const weather = await queryWeather(fallbackState.coordinates, fallbackState).catch(() => ({ unavailable: true, reason: '天气加载失败，请出发前手动确认。' }));
        renderWeather(weather, fallbackState);
        renderPlan(fallbackPlan(fallbackState, '未填写代理域名或代理访问码。已显示千岛湖兜底模板；配置云端代理后可生成任意目的地计划。'), fallbackState);
        setBox(els.statusBox, '未填写代理域名或代理访问码。已显示千岛湖兜底模板；配置云端代理后可生成任意目的地计划。', 'error');
        return;
      }

      if (state.callMode === 'direct' && !state.apiKey) {
        const fallbackState = { ...state, destination: '千岛湖', coordinates: { lat: 29.62, lon: 119.02 } };
        const weather = await queryWeather(fallbackState.coordinates, fallbackState).catch(() => ({ unavailable: true, reason: '天气加载失败，请出发前手动确认。' }));
        renderWeather(weather, fallbackState);
        renderPlan(fallbackPlan(fallbackState, '未填写 API Key。已显示千岛湖兜底模板；填写 Key 后可使用 API直连。'), fallbackState);
        setBox(els.statusBox, '未填写 API Key。已显示千岛湖兜底模板；填写 Key 后可使用 API直连。', 'error');
        return;
      }

      const destinationInfo = await geocodeDestination(state);
      state.coordinates = Number.isFinite(Number(destinationInfo.lat)) && Number.isFinite(Number(destinationInfo.lon))
        ? { lat: Number(destinationInfo.lat), lon: Number(destinationInfo.lon) }
        : null;
      const weather = await queryWeather(state.coordinates, state).catch(err => ({ unavailable: true, reason: err.message || '天气加载失败，请出发前手动确认。' }));
      renderWeather(weather, state);

      let plan;
      try {
        plan = await generateAiPlan(state, destinationInfo, weather, controller.signal);
        cachePlan(plan, state, weather);
        savePlanToHistory(plan, state, weather);
        refreshHistoryUI();
        setBox(els.statusBox, `已根据 ${state.destination} 和 ${state.startDate} 更新计划（${formatDateTime()}）。`);
      } catch (aiErr) {
        if (isAbortError(aiErr)) {
          setBox(els.statusBox, friendlyError(aiErr, state));
          return;
        }
        const cached = loadPlanCache();
        if (cached?.plan && cached.signature === signature(state)) {
          plan = cached.plan;
          if (cached.weather) renderWeather(cached.weather, state);
        } else {
          plan = fallbackPlan(state, friendlyError(aiErr, state));
        }
        setBox(els.statusBox, friendlyError(aiErr, state) || 'AI 生成失败，已保留可读计划。', 'error');
      }
      renderPlan(plan, state);
    } catch (err) {
      if (isAbortError(err)) {
        setBox(els.statusBox, friendlyError(err, state));
        return;
      }
      const fallback = fallbackPlan(state, friendlyError(err, state));
      renderWeather({ unavailable: true, reason: '天气加载失败，请出发前手动确认。' }, state);
      renderPlan(fallback, state);
      setBox(els.statusBox, friendlyError(err, state) || '生成失败，已显示千岛湖兜底模板。', 'error');
    } finally {
      if (currentAbort === controller) currentAbort = null;
      setLoading(false);
    }
  }

  function scheduleGenerate() {
    saveState(getState());
    setBox(els.statusBox, '参数已修改。点击“重新生成”后再更新天气和旅游计划。');
  }

  async function testAi() {
    const state = getState();
    syncKeyStorage();
    saveState(state);
    if (state.callMode === 'proxy' && (!state.proxyBase || !state.proxyToken)) {
      setBox(els.aiStatusBox, '请先填写代理域名和代理访问码。', 'error');
      return;
    }
    if (state.callMode === 'direct' && !state.apiKey) {
      setBox(els.aiStatusBox, 'API直连模式请先填写 API Key。', 'error');
      return;
    }
    setBox(els.aiStatusBox, '正在测试连接...');
    try {
      const raw = await fetchChatCompletion(state, [
        { role: 'system', content: '只返回 JSON。' },
        { role: 'user', content: '返回 {"ok":true,"message":"连接成功"}' }
      ]);
      setBox(els.aiStatusBox, raw.ok ? '连接成功。' : '接口可访问，但返回内容不符合预期。');
    } catch (err) {
      setBox(els.aiStatusBox, friendlyError(err, state) || '连接失败。', 'error');
    }
  }

  function resetAll() {
    if (!confirm('确认恢复默认？本机保存的编辑内容会被清除。')) return;
    clearEditedContent();
    localStorage.removeItem(PLAN_CACHE_KEY);
    const state = defaultState();
    setControls(state);
    renderWeather({ unavailable: true, reason: '请点击重新生成查询实时天气。' }, state);
    renderPlan(fallbackPlan(state), state, { skipRestore: true });
    setBox(els.statusBox, '已恢复默认千岛湖模板。');
  }

  function downloadPdf() {
    setBox(els.statusBox, '正在打开浏览器 PDF 保存流程，请在系统界面选择保存为 PDF。');
    window.print();
  }

  function onProviderChange() {
    if ((els.callMode.value || 'proxy') === 'direct') {
      saveProviderApiKey(activeProvider);
    }
    const provider = providerKey(els.aiProvider.value);
    const cfg = PROVIDERS[provider] || PROVIDERS.deepseek;
    activeProvider = provider;
    fillModelOptions(provider);
    els.aiModel.value = cfg.model;
    els.apiEndpoint.value = cfg.endpoint;
    setApiKeyControlForProvider(provider);
    updateAiModeUI();
    normalizeProxyField(false);
    const state = getState();
    saveState(state);
  }

  function createHistoryCard(item) {
    const card = document.createElement('div');
    card.className = 'history-card';
    card.dataset.historyId = item.id;
    const date = item.startDate ? displayDate(item.startDate) : '';
    card.innerHTML = `
      <div class="history-card-inner">
        <div class="history-card-title">${escapeHtml(item.title || item.destination)}</div>
        <div class="history-card-meta">
          <span>${escapeHtml(date)}</span>
          <span>${escapeHtml(item.transportMode || '自驾')}</span>
        </div>
      </div>
      <button class="history-action-btn apply-btn" data-action="apply" data-id="${item.id}">应用</button>
      <button class="history-action-btn delete-btn" data-action="delete" data-id="${item.id}">删除</button>
    `;
    return card;
  }

  function createHistorySection() {
    const section = document.createElement('section');
    section.className = 'card glass-card history-section';
    section.id = 'historySection';
    section.innerHTML = `
      <div class="card-header">
        <div class="card-header-left">
          <div class="card-icon history-icon">历</div>
          <span class="card-title">历史计划</span>
        </div>
      </div>
      <div class="card-body">
        <div class="history-scroll" id="historyScroll"></div>
        <div class="history-empty" id="historyEmpty" hidden>暂无历史计划，生成一次行程后会自动保存到这里。</div>
      </div>
    `;
    return section;
  }

  function refreshHistoryUI() {
    const scroll = document.getElementById('historyScroll');
    const empty = document.getElementById('historyEmpty');
    if (!scroll || !empty) return;
    const history = loadPlanHistory();
    scroll.innerHTML = '';
    if (!history.length) {
      empty.hidden = false;
      scroll.hidden = true;
      return;
    }
    empty.hidden = true;
    scroll.hidden = false;
    history.forEach(item => {
      scroll.appendChild(createHistoryCard(item));
    });
  }

  function handleHistoryAction(event) {
    const btn = event.target.closest('[data-action]');
    if (!btn) return;
    event.preventDefault();
    event.stopPropagation();
    const action = btn.dataset.action;
    const id = btn.dataset.id;
    if (action === 'apply') {
      applyHistoryPlan(id);
    } else if (action === 'delete') {
      if (confirm('确认删除该历史计划？')) {
        deletePlanHistoryItem(id);
        refreshHistoryUI();
        initHistorySwipe();
        setBox(els.statusBox, '已删除历史计划。');
      }
    }
  }

  function initHistorySwipe() {
    const scroll = document.getElementById('historyScroll');
    if (!scroll) return;

    let startX = 0;
    let startY = 0;
    let currentCard = null;
    let swiping = false;
    let lockedAxis = '';

    function resetCard() {
      if (currentCard) {
        currentCard.classList.remove('show-apply', 'show-delete');
        currentCard = null;
      }
    }

    scroll.addEventListener('pointerdown', e => {
      if (e.target.closest('.history-action-btn')) {
        e.stopPropagation();
        return;
      }
      const card = e.target.closest('.history-card');
      if (!card) { resetCard(); return; }
      if (currentCard && currentCard !== card) resetCard();
      startX = e.clientX;
      startY = e.clientY;
      currentCard = card;
      swiping = true;
      lockedAxis = '';
      card.classList.add('no-transition');
    });

    scroll.addEventListener('pointermove', e => {
      if (!swiping || !currentCard) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      if (!lockedAxis && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) {
        lockedAxis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
      }
      if (lockedAxis !== 'x') return;
      e.preventDefault();
    });

    scroll.addEventListener('pointerup', e => {
      if (!swiping || !currentCard) { swiping = false; return; }
      swiping = false;
      currentCard.classList.remove('no-transition');
      if (lockedAxis !== 'x') { resetCard(); return; }
      const dx = e.clientX - startX;
      const threshold = 40;
      if (dx < -threshold) {
        currentCard.classList.remove('show-delete');
        currentCard.classList.add('show-apply');
      } else if (dx > threshold) {
        currentCard.classList.remove('show-apply');
        currentCard.classList.add('show-delete');
      } else {
        resetCard();
      }
    });

    scroll.addEventListener('pointercancel', () => {
      swiping = false;
      if (currentCard) currentCard.classList.remove('no-transition');
    });

    document.addEventListener('pointerdown', e => {
      if (!currentCard) return;
      if (e.target.closest('.history-action-btn')) return;
      if (!scroll.contains(e.target)) resetCard();
    });
  }

  function applyHistoryPlan(id) {
    const history = loadPlanHistory();
    const item = history.find(h => h.id === id);
    if (!item) {
      setBox(els.statusBox, '未找到该历史计划。', 'error');
      return;
    }
    const state = getState();
    const restoredState = {
      ...state,
      departureCity: item.departureCity || state.departureCity,
      destination: item.destination || state.destination,
      startDate: item.startDate || state.startDate,
      days: item.tripDays || state.days,
      transportMode: item.transportMode || state.transportMode,
      travelers: item.travelers || state.travelers,
      hotelInfo: item.hotelInfo || null,
      ticketInfo: item.ticketInfo || null
    };
    setControls(restoredState);
    saveState(restoredState);
    const plan = item.planData;
    currentPlan = plan;
    if (plan) {
      renderPlan(plan, restoredState);
      setBox(els.statusBox, '已应用该历史计划。');
    } else {
      setBox(els.statusBox, '历史计划数据不完整，已恢复参数。');
    }
    if (activeAppTab !== 'home') switchTab('home');
  }

  export function init() {
    applyTheme(localStorage.getItem(THEME_KEY) || 'light');
    updateTime();
    fillDestinations();
    fillModelOptions('deepseek');
    setupCards();
    initAppShell();
    applyTheme(localStorage.getItem(THEME_KEY) || 'light');
    restoreCustomBackground();
    sanitizePlanCacheSecrets();

    const state = loadState();
    if (!state.startDate) state.startDate = todayText();
    setControls(state);
    activeProvider = providerKey(state.provider);
    hydrateStoredSecrets();
    updateAiModeUI();
    isEditing = localStorage.getItem(STORAGE_PREFIX + 'editMode') === 'true';
    setEditing(isEditing);

    document.addEventListener('input', e => {
      if (e.target.matches('[data-editable="true"]') && e.target.isContentEditable) {
        saveEditedContent(e.target);
      }
    });

    document.addEventListener('click', handleNativeMapClick);
    document.addEventListener('click', handleDailyClick);
    els.dayEditorBackdrop.addEventListener('click', closeDayEditor);
    els.dayEditorClose.addEventListener('click', closeDayEditor);
    els.dayEditorCancel.addEventListener('click', closeDayEditor);
    els.dayEditorSave.addEventListener('click', saveDayEditor);
    els.dayEditorAdd.addEventListener('click', () => addDayEditorItem());
    els.dayEditorItems.addEventListener('click', handleDayEditorClick);
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && !els.dayEditorSheet.hidden) closeDayEditor();
    });

    els.themeToggle.addEventListener('click', cycleTheme);

    els.editToggle.addEventListener('click', e => {
      e.stopPropagation();
      setEditing(!isEditing);
    });
    els.editToggle.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setEditing(!isEditing);
      }
    });

    els.destinationInput.addEventListener('change', scheduleGenerate);
    [els.startDate, els.tripDays, els.transportMode].forEach(el => el.addEventListener('change', scheduleGenerate));
    [els.departureCity, els.destinationInput, els.travelers].forEach(el => el.addEventListener('blur', scheduleGenerate));
    els.callMode.addEventListener('change', () => {
      if (!els.apiKey.readOnly) saveProviderApiKey(activeProvider);
      updateAiModeUI();
      normalizeProxyField(false);
      syncKeyStorage();
      saveState(getState());
    });
    els.proxyBase.addEventListener('change', () => {
      normalizeProxyField(true);
      syncKeyStorage();
      saveState(getState());
    });
    [els.proxyToken, els.rememberProxyToken, els.apiKey, els.apiEndpoint, els.aiModel, els.rememberKey].forEach(el => el.addEventListener('change', () => {
      syncKeyStorage();
      saveState(getState());
    }));
    els.aiProvider.addEventListener('change', onProviderChange);
    els.generateBtn.addEventListener('click', () => regenerate());
    els.cancelGenerateBtn.addEventListener('click', cancelGeneration);
    els.resetBtn.addEventListener('click', resetAll);
    els.printBtn.addEventListener('click', downloadPdf);
    els.testAiBtn.addEventListener('click', testAi);
    els.clearKeyBtn.addEventListener('click', () => {
      els.apiKey.value = '';
      els.proxyToken.value = '';
      els.rememberProxyToken.checked = false;
      els.rememberKey.checked = false;
      clearAllProviderApiKeys();
      localStorage.removeItem(PROXY_TOKEN_LOCAL_KEY);
      updateAiModeUI();
      saveState(getState());
      setBox(els.aiStatusBox, '所有服务商 API Key 和代理访问码已清除。');
    });

    const cached = loadPlanCache();
    if (cached?.plan) {
      const cachedState = { ...state, ...(cached.state || {}), proxyToken: state.proxyToken };
      setControls(cachedState);
      activeProvider = providerKey(cachedState.provider);
      updateAiModeUI();
      if (cached.weather) {
        renderWeather(cached.weather, cachedState);
      } else {
        renderWeather({ unavailable: true, reason: '未保存到上次天气，请点击重新生成查询实时天气。' }, cachedState);
      }
      renderPlan(cached.plan, cachedState);
      const generatedAt = formatDateTime(cached.generatedAt);
      setBox(els.statusBox, generatedAt ? `已加载最近一次成功生成的计划（${generatedAt}）。` : '已加载最近一次成功生成的计划。');
    } else {
      const fallback = fallbackPlan(state);
      renderWeather({ unavailable: true, reason: '未查询实时天气。配置云端代理后可生成任意目的地计划；也可切换 API直连。' }, state);
      renderPlan(fallback, state);
      setBox(els.statusBox, '当前显示千岛湖兜底模板；填写代理域名和代理访问码后可按目的地和日期生成。');
    }

    // Load history UI
    refreshHistoryUI();
    initHistorySwipe();
  }
// init() called from main.js
