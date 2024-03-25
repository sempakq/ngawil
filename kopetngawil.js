/*!
 * Platform.js
 * Copyright by Mulda Janu
 * https://facebook.com/muldajanu
 * 081279999911
 */
;(function() {
  'use strict';

  /** Used to determine if values are of the language type `Object`. */
  var objectTypes = {
    'function': true,
    'object': true
  };

  /** Used as a reference to the global object. */
  var root = (objectTypes[typeof window] && window) || this;

  /** Backup possible global object. */
  var oldRoot = root;

  /** Detect free variable `exports`. */
  var freeExports = objectTypes[typeof exports] && exports;

  /** Detect free variable `module`. */
  var freeModule = objectTypes[typeof module] && module && !module.nodeType && module;

  /** Detect free variable `global` from Node.js or Browserified code and use it as `root`. */
  var freeGlobal = freeExports && freeModule && typeof global == 'object' && global;
  if (freeGlobal && (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal || freeGlobal.self === freeGlobal)) {
    root = freeGlobal;
  }

  /**
   * Used as the maximum length of an array-like object.
   * See the [ES6 spec](http://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength)
   * for more details.
   */
  var maxSafeInteger = Math.pow(2, 53) - 1;

  /** Regular expression to detect Opera. */
  var reOpera = /\bOpera/;

  /** Possible global object. */
  var thisBinding = this;

  /** Used for native method references. */
  var objectProto = Object.prototype;

  /** Used to check for own properties of an object. */
  var hasOwnProperty = objectProto.hasOwnProperty;

  /** Used to resolve the internal `[[Class]]` of values. */
  var toString = objectProto.toString;

  /*--------------------------------------------------------------------------*/

  /**
   * Capitalizes a string value.
   *
   * @private
   * @param {string} string The string to capitalize.
   * @returns {string} The capitalized string.
   */
  function capitalize(string) {
    string = String(string);
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  /**
   * A utility function to clean up the OS name.
   *
   * @private
   * @param {string} os The OS name to clean up.
   * @param {string} [pattern] A `RegExp` pattern matching the OS name.
   * @param {string} [label] A label for the OS.
   */
  function cleanupOS(os, pattern, label) {
    // Platform tokens are defined at:
    // http://msdn.microsoft.com/en-us/library/ms537503(VS.85).aspx
    // http://web.archive.org/web/20081122053950/http://msdn.microsoft.com/en-us/library/ms537503(VS.85).aspx
    var data = {
      '10.0': '10',
      '6.4':  '10 Technical Preview',
      '6.3':  '8.1',
      '6.2':  '8',
      '6.1':  'Server 2008 R2 / 7',
      '6.0':  'Server 2008 / Vista',
      '5.2':  'Server 2003 / XP 64-bit',
      '5.1':  'XP',
      '5.01': '2000 SP1',
      '5.0':  '2000',
      '4.0':  'NT',
      '4.90': 'ME'
    };
    // Detect Windows version from platform tokens.
    if (pattern && label && /^Win/i.test(os) && !/^Windows Phone /i.test(os) &&
        (data = data[/[\d.]+$/.exec(os)])) {
      os = 'Windows ' + data;
    }
    // Correct character case and cleanup string.
    os = String(os);

    if (pattern && label) {
      os = os.replace(RegExp(pattern, 'i'), label);
    }

    os = format(
      os.replace(/ ce$/i, ' CE')
        .replace(/\bhpw/i, 'web')
        .replace(/\bMacintosh\b/, 'Mac OS')
        .replace(/_PowerPC\b/i, ' OS')
        .replace(/\b(OS X) [^ \d]+/i, '$1')
        .replace(/\bMac (OS X)\b/, '$1')
        .replace(/\/(\d)/, ' $1')
        .replace(/_/g, '.')
        .replace(/(?: BePC|[ .]*fc[ \d.]+)$/i, '')
        .replace(/\bx86\.64\b/gi, 'x86_64')
        .replace(/\b(Windows Phone) OS\b/, '$1')
        .replace(/\b(Chrome OS \w+) [\d.]+\b/, '$1')
        .split(' on ')[0]
    );

    return os;
  }

  /**
   * An iteration utility for arrays and objects.
   *
   * @private
   * @param {Array|Object} object The object to iterate over.
   * @param {Function} callback The function called per iteration.
   */
  function each(object, callback) {
    var index = -1,
        length = object ? object.length : 0;

    if (typeof length == 'number' && length > -1 && length <= maxSafeInteger) {
      while (++index < length) {
        callback(object[index], index, object);
      }
    } else {
      forOwn(object, callback);
    }
  }

  /**
   * Trim and conditionally capitalize string values.
   *
   * @private
   * @param {string} string The string to format.
   * @returns {string} The formatted string.
   */
  function format(string) {
    string = trim(string);
    return /^(?:webOS|i(?:OS|P))/.test(string)
      ? string
      : capitalize(string);
  }

  /**
   * Iterates over an object's own properties, executing the `callback` for each.
   *
   * @private
   * @param {Object} object The object to iterate over.
   * @param {Function} callback The function executed per own property.
   */
  function forOwn(object, callback) {
    for (var key in object) {
      if (hasOwnProperty.call(object, key)) {
        callback(object[key], key, object);
      }
    }
  }

  /**
   * Gets the internal `[[Class]]` of a value.
   *
   * @private
   * @param {*} value The value.
   * @returns {string} The `[[Class]]`.
   */
  function getClassOf(value) {
    return value == null
      ? capitalize(value)
      : toString.call(value).slice(8, -1);
  }

  /**
   * Host objects can return type values that are different from their actual
   * data type. The objects we are concerned with usually return non-primitive
   * types of "object", "function", or "unknown".
   *
   * @private
   * @param {*} object The owner of the property.
   * @param {string} property The property to check.
   * @returns {boolean} Returns `true` if the property value is a non-primitive, else `false`.
   */
  function isHostType(object, property) {
    var type = object != null ? typeof object[property] : 'number';
    return !/^(?:boolean|number|string|undefined)$/.test(type) &&
      (type == 'object' ? !!object[property] : true);
  }

  /**
   * Prepares a string for use in a `RegExp` by making hyphens and spaces optional.
   *
   * @private
   * @param {string} string The string to qualify.
   * @returns {string} The qualified string.
   */
  function qualify(string) {
    return String(string).replace(/([ -])(?!$)/g, '$1?');
  }

  /**
   * A bare-bones `Array#reduce` like utility function.
   *
   * @private
   * @param {Array} array The array to iterate over.
   * @param {Function} callback The function called per iteration.
   * @returns {*} The accumulated result.
   */
  function reduce(array, callback) {
    var accumulator = null;
    each(array, function(value, index) {
      accumulator = callback(accumulator, value, index, array);
    });
    return accumulator;
  }

  /**
   * Removes leading and trailing whitespace from a string.
   *
   * @private
   * @param {string} string The string to trim.
   * @returns {string} The trimmed string.
   */
  function trim(string) {
    return String(string).replace(/^ +| +$/g, '');
  }

  /*--------------------------------------------------------------------------*/

  /**
   * Creates a new platform object.
   *
   * @memberOf platform
   * @param {Object|string} [ua=navigator.userAgent] The user agent string or
   *  context object.
   * @returns {Object} A platform object.
   */
  function parse(ua) {

    /** The environment context object. */
    var context = root;

    /** Used to flag when a custom context is provided. */
    var isCustomContext = ua && typeof ua == 'object' && getClassOf(ua) != 'String';

    // Juggle arguments.
    if (isCustomContext) {
      context = ua;
      ua = null;
    }

    /** Browser navigator object. */
    var nav = context.navigator || {};

    /** Browser user agent string. */
    var userAgent = nav.userAgent || '';

    ua || (ua = userAgent);

    /** Used to flag when `thisBinding` is the [ModuleScope]. */
    var isModuleScope = isCustomContext || thisBinding == oldRoot;

    /** Used to detect if browser is like Chrome. */
    var likeChrome = isCustomContext
      ? !!nav.likeChrome
      : /\bChrome\b/.test(ua) && !/internal|\n/i.test(toString.toString());

    /** Internal `[[Class]]` value shortcuts. */
    var objectClass = 'Object',
        airRuntimeClass = isCustomContext ? objectClass : 'ScriptBridgingProxyObject',
        enviroClass = isCustomContext ? objectClass : 'Environment',
        javaClass = (isCustomContext && context.java) ? 'JavaPackage' : getClassOf(context.java),
        phantomClass = isCustomContext ? objectClass : 'RuntimeObject';

    /** Detect Java environments. */
    var java = /\bJava/.test(javaClass) && context.java;

    /** Detect Rhino. */
    var rhino = java && getClassOf(context.environment) == enviroClass;

    /** A character to represent alpha. */
    var alpha = java ? 'a' : '\u03b1';

    /** A character to represent beta. */
    var beta = java ? 'b' : '\u03b2';

    /** Browser document object. */
    var doc = context.document || {};

    /**
     * Detect Opera browser (Presto-based).
     * http://www.howtocreate.co.uk/operaStuff/operaObject.html
     * http://dev.opera.com/articles/view/opera-mini-web-content-authoring-guidelines/#operamini
     */
    var opera = context.operamini || context.opera;

    /** Opera `[[Class]]`. */
    var operaClass = reOpera.test(operaClass = (isCustomContext && opera) ? opera['[[Class]]'] : getClassOf(opera))
      ? operaClass
      : (opera = null);

    /*------------------------------------------------------------------------*/

    /** Temporary variable used over the script's lifetime. */
    var data;

    /** The CPU architecture. */
    var arch = ua;

    /** Platform description array. */
    var description = [];

    /** Platform alpha/beta indicator. */
    var prerelease = null;

    /** A flag to indicate that environment features should be used to resolve the platform. */
    var useFeatures = ua == userAgent;

    /** The browser/environment version. */
    var version = useFeatures && opera && typeof opera.version == 'function' && opera.version();

    /** A flag to indicate if the OS ends with "/ Version" */
    var isSpecialCasedOS;

    /* Detectable layout engines (order is important). */
    var layout = getLayout([
      { 'label': 'EdgeHTML', 'pattern': 'Edge' },
      'Trident',
      { 'label': 'WebKit', 'pattern': 'AppleWebKit' },
      'iCab',
      'Presto',
      'NetFront',
      'Tasman',
      'KHTML',
      'Gecko'
    ]);

    /* Detectable browser names (order is important). */
    var name = getName([
      { 'label': 'Facebook App', 'pattern': 'FB_IAB/FB4A;FBAV' },
      { 'label': 'Facebook App', 'pattern': 'FBAN/FBIOS' },
      { 'label': 'Instagram App', 'pattern': 'Instagram' },
	  { 'label': 'Samsung Browser', 'pattern': 'SamsungBrowser' },
      'Adobe AIR',
      'Arora',
      'Avant Browser',
      'Breach',
      'Camino',
      'Electron',
      'Epiphany',
      'Fennec',
      'Flock',
      'Galeon',
      'GreenBrowser',
      'iCab',
      'Iceweasel',
      'K-Meleon',
      'Konqueror',
      'Lunascape',
      'Maxthon',
      { 'label': 'Microsoft Edge', 'pattern': '(?:Edge|Edg|EdgA|EdgiOS)' },
      'Midori',
      'Nook Browser',
      'PaleMoon',
      'PhantomJS',
      'Raven',
      'Rekonq',
      'RockMelt',
      'SeaMonkey',
      { 'label': 'Silk', 'pattern': '(?:Cloud9|Silk-Accelerated)' },
      'Sleipnir',
      'SlimBrowser',
      { 'label': 'SRWare Iron', 'pattern': 'Iron' },
      'Sunrise',
      'Swiftfox',
      'Vivaldi',
      'Waterfox',
      'WebPositive',
      { 'label': 'Yandex Browser', 'pattern': 'YaBrowser' },
      { 'label': 'UC Browser', 'pattern': 'UCBrowser' },
      'Opera Mini',
      { 'label': 'Opera Mini', 'pattern': 'OPiOS' },
      'Opera',
      { 'label': 'Opera', 'pattern': 'OPR' },
      'Chromium',
      'Chrome',
      { 'label': 'Chrome', 'pattern': '(?:HeadlessChrome)' },
      { 'label': 'Chrome Mobile', 'pattern': '(?:CriOS|CrMo)' },
      { 'label': 'Firefox', 'pattern': '(?:Firefox|Minefield)' },
      { 'label': 'Firefox for iOS', 'pattern': 'FxiOS' },
      { 'label': 'IE', 'pattern': 'IEMobile' },
      { 'label': 'IE', 'pattern': 'MSIE' },
      'Safari'
    ]);

    /* Detectable products (order is important). */
    var product = getProduct([
      { 'label': 'Android', 'pattern': 'Android 10; K' },
      { 'label': 'Asus ROG Phone 3', 'pattern': 'ASUS_I003D' },
      { 'label': 'Asus ROG Phone 5', 'pattern': 'ASUS_I005DA' },
      { 'label': 'Asus ROG Phone 5', 'pattern': 'ASUS_I005D' },
      { 'label': 'Asus ROG Phone 6', 'pattern': 'ASUS_AI2201_C' },
      { 'label': 'Asus ROG Phone 7', 'pattern': 'ASUS_AI2205_C' },
      { 'label': 'Asus ZenFone 10', 'pattern': 'ASUS_AI2302' },
      { 'label': 'Asus Zenfone 6', 'pattern': 'ASUS_I01WD' },
      { 'label': 'Asus Zenfone 7 Pro', 'pattern': 'ASUS_I002D' },
      { 'label': 'Asus Zenfone 8', 'pattern': 'ASUS_I006D' },
      { 'label': 'Asus ZenFone 8', 'pattern': 'ASUS_I004D' },
      { 'label': 'Asus Zenfone 8 Flip', 'pattern': 'ASUS_I004D' },
      { 'label': 'Asus ZenFone 8 Mini', 'pattern': 'ASUS_I006D' },
      { 'label': 'Asus Zenfone 9', 'pattern': 'ASUS_AI2202' },
      { 'label': 'Google Pixel 3', 'pattern': 'Pixel 3' },
      { 'label': 'Google Pixel 3 XL', 'pattern': 'Pixel 3 XL' },
      { 'label': 'Google Pixel 3a', 'pattern': 'Pixel 3a' },
      { 'label': 'Google Pixel 3a XL', 'pattern': 'Pixel 3a XL' },
      { 'label': 'Google Pixel 4', 'pattern': 'Pixel 4' },
      { 'label': 'Google Pixel 4 XL', 'pattern': 'Pixel 4 XL' },
      { 'label': 'Google Pixel 4a', 'pattern': 'Pixel 4a' },
      { 'label': 'Google Pixel 4a (5G)', 'pattern': 'Pixel 4a (5G)' },
      { 'label': 'Google Pixel 4a 5G', 'pattern': 'Pixel 4a (5G)' },
      { 'label': 'Google Pixel 5', 'pattern': 'Pixel 5' },
      { 'label': 'Google Pixel 5a', 'pattern': 'Pixel 5a' },
      { 'label': 'Google Pixel 6', 'pattern': 'Pixel 6' },
      { 'label': 'Google Pixel 6 Pro', 'pattern': 'Pixel 6 Pro' },
      { 'label': 'Google Pixel 6a', 'pattern': 'Pixel 6a' },
      { 'label': 'Google Pixel 7', 'pattern': 'Pixel 7' },
      { 'label': 'Google Pixel 7 Pro', 'pattern': 'Pixel 7 Pro' },
      { 'label': 'Google Pixel 7a', 'pattern': 'Pixel 7a' },
      { 'label': 'Google Pixel 8', 'pattern': 'Pixel 8' },
      { 'label': 'Google Pixel 8 Pro', 'pattern': 'Pixel 8 Pro' },
      { 'label': 'Honor 50 5G', 'pattern': 'NTH-NX9' },
      { 'label': 'Honor 50 Lite', 'pattern': 'NTN-LX1' },
      { 'label': 'Honor 70 5G', 'pattern': 'FNE-NX9' },
      { 'label': 'Honor 90', 'pattern': 'REA-NX9' },
      { 'label': 'Honor 90 Lite 5G', 'pattern': 'CRT-NX1' },
      { 'label': 'Honor Magic 4 Pro 5G', 'pattern': 'LGE-NX9' },
      { 'label': 'Honor Magic5 Pro', 'pattern': 'PGT-N19' },
      { 'label': 'Honor X5 Plus', 'pattern': 'WOD-LX1' },
      { 'label': 'Honor X6a', 'pattern': 'WDY-LX1' },
      { 'label': 'Honor X7', 'pattern': 'CMA-LX1' },
      { 'label': 'Honor X7', 'pattern': 'CMA-LX2' },
      { 'label': 'Honor X7', 'pattern': 'CMA-LX3' },
      { 'label': 'Honor X8', 'pattern': 'TFY-LX1' },
      { 'label': 'Honor X9 5G', 'pattern': 'ANY-NX1' },
      { 'label': 'Honor X9a', 'pattern': 'RMO-NX1' },
      { 'label': 'Huawei P20 lite', 'pattern': 'ANY-LX1' },
      { 'label': 'Infinix Note 12', 'pattern': 'Infinix X670' },
      { 'label': 'iQOO 11 Pro 5G', 'pattern': 'V2254A' },
      { 'label': 'iQOO Neo 6 5G', 'pattern': 'I2202' },
      { 'label': 'LG V60 ThinQ 5G', 'pattern': 'LM-V600' },
      { 'label': 'LG Velvet', 'pattern': 'LM-G900' },
      { 'label': 'LG Velvet 5G', 'pattern': 'LM-G900' },
      { 'label': 'Motorola Edge', 'pattern': 'motorola edge' },
      { 'label': 'Motorola Edge 20', 'pattern': 'motorola edge 20' },
      { 'label': 'Motorola Edge 20 Lite', 'pattern': 'motorola edge 20 lite' },
      { 'label': 'Motorola Edge 20 Pro', 'pattern': 'motorola edge 20 pro' },
      { 'label': 'Motorola Edge 30', 'pattern': 'motorola edge 30' },
      { 'label': 'Motorola Edge 30 Fusion', 'pattern': 'motorola edge 30 fusion' },
      { 'label': 'Motorola Edge 30 Neo', 'pattern': 'motorola edge 30 neo' },
      { 'label': 'Motorola Edge 30 Pro', 'pattern': 'motorola edge 30 pro' },
      { 'label': 'Motorola Edge 30 Ultra', 'pattern': 'motorola edge 30 ultra' },
      { 'label': 'Motorola Edge 40', 'pattern': 'motorola edge 40' },
      { 'label': 'Motorola Edge 40 Neo', 'pattern': 'motorola edge 40 neo' },
      { 'label': 'Motorola Edge 40 Pro', 'pattern': 'motorola edge 40 pro' },
      { 'label': 'Motorola Edge 5G UW', 'pattern': 'motorola edge 5G UW (2021)' },
      { 'label': 'Motorola G 8', 'pattern': 'moto g(8)' },
      { 'label': 'Motorola G 8 Power', 'pattern': 'moto g(8) power' },
      { 'label': 'Motorola G 9 Play', 'pattern': 'moto g(9) play' },
      { 'label': 'Motorola G Stylus', 'pattern': 'moto g stylus' },
      { 'label': 'Motorola Moto E13', 'pattern': 'moto e13' },
      { 'label': 'Motorola Moto G Power 2023', 'pattern': 'moto g power 5G - 2023' },
      { 'label': 'Motorola Moto G Pro', 'pattern': 'moto g pro' },
      { 'label': 'Motorola Moto G Stylus 2023 5G', 'pattern': 'moto g stylus 5G - 2023' },
      { 'label': 'Motorola Moto G100', 'pattern': 'moto g(100)' },
      { 'label': 'Motorola Moto G13', 'pattern': 'moto g13' },
      { 'label': 'Motorola Moto G14', 'pattern': 'moto g14' },
      { 'label': 'Motorola Moto G200 5G', 'pattern': 'moto g200 5G' },
      { 'label': 'Motorola Moto G22', 'pattern': 'moto g22' },
      { 'label': 'Motorola Moto G23', 'pattern': 'moto g23' },
      { 'label': 'Motorola Moto G30', 'pattern': 'moto g(30)' },
      { 'label': 'Motorola Moto G32', 'pattern': 'moto g32' },
      { 'label': 'Motorola Moto G42', 'pattern': 'moto g42' },
      { 'label': 'Motorola Moto G50', 'pattern': 'moto g(50)' },
      { 'label': 'Motorola Moto G50 5G', 'pattern': 'moto g(50) 5G' },
      { 'label': 'Motorola Moto G52', 'pattern': 'moto g52' },
      { 'label': 'Motorola Moto G53 5G', 'pattern': 'moto g53 5G' },
      { 'label': 'Motorola Moto G54 5G', 'pattern': 'moto g54 5G' },
      { 'label': 'Motorola Moto G60', 'pattern': 'moto g(60)' },
      { 'label': 'Motorola Moto G62 5G', 'pattern': 'moto g62 5G' },
      { 'label': 'Motorola Moto G71 5G', 'pattern': 'moto g71 5G' },
      { 'label': 'Motorola Moto G73', 'pattern': 'moto g73 5G' },
      { 'label': 'Motorola Moto G82 5G', 'pattern': 'moto g82 5G' },
      { 'label': 'Motorola Moto G84 5G', 'pattern': 'moto g84 5G' },
      { 'label': 'Motorola One 5G UW Ace', 'pattern': 'motorola one 5G UW ace' },
      { 'label': 'Motorola One Action', 'pattern': 'motorola one action' },
      { 'label': 'Motorola Razr 2022', 'pattern': 'motorola razr 2022' },
      { 'label': 'Motorola Razr 40', 'pattern': 'motorola razr 40' },
      { 'label': 'Motorola Razr 40 Ultra', 'pattern': 'motorola razr 40 ultra' },
      { 'label': 'Motorola ThinkPhone', 'pattern': 'ThinkPhone by motorola' },
      { 'label': 'Nokia 2.4', 'pattern': 'Nokia 2.4' },
      { 'label': 'Nokia 3.2', 'pattern': 'Nokia 3.2' },
      { 'label': 'Nokia 3.4', 'pattern': 'Nokia 3.4' },
      { 'label': 'Nokia 4.2', 'pattern': 'Nokia 4.2' },
      { 'label': 'Nokia 5.4', 'pattern': 'Nokia 5.4' },
      { 'label': 'Nokia 8.3', 'pattern': 'Nokia 8.3 5G' },
      { 'label': 'Nokia 8.3 5G', 'pattern': 'Nokia 8.3 5G' },
      { 'label': 'Nokia G10', 'pattern': 'Nokia G10' },
      { 'label': 'Nokia G11', 'pattern': 'Nokia G11' },
      { 'label': 'Nokia G20', 'pattern': 'Nokia G20' },
      { 'label': 'Nokia G21', 'pattern': 'Nokia G21' },
      { 'label': 'Nokia G42 5G', 'pattern': 'Nokia G42 5G' },
      { 'label': 'Nokia G50', 'pattern': 'Nokia G50' },
      { 'label': 'Nokia G60 5G', 'pattern': 'Nokia G60 5G' },
      { 'label': 'Nokia X10', 'pattern': 'Nokia X10' },
      { 'label': 'Nokia X10 5G', 'pattern': 'Nokia X10' },
      { 'label': 'Nokia X20', 'pattern': 'Nokia X20' },
      { 'label': 'Nokia X30 5G', 'pattern': 'Nokia X30 5G' },
      { 'label': 'Nokia XR20', 'pattern': 'Nokia XR20' },
      { 'label': 'Nubia Red Magic 8 Pro', 'pattern': 'NX729J' },
      { 'label': 'OnePlus 10 Pro', 'pattern': 'NE2213' },
      { 'label': 'OnePlus 10 Pro', 'pattern': 'NE2215' },
      { 'label': 'OnePlus 10 Pro 5G', 'pattern': 'NE2213' },
      { 'label': 'OnePlus 10 Pro 5G', 'pattern': 'NE2215' },
      { 'label': 'OnePlus 10T', 'pattern': 'CPH2415' },
      { 'label': 'OnePlus 10T 5G', 'pattern': 'CPH2415' },
      { 'label': 'OnePlus 11', 'pattern': 'CPH2449' },
      { 'label': 'OnePlus 7', 'pattern': 'GM1903' },
      { 'label': 'OnePlus 7', 'pattern': 'GM1900' },
      { 'label': 'OnePlus 7 Pro', 'pattern': 'GM1917' },
      { 'label': 'OnePlus 7 Pro', 'pattern': 'GM1913' },
      { 'label': 'OnePlus 7 Pro', 'pattern': 'GM1910' },
      { 'label': 'OnePlus 7T', 'pattern': 'HD1903' },
      { 'label': 'OnePlus 7T', 'pattern': 'HD1900' },
      { 'label': 'OnePlus 7T Pro', 'pattern': 'HD1913' },
      { 'label': 'OnePlus 7T Pro', 'pattern': 'HD1910' },
      { 'label': 'OnePlus 8', 'pattern': 'IN2013' },
      { 'label': 'OnePlus 8', 'pattern': 'IN2011' },
      { 'label': 'OnePlus 8', 'pattern': 'IN2010' },
      { 'label': 'OnePlus 8 5G', 'pattern': 'IN2015' },
      { 'label': 'OnePlus 8 Pro', 'pattern': 'IN2023' },
      { 'label': 'OnePlus 8 Pro', 'pattern': 'IN2025' },
      { 'label': 'OnePlus 8 Pro', 'pattern': 'IN2020' },
      { 'label': 'OnePlus 8T', 'pattern': 'KB2005' },
      { 'label': 'OnePlus 8T', 'pattern': 'KB2003' },
      { 'label': 'OnePlus 8T', 'pattern': 'KB2007' },
      { 'label': 'OnePlus 8T', 'pattern': 'KB2001' },
      { 'label': 'OnePlus 8T', 'pattern': 'KB2000' },
      { 'label': 'OnePlus 9', 'pattern': 'LE2115' },
      { 'label': 'OnePlus 9', 'pattern': 'LE2113' },
      { 'label': 'OnePlus 9', 'pattern': 'LE2111' },
      { 'label': 'OnePlus 9 Pro', 'pattern': 'LE2125' },
      { 'label': 'OnePlus 9 Pro', 'pattern': 'LE2123' },
      { 'label': 'OnePlus 9 Pro', 'pattern': 'LE2121' },
      { 'label': 'OnePlus 9R', 'pattern': 'LE2101' },
      { 'label': 'OnePlus Nord', 'pattern': 'AC2003' },
      { 'label': 'OnePlus Nord', 'pattern': 'AC2001' },
      { 'label': 'OnePlus Nord 2 5G', 'pattern': 'DN2103' },
      { 'label': 'OnePlus Nord 2 5G', 'pattern': 'DN2101' },
      { 'label': 'OnePlus Nord 2T', 'pattern': 'CPH2399' },
      { 'label': 'OnePlus Nord 2T 5G', 'pattern': 'CPH2399' },
      { 'label': 'OnePlus Nord 3 5G', 'pattern': 'CPH2493' },
      { 'label': 'OnePlus Nord CE 2 5G', 'pattern': 'IV2201' },
      { 'label': 'OnePlus Nord CE 2 Lite 5G', 'pattern': 'CPH2409' },
      { 'label': 'OnePlus Nord CE 3 Lite', 'pattern': 'CPH2465' },
      { 'label': 'OnePlus Nord CE 5G', 'pattern': 'EB2103' },
      { 'label': 'OnePlus Nord N300', 'pattern': 'CPH2389' },
      { 'label': 'Oppo A1 Pro', 'pattern': 'PHQ110' },
      { 'label': 'Oppo A16', 'pattern': 'CPH2269' },
      { 'label': 'Oppo A16s', 'pattern': 'CPH2271' },
      { 'label': 'Oppo A38', 'pattern': 'CPH2579' },
      { 'label': 'Oppo A52', 'pattern': 'CPH2069' },
      { 'label': 'Oppo A53', 'pattern': 'CPH2127' },
      { 'label': 'Oppo A53s', 'pattern': 'CPH2135' },
      { 'label': 'Oppo A54 5G', 'pattern': 'CPH2195' },
      { 'label': 'Oppo A54s', 'pattern': 'CPH2273' },
      { 'label': 'Oppo A57', 'pattern': 'CPH2387' },
      { 'label': 'Oppo A58', 'pattern': 'CPH2577' },
      { 'label': 'Oppo A72', 'pattern': 'CPH2067' },
      { 'label': 'Oppo A73 5G', 'pattern': 'CPH2161' },
      { 'label': 'Oppo A74', 'pattern': 'CPH2219' },
      { 'label': 'Oppo A74 5G', 'pattern': 'CPH2197' },
      { 'label': 'Oppo A76', 'pattern': 'CPH2375' },
      { 'label': 'Oppo A77', 'pattern': 'CPH2339' },
      { 'label': 'Oppo A77 5G', 'pattern': 'CPH2339' },
      { 'label': 'Oppo A77s', 'pattern': 'CPH2473' },
      { 'label': 'Oppo A78', 'pattern': 'CPH2565' },
      { 'label': 'Oppo A78 5G', 'pattern': 'CPH2483' },
      { 'label': 'Oppo A9', 'pattern': 'CPH1941' },
      { 'label': 'Oppo A91', 'pattern': 'CPH2021' },
      { 'label': 'Oppo A94', 'pattern': 'CPH2203' },
      { 'label': 'Oppo A94', 'pattern': 'CPH2205' },
      { 'label': 'Oppo A94 5G', 'pattern': 'CPH2211' },
      { 'label': 'Oppo A95', 'pattern': 'CPH2365' },
      { 'label': 'Oppo A96', 'pattern': 'CPH2333' },
      { 'label': 'Oppo A98 5G', 'pattern': 'CPH2529' },
      { 'label': 'Oppo F11 Pro', 'pattern': 'CPH2385' },
      { 'label': 'Oppo F17', 'pattern': 'CPH2095' },
      { 'label': 'Oppo F17 Pro', 'pattern': 'CPH2119' },
      { 'label': 'Oppo F19', 'pattern': 'CPH2219' },
      { 'label': 'Oppo F19 Pro', 'pattern': 'CPH2285' },
      { 'label': 'Oppo F21 Pro', 'pattern': 'CPH2461' },
      { 'label': 'Oppo F21 Pro', 'pattern': 'CPH2363' },
      { 'label': 'Oppo Find N 5G', 'pattern': 'PEUM00' },
      { 'label': 'Oppo Find N2 Flip', 'pattern': 'CPH2437' },
      { 'label': 'Oppo Find X2 Lite', 'pattern': 'CPH2005' },
      { 'label': 'Oppo Find X2 Neo', 'pattern': 'CPH2009' },
      { 'label': 'Oppo Find X2 Pro', 'pattern': 'CPH2025' },
      { 'label': 'Oppo Find X3 Lite', 'pattern': 'CPH2145' },
      { 'label': 'Oppo Find X3 Neo', 'pattern': 'CPH2207' },
      { 'label': 'Oppo Find X3 Neo 5G', 'pattern': 'CPH2207' },
      { 'label': 'Oppo Find X3 Pro', 'pattern': 'CPH2173' },
      { 'label': 'Oppo Find X5', 'pattern': 'CPH2307' },
      { 'label': 'Oppo Find X5 Pro', 'pattern': 'CPH2305' },
      { 'label': 'Oppo K10', 'pattern': 'CPH2373' },
      { 'label': 'Oppo K10 5G', 'pattern': 'CPH2337' },
      { 'label': 'Oppo Reno', 'pattern': 'CPH1917' },
      { 'label': 'Oppo Reno 10', 'pattern': 'CPH2531' },
      { 'label': 'Oppo Reno 10 Pro', 'pattern': 'CPH2525' },
      { 'label': 'Oppo Reno 2', 'pattern': 'CPH1907' },
      { 'label': 'Oppo Reno 2 Z', 'pattern': 'CPH1951' },
      { 'label': 'Oppo Reno 3', 'pattern': 'CPH2043' },
      { 'label': 'Oppo Reno 4', 'pattern': 'CPH2113' },
      { 'label': 'Oppo Reno 4 5G', 'pattern': 'CPH2091' },
      { 'label': 'Oppo Reno 4 Lite', 'pattern': 'CPH2125' },
      { 'label': 'Oppo Reno 4 Pro', 'pattern': 'CPH2109' },
      { 'label': 'Oppo Reno 4 Pro 5G', 'pattern': 'CPH2089' },
      { 'label': 'Oppo Reno 4 Z 5G', 'pattern': 'CPH2065' },
      { 'label': 'Oppo Reno 5', 'pattern': 'CPH2159' },
      { 'label': 'Oppo Reno 5 4G', 'pattern': 'CPH2159' },
      { 'label': 'Oppo Reno 5 5G', 'pattern': 'CPH2145' },
      { 'label': 'Oppo Reno 5 Lite', 'pattern': 'CPH2205' },
      { 'label': 'Oppo Reno 5 Z 5G', 'pattern': 'CPH2211' },
      { 'label': 'Oppo Reno 6 5G', 'pattern': 'CPH2251' },
      { 'label': 'Oppo Reno 6 Pro 5G', 'pattern': 'CPH2247' },
      { 'label': 'Oppo Reno 6 Z', 'pattern': 'CPH2237' },
      { 'label': 'Oppo Reno 7', 'pattern': 'CPH2363' },
      { 'label': 'Oppo Reno 7 5G', 'pattern': 'CPH2371' },
      { 'label': 'Oppo Reno 7 Pro 5G', 'pattern': 'CPH2293' },
      { 'label': 'Oppo Reno 7 Z 5G', 'pattern': 'CPH2343' },
      { 'label': 'Oppo Reno 8', 'pattern': 'CPH2359' },
      { 'label': 'Oppo Reno 8 5G', 'pattern': 'CPH2359' },
      { 'label': 'Oppo Reno 8 Pro', 'pattern': 'CPH2357' },
      { 'label': 'Oppo Reno 8 Pro 5G', 'pattern': 'CPH2357' },
      { 'label': 'Oppo Reno 8 T', 'pattern': 'CPH2481' },
      { 'label': 'Oppo Reno2', 'pattern': 'CPH1907' },
      { 'label': 'Oppo Reno2 Z', 'pattern': 'CPH1951' },
      { 'label': 'Oppo Reno3', 'pattern': 'CPH2043' },
      { 'label': 'Oppo Reno4 5G', 'pattern': 'CPH2091' },
      { 'label': 'Oppo Reno4 Lite', 'pattern': 'CPH2125' },
      { 'label': 'Oppo Reno4 Pro', 'pattern': 'CPH2109' },
      { 'label': 'Oppo Reno4 Pro 5G', 'pattern': 'CPH2089' },
      { 'label': 'Oppo Reno4 Z 5G', 'pattern': 'CPH2065' },
      { 'label': 'Oppo Reno5 4G', 'pattern': 'CPH2159' },
      { 'label': 'Oppo Reno5 Lite', 'pattern': 'CPH2205' },
      { 'label': 'Oppo Reno7 5G', 'pattern': 'CPH2371' },
      { 'label': 'Poco F3', 'pattern': 'M2012K11AG' },
      { 'label': 'Poco F4', 'pattern': '22021211RG' },
      { 'label': 'Poco F4 GT', 'pattern': '21121210G' },
      { 'label': 'Poco F5', 'pattern': '23049PCD8G' },
      { 'label': 'Poco F5 Pro', 'pattern': '23013PC75G' },
      { 'label': 'Poco M3 Pro 5G', 'pattern': 'M2103K19PG' },
      { 'label': 'Poco M4 5G', 'pattern': '22041219PG' },
      { 'label': 'Poco M4 Pro', 'pattern': '2201117PG' },
      { 'label': 'Poco M4 Pro 5G', 'pattern': '21091116AG' },
      { 'label': 'Poco M5', 'pattern': '22071219CG' },
      { 'label': 'Poco M5s', 'pattern': '2207117BPG' },
      { 'label': 'Poco X3 GT', 'pattern': '21061110AG' },
      { 'label': 'Poco X3 GT 5G', 'pattern': '21061110AG' },
      { 'label': 'Poco X3 Pro', 'pattern': 'M2102J20SG' },
      { 'label': 'Poco X4 GT', 'pattern': '22041216G' },
      { 'label': 'Poco X4 Pro 5G', 'pattern': '2201116PG' },
      { 'label': 'Poco X5', 'pattern': '22111317PG' },
      { 'label': 'Poco X5 Pro', 'pattern': '22101320G' },
      { 'label': 'Poco X5 Pro 5G', 'pattern': '22101320I' },
      { 'label': 'Realme 10', 'pattern': 'RMX3630' },
      { 'label': 'Realme 10 Pro+', 'pattern': 'RMX3686' },
      { 'label': 'Realme 11 Pro', 'pattern': 'RMX3771' },
      { 'label': 'Realme 11 Pro+ 5G', 'pattern': 'RMX3741' },
      { 'label': 'Realme 6', 'pattern': 'RMX2001' },
      { 'label': 'Realme 6 Pro', 'pattern': 'RMX2063' },
      { 'label': 'Realme 7 5G', 'pattern': 'RMX2111' },
      { 'label': 'Realme 7 Pro', 'pattern': 'RMX2170' },
      { 'label': 'Realme 8', 'pattern': 'RMX3241' },
      { 'label': 'Realme 8', 'pattern': 'RMX3085' },
      { 'label': 'Realme 8 5G', 'pattern': 'RMX3241' },
      { 'label': 'Realme 8 Pro', 'pattern': 'RMX3081' },
      { 'label': 'Realme 8i', 'pattern': 'RMX3151' },
      { 'label': 'Realme 9', 'pattern': 'RMX3521' },
      { 'label': 'Realme 9 Pro', 'pattern': 'RMX3472' },
      { 'label': 'Realme 9 Pro+', 'pattern': 'RMX3393' },
      { 'label': 'Realme 9 Pro+', 'pattern': 'RMX3392' },
      { 'label': 'Realme 9i', 'pattern': 'RMX3491' },
      { 'label': 'Realme C21', 'pattern': 'RMX3201' },
      { 'label': 'Realme C25', 'pattern': 'RMX3191' },
      { 'label': 'Realme C25s', 'pattern': 'RMX3195' },
      { 'label': 'Realme C31', 'pattern': 'RMX3503' },
      { 'label': 'Realme C33', 'pattern': 'RMX3624' },
      { 'label': 'Realme C35', 'pattern': 'RMX3511' },
      { 'label': 'Realme C51', 'pattern': 'RMX3830' },
      { 'label': 'Realme C53', 'pattern': 'RMX3760' },
      { 'label': 'Realme C55', 'pattern': 'RMX3710' },
      { 'label': 'Realme GT 5G', 'pattern': 'RMX2202' },
      { 'label': 'Realme GT Master', 'pattern': 'RMX3363' },
      { 'label': 'Realme GT Master', 'pattern': 'RMX3360' },
      { 'label': 'Realme GT Neo', 'pattern': 'RMX3031' },
      { 'label': 'Realme GT Neo 2', 'pattern': 'RMX3370' },
      { 'label': 'Realme GT Neo 3', 'pattern': 'RMX3561' },
      { 'label': 'Realme GT Neo 3 150W', 'pattern': 'RMX3563' },
      { 'label': 'Realme GT Neo 3 5G', 'pattern': 'RMX3561' },
      { 'label': 'Realme GT Neo 3T', 'pattern': 'RMX3371' },
      { 'label': 'Realme GT Neo2', 'pattern': 'RMX3370' },
      { 'label': 'Realme GT Neo3 5G', 'pattern': 'RMX3563' },
      { 'label': 'Realme GT2', 'pattern': 'RMX3311' },
      { 'label': 'Realme GT2 Pro', 'pattern': 'RMX3301' },
      { 'label': 'Realme Narzo 30 5G', 'pattern': 'RMX3242' },
      { 'label': 'Realme Narzo 30 5G', 'pattern': 'RMX3474' },
      { 'label': 'Realme Narzo 50', 'pattern': 'RMX3286' },
      { 'label': 'Realme Narzo 50 5G', 'pattern': 'RMX3572' },
      { 'label': 'Realme Narzo 50A Prime', 'pattern': 'RMX3516' },
      { 'label': 'Realme X2 Pro', 'pattern': 'RMX1931' },
      { 'label': 'Realme X50 Pro 5G', 'pattern': 'RMX2075' },
      { 'label': 'Realme X7 Pro', 'pattern': 'RMX2121' },
      { 'label': 'Samsung Galaxy A02s', 'pattern': 'SM-A025F' },
      { 'label': 'Samsung Galaxy A03', 'pattern': 'SM-A035F' },
      { 'label': 'Samsung Galaxy A03s', 'pattern': 'SM-A037F' },
      { 'label': 'Samsung Galaxy A03s', 'pattern': 'SM-A037G' },
      { 'label': 'Samsung Galaxy A04', 'pattern': 'SM-A045F' },
      { 'label': 'Samsung Galaxy A04e', 'pattern': 'SM-A042M' },
      { 'label': 'Samsung Galaxy A04s', 'pattern': 'SM-A047F' },
      { 'label': 'Samsung Galaxy A12', 'pattern': 'SM-A127F' },
      { 'label': 'Samsung Galaxy A12', 'pattern': 'SM-A125F' },
      { 'label': 'Samsung Galaxy A12 Nacho', 'pattern': 'SM-A127F' },
      { 'label': 'Samsung Galaxy A13', 'pattern': 'SM-A135F' },
      { 'label': 'Samsung Galaxy A13', 'pattern': 'SM-A137F' },
      { 'label': 'Samsung Galaxy A13 5G', 'pattern': 'SM-A136B' },
      { 'label': 'Samsung Galaxy A13 5G', 'pattern': 'SM-A136U' },
      { 'label': 'Samsung Galaxy A137', 'pattern': 'SM-A137F' },
      { 'label': 'Samsung Galaxy A14', 'pattern': 'SM-A145F' },
      { 'label': 'Samsung Galaxy A14', 'pattern': 'SM-A145M' },
      { 'label': 'Samsung Galaxy A14 5G', 'pattern': 'SM-A146M' },
      { 'label': 'Samsung Galaxy A14 5G', 'pattern': 'SM-A146U' },
      { 'label': 'Samsung Galaxy A21s', 'pattern': 'SM-A217F' },
      { 'label': 'Samsung Galaxy A22', 'pattern': 'SM-A225F' },
      { 'label': 'Samsung Galaxy A22 5G', 'pattern': 'SM-A226B' },
      { 'label': 'Samsung Galaxy A23', 'pattern': 'SM-A235F' },
      { 'label': 'Samsung Galaxy A23', 'pattern': 'SM-A235M' },
      { 'label': 'Samsung Galaxy A23 5G', 'pattern': 'SM-A236B' },
      { 'label': 'Samsung Galaxy A24', 'pattern': 'SM-A245F' },
      { 'label': 'Samsung Galaxy A24', 'pattern': 'SM-A245M' },
      { 'label': 'Samsung Galaxy A31', 'pattern': 'SM-A315F' },
      { 'label': 'Samsung Galaxy A32', 'pattern': 'SM-A325F' },
      { 'label': 'Samsung Galaxy A32 5G', 'pattern': 'SM-A326B' },
      { 'label': 'Samsung Galaxy A33 5G', 'pattern': 'SM-A336B' },
      { 'label': 'Samsung Galaxy A34', 'pattern': 'SM-A346B' },
      { 'label': 'Samsung Galaxy A40', 'pattern': 'SM-A405FN' },
      { 'label': 'Samsung Galaxy A41', 'pattern': 'SM-A415F' },
      { 'label': 'Samsung Galaxy A42 5G', 'pattern': 'SM-A426B' },
      { 'label': 'Samsung Galaxy A51', 'pattern': 'SM-A515F' },
      { 'label': 'Samsung Galaxy A51 5G', 'pattern': 'SM-A516B' },
      { 'label': 'Samsung Galaxy A52', 'pattern': 'SM-A525F' },
      { 'label': 'Samsung Galaxy A52 5G', 'pattern': 'SM-A526B' },
      { 'label': 'Samsung Galaxy A52s 5G', 'pattern': 'SM-A528B' },
      { 'label': 'Samsung Galaxy A53', 'pattern': 'SM-A536E' },
      { 'label': 'Samsung Galaxy A53 5G', 'pattern': 'SM-A536B' },
      { 'label': 'Samsung Galaxy A54 5G', 'pattern': 'SM-A546B' },
      { 'label': 'Samsung Galaxy A70', 'pattern': 'SM-A705FN' },
      { 'label': 'Samsung Galaxy A71', 'pattern': 'SM-A715F' },
      { 'label': 'Samsung Galaxy A71 5G', 'pattern': 'SM-A716U' },
      { 'label': 'Samsung Galaxy A72', 'pattern': 'SM-A725F' },
      { 'label': 'Samsung Galaxy A73 5G', 'pattern': 'SM-A736B' },
      { 'label': 'Samsung Galaxy A90 5G', 'pattern': 'SM-A908B' },
      { 'label': 'Samsung Galaxy F13', 'pattern': 'SM-E135F' },
      { 'label': 'Samsung Galaxy F22', 'pattern': 'SM-E225F' },
      { 'label': 'Samsung Galaxy F23', 'pattern': 'SM-E236B' },
      { 'label': 'Samsung Galaxy F62', 'pattern': 'SM-E625F' },
      { 'label': 'Samsung Galaxy M11', 'pattern': 'SM-M115F' },
      { 'label': 'Samsung Galaxy M12', 'pattern': 'SM-M127F' },
      { 'label': 'Samsung Galaxy M13', 'pattern': 'SM-M135F' },
      { 'label': 'Samsung Galaxy M13', 'pattern': 'SM-M135M' },
      { 'label': 'Samsung Galaxy M14', 'pattern': 'SM-M146B' },
      { 'label': 'Samsung Galaxy M21', 'pattern': 'SM-M215F' },
      { 'label': 'Samsung Galaxy M21s', 'pattern': 'SM-F415F' },
      { 'label': 'Samsung Galaxy M22', 'pattern': 'SM-M225FV' },
      { 'label': 'Samsung Galaxy M23', 'pattern': 'SM-M236B' },
      { 'label': 'Samsung Galaxy M23 5G', 'pattern': 'SM-M236B' },
      { 'label': 'Samsung Galaxy M31', 'pattern': 'SM-M315F' },
      { 'label': 'Samsung Galaxy M31s', 'pattern': 'SM-M317F' },
      { 'label': 'Samsung Galaxy M32', 'pattern': 'SM-M325F' },
      { 'label': 'Samsung Galaxy M32', 'pattern': 'SM-M325FV' },
      { 'label': 'Samsung Galaxy M33', 'pattern': 'SM-M336B' },
      { 'label': 'Samsung Galaxy M33 5G', 'pattern': 'SM-M336B' },
      { 'label': 'Samsung Galaxy M51', 'pattern': 'SM-M515F' },
      { 'label': 'Samsung Galaxy M52 5G', 'pattern': 'SM-M526B' },
      { 'label': 'Samsung Galaxy M53', 'pattern': 'SM-M536B' },
      { 'label': 'Samsung Galaxy M53 5G', 'pattern': 'SM-M536B' },
      { 'label': 'Samsung Galaxy M54 5G', 'pattern': 'SM-M546B' },
      { 'label': 'Samsung Galaxy M62', 'pattern': 'SM-M625F' },
      { 'label': 'Samsung Galaxy Note 10', 'pattern': 'SM-N970F' },
      { 'label': 'Samsung Galaxy Note 10 5G', 'pattern': 'SM-N971U' },
      { 'label': 'Samsung Galaxy Note 10 Lite', 'pattern': 'SM-N770F' },
      { 'label': 'Samsung Galaxy Note 10+', 'pattern': 'SM-N975F' },
      { 'label': 'Samsung Galaxy Note 10+ 5G', 'pattern': 'SM-N976B' },
      { 'label': 'Samsung Galaxy Note 20', 'pattern': 'SM-N980F' },
      { 'label': 'Samsung Galaxy Note 20 5G', 'pattern': 'SM-N981B' },
      { 'label': 'Samsung Galaxy Note 20 Ultra', 'pattern': 'SM-N985F' },
      { 'label': 'Samsung Galaxy Note 20 Ultra 5G', 'pattern': 'SM-N986B' },
      { 'label': 'Samsung Galaxy Note 20+ 5G', 'pattern': 'SM-N986B' },
      { 'label': 'Samsung Galaxy S10', 'pattern': 'SM-G973F' },
      { 'label': 'Samsung Galaxy S10 5G', 'pattern': 'SM-G977B' },
      { 'label': 'Samsung Galaxy S10 Lite', 'pattern': 'SM-G770F' },
      { 'label': 'Samsung Galaxy S10+', 'pattern': 'SM-G975F' },
      { 'label': 'Samsung Galaxy S10e', 'pattern': 'SM-G970F' },
      { 'label': 'Samsung Galaxy S20', 'pattern': 'SM-G980F' },
      { 'label': 'Samsung Galaxy S20 5G', 'pattern': 'SM-G981B' },
      { 'label': 'Samsung Galaxy S20 FE', 'pattern': 'SM-G780F' },
      { 'label': 'Samsung Galaxy S20 FE 5G', 'pattern': 'SM-G781B' },
      { 'label': 'Samsung Galaxy S20 Ultra', 'pattern': 'SM-G988B' },
      { 'label': 'Samsung Galaxy S20 Ultra 5G', 'pattern': 'SM-G988B' },
      { 'label': 'Samsung Galaxy S20+', 'pattern': 'SM-G985F' },
      { 'label': 'Samsung Galaxy S20+ 5G', 'pattern': 'SM-G986B' },
      { 'label': 'Samsung Galaxy S21 5G', 'pattern': 'SM-G991B' },
      { 'label': 'Samsung Galaxy S21 FE', 'pattern': 'SM-G990B2' },
      { 'label': 'Samsung Galaxy S21 FE 5G', 'pattern': 'SM-G990B' },
      { 'label': 'Samsung Galaxy S21 FE 5G', 'pattern': 'SM-G990E' },
      { 'label': 'Samsung Galaxy S21 Ultra 5G', 'pattern': 'SM-G998B' },
      { 'label': 'Samsung Galaxy S21+ 5G', 'pattern': 'SM-G996B' },
      { 'label': 'Samsung Galaxy S22', 'pattern': 'SM-S908B' },
      { 'label': 'Samsung Galaxy S22', 'pattern': 'SM-S906B' },
      { 'label': 'Samsung Galaxy S22 5G', 'pattern': 'SM-S901B' },
      { 'label': 'Samsung Galaxy S22 Ultra 5G', 'pattern': 'SM-S908B' },
      { 'label': 'Samsung Galaxy S22+ 5G', 'pattern': 'SM-S906B' },
      { 'label': 'Samsung Galaxy S23', 'pattern': 'SM-S911B' },
      { 'label': 'Samsung Galaxy S23 Ultra', 'pattern': 'SM-S918B' },
      { 'label': 'Samsung Galaxy S23+', 'pattern': 'SM-S916B' },
      { 'label': 'Samsung Galaxy Tab A 10.1 LTE', 'pattern': 'SM-T515' },
      { 'label': 'Samsung Galaxy Tab A 10.1 WIFI', 'pattern': 'SM-T510' },
      { 'label': 'Samsung Galaxy Tab A 8.0 & S Pen LTE', 'pattern': 'SM-P205' },
      { 'label': 'Samsung Galaxy Tab A 8.0 & S Pen WIFI', 'pattern': 'SM-P200' },
      { 'label': 'Samsung Galaxy Tab A 8.0 LTE', 'pattern': 'SM-T295' },
      { 'label': 'Samsung Galaxy Tab A 8.0 WIFI', 'pattern': 'SM-T290' },
      { 'label': 'Samsung Galaxy Tab A 8.4', 'pattern': 'SM-T307U' },
      { 'label': 'Samsung Galaxy Tab A7 10.4 LTE', 'pattern': 'SM-T505' },
      { 'label': 'Samsung Galaxy Tab A7 10.4 WIFI', 'pattern': 'SM-T500' },
      { 'label': 'Samsung Galaxy Tab A7 Lite', 'pattern': 'SM-T220' },
      { 'label': 'Samsung Galaxy Tab A7 Lite LTE', 'pattern': 'SM-T225' },
      { 'label': 'Samsung Galaxy Tab A7 Lite WIFI', 'pattern': 'SM-T220' },
      { 'label': 'Samsung Galaxy Tab A8 10.5 (2021) LTE', 'pattern': 'SM-X205' },
      { 'label': 'Samsung Galaxy Tab A8 10.5 (2021) WIFI', 'pattern': 'SM-X200' },
      { 'label': 'Samsung Galaxy Tab Active 3', 'pattern': 'SM-T575' },
      { 'label': 'Samsung Galaxy Tab S5e LTE', 'pattern': 'SM-T725' },
      { 'label': 'Samsung Galaxy Tab S5e WIFI', 'pattern': 'SM-T720' },
      { 'label': 'Samsung Galaxy Tab S6 Lite (2022) LTE', 'pattern': 'SM-P619' },
      { 'label': 'Samsung Galaxy Tab S6 Lite (2022) WIFI', 'pattern': 'SM-P613' },
      { 'label': 'Samsung Galaxy Tab S6 Lite LTE', 'pattern': 'SM-P615' },
      { 'label': 'Samsung Galaxy Tab S6 Lite WIFI', 'pattern': 'SM-P610' },
      { 'label': 'Samsung Galaxy Tab S6 LTE', 'pattern': 'SM-T865' },
      { 'label': 'Samsung Galaxy Tab S6 WIFI', 'pattern': 'SM-T860' },
      { 'label': 'Samsung Galaxy Tab S7', 'pattern': 'SM-T875' },
      { 'label': 'Samsung Galaxy Tab S7', 'pattern': 'SM-T870' },
      { 'label': 'Samsung Galaxy Tab S7 5G', 'pattern': 'SM-T876B' },
      { 'label': 'Samsung Galaxy Tab S7 FE 5G', 'pattern': 'SM-T736B' },
      { 'label': 'Samsung Galaxy Tab S7 FE WIFI', 'pattern': 'SM-T733' },
      { 'label': 'Samsung Galaxy Tab S7 LTE', 'pattern': 'SM-T875' },
      { 'label': 'Samsung Galaxy Tab S7 WIFI', 'pattern': 'SM-T870' },
      { 'label': 'Samsung Galaxy Tab S7+ 5G', 'pattern': 'SM-T976B' },
      { 'label': 'Samsung Galaxy Tab S7+ WIFI', 'pattern': 'SM-T970' },
      { 'label': 'Samsung Galaxy Tab S8 5G', 'pattern': 'SM-X706B' },
      { 'label': 'Samsung Galaxy Tab S8 Ultra 5G', 'pattern': 'SM-X906' },
      { 'label': 'Samsung Galaxy Tab S8 Ultra WIFI', 'pattern': 'SM-X900' },
      { 'label': 'Samsung Galaxy Tab S8 WIFI', 'pattern': 'SM-X700' },
      { 'label': 'Samsung Galaxy Tab S8+ 5G', 'pattern': 'SM-X806B' },
      { 'label': 'Samsung Galaxy Tab S8+ WIFI', 'pattern': 'SM-X800' },
      { 'label': 'Samsung Galaxy Tab S9', 'pattern': 'SM-X710' },
      { 'label': 'Samsung Galaxy Tab S9+ (5G)', 'pattern': 'SM-X816B' },
      { 'label': 'Samsung Galaxy Xcover6 Pro', 'pattern': 'SM-G736B' },
      { 'label': 'Samsung Galaxy Z Flip3 5G', 'pattern': 'SM-F711B' },
      { 'label': 'Samsung Galaxy Z Flip4 5G', 'pattern': 'SM-F721B' },
      { 'label': 'Samsung Galaxy Z Flip5 5G', 'pattern': 'SM-F731B' },
      { 'label': 'Sony Xperia 1', 'pattern': 'J9110' },
      { 'label': 'Sony Xperia 1 II', 'pattern': 'XQ-AT52' },
      { 'label': 'Sony Xperia 1 II', 'pattern': 'XQ-AT51' },
      { 'label': 'Sony Xperia 1 III', 'pattern': 'XQ-BC52' },
      { 'label': 'Sony Xperia 1 III', 'pattern': 'XQ-BC72' },
      { 'label': 'Sony Xperia 1 IV', 'pattern': 'XQ-CT54' },
      { 'label': 'Sony Xperia 10 II', 'pattern': 'XQ-AU52' },
      { 'label': 'Sony Xperia 10 II', 'pattern': 'XQ-AU51' },
      { 'label': 'Sony Xperia 10 III', 'pattern': 'XQ-BT52' },
      { 'label': 'Sony Xperia 10 III 5G', 'pattern': 'XQ-BT52' },
      { 'label': 'Sony Xperia 10 IV', 'pattern': 'XQ-CC54' },
      { 'label': 'Sony Xperia 10 V', 'pattern': 'XQ-DC54' },
      { 'label': 'Sony Xperia 5', 'pattern': 'J9210' },
      { 'label': 'Sony Xperia 5 II', 'pattern': 'XQ-AS72' },
      { 'label': 'Sony Xperia 5 II', 'pattern': 'XQ-AS52' },
      { 'label': 'Sony Xperia 5 III', 'pattern': 'XQ-BQ72' },
      { 'label': 'Sony Xperia 5 III', 'pattern': 'XQ-BQ52' },
      { 'label': 'Sony Xperia 5 III 5G', 'pattern': 'XQ-BQ52' },
      { 'label': 'Sony Xperia 5 IV', 'pattern': 'XQ-CQ54' },
      { 'label': 'Sony Xperia Pro I', 'pattern': 'XQ-BE52' },
      { 'label': 'Tecno Camon 20', 'pattern': 'TECNO CK6' },
      { 'label': 'Tecno Spark 10 Pro', 'pattern': 'TECNO KI7' },
      { 'label': 'Vivo S1', 'pattern': 'vivo 1907' },
      { 'label': 'Vivo S1 Pro', 'pattern': 'vivo 1920' },
      { 'label': 'Vivo V17 Pro', 'pattern': 'vivo 1909' },
      { 'label': 'Vivo V20', 'pattern': 'V2025' },
      { 'label': 'Vivo V20 Pro', 'pattern': 'vivo 2018' },
      { 'label': 'Vivo V20 SE', 'pattern': 'V2023' },
      { 'label': 'Vivo V21', 'pattern': 'V2066' },
      { 'label': 'Vivo V21 5G', 'pattern': 'V2050' },
      { 'label': 'Vivo V21e', 'pattern': 'V2061' },
      { 'label': 'Vivo V23 5G', 'pattern': 'V2130' },
      { 'label': 'Vivo X50 5G', 'pattern': 'vivo 2005' },
      { 'label': 'Vivo X50 Pro', 'pattern': 'vivo 2006' },
      { 'label': 'Vivo X60 Pro', 'pattern': 'V2046' },
      { 'label': 'Vivo X70 Pro', 'pattern': 'V2105' },
      { 'label': 'Vivo X70 Pro+', 'pattern': 'V2145A' },
      { 'label': 'Vivo X80 Lite', 'pattern': 'V2208' },
      { 'label': 'Vivo X80 Pro', 'pattern': 'V2145' },
      { 'label': 'Vivo Y15s', 'pattern': 'V2120' },
      { 'label': 'Vivo Y19', 'pattern': 'vivo 1915' },
      { 'label': 'Vivo Y20G', 'pattern': 'V2037' },
      { 'label': 'Vivo Y21', 'pattern': 'V2111' },
      { 'label': 'Vivo Y21s', 'pattern': 'V2110' },
      { 'label': 'Vivo Y31', 'pattern': 'V2036' },
      { 'label': 'Vivo Y33s', 'pattern': 'V2109' },
      { 'label': 'Vivo Y35', 'pattern': 'V2205' },
      { 'label': 'Vivo Y36', 'pattern': 'V2247' },
      { 'label': 'Vivo Y52 5G', 'pattern': 'V2053' },
      { 'label': 'Vivo Y53s', 'pattern': 'V2058' },
      { 'label': 'Vivo Y55 5G', 'pattern': 'V2127' },
      { 'label': 'Vivo Y72', 'pattern': 'V2041' },
      { 'label': 'Vivo Y72 5G', 'pattern': 'V2041' },
      { 'label': 'Vivo Y76 5G', 'pattern': 'V2124' },
      { 'label': 'Xiaomi 11 Lite 5G NE', 'pattern': '2109119DG' },
      { 'label': 'Xiaomi 11T', 'pattern': '21081111RG' },
      { 'label': 'Xiaomi 11T Pro', 'pattern': '2107113SG' },
      { 'label': 'Xiaomi 12', 'pattern': '2201123G' },
      { 'label': 'Xiaomi 12 Lite', 'pattern': '2203129G' },
      { 'label': 'Xiaomi 12 Lite 5G', 'pattern': '2210129SG' },
      { 'label': 'Xiaomi 12 Pro', 'pattern': '2201122G' },
      { 'label': 'Xiaomi 12T', 'pattern': '22071212AG' },
      { 'label': 'Xiaomi 12T Pro', 'pattern': '22081212UG' },
      { 'label': 'Xiaomi 12X', 'pattern': '2112123AG' },
      { 'label': 'Xiaomi 13', 'pattern': '2211133G' },
      { 'label': 'Xiaomi 13 Pro', 'pattern': '2210132G' },
      { 'label': 'Xiaomi 13 Ultra', 'pattern': '2304FPN6DG' },
      { 'label': 'Xiaomi 13T', 'pattern': '2306EPN60G' },
      { 'label': 'Xiaomi 13T Pro', 'pattern': '23078PND5G' },
      { 'label': 'Xiaomi Mi 10', 'pattern': 'Mi 10' },
      { 'label': 'Xiaomi Mi 10 Lite 5G', 'pattern': 'M2002J9G' },
      { 'label': 'Xiaomi Mi 10 Pro', 'pattern': 'Mi 10 Pro' },
      { 'label': 'Xiaomi Mi 10T 5G', 'pattern': 'M2007J3SY' },
      { 'label': 'Xiaomi Mi 10T Lite 5G', 'pattern': 'M2007J17G' },
      { 'label': 'Xiaomi Mi 10T Pro 5G', 'pattern': 'M2007J3SG' },
      { 'label': 'Xiaomi Mi 11', 'pattern': 'M2011K2G' },
      { 'label': 'Xiaomi Mi 11 5G', 'pattern': 'M2011K2G' },
      { 'label': 'Xiaomi Mi 11 Lite', 'pattern': 'M2101K9AG' },
      { 'label': 'Xiaomi Mi 11 Lite 5G', 'pattern': 'M2101K9G' },
      { 'label': 'Xiaomi Mi 11 Lite NE 5G', 'pattern': '2109119DG' },
      { 'label': 'Xiaomi Mi 11 Ultra', 'pattern': 'M2102K1G' },
      { 'label': 'Xiaomi Mi 11 Ultra 5G', 'pattern': 'M2102K1G' },
      { 'label': 'Xiaomi Mi 11i', 'pattern': 'M2012K11G' },
      { 'label': 'Xiaomi Mi 11i 5G', 'pattern': 'M2012K11G' },
      { 'label': 'Xiaomi Mi 11T 5G', 'pattern': '21081111RG' },
      { 'label': 'Xiaomi Mi 11T Pro', 'pattern': '2107113SG' },
      { 'label': 'Xiaomi Mi 9', 'pattern': 'MI 9' },
      { 'label': 'Xiaomi Mi 9 Lite', 'pattern': 'Mi 9 Lite' },
      { 'label': 'Xiaomi Mi 9T', 'pattern': 'Mi 9T' },
      { 'label': 'Xiaomi Mi K20 Pro', 'pattern': 'Redmi K20 Pro' },
      { 'label': 'Xiaomi Mi Note 10', 'pattern': 'Mi Note 10' },
      { 'label': 'Xiaomi Mi Note 10 Lite', 'pattern': 'Mi Note 10 Lite' },
      { 'label': 'Xiaomi Mi Note 10 Pro', 'pattern': 'Mi Note 10 Pro' },
      { 'label': 'Xiaomi Mi Pad 5', 'pattern': '21051182G' },
      { 'label': 'Xiaomi Pad 6', 'pattern': '23043RP34G' },
      { 'label': 'Xiaomi Poco F2 Pro', 'pattern': 'POCO F2 Pro' },
      { 'label': 'Xiaomi Poco F3', 'pattern': 'M2012K11AG' },
      { 'label': 'Xiaomi Poco M3 Pro 5G', 'pattern': 'M2103K19PG' },
      { 'label': 'Xiaomi Poco M4 Pro 5G', 'pattern': '21091116AG' },
      { 'label': 'Xiaomi Poco X3 NFC', 'pattern': 'M2007J20CG' },
      { 'label': 'Xiaomi Redmi 10 2022', 'pattern': '22011119UY' },
      { 'label': 'Xiaomi Redmi 13C', 'pattern': '23100RN82L' },
      { 'label': 'Xiaomi Redmi 9', 'pattern': 'M2004J19C' },
      { 'label': 'Xiaomi Redmi K20 Pro', 'pattern': 'Redmi K20 Pro' },
      { 'label': 'Xiaomi Redmi Note 10', 'pattern': 'M2101K7AG' },
      { 'label': 'Xiaomi Redmi Note 10 5G', 'pattern': 'M2103K19G' },
      { 'label': 'Xiaomi Redmi Note 10 Pro', 'pattern': 'M2101K6G' },
      { 'label': 'Xiaomi Redmi Note 10S', 'pattern': 'M2101K7BG' },
      { 'label': 'Xiaomi Redmi Note 10S', 'pattern': 'M2101K7BI' },
      { 'label': 'Xiaomi Redmi Note 11', 'pattern': '2201117TG' },
      { 'label': 'Xiaomi Redmi Note 11', 'pattern': '2201117TY' },
      { 'label': 'Xiaomi Redmi Note 11 Pro', 'pattern': '2201116SG' },
      { 'label': 'Xiaomi Redmi Note 11 Pro', 'pattern': '2201116TG' },
      { 'label': 'Xiaomi Redmi Note 11 Pro 5G', 'pattern': '2201116SR' },
      { 'label': 'Xiaomi Redmi Note 11 Pro+', 'pattern': '21091116UG' },
      { 'label': 'Xiaomi Redmi Note 11 Pro+ 5G', 'pattern': '21091116UG' },
      { 'label': 'Xiaomi Redmi Note 11S', 'pattern': '2201117SG' },
      { 'label': 'Xiaomi Redmi Note 11S', 'pattern': '2201117SY' },
      { 'label': 'Xiaomi Redmi Note 11S 5G', 'pattern': '22031116BG' },
      { 'label': 'Xiaomi Redmi Note 12', 'pattern': '22111317G' },
      { 'label': 'Xiaomi Redmi Note 12', 'pattern': '23021RAAEG' },
      { 'label': 'Xiaomi Redmi Note 12 Pro', 'pattern': '2209116AG' },
      { 'label': 'Xiaomi Redmi Note 12 Pro', 'pattern': '22101316G' },
      { 'label': 'Xiaomi Redmi Note 8', 'pattern': 'M1908C3JGG' },
      { 'label': 'Xiaomi Redmi Note 8 Pro', 'pattern': 'Redmi Note 8 Pro' },
      { 'label': 'Xiaomi Redmi Note 9', 'pattern': 'M2003J15SC' },
      { 'label': 'Xiaomi Redmi Note 9 Pro', 'pattern': 'Redmi Note 9 Pro' },
      { 'label': 'Xiaomi Redmi Note 9S', 'pattern': 'Redmi Note 9S' },
      { 'label': 'Xiaomi Redmi Note 9T', 'pattern': 'M2007J22G' },
      { 'label': 'Xiaomi Redmi Pad', 'pattern': '22081283G' },
      { 'label': 'iPad Pro 12.9 inch 6th Gen', 'pattern': 'iPad14,6' },
      { 'label': 'iPad Pro 12.9 inch 6th Gen', 'pattern': 'iPad14,5' },
      { 'label': 'iPad Pro 11 inch 4th Gen', 'pattern': 'iPad14,4' },
      { 'label': 'iPad Pro 11 inch 4th Gen', 'pattern': 'iPad14,3' },
      { 'label': 'iPad mini 6', 'pattern': 'iPad14,2' },
      { 'label': 'iPad mini 6', 'pattern': 'iPad14,1' },
      { 'label': 'iPad 10th Gen', 'pattern': 'iPad13,19' },
      { 'label': 'iPad 10th Gen', 'pattern': 'iPad13,18' },
      { 'label': 'iPad Air 5th Gen', 'pattern': 'iPad13,17' },
      { 'label': 'iPad Air 5th Gen', 'pattern': 'iPad13,16' },
      { 'label': 'iPad Pro 12.9 inch 5th Gen', 'pattern': 'iPad13,10' },
      { 'label': 'iPad Pro 12.9 inch 5th Gen', 'pattern': 'iPad13,8' },
      { 'label': 'iPad Pro 11 inch 5th Gen', 'pattern': 'iPad13,6' },
      { 'label': 'iPad Pro 11 inch 5th Gen', 'pattern': 'iPad13,4' },
      { 'label': 'iPad Air 4th Gen', 'pattern': 'iPad13,2' },
      { 'label': 'iPad Air 4th Gen', 'pattern': 'iPad13,1' },
      { 'label': 'iPad 9th Gen', 'pattern': 'iPad12,2' },
      { 'label': 'iPad 9th Gen', 'pattern': 'iPad12,1' },
      { 'label': 'iPad 8th Gen', 'pattern': 'iPad11,7' },
      { 'label': 'iPad 8th Gen', 'pattern': 'iPad11,6' },
      { 'label': 'iPad Air 3rd Gen', 'pattern': 'iPad11,4' },
      { 'label': 'iPad Air 3rd Gen', 'pattern': 'iPad11,3' },
      { 'label': 'iPad Mini 5th Gen', 'pattern': 'iPad11,2' },
      { 'label': 'iPad Mini 5th Gen', 'pattern': 'iPad11,1' },
      { 'label': 'iPad Pro 12.9 inch 4th Gen', 'pattern': 'iPad8,12' },
      { 'label': 'iPad Pro 12.9 inch 4th Gen', 'pattern': 'iPad8,11' },
      { 'label': 'iPad Pro 11 inch 4th Gen', 'pattern': 'iPad8,10' },
      { 'label': 'iPad Pro 11 inch 4th Gen', 'pattern': 'iPad8,9' },
      { 'label': 'iPad Pro 12.9 inch 3rd Gen', 'pattern': 'iPad8,7' },
      { 'label': 'iPad Pro 12.9 inch 3rd Gen', 'pattern': 'iPad8,5' },
      { 'label': 'iPad Pro 11 inch 3rd Gen', 'pattern': 'iPad8,3' },
      { 'label': 'iPad Pro 11 inch 3rd Gen', 'pattern': 'iPad8,2' },
      { 'label': 'iPad Pro 11 inch 3rd Gen', 'pattern': 'iPad8,1' },
      { 'label': 'iPad 10.2 inch 7th Gen', 'pattern': 'iPad7,12' },
      { 'label': 'iPad 10.2 inch 7th Gen', 'pattern': 'iPad7,11' },
      { 'label': 'iPad 6th Gen', 'pattern': 'iPad7,6' },
      { 'label': 'iPad 6th Gen', 'pattern': 'iPad7,5' },
      { 'label': 'iPad Pro 10.5 inch 2nd Gen', 'pattern': 'iPad7,4' },
      { 'label': 'iPad Pro 10.5 inch 2nd Gen', 'pattern': 'iPad7,3' },
      { 'label': 'iPad Pro 2nd Gen', 'pattern': 'iPad7,2' },
      { 'label': 'iPad Pro 2nd Gen', 'pattern': 'iPad7,1' },
      { 'label': 'iPhone 15 Pro Max', 'pattern': 'iPhone16,2' },
      { 'label': 'iPhone 15 Pro', 'pattern': 'iPhone16,1' },
      { 'label': 'iPhone 15 Plus', 'pattern': 'iPhone15,5' },
      { 'label': 'iPhone 15', 'pattern': 'iPhone15,4' },
      { 'label': 'iPhone 14 Pro Max', 'pattern': 'iPhone15,3' },
      { 'label': 'iPhone 14 Pro', 'pattern': 'iPhone15,2' },
      { 'label': 'iPhone 14 Plus', 'pattern': 'iPhone14,8' },
      { 'label': 'iPhone 14', 'pattern': 'iPhone14,7' },
      { 'label': 'iPhone SE 3rd Gen', 'pattern': 'iPhone14,6' },
      { 'label': 'iPhone 13', 'pattern': 'iPhone14,5' },
      { 'label': 'iPhone 13 Mini', 'pattern': 'iPhone14,4' },
      { 'label': 'iPhone 13 Pro Max', 'pattern': 'iPhone14,3' },
      { 'label': 'iPhone 13 Pro', 'pattern': 'iPhone14,2' },
      { 'label': 'iPhone 12 Pro Max', 'pattern': 'iPhone13,4' },
      { 'label': 'iPhone 12 Pro', 'pattern': 'iPhone13,3' },
      { 'label': 'iPhone 12', 'pattern': 'iPhone13,2' },
      { 'label': 'iPhone 12 Mini', 'pattern': 'iPhone13,1' },
      { 'label': 'iPhone SE 2nd Gen', 'pattern': 'iPhone12,8' },
      { 'label': 'iPhone 11 Pro Max', 'pattern': 'iPhone12,5' },
      { 'label': 'iPhone 11 Pro', 'pattern': 'iPhone12,3' },
      { 'label': 'iPhone 11', 'pattern': 'iPhone12,1' },
      { 'label': 'iPhone XR', 'pattern': 'iPhone11,8' },
      { 'label': 'iPhone XS Max', 'pattern': 'iPhone11,6' },
      { 'label': 'iPhone XS', 'pattern': 'iPhone11,2' },
      { 'label': 'Samsung Galaxy S24 Ultra', 'pattern': 'SM-S928U' },
      { 'label': 'Samsung Galaxy S24 Ultra', 'pattern': 'SM-S928B' },
      { 'label': 'Samsung Galaxy S24+', 'pattern': 'SM-S926U' },
      { 'label': 'Samsung Galaxy S24+', 'pattern': 'SM-S926B' },
      { 'label': 'Samsung Galaxy S24', 'pattern': 'SM-S921U' },
      { 'label': 'Samsung Galaxy S24', 'pattern': 'SM-S921B' },
      { 'label': 'Samsung Galaxy S23 Ultra', 'pattern': 'SM-S918U' },
      { 'label': 'Samsung Galaxy S23+', 'pattern': 'SM-S916U' },
      { 'label': 'Samsung Galaxy S23', 'pattern': 'SM-S911U' },
      { 'label': 'Samsung Galaxy S22 Ultra', 'pattern': 'SM-S908U' },
      { 'label': 'Samsung Galaxy S22 Ultra', 'pattern': 'SM-S908B' },
      { 'label': 'Samsung Galaxy S22+', 'pattern': 'SM-S906U' },
      { 'label': 'Samsung Galaxy S22+', 'pattern': 'SM-S906B' },
      { 'label': 'Samsung Galaxy S22', 'pattern': 'SM-S901U' },
      { 'label': 'Samsung Galaxy S22', 'pattern': 'SM-S901B' },
      { 'label': 'Samsung Galaxy S23 FE', 'pattern': 'SM-S711U' },
      { 'label': 'Samsung Galaxy S23 FE', 'pattern': 'SM-S711B' },
      { 'label': 'Samsung Galaxy A53 5G', 'pattern': 'SM-S536DL' },
      { 'label': 'Samsung Galaxy M54', 'pattern': 'SM-M546B' },
      { 'label': 'Samsung Galaxy M34', 'pattern': 'SM-M346B' },
      { 'label': 'Samsung M13 5G', 'pattern': 'SM-M135F' },
      { 'label': 'Samsung Galaxy S21 Ultra 5G', 'pattern': 'SM-G998U' },
      { 'label': 'Samsung Galaxy S21+ 5G', 'pattern': 'SM-G996U' },
      { 'label': 'Samsung Galaxy S21 5G', 'pattern': 'SM-G991U' },
      { 'label': 'Samsung Galaxy S21 FE 5G', 'pattern': 'SM-G990U' },
      { 'label': 'Samsung Galaxy Fold5', 'pattern': 'SM-F946U' },
      { 'label': 'Samsung Galaxy Fold5', 'pattern': 'SM-F946B' },
      { 'label': 'Samsung Galaxy Z Fold4', 'pattern': 'SM-F936U' },
      { 'label': 'Samsung Galaxy Z Fold4', 'pattern': 'SM-F936B' },
      { 'label': 'Samsung Galaxy Z Fold3 5G', 'pattern': 'SM-F926U' },
      { 'label': 'Samsung Galaxy Z Fold3 5G', 'pattern': 'SM-F926B' },
      { 'label': 'Samsung Galaxy Z Flip 5', 'pattern': 'SM-F731U' },
      { 'label': 'Samsung Galaxy Z Flip 5', 'pattern': 'SM-F731B' },
      { 'label': 'Samsung Galaxy Z Flip4', 'pattern': 'SM-F721U' },
      { 'label': 'Samsung Galaxy Z Flip4', 'pattern': 'SM-F721B' },
      { 'label': 'Samsung Galaxy Z Flip3 5G', 'pattern': 'SM-F711U' },
      { 'label': 'Samsung Galaxy A54', 'pattern': 'SM-A546U' },
      { 'label': 'Samsung Galaxy A54', 'pattern': 'SM-A546B' },
      { 'label': 'Samsung Galaxy A53 5G', 'pattern': 'SM-A536U' },
      { 'label': 'Samsung Galaxy A52 5G', 'pattern': 'SM-A526U' },
      { 'label': 'Samsung Galaxy A33', 'pattern': 'SM-A336B' },
      { 'label': 'Samsung Galaxy A25', 'pattern': 'SM-A256B' },
      { 'label': 'Samsung Galaxy A24 4G', 'pattern': 'SM-A245F' },
      { 'label': 'Samsung Galaxy A15 5G', 'pattern': 'SM-A156U' },
      { 'label': 'Samsung Galaxy A15 5G', 'pattern': 'SM-A156B' },
      { 'label': 'Samsung Galaxy A15', 'pattern': 'SM-A155F' },
      { 'label': 'Samsung Galaxy A14', 'pattern': 'SM-A145R' },
      { 'label': 'Samsung Galaxy A13', 'pattern': 'SM-A135U' },
      { 'label': 'Samsung Galaxy A05', 'pattern': 'SM-A055F' },
      { 'label': 'Samsung Galaxy A03s', 'pattern': 'SM-S134DL' },
      { 'label': 'Samsung Galaxy Note20 Ultra 5G', 'pattern': 'SM-N986U' },
      { 'label': 'Samsung Galaxy Note20 Ultra 5G', 'pattern': 'SM-N986B' },
      { 'label': 'Samsung Galaxy Note20 5G', 'pattern': 'SM-N981U' },
      { 'label': 'Samsung Galaxy Note20 5G', 'pattern': 'SM-N981B' },
      { 'label': 'Samsung Galaxy Note20', 'pattern': 'SM-N980F' },
      { 'label': 'Samsung Galaxy S20 Ultra 5G', 'pattern': 'SM-G988U' },
      { 'label': 'Samsung Galaxy S20+ 5G', 'pattern': 'SM-G986U' },
      { 'label': 'Samsung Galaxy S20 5G', 'pattern': 'SM-G981U' },
      { 'label': 'Samsung Galaxy S20 FE 5G', 'pattern': 'SM-G781U' },
      { 'label': 'Samsung Galaxy S20 FE 5G', 'pattern': 'SM-G7810' },
      { 'label': 'Samsung Galaxy Xcover 5', 'pattern': 'SM-G525F' },
      { 'label': 'Samsung Galaxy Z Flip 5G', 'pattern': 'SM-F707B' },
      { 'label': 'Samsung Galaxy Z Flip', 'pattern': 'SM-F700F' },
      { 'label': 'Samsung Galaxy A52 4G', 'pattern': 'SM-A525F' },
      { 'label': 'Samsung Galaxy A42 5G', 'pattern': 'SM-A426U' },
      { 'label': 'Samsung Galaxy A32 5G', 'pattern': 'SM-A326U' },
      { 'label': 'Samsung Galaxy A24 4G', 'pattern': 'SM-A245M' },
      { 'label': 'Samsung Galaxy A22 4G', 'pattern': 'SM-A225F' },
      { 'label': 'Samsung Galaxy A05s', 'pattern': 'SM-A057G' },
      { 'label': 'Samsung Galaxy A05', 'pattern': 'SM-A055M' },
      { 'label': 'Samsung Galaxy A03s', 'pattern': 'SM-A037U' },
      { 'label': 'Samsung Galaxy A03', 'pattern': 'SM-A035G' },
      { 'label': 'Honor Magic 6 Pro', 'pattern': 'BVL-N49' },
      { 'label': 'OnePlus 11 5G', 'pattern': 'CPH2449' },
      { 'label': 'OnePlus 9 5G', 'pattern': 'LE2113' },
      { 'label': 'OnePlus 9 Pro 5G', 'pattern': 'LE2123' },
      { 'label': 'OnePlus Open', 'pattern': 'CPH2551' },
      { 'label': 'OPPO A57 4G', 'pattern': 'CPH2387' },
      { 'label': 'OPPO A77', 'pattern': 'CPH2385' },
      { 'label': 'OPPO A78', 'pattern': 'CPH2483' },
      { 'label': 'OPPO Reno10', 'pattern': 'CPH2531' },
      { 'label': 'OPPO Reno8', 'pattern': 'CPH2359' },
      { 'label': 'OPPO Reno8 Pro 5G', 'pattern': 'CPH2357' },
      { 'label': 'OPPO Reno8 T', 'pattern': 'CPH2481' },
      { 'label': 'Realme 11 Pro+', 'pattern': 'RMX3741' },
      { 'label': 'Realme GT Neo3', 'pattern': 'RMX3561' },
      { 'label': 'Vivo V25', 'pattern': 'V2202' },
      { 'label': 'Xiaomi 14', 'pattern': '23127PN0CG' },
      { 'label': 'Xiaomi Poco F5', 'pattern': '23049PCD8G' },
      { 'label': 'Xiaomi Poco F5 Pro', 'pattern': '23013PC75G' },
      { 'label': 'Xiaomi Poco X5', 'pattern': '22111317PI' },
      { 'label': 'Xiaomi Poco X6 Pro', 'pattern': '2311DRK48G' },
      { 'label': 'Xiaomi Redmi 12', 'pattern': '23053RN02L' },
      { 'label': 'Xiaomi Redmi 12C', 'pattern': '22120RN86G' },
      { 'label': 'Xiaomi Redmi Note 12 4G', 'pattern': '23021RAAEG' },
      { 'label': 'Xiaomi Redmi Note 12 5G', 'pattern': '22111317G' },
      { 'label': 'Xiaomi Redmi Note 12S', 'pattern': '2303ERA42L' },
      { 'label': 'Asus I005DA  ROG Phone 5', 'pattern': 'ASUS_I005DA' },
      { 'label': 'Asus I006D  Zenfone 8', 'pattern': 'ASUS_I006D' },
      { 'label': 'Honor 50', 'pattern': 'NTH-NX9' },
      { 'label': 'Honor 70', 'pattern': 'FNE-NX9' },
      { 'label': 'Honor 90 Lite', 'pattern': 'CRT-NX1' },
      { 'label': 'Honor Magic V2', 'pattern': 'VER-N49' },
      { 'label': 'Honor Magic4 Lite', 'pattern': 'ANY-LX1' },
      { 'label': 'Honor Magic5 Lite', 'pattern': 'RMO-NX3' },
      { 'label': 'Honor X7b', 'pattern': 'CLK-LX1' },
      { 'label': 'Honor X8b', 'pattern': 'LLY-LX1' },
      { 'label': 'Honor X9', 'pattern': 'ANY-LX2' },
      { 'label': 'Honor X9b', 'pattern': 'ALI-NX1' },
      { 'label': 'Infinix X6739  GT 10 Pro', 'pattern': 'Infinix X6739' },
      { 'label': 'Motorola Edge Plus ', 'pattern': 'motorola edge plus (2022)' },
      { 'label': 'Motorola Edge Plus 5G UW ', 'pattern': 'motorola edge plus 5G UW (2022)' },
      { 'label': 'Motorola Moto G 5G ', 'pattern': 'moto g 5G (2022)' },
      { 'label': 'Motorola Moto G 5G - 2023', 'pattern': 'moto g 5G - 2023' },
      { 'label': 'Motorola Moto G Power 5G - 2023', 'pattern': 'moto g power 5G - 2023' },
      { 'label': 'Motorola Moto G stylus ', 'pattern': 'moto g stylus (2023)' },
      { 'label': 'Motorola Moto G Stylus 5G ', 'pattern': 'moto g stylus 5G (2022)' },
      { 'label': 'Motorola Moto G stylus 5G - 2023', 'pattern': 'moto g stylus 5G - 2023' },
      { 'label': 'Motorola Moto G72', 'pattern': 'moto g72' },
      { 'label': 'Motorola Moto G73 5G', 'pattern': 'moto g73 5G' },
      { 'label': 'Nokia C22', 'pattern': 'Nokia C22' },
      { 'label': 'Nokia C32', 'pattern': 'Nokia C32' },
      { 'label': 'Nokia G310 5G', 'pattern': 'Nokia G310 5G' },
      { 'label': 'OnePlus 9 5G', 'pattern': 'LE2117' },
      { 'label': 'OnePlus Nord N30', 'pattern': 'CPH2515' },
      { 'label': 'OnePlus Nord N300 5G', 'pattern': 'CPH2389' },
      { 'label': 'OPPO A58 4G', 'pattern': 'CPH2577' },
      { 'label': 'OPPO A78 4G', 'pattern': 'CPH2565' },
      { 'label': 'OPPO A79', 'pattern': 'CPH2557' },
      { 'label': 'OPPO Reno5 5G', 'pattern': 'CPH2145' },
      { 'label': 'OPPO Reno5 Pro 5G', 'pattern': 'CPH2207' },
      { 'label': 'OPPO Reno5 Z', 'pattern': 'CPH2211' },
      { 'label': 'OPPO Reno6 5G', 'pattern': 'CPH2251' },
      { 'label': 'OPPO Reno6 Pro 5G', 'pattern': 'CPH2247' },
      { 'label': 'Realme 11 5G', 'pattern': 'RMX3780' },
      { 'label': 'Realme 9 5G', 'pattern': 'RMX3474' },
      { 'label': 'Realme GT Master Edition', 'pattern': 'RMX3363' },
      { 'label': 'Realme GT Neo3 150W', 'pattern': 'RMX3563' },
      { 'label': 'Vivo Y36 5G', 'pattern': 'V2248' },
      { 'label': 'Xiaomi 13 Lite 5G', 'pattern': '2210129SG' },
      { 'label': 'Xiaomi Poco C65', 'pattern': '2310FPCA4G' },
      { 'label': 'Xiaomi Poco F4', 'pattern': '22021211RG' },
      { 'label': 'Xiaomi Poco M4 5G', 'pattern': '22041219PG' },
      { 'label': 'Xiaomi Poco M4 Pro', 'pattern': '2201117PG' },
      { 'label': 'Xiaomi Poco M5s', 'pattern': '2207117BPG' },
      { 'label': 'Xiaomi Poco M6 Pro', 'pattern': '2312FPCA6G' },
      { 'label': 'Xiaomi Poco X3 Pro', 'pattern': 'M2102J20SG' },
      { 'label': 'Xiaomi Poco X4 Pro 5G', 'pattern': '2201116PG' },
      { 'label': 'Xiaomi Poco X5 Pro', 'pattern': '22101320G' },
      { 'label': 'Xiaomi Poco X6', 'pattern': '23122PCD1G' },
      { 'label': 'Xiaomi Redmi 10', 'pattern': '21121119SG' },
      { 'label': 'Xiaomi Redmi 10 5G', 'pattern': '22041219NY' },
      { 'label': 'Xiaomi Redmi 10C', 'pattern': '220333QAG' },
      { 'label': 'Xiaomi Redmi A2', 'pattern': '23026RN54G' },
      { 'label': 'Xiaomi Redmi A2', 'pattern': '23028RN4DG' },
      { 'label': 'Xiaomi Redmi A2+', 'pattern': '23028RNCAG' },
      { 'label': 'Xiaomi Redmi Note 11 4G', 'pattern': '2201117TL' },
      { 'label': 'Xiaomi Redmi Note 11 Pro', 'pattern': '2201116TI' },
      { 'label': 'Xiaomi Redmi Note 11 Pro 5G', 'pattern': '2201116SG' },
      { 'label': 'Xiaomi Redmi Note 12 Pro 4G', 'pattern': '2209116AG' },
      { 'label': 'Xiaomi Redmi Note 13 4G', 'pattern': '23124RA7EO' },
      { 'label': 'Xiaomi Redmi Note 13 Pro', 'pattern': '2312DRA50G' },
      { 'label': 'Xiaomi Redmi Note 13 Pro 4G', 'pattern': '23117RA68G' },
      { 'label': 'Xiaomi Redmi Note 13 Pro+', 'pattern': '23090RA98G' },
      { 'label': 'Xiaomi Redmi Note 8 2021', 'pattern': 'M1908C3JGG' },
      { 'label': 'ZTE Nubia Neo', 'pattern': 'ZTE 8150N' },
      { 'label': 'ZTE Nubia Z50S PRO', 'pattern': 'NX713J' },
      { 'label': 'Honor X8A', 'pattern': 'CRT-LX1' },
      { 'label': 'Honor 70 Lite', 'pattern': 'RBN-NX1' },
      { 'label': 'Honor X6', 'pattern': 'VNE-LX1' },
      { 'label': 'Honor X7a', 'pattern': 'RKY-LX1' },
      { 'label': 'Honor X8 5G', 'pattern': 'VNE-N41' },
      { 'label': 'Infinix Hot 30i', 'pattern': 'Infinix X669C' },
      { 'label': 'Infinix Smart 7', 'pattern': 'Infinix X6515' },
      { 'label': 'Motorola 30', 'pattern': 'moto g(30)' },
      { 'label': 'Motorola 60', 'pattern': 'moto g(60)' },
      { 'label': 'Motorola 100', 'pattern': 'moto g(100)' },
      { 'label': 'Motorola 50 5G', 'pattern': 'moto g(50) 5G' },
      { 'label': 'Motorola 60s', 'pattern': 'moto g(60)s' },
      { 'label': 'Motorola Moto E22', 'pattern': 'moto e22' },
      { 'label': 'Motorola Moto E22i', 'pattern': 'moto e22i' },
      { 'label': 'Motorola Moto E32s', 'pattern': 'moto e32(s)' },
      { 'label': 'Motorola Moto G play ', 'pattern': 'moto g play - 2023' },
      { 'label': 'Motorola Moto G Power ', 'pattern': 'moto g power (2022)' },
      { 'label': 'Motorola Moto G pure', 'pattern': 'moto g pure' },
      { 'label': 'Motorola Moto G Stylus ', 'pattern': 'moto g stylus (2022)' },
      { 'label': 'Motorola Moto G31', 'pattern': 'moto g31' },
      { 'label': 'Motorola Moto G31 W', 'pattern': 'moto g31(w)' },
      { 'label': 'Motorola Moto G41', 'pattern': 'moto g41' },
      { 'label': 'Motorola Moto G51 5G', 'pattern': 'moto g51 5G' },
      { 'label': 'Nokia C110', 'pattern': 'N156DL' },
      { 'label': 'Nokia G22', 'pattern': 'Nokia G22' },
      { 'label': 'Nokia G400 5G', 'pattern': 'Nokia G400 5G' },
      { 'label': 'OnePlus Nord N20 5G', 'pattern': 'GN2200' },
      { 'label': 'OPPO A17', 'pattern': 'CPH2477' },
      { 'label': 'Vivo Y01', 'pattern': 'V2118' },
      { 'label': 'Vivo Y16', 'pattern': 'V2204' },
      { 'label': 'Xiaomi Poco X4 GT', 'pattern': '22041216G' },
      { 'label': 'Xiaomi Redmi 10', 'pattern': '21061119DG' },
      { 'label': 'Xiaomi Redmi 10C', 'pattern': '220333QNY' },
      { 'label': 'Xiaomi Redmi A1', 'pattern': '220733SG' },
      { 'label': 'Xiaomi Redmi Note 12', 'pattern': '22101317C' },
      { 'label': 'Xiaomi Redmi Note 12 5G', 'pattern': '22111317PG' },
      { 'label': 'Xiaomi Redmi Note 12 4G', 'pattern': '23028RA60L' },
      { 'label': 'Honor 50 Lite', 'pattern': 'NTN-L22' },
      { 'label': 'Infinix Hot 30', 'pattern': 'Infinix X6831' },
      { 'label': 'Infinix Note 12 Pro 5G', 'pattern': 'Infinix X671B' },
      { 'label': 'Infinix Note 30', 'pattern': 'Infinix X6833B' },
      { 'label': 'Infinix Note 30 5G', 'pattern': 'Infinix X6711' },
      { 'label': 'Motorola Razr 40 ', 'pattern': 'motorola razr 40' },
      { 'label': 'Motorola Razr Plus 2023', 'pattern': 'motorola razr plus 2023' },
      { 'label': 'Nokia C210', 'pattern': 'Nokia C210' },
      { 'label': 'OnePlus 10 Pro 5G', 'pattern': 'NE2217' },
      { 'label': 'OPPO Reno8 T 5G', 'pattern': 'CPH2505' },
      { 'label': 'Vivo Y52', 'pattern': 'V2053' },
      { 'label': 'Xiaomi Poco M5', 'pattern': '22071219CG' },
      { 'label': 'Xiaomi Poco X3 GT', 'pattern': '21061110AG' },
      { 'label': 'Xiaomi Redmi Note 11 4G', 'pattern': '2201117TG' },
      { 'label': 'Motorola Moto G Stylus 5G', 'pattern': 'moto g stylus 5G' },
      { 'label': 'Motorola Moto G Stylus 5G 2022', 'pattern': 'moto g stylus 5G (2022)' },
      { 'label': 'Motorola Moto G60s', 'pattern': 'moto g(60)s' },
      { 'label': 'Nokia C100', 'pattern': 'N152DL' },
      { 'label': 'Nokia C300', 'pattern': 'Nokia C300' },
      { 'label': 'Realme C30s', 'pattern': 'RMX3690' },
      { 'label': 'Tecno Pova Neo 2', 'pattern': 'TECNO LG6n' },
      { 'label': 'Xiaomi Poco C50', 'pattern': '220733SPI' },
      { 'label': 'Xiaomi Redmi 10', 'pattern': '21061119AG' },
      { 'label': 'Xiaomi Redmi 9T', 'pattern': 'M2010J19SY' },
      { 'label': 'Xiaomi Redmi K40 Gaming Edition', 'pattern': 'M2104K10AC' },
      { 'label': 'ZTE Axon 30 Ultra 5G', 'pattern': 'ZTE A2022PG' },
      { 'label': 'ZTE Blade V41 Smart', 'pattern': 'ZTE A7050' },
      { 'label': 'Samsung Galaxy Tab S8+', 'pattern': 'SM-X806B' },
      { 'label': 'Samsung Galaxy Tab S8', 'pattern': 'SM-X700' },
      { 'label': 'Samsung Galaxy Tab S9 FE+', 'pattern': 'SM-X610' },
      { 'label': 'Samsung Galaxy Tab S9 FE', 'pattern': 'SM-X510' },
      { 'label': 'Samsung Galaxy Tab S7 FE', 'pattern': 'SM-T733' },
      { 'label': 'Samsung Galaxy Tab A9+', 'pattern': 'SM-X210' },
      { 'label': 'Samsung Galaxy Tab A8 10.5', 'pattern': 'SM-X205' },
      { 'label': 'Samsung Galaxy Tab A8 10.5', 'pattern': 'SM-X200' },
      { 'label': 'Samsung Galaxy Tab S7+', 'pattern': 'SM-T970' },
      { 'label': 'Samsung Galaxy Tab A7 Lite', 'pattern': 'SM-T225' },
      { 'label': 'Samsung Galaxy Tab S6 Lite', 'pattern': 'SM-P615' },
      { 'label': 'Samsung Galaxy Tab S6 Lite', 'pattern': 'SM-P610' },
      { 'label': 'Samsung Galaxy Tab A7 10.4 ', 'pattern': 'SM-T505' },
      { 'label': 'Samsung Galaxy Tab A7 10.4 ', 'pattern': 'SM-T500' },
      'Google TV',
      'Lumia',
      'iPad',
      'iPod',
      'iPhone',
      'Kindle',
      { 'label': 'Kindle Fire', 'pattern': '(?:Cloud9|Silk-Accelerated)' },
      'Nexus',
      'Nook',
      'PlayBook',
      'PlayStation Vita',
      'PlayStation',
      'TouchPad',
      'Transformer',
      { 'label': 'Wii U', 'pattern': 'WiiU' },
      'Wii',
      'Xbox One',
      { 'label': 'Xbox 360', 'pattern': 'Xbox' },
      'Xoom'
    ]);

    /* Detectable manufacturers. */
    var manufacturer = getManufacturer({
      'Apple': { 'iPad': 1, 'iPhone': 1, 'iPod': 1 },
      'Alcatel': {},
      'Archos': {},
      'Amazon': { 'Kindle': 1, 'Kindle Fire': 1 },
      'Asus': { 'Transformer': 1 },
      'Barnes & Noble': { 'Nook': 1 },
      'BlackBerry': { 'PlayBook': 1 },
      'Google': { 'Google TV': 1, 'Nexus': 1, 'Pixel': 1 },
      'HP': { 'TouchPad': 1 },
      'HTC': {},
      'Huawei': {},
      'Lenovo': {},
      'LG': {},
      'Microsoft': { 'Xbox': 1, 'Xbox One': 1 },
      'Motorola': { 'Xoom': 1 },
      'Nintendo': { 'Wii U': 1,  'Wii': 1 },
      'Nokia': { 'Lumia': 1 },
      'Oppo': {},
      'Samsung': { 'Galaxy S': 1, 'Galaxy S2': 1, 'Galaxy S3': 1, 'Galaxy S4': 1 },
      'Sony': { 'PlayStation': 1, 'PlayStation Vita': 1 },
      'Xiaomi': { 'Mi': 1, 'Redmi': 1 }
    });

    /* Detectable 2 manufacturers. */
    var manufacturer = getProduct([
      { 'label': 'Google', 'pattern': 'Android 10; K' },
      { 'label': 'Asus', 'pattern': 'ASUS_I003D' },
      { 'label': 'Asus', 'pattern': 'ASUS_I005DA' },
      { 'label': 'Asus', 'pattern': 'ASUS_I005D' },
      { 'label': 'Asus', 'pattern': 'ASUS_AI2201_C' },
      { 'label': 'Asus', 'pattern': 'ASUS_AI2205_C' },
      { 'label': 'Asus', 'pattern': 'ASUS_AI2302' },
      { 'label': 'Asus', 'pattern': 'ASUS_I01WD' },
      { 'label': 'Asus', 'pattern': 'ASUS_I002D' },
      { 'label': 'Asus', 'pattern': 'ASUS_I006D' },
      { 'label': 'Asus', 'pattern': 'ASUS_I004D' },
      { 'label': 'Asus', 'pattern': 'ASUS_AI2202' },
      { 'label': 'Google', 'pattern': 'Pixel 3' },
      { 'label': 'Google', 'pattern': 'Pixel 3 XL' },
      { 'label': 'Google', 'pattern': 'Pixel 3a' },
      { 'label': 'Google', 'pattern': 'Pixel 3a XL' },
      { 'label': 'Google', 'pattern': 'Pixel 4' },
      { 'label': 'Google', 'pattern': 'Pixel 4 XL' },
      { 'label': 'Google', 'pattern': 'Pixel 4a' },
      { 'label': 'Google', 'pattern': 'Pixel 4a (5G)' },
      { 'label': 'Google', 'pattern': 'Pixel 5' },
      { 'label': 'Google', 'pattern': 'Pixel 5a' },
      { 'label': 'Google', 'pattern': 'Pixel 6' },
      { 'label': 'Google', 'pattern': 'Pixel 6 Pro' },
      { 'label': 'Google', 'pattern': 'Pixel 6a' },
      { 'label': 'Google', 'pattern': 'Pixel 7' },
      { 'label': 'Google', 'pattern': 'Pixel 7 Pro' },
      { 'label': 'Google', 'pattern': 'Pixel 7a' },
      { 'label': 'Google', 'pattern': 'Pixel 8' },
      { 'label': 'Google', 'pattern': 'Pixel 8 Pro' },
      { 'label': 'Honor', 'pattern': 'NTH-NX9' },
      { 'label': 'Honor', 'pattern': 'NTN-LX1' },
      { 'label': 'Honor', 'pattern': 'FNE-NX9' },
      { 'label': 'Honor', 'pattern': 'REA-NX9' },
      { 'label': 'Honor', 'pattern': 'CRT-NX1' },
      { 'label': 'Honor', 'pattern': 'LGE-NX9' },
      { 'label': 'Honor', 'pattern': 'PGT-N19' },
      { 'label': 'Honor', 'pattern': 'WOD-LX1' },
      { 'label': 'Honor', 'pattern': 'WDY-LX1' },
      { 'label': 'Honor', 'pattern': 'CMA-LX1' },
      { 'label': 'Honor', 'pattern': 'CMA-LX2' },
      { 'label': 'Honor', 'pattern': 'CMA-LX3' },
      { 'label': 'Honor', 'pattern': 'TFY-LX1' },
      { 'label': 'Honor', 'pattern': 'ANY-NX1' },
      { 'label': 'Honor', 'pattern': 'RMO-NX1' },
      { 'label': 'Huawei', 'pattern': 'ANY-LX1' },
      { 'label': 'Infinix', 'pattern': 'Infinix X670' },
      { 'label': 'iQOO', 'pattern': 'V2254A' },
      { 'label': 'iQOO', 'pattern': 'I2202' },
      { 'label': 'LG', 'pattern': 'LM-V600' },
      { 'label': 'LG', 'pattern': 'LM-G900' },
      { 'label': 'Motorola', 'pattern': 'motorola edge' },
      { 'label': 'Motorola', 'pattern': 'motorola edge 20' },
      { 'label': 'Motorola', 'pattern': 'motorola edge 20 lite' },
      { 'label': 'Motorola', 'pattern': 'motorola edge 20 pro' },
      { 'label': 'Motorola', 'pattern': 'motorola edge 30' },
      { 'label': 'Motorola', 'pattern': 'motorola edge 30 fusion' },
      { 'label': 'Motorola', 'pattern': 'motorola edge 30 neo' },
      { 'label': 'Motorola', 'pattern': 'motorola edge 30 pro' },
      { 'label': 'Motorola', 'pattern': 'motorola edge 30 ultra' },
      { 'label': 'Motorola', 'pattern': 'motorola edge 40' },
      { 'label': 'Motorola', 'pattern': 'motorola edge 40 neo' },
      { 'label': 'Motorola', 'pattern': 'motorola edge 40 pro' },
      { 'label': 'Motorola', 'pattern': 'motorola edge 5G UW (2021)' },
      { 'label': 'Motorola', 'pattern': 'moto g(8)' },
      { 'label': 'Motorola', 'pattern': 'moto g(8) power' },
      { 'label': 'Motorola', 'pattern': 'moto g(9) play' },
      { 'label': 'Motorola', 'pattern': 'moto g stylus' },
      { 'label': 'Motorola', 'pattern': 'moto e13' },
      { 'label': 'Motorola', 'pattern': 'moto g power 5G - 2023' },
      { 'label': 'Motorola', 'pattern': 'moto g pro' },
      { 'label': 'Motorola', 'pattern': 'moto g stylus 5G - 2023' },
      { 'label': 'Motorola', 'pattern': 'moto g(100)' },
      { 'label': 'Motorola', 'pattern': 'moto g13' },
      { 'label': 'Motorola', 'pattern': 'moto g14' },
      { 'label': 'Motorola', 'pattern': 'moto g200 5G' },
      { 'label': 'Motorola', 'pattern': 'moto g22' },
      { 'label': 'Motorola', 'pattern': 'moto g23' },
      { 'label': 'Motorola', 'pattern': 'moto g(30)' },
      { 'label': 'Motorola', 'pattern': 'moto g32' },
      { 'label': 'Motorola', 'pattern': 'moto g42' },
      { 'label': 'Motorola', 'pattern': 'moto g(50)' },
      { 'label': 'Motorola', 'pattern': 'moto g(50) 5G' },
      { 'label': 'Motorola', 'pattern': 'moto g52' },
      { 'label': 'Motorola', 'pattern': 'moto g53 5G' },
      { 'label': 'Motorola', 'pattern': 'moto g54 5G' },
      { 'label': 'Motorola', 'pattern': 'moto g(60)' },
      { 'label': 'Motorola', 'pattern': 'moto g62 5G' },
      { 'label': 'Motorola', 'pattern': 'moto g71 5G' },
      { 'label': 'Motorola', 'pattern': 'moto g73 5G' },
      { 'label': 'Motorola', 'pattern': 'moto g82 5G' },
      { 'label': 'Motorola', 'pattern': 'moto g84 5G' },
      { 'label': 'Motorola', 'pattern': 'motorola one 5G UW ace' },
      { 'label': 'Motorola', 'pattern': 'motorola one action' },
      { 'label': 'Motorola', 'pattern': 'motorola razr 2022' },
      { 'label': 'Motorola', 'pattern': 'motorola razr 40' },
      { 'label': 'Motorola', 'pattern': 'motorola razr 40 ultra' },
      { 'label': 'Motorola', 'pattern': 'ThinkPhone by motorola' },
      { 'label': 'Nokia', 'pattern': 'Nokia 2.4' },
      { 'label': 'Nokia', 'pattern': 'Nokia 3.2' },
      { 'label': 'Nokia', 'pattern': 'Nokia 3.4' },
      { 'label': 'Nokia', 'pattern': 'Nokia 4.2' },
      { 'label': 'Nokia', 'pattern': 'Nokia 5.4' },
      { 'label': 'Nokia', 'pattern': 'Nokia 8.3 5G' },
      { 'label': 'Nokia', 'pattern': 'Nokia G10' },
      { 'label': 'Nokia', 'pattern': 'Nokia G11' },
      { 'label': 'Nokia', 'pattern': 'Nokia G20' },
      { 'label': 'Nokia', 'pattern': 'Nokia G21' },
      { 'label': 'Nokia', 'pattern': 'Nokia G42 5G' },
      { 'label': 'Nokia', 'pattern': 'Nokia G50' },
      { 'label': 'Nokia', 'pattern': 'Nokia G60 5G' },
      { 'label': 'Nokia', 'pattern': 'Nokia X10' },
      { 'label': 'Nokia', 'pattern': 'Nokia X20' },
      { 'label': 'Nokia', 'pattern': 'Nokia X30 5G' },
      { 'label': 'Nokia', 'pattern': 'Nokia XR20' },
      { 'label': 'Nubia', 'pattern': 'NX729J' },
      { 'label': 'OnePlus', 'pattern': 'NE2213' },
      { 'label': 'OnePlus', 'pattern': 'NE2215' },
      { 'label': 'OnePlus', 'pattern': 'CPH2415' },
      { 'label': 'OnePlus', 'pattern': 'CPH2449' },
      { 'label': 'OnePlus', 'pattern': 'GM1903' },
      { 'label': 'OnePlus', 'pattern': 'GM1900' },
      { 'label': 'OnePlus', 'pattern': 'GM1917' },
      { 'label': 'OnePlus', 'pattern': 'GM1913' },
      { 'label': 'OnePlus', 'pattern': 'GM1910' },
      { 'label': 'OnePlus', 'pattern': 'HD1903' },
      { 'label': 'OnePlus', 'pattern': 'HD1900' },
      { 'label': 'OnePlus', 'pattern': 'HD1913' },
      { 'label': 'OnePlus', 'pattern': 'HD1910' },
      { 'label': 'OnePlus', 'pattern': 'IN2013' },
      { 'label': 'OnePlus', 'pattern': 'IN2011' },
      { 'label': 'OnePlus', 'pattern': 'IN2010' },
      { 'label': 'OnePlus', 'pattern': 'IN2015' },
      { 'label': 'OnePlus', 'pattern': 'IN2023' },
      { 'label': 'OnePlus', 'pattern': 'IN2025' },
      { 'label': 'OnePlus', 'pattern': 'IN2020' },
      { 'label': 'OnePlus', 'pattern': 'KB2005' },
      { 'label': 'OnePlus', 'pattern': 'KB2003' },
      { 'label': 'OnePlus', 'pattern': 'KB2007' },
      { 'label': 'OnePlus', 'pattern': 'KB2001' },
      { 'label': 'OnePlus', 'pattern': 'KB2000' },
      { 'label': 'OnePlus', 'pattern': 'LE2115' },
      { 'label': 'OnePlus', 'pattern': 'LE2113' },
      { 'label': 'OnePlus', 'pattern': 'LE2111' },
      { 'label': 'OnePlus', 'pattern': 'LE2125' },
      { 'label': 'OnePlus', 'pattern': 'LE2123' },
      { 'label': 'OnePlus', 'pattern': 'LE2121' },
      { 'label': 'OnePlus', 'pattern': 'LE2101' },
      { 'label': 'OnePlus', 'pattern': 'AC2003' },
      { 'label': 'OnePlus', 'pattern': 'AC2001' },
      { 'label': 'OnePlus', 'pattern': 'DN2103' },
      { 'label': 'OnePlus', 'pattern': 'DN2101' },
      { 'label': 'OnePlus', 'pattern': 'CPH2399' },
      { 'label': 'OnePlus', 'pattern': 'CPH2493' },
      { 'label': 'OnePlus', 'pattern': 'IV2201' },
      { 'label': 'OnePlus', 'pattern': 'CPH2409' },
      { 'label': 'OnePlus', 'pattern': 'CPH2465' },
      { 'label': 'OnePlus', 'pattern': 'EB2103' },
      { 'label': 'OnePlus', 'pattern': 'CPH2389' },
      { 'label': 'Oppo', 'pattern': 'PHQ110' },
      { 'label': 'Oppo', 'pattern': 'CPH2269' },
      { 'label': 'Oppo', 'pattern': 'CPH2271' },
      { 'label': 'Oppo', 'pattern': 'CPH2579' },
      { 'label': 'Oppo', 'pattern': 'CPH2069' },
      { 'label': 'Oppo', 'pattern': 'CPH2127' },
      { 'label': 'Oppo', 'pattern': 'CPH2135' },
      { 'label': 'Oppo', 'pattern': 'CPH2195' },
      { 'label': 'Oppo', 'pattern': 'CPH2273' },
      { 'label': 'Oppo', 'pattern': 'CPH2387' },
      { 'label': 'Oppo', 'pattern': 'CPH2577' },
      { 'label': 'Oppo', 'pattern': 'CPH2067' },
      { 'label': 'Oppo', 'pattern': 'CPH2161' },
      { 'label': 'Oppo', 'pattern': 'CPH2219' },
      { 'label': 'Oppo', 'pattern': 'CPH2197' },
      { 'label': 'Oppo', 'pattern': 'CPH2375' },
      { 'label': 'Oppo', 'pattern': 'CPH2339' },
      { 'label': 'Oppo', 'pattern': 'CPH2473' },
      { 'label': 'Oppo', 'pattern': 'CPH2565' },
      { 'label': 'Oppo', 'pattern': 'CPH2483' },
      { 'label': 'Oppo', 'pattern': 'CPH1941' },
      { 'label': 'Oppo', 'pattern': 'CPH2021' },
      { 'label': 'Oppo', 'pattern': 'CPH2203' },
      { 'label': 'Oppo', 'pattern': 'CPH2205' },
      { 'label': 'Oppo', 'pattern': 'CPH2211' },
      { 'label': 'Oppo', 'pattern': 'CPH2365' },
      { 'label': 'Oppo', 'pattern': 'CPH2333' },
      { 'label': 'Oppo', 'pattern': 'CPH2529' },
      { 'label': 'Oppo', 'pattern': 'CPH2385' },
      { 'label': 'Oppo', 'pattern': 'CPH2095' },
      { 'label': 'Oppo', 'pattern': 'CPH2119' },
      { 'label': 'Oppo', 'pattern': 'CPH2285' },
      { 'label': 'Oppo', 'pattern': 'CPH2461' },
      { 'label': 'Oppo', 'pattern': 'CPH2363' },
      { 'label': 'Oppo', 'pattern': 'PEUM00' },
      { 'label': 'Oppo', 'pattern': 'CPH2437' },
      { 'label': 'Oppo', 'pattern': 'CPH2005' },
      { 'label': 'Oppo', 'pattern': 'CPH2009' },
      { 'label': 'Oppo', 'pattern': 'CPH2025' },
      { 'label': 'Oppo', 'pattern': 'CPH2145' },
      { 'label': 'Oppo', 'pattern': 'CPH2207' },
      { 'label': 'Oppo', 'pattern': 'CPH2173' },
      { 'label': 'Oppo', 'pattern': 'CPH2307' },
      { 'label': 'Oppo', 'pattern': 'CPH2305' },
      { 'label': 'Oppo', 'pattern': 'CPH2373' },
      { 'label': 'Oppo', 'pattern': 'CPH2337' },
      { 'label': 'Oppo', 'pattern': 'CPH1917' },
      { 'label': 'Oppo', 'pattern': 'CPH2531' },
      { 'label': 'Oppo', 'pattern': 'CPH2525' },
      { 'label': 'Oppo', 'pattern': 'CPH1907' },
      { 'label': 'Oppo', 'pattern': 'CPH1951' },
      { 'label': 'Oppo', 'pattern': 'CPH2043' },
      { 'label': 'Oppo', 'pattern': 'CPH2113' },
      { 'label': 'Oppo', 'pattern': 'CPH2091' },
      { 'label': 'Oppo', 'pattern': 'CPH2125' },
      { 'label': 'Oppo', 'pattern': 'CPH2109' },
      { 'label': 'Oppo', 'pattern': 'CPH2089' },
      { 'label': 'Oppo', 'pattern': 'CPH2065' },
      { 'label': 'Oppo', 'pattern': 'CPH2159' },
      { 'label': 'Oppo', 'pattern': 'CPH2251' },
      { 'label': 'Oppo', 'pattern': 'CPH2247' },
      { 'label': 'Oppo', 'pattern': 'CPH2237' },
      { 'label': 'Oppo', 'pattern': 'CPH2371' },
      { 'label': 'Oppo', 'pattern': 'CPH2293' },
      { 'label': 'Oppo', 'pattern': 'CPH2343' },
      { 'label': 'Oppo', 'pattern': 'CPH2359' },
      { 'label': 'Oppo', 'pattern': 'CPH2357' },
      { 'label': 'Oppo', 'pattern': 'CPH2481' },
      { 'label': 'Poco', 'pattern': 'M2012K11AG' },
      { 'label': 'Poco', 'pattern': '22021211RG' },
      { 'label': 'Poco', 'pattern': '21121210G' },
      { 'label': 'Poco', 'pattern': '23049PCD8G' },
      { 'label': 'Poco', 'pattern': '23013PC75G' },
      { 'label': 'Poco', 'pattern': 'M2103K19PG' },
      { 'label': 'Poco', 'pattern': '22041219PG' },
      { 'label': 'Poco', 'pattern': '2201117PG' },
      { 'label': 'Poco', 'pattern': '21091116AG' },
      { 'label': 'Poco', 'pattern': '22071219CG' },
      { 'label': 'Poco', 'pattern': '2207117BPG' },
      { 'label': 'Poco', 'pattern': '21061110AG' },
      { 'label': 'Poco', 'pattern': 'M2102J20SG' },
      { 'label': 'Poco', 'pattern': '22041216G' },
      { 'label': 'Poco', 'pattern': '2201116PG' },
      { 'label': 'Poco', 'pattern': '22111317PG' },
      { 'label': 'Poco', 'pattern': '22101320G' },
      { 'label': 'Poco', 'pattern': '22101320I' },
      { 'label': 'Realme', 'pattern': 'RMX3630' },
      { 'label': 'Realme', 'pattern': 'RMX3686' },
      { 'label': 'Realme', 'pattern': 'RMX3771' },
      { 'label': 'Realme', 'pattern': 'RMX3741' },
      { 'label': 'Realme', 'pattern': 'RMX2001' },
      { 'label': 'Realme', 'pattern': 'RMX2063' },
      { 'label': 'Realme', 'pattern': 'RMX2111' },
      { 'label': 'Realme', 'pattern': 'RMX2170' },
      { 'label': 'Realme', 'pattern': 'RMX3241' },
      { 'label': 'Realme', 'pattern': 'RMX3085' },
      { 'label': 'Realme', 'pattern': 'RMX3081' },
      { 'label': 'Realme', 'pattern': 'RMX3151' },
      { 'label': 'Realme', 'pattern': 'RMX3521' },
      { 'label': 'Realme', 'pattern': 'RMX3472' },
      { 'label': 'Realme', 'pattern': 'RMX3393' },
      { 'label': 'Realme', 'pattern': 'RMX3392' },
      { 'label': 'Realme', 'pattern': 'RMX3491' },
      { 'label': 'Realme', 'pattern': 'RMX3201' },
      { 'label': 'Realme', 'pattern': 'RMX3191' },
      { 'label': 'Realme', 'pattern': 'RMX3195' },
      { 'label': 'Realme', 'pattern': 'RMX3503' },
      { 'label': 'Realme', 'pattern': 'RMX3624' },
      { 'label': 'Realme', 'pattern': 'RMX3511' },
      { 'label': 'Realme', 'pattern': 'RMX3830' },
      { 'label': 'Realme', 'pattern': 'RMX3760' },
      { 'label': 'Realme', 'pattern': 'RMX3710' },
      { 'label': 'Realme', 'pattern': 'RMX2202' },
      { 'label': 'Realme', 'pattern': 'RMX3363' },
      { 'label': 'Realme', 'pattern': 'RMX3360' },
      { 'label': 'Realme', 'pattern': 'RMX3031' },
      { 'label': 'Realme', 'pattern': 'RMX3370' },
      { 'label': 'Realme', 'pattern': 'RMX3561' },
      { 'label': 'Realme', 'pattern': 'RMX3563' },
      { 'label': 'Realme', 'pattern': 'RMX3371' },
      { 'label': 'Realme', 'pattern': 'RMX3311' },
      { 'label': 'Realme', 'pattern': 'RMX3301' },
      { 'label': 'Realme', 'pattern': 'RMX3242' },
      { 'label': 'Realme', 'pattern': 'RMX3474' },
      { 'label': 'Realme', 'pattern': 'RMX3286' },
      { 'label': 'Realme', 'pattern': 'RMX3572' },
      { 'label': 'Realme', 'pattern': 'RMX3516' },
      { 'label': 'Realme', 'pattern': 'RMX1931' },
      { 'label': 'Realme', 'pattern': 'RMX2075' },
      { 'label': 'Realme', 'pattern': 'RMX2121' },
      { 'label': 'Samsung', 'pattern': 'SM-A025F' },
      { 'label': 'Samsung', 'pattern': 'SM-A035F' },
      { 'label': 'Samsung', 'pattern': 'SM-A037F' },
      { 'label': 'Samsung', 'pattern': 'SM-A037G' },
      { 'label': 'Samsung', 'pattern': 'SM-A045F' },
      { 'label': 'Samsung', 'pattern': 'SM-A042M' },
      { 'label': 'Samsung', 'pattern': 'SM-A047F' },
      { 'label': 'Samsung', 'pattern': 'SM-A127F' },
      { 'label': 'Samsung', 'pattern': 'SM-A125F' },
      { 'label': 'Samsung', 'pattern': 'SM-A135F' },
      { 'label': 'Samsung', 'pattern': 'SM-A137F' },
      { 'label': 'Samsung', 'pattern': 'SM-A136B' },
      { 'label': 'Samsung', 'pattern': 'SM-A136U' },
      { 'label': 'Samsung', 'pattern': 'SM-A145F' },
      { 'label': 'Samsung', 'pattern': 'SM-A145M' },
      { 'label': 'Samsung', 'pattern': 'SM-A146M' },
      { 'label': 'Samsung', 'pattern': 'SM-A146U' },
      { 'label': 'Samsung', 'pattern': 'SM-A217F' },
      { 'label': 'Samsung', 'pattern': 'SM-A225F' },
      { 'label': 'Samsung', 'pattern': 'SM-A226B' },
      { 'label': 'Samsung', 'pattern': 'SM-A235F' },
      { 'label': 'Samsung', 'pattern': 'SM-A235M' },
      { 'label': 'Samsung', 'pattern': 'SM-A236B' },
      { 'label': 'Samsung', 'pattern': 'SM-A245F' },
      { 'label': 'Samsung', 'pattern': 'SM-A245M' },
      { 'label': 'Samsung', 'pattern': 'SM-A315F' },
      { 'label': 'Samsung', 'pattern': 'SM-A325F' },
      { 'label': 'Samsung', 'pattern': 'SM-A326B' },
      { 'label': 'Samsung', 'pattern': 'SM-A336B' },
      { 'label': 'Samsung', 'pattern': 'SM-A346B' },
      { 'label': 'Samsung', 'pattern': 'SM-A405FN' },
      { 'label': 'Samsung', 'pattern': 'SM-A415F' },
      { 'label': 'Samsung', 'pattern': 'SM-A426B' },
      { 'label': 'Samsung', 'pattern': 'SM-A515F' },
      { 'label': 'Samsung', 'pattern': 'SM-A516B' },
      { 'label': 'Samsung', 'pattern': 'SM-A525F' },
      { 'label': 'Samsung', 'pattern': 'SM-A526B' },
      { 'label': 'Samsung', 'pattern': 'SM-A528B' },
      { 'label': 'Samsung', 'pattern': 'SM-A536E' },
      { 'label': 'Samsung', 'pattern': 'SM-A536B' },
      { 'label': 'Samsung', 'pattern': 'SM-A546B' },
      { 'label': 'Samsung', 'pattern': 'SM-A705FN' },
      { 'label': 'Samsung', 'pattern': 'SM-A715F' },
      { 'label': 'Samsung', 'pattern': 'SM-A716U' },
      { 'label': 'Samsung', 'pattern': 'SM-A725F' },
      { 'label': 'Samsung', 'pattern': 'SM-A736B' },
      { 'label': 'Samsung', 'pattern': 'SM-A908B' },
      { 'label': 'Samsung', 'pattern': 'SM-E135F' },
      { 'label': 'Samsung', 'pattern': 'SM-E225F' },
      { 'label': 'Samsung', 'pattern': 'SM-E236B' },
      { 'label': 'Samsung', 'pattern': 'SM-E625F' },
      { 'label': 'Samsung', 'pattern': 'SM-M115F' },
      { 'label': 'Samsung', 'pattern': 'SM-M127F' },
      { 'label': 'Samsung', 'pattern': 'SM-M135F' },
      { 'label': 'Samsung', 'pattern': 'SM-M135M' },
      { 'label': 'Samsung', 'pattern': 'SM-M146B' },
      { 'label': 'Samsung', 'pattern': 'SM-M215F' },
      { 'label': 'Samsung', 'pattern': 'SM-F415F' },
      { 'label': 'Samsung', 'pattern': 'SM-M225FV' },
      { 'label': 'Samsung', 'pattern': 'SM-M236B' },
      { 'label': 'Samsung', 'pattern': 'SM-M315F' },
      { 'label': 'Samsung', 'pattern': 'SM-M317F' },
      { 'label': 'Samsung', 'pattern': 'SM-M325F' },
      { 'label': 'Samsung', 'pattern': 'SM-M325FV' },
      { 'label': 'Samsung', 'pattern': 'SM-M336B' },
      { 'label': 'Samsung', 'pattern': 'SM-M515F' },
      { 'label': 'Samsung', 'pattern': 'SM-M526B' },
      { 'label': 'Samsung', 'pattern': 'SM-M536B' },
      { 'label': 'Samsung', 'pattern': 'SM-M546B' },
      { 'label': 'Samsung', 'pattern': 'SM-M625F' },
      { 'label': 'Samsung', 'pattern': 'SM-N970F' },
      { 'label': 'Samsung', 'pattern': 'SM-N971U' },
      { 'label': 'Samsung', 'pattern': 'SM-N770F' },
      { 'label': 'Samsung', 'pattern': 'SM-N975F' },
      { 'label': 'Samsung', 'pattern': 'SM-N976B' },
      { 'label': 'Samsung', 'pattern': 'SM-N980F' },
      { 'label': 'Samsung', 'pattern': 'SM-N981B' },
      { 'label': 'Samsung', 'pattern': 'SM-N985F' },
      { 'label': 'Samsung', 'pattern': 'SM-N986B' },
      { 'label': 'Samsung', 'pattern': 'SM-G973F' },
      { 'label': 'Samsung', 'pattern': 'SM-G977B' },
      { 'label': 'Samsung', 'pattern': 'SM-G770F' },
      { 'label': 'Samsung', 'pattern': 'SM-G975F' },
      { 'label': 'Samsung', 'pattern': 'SM-G970F' },
      { 'label': 'Samsung', 'pattern': 'SM-G980F' },
      { 'label': 'Samsung', 'pattern': 'SM-G981B' },
      { 'label': 'Samsung', 'pattern': 'SM-G780F' },
      { 'label': 'Samsung', 'pattern': 'SM-G781B' },
      { 'label': 'Samsung', 'pattern': 'SM-G988B' },
      { 'label': 'Samsung', 'pattern': 'SM-G985F' },
      { 'label': 'Samsung', 'pattern': 'SM-G986B' },
      { 'label': 'Samsung', 'pattern': 'SM-G991B' },
      { 'label': 'Samsung', 'pattern': 'SM-G990B2' },
      { 'label': 'Samsung', 'pattern': 'SM-G990B' },
      { 'label': 'Samsung', 'pattern': 'SM-G990E' },
      { 'label': 'Samsung', 'pattern': 'SM-G998B' },
      { 'label': 'Samsung', 'pattern': 'SM-G996B' },
      { 'label': 'Samsung', 'pattern': 'SM-S908B' },
      { 'label': 'Samsung', 'pattern': 'SM-S906B' },
      { 'label': 'Samsung', 'pattern': 'SM-S901B' },
      { 'label': 'Samsung', 'pattern': 'SM-S911B' },
      { 'label': 'Samsung', 'pattern': 'SM-S918B' },
      { 'label': 'Samsung', 'pattern': 'SM-S916B' },
      { 'label': 'Samsung', 'pattern': 'SM-T515' },
      { 'label': 'Samsung', 'pattern': 'SM-T510' },
      { 'label': 'Samsung', 'pattern': 'SM-P205' },
      { 'label': 'Samsung', 'pattern': 'SM-P200' },
      { 'label': 'Samsung', 'pattern': 'SM-T295' },
      { 'label': 'Samsung', 'pattern': 'SM-T290' },
      { 'label': 'Samsung', 'pattern': 'SM-T307U' },
      { 'label': 'Samsung', 'pattern': 'SM-T505' },
      { 'label': 'Samsung', 'pattern': 'SM-T500' },
      { 'label': 'Samsung', 'pattern': 'SM-T220' },
      { 'label': 'Samsung', 'pattern': 'SM-T225' },
      { 'label': 'Samsung', 'pattern': 'SM-X205' },
      { 'label': 'Samsung', 'pattern': 'SM-X200' },
      { 'label': 'Samsung', 'pattern': 'SM-T575' },
      { 'label': 'Samsung', 'pattern': 'SM-T725' },
      { 'label': 'Samsung', 'pattern': 'SM-T720' },
      { 'label': 'Samsung', 'pattern': 'SM-P619' },
      { 'label': 'Samsung', 'pattern': 'SM-P613' },
      { 'label': 'Samsung', 'pattern': 'SM-P615' },
      { 'label': 'Samsung', 'pattern': 'SM-P610' },
      { 'label': 'Samsung', 'pattern': 'SM-T865' },
      { 'label': 'Samsung', 'pattern': 'SM-T860' },
      { 'label': 'Samsung', 'pattern': 'SM-T875' },
      { 'label': 'Samsung', 'pattern': 'SM-T870' },
      { 'label': 'Samsung', 'pattern': 'SM-T876B' },
      { 'label': 'Samsung', 'pattern': 'SM-T736B' },
      { 'label': 'Samsung', 'pattern': 'SM-T733' },
      { 'label': 'Samsung', 'pattern': 'SM-T976B' },
      { 'label': 'Samsung', 'pattern': 'SM-T970' },
      { 'label': 'Samsung', 'pattern': 'SM-X706B' },
      { 'label': 'Samsung', 'pattern': 'SM-X906' },
      { 'label': 'Samsung', 'pattern': 'SM-X900' },
      { 'label': 'Samsung', 'pattern': 'SM-X700' },
      { 'label': 'Samsung', 'pattern': 'SM-X806B' },
      { 'label': 'Samsung', 'pattern': 'SM-X800' },
      { 'label': 'Samsung', 'pattern': 'SM-X710' },
      { 'label': 'Samsung', 'pattern': 'SM-X816B' },
      { 'label': 'Samsung', 'pattern': 'SM-G736B' },
      { 'label': 'Samsung', 'pattern': 'SM-F711B' },
      { 'label': 'Samsung', 'pattern': 'SM-F721B' },
      { 'label': 'Samsung', 'pattern': 'SM-F731B' },
      { 'label': 'Sony', 'pattern': 'J9110' },
      { 'label': 'Sony', 'pattern': 'XQ-AT52' },
      { 'label': 'Sony', 'pattern': 'XQ-AT51' },
      { 'label': 'Sony', 'pattern': 'XQ-BC52' },
      { 'label': 'Sony', 'pattern': 'XQ-BC72' },
      { 'label': 'Sony', 'pattern': 'XQ-CT54' },
      { 'label': 'Sony', 'pattern': 'XQ-AU52' },
      { 'label': 'Sony', 'pattern': 'XQ-AU51' },
      { 'label': 'Sony', 'pattern': 'XQ-BT52' },
      { 'label': 'Sony', 'pattern': 'XQ-CC54' },
      { 'label': 'Sony', 'pattern': 'XQ-DC54' },
      { 'label': 'Sony', 'pattern': 'J9210' },
      { 'label': 'Sony', 'pattern': 'XQ-AS72' },
      { 'label': 'Sony', 'pattern': 'XQ-AS52' },
      { 'label': 'Sony', 'pattern': 'XQ-BQ72' },
      { 'label': 'Sony', 'pattern': 'XQ-BQ52' },
      { 'label': 'Sony', 'pattern': 'XQ-CQ54' },
      { 'label': 'Sony', 'pattern': 'XQ-BE52' },
      { 'label': 'Tecno', 'pattern': 'TECNO CK6' },
      { 'label': 'Tecno', 'pattern': 'TECNO KI7' },
      { 'label': 'Vivo', 'pattern': 'vivo 1907' },
      { 'label': 'Vivo', 'pattern': 'vivo 1920' },
      { 'label': 'Vivo', 'pattern': 'vivo 1909' },
      { 'label': 'Vivo', 'pattern': 'V2025' },
      { 'label': 'Vivo', 'pattern': 'vivo 2018' },
      { 'label': 'Vivo', 'pattern': 'V2023' },
      { 'label': 'Vivo', 'pattern': 'V2066' },
      { 'label': 'Vivo', 'pattern': 'V2050' },
      { 'label': 'Vivo', 'pattern': 'V2061' },
      { 'label': 'Vivo', 'pattern': 'V2130' },
      { 'label': 'Vivo', 'pattern': 'vivo 2005' },
      { 'label': 'Vivo', 'pattern': 'vivo 2006' },
      { 'label': 'Vivo', 'pattern': 'V2046' },
      { 'label': 'Vivo', 'pattern': 'V2105' },
      { 'label': 'Vivo', 'pattern': 'V2145A' },
      { 'label': 'Vivo', 'pattern': 'V2208' },
      { 'label': 'Vivo', 'pattern': 'V2145' },
      { 'label': 'Vivo', 'pattern': 'V2120' },
      { 'label': 'Vivo', 'pattern': 'vivo 1915' },
      { 'label': 'Vivo', 'pattern': 'V2037' },
      { 'label': 'Vivo', 'pattern': 'V2111' },
      { 'label': 'Vivo', 'pattern': 'V2110' },
      { 'label': 'Vivo', 'pattern': 'V2036' },
      { 'label': 'Vivo', 'pattern': 'V2109' },
      { 'label': 'Vivo', 'pattern': 'V2205' },
      { 'label': 'Vivo', 'pattern': 'V2247' },
      { 'label': 'Vivo', 'pattern': 'V2053' },
      { 'label': 'Vivo', 'pattern': 'V2058' },
      { 'label': 'Vivo', 'pattern': 'V2127' },
      { 'label': 'Vivo', 'pattern': 'V2041' },
      { 'label': 'Vivo', 'pattern': 'V2124' },
      { 'label': 'Xiaomi', 'pattern': '2109119DG' },
      { 'label': 'Xiaomi', 'pattern': '21081111RG' },
      { 'label': 'Xiaomi', 'pattern': '2107113SG' },
      { 'label': 'Xiaomi', 'pattern': '2201123G' },
      { 'label': 'Xiaomi', 'pattern': '2203129G' },
      { 'label': 'Xiaomi', 'pattern': '2210129SG' },
      { 'label': 'Xiaomi', 'pattern': '2201122G' },
      { 'label': 'Xiaomi', 'pattern': '22071212AG' },
      { 'label': 'Xiaomi', 'pattern': '22081212UG' },
      { 'label': 'Xiaomi', 'pattern': '2112123AG' },
      { 'label': 'Xiaomi', 'pattern': '2211133G' },
      { 'label': 'Xiaomi', 'pattern': '2210132G' },
      { 'label': 'Xiaomi', 'pattern': '2304FPN6DG' },
      { 'label': 'Xiaomi', 'pattern': '2306EPN60G' },
      { 'label': 'Xiaomi', 'pattern': '23078PND5G' },
      { 'label': 'Xiaomi', 'pattern': 'Mi 10' },
      { 'label': 'Xiaomi', 'pattern': 'M2002J9G' },
      { 'label': 'Xiaomi', 'pattern': 'Mi 10 Pro' },
      { 'label': 'Xiaomi', 'pattern': 'M2007J3SY' },
      { 'label': 'Xiaomi', 'pattern': 'M2007J17G' },
      { 'label': 'Xiaomi', 'pattern': 'M2007J3SG' },
      { 'label': 'Xiaomi', 'pattern': 'M2011K2G' },
      { 'label': 'Xiaomi', 'pattern': 'M2101K9AG' },
      { 'label': 'Xiaomi', 'pattern': 'M2101K9G' },
      { 'label': 'Xiaomi', 'pattern': 'M2102K1G' },
      { 'label': 'Xiaomi', 'pattern': 'M2012K11G' },
      { 'label': 'Xiaomi', 'pattern': 'MI 9' },
      { 'label': 'Xiaomi', 'pattern': 'Mi 9 Lite' },
      { 'label': 'Xiaomi', 'pattern': 'Mi 9T' },
      { 'label': 'Xiaomi', 'pattern': 'Redmi K20 Pro' },
      { 'label': 'Xiaomi', 'pattern': 'Mi Note 10' },
      { 'label': 'Xiaomi', 'pattern': 'Mi Note 10 Lite' },
      { 'label': 'Xiaomi', 'pattern': 'Mi Note 10 Pro' },
      { 'label': 'Xiaomi', 'pattern': '21051182G' },
      { 'label': 'Xiaomi', 'pattern': '23043RP34G' },
      { 'label': 'Xiaomi', 'pattern': 'POCO F2 Pro' },
      { 'label': 'Xiaomi', 'pattern': 'M2012K11AG' },
      { 'label': 'Xiaomi', 'pattern': 'M2103K19PG' },
      { 'label': 'Xiaomi', 'pattern': '21091116AG' },
      { 'label': 'Xiaomi', 'pattern': 'M2007J20CG' },
      { 'label': 'Xiaomi', 'pattern': '22011119UY' },
      { 'label': 'Xiaomi', 'pattern': '23100RN82L' },
      { 'label': 'Xiaomi', 'pattern': 'M2004J19C' },
      { 'label': 'Xiaomi', 'pattern': 'M2101K7AG' },
      { 'label': 'Xiaomi', 'pattern': 'M2103K19G' },
      { 'label': 'Xiaomi', 'pattern': 'M2101K6G' },
      { 'label': 'Xiaomi', 'pattern': 'M2101K7BG' },
      { 'label': 'Xiaomi', 'pattern': 'M2101K7BI' },
      { 'label': 'Xiaomi', 'pattern': '2201117TG' },
      { 'label': 'Xiaomi', 'pattern': '2201117TY' },
      { 'label': 'Xiaomi', 'pattern': '2201116SG' },
      { 'label': 'Xiaomi', 'pattern': '2201116TG' },
      { 'label': 'Xiaomi', 'pattern': '2201116SR' },
      { 'label': 'Xiaomi', 'pattern': '21091116UG' },
      { 'label': 'Xiaomi', 'pattern': '2201117SG' },
      { 'label': 'Xiaomi', 'pattern': '2201117SY' },
      { 'label': 'Xiaomi', 'pattern': '22031116BG' },
      { 'label': 'Xiaomi', 'pattern': '22111317G' },
      { 'label': 'Xiaomi', 'pattern': '23021RAAEG' },
      { 'label': 'Xiaomi', 'pattern': '2209116AG' },
      { 'label': 'Xiaomi', 'pattern': '22101316G' },
      { 'label': 'Xiaomi', 'pattern': 'M1908C3JGG' },
      { 'label': 'Xiaomi', 'pattern': 'Redmi Note 8 Pro' },
      { 'label': 'Xiaomi', 'pattern': 'M2003J15SC' },
      { 'label': 'Xiaomi', 'pattern': 'Redmi Note 9 Pro' },
      { 'label': 'Xiaomi', 'pattern': 'Redmi Note 9S' },
      { 'label': 'Xiaomi', 'pattern': 'M2007J22G' },
      { 'label': 'Xiaomi', 'pattern': '22081283G' },
      { 'label': 'Samsung', 'pattern': 'SM-S928U' },
      { 'label': 'Samsung', 'pattern': 'SM-S928B' },
      { 'label': 'Samsung', 'pattern': 'SM-S926U' },
      { 'label': 'Samsung', 'pattern': 'SM-S926B' },
      { 'label': 'Samsung', 'pattern': 'SM-S921U' },
      { 'label': 'Samsung', 'pattern': 'SM-S921B' },
      { 'label': 'Samsung', 'pattern': 'SM-S918U' },
      { 'label': 'Samsung', 'pattern': 'SM-S916U' },
      { 'label': 'Samsung', 'pattern': 'SM-S911U' },
      { 'label': 'Samsung', 'pattern': 'SM-S908U' },
      { 'label': 'Samsung', 'pattern': 'SM-S906U' },
      { 'label': 'Samsung', 'pattern': 'SM-S901U' },
      { 'label': 'Samsung', 'pattern': 'SM-S711U' },
      { 'label': 'Samsung', 'pattern': 'SM-S711B' },
      { 'label': 'Samsung', 'pattern': 'SM-S536DL' },
      { 'label': 'Samsung', 'pattern': 'SM-M346B' },
      { 'label': 'Samsung', 'pattern': 'SM-G998U' },
      { 'label': 'Samsung', 'pattern': 'SM-G996U' },
      { 'label': 'Samsung', 'pattern': 'SM-G991U' },
      { 'label': 'Samsung', 'pattern': 'SM-G990U' },
      { 'label': 'Samsung', 'pattern': 'SM-F946U' },
      { 'label': 'Samsung', 'pattern': 'SM-F946B' },
      { 'label': 'Samsung', 'pattern': 'SM-F936U' },
      { 'label': 'Samsung', 'pattern': 'SM-F936B' },
      { 'label': 'Samsung', 'pattern': 'SM-F926U' },
      { 'label': 'Samsung', 'pattern': 'SM-F926B' },
      { 'label': 'Samsung', 'pattern': 'SM-F731U' },
      { 'label': 'Samsung', 'pattern': 'SM-F721U' },
      { 'label': 'Samsung', 'pattern': 'SM-F711U' },
      { 'label': 'Samsung', 'pattern': 'SM-A546U' },
      { 'label': 'Samsung', 'pattern': 'SM-A536U' },
      { 'label': 'Samsung', 'pattern': 'SM-A526U' },
      { 'label': 'Samsung', 'pattern': 'SM-A256B' },
      { 'label': 'Samsung', 'pattern': 'SM-A156U' },
      { 'label': 'Samsung', 'pattern': 'SM-A156B' },
      { 'label': 'Samsung', 'pattern': 'SM-A155F' },
      { 'label': 'Samsung', 'pattern': 'SM-A145R' },
      { 'label': 'Samsung', 'pattern': 'SM-A135U' },
      { 'label': 'Samsung', 'pattern': 'SM-A055F' },
      { 'label': 'Samsung', 'pattern': 'SM-S134DL' },
      { 'label': 'Samsung', 'pattern': 'SM-N986U' },
      { 'label': 'Samsung', 'pattern': 'SM-N981U' },
      { 'label': 'Samsung', 'pattern': 'SM-G988U' },
      { 'label': 'Samsung', 'pattern': 'SM-G986U' },
      { 'label': 'Samsung', 'pattern': 'SM-G981U' },
      { 'label': 'Samsung', 'pattern': 'SM-G781U' },
      { 'label': 'Samsung', 'pattern': 'SM-G7810' },
      { 'label': 'Samsung', 'pattern': 'SM-G525F' },
      { 'label': 'Samsung', 'pattern': 'SM-F707B' },
      { 'label': 'Samsung', 'pattern': 'SM-F700F' },
      { 'label': 'Samsung', 'pattern': 'SM-A426U' },
      { 'label': 'Samsung', 'pattern': 'SM-A326U' },
      { 'label': 'Samsung', 'pattern': 'SM-A057G' },
      { 'label': 'Samsung', 'pattern': 'SM-A055M' },
      { 'label': 'Samsung', 'pattern': 'SM-A037U' },
      { 'label': 'Samsung', 'pattern': 'SM-A035G' },
      { 'label': 'Honor', 'pattern': 'BVL-N49' },
      { 'label': 'OnePlus', 'pattern': 'CPH2551' },
      { 'label': 'Vivo', 'pattern': 'V2202' },
      { 'label': 'Xiaomi', 'pattern': '23127PN0CG' },
      { 'label': 'Xiaomi', 'pattern': '23049PCD8G' },
      { 'label': 'Xiaomi', 'pattern': '23013PC75G' },
      { 'label': 'Xiaomi', 'pattern': '22111317PI' },
      { 'label': 'Xiaomi', 'pattern': '2311DRK48G' },
      { 'label': 'Xiaomi', 'pattern': '23053RN02L' },
      { 'label': 'Xiaomi', 'pattern': '22120RN86G' },
      { 'label': 'Xiaomi', 'pattern': '2303ERA42L' },
      { 'label': 'Honor', 'pattern': 'VER-N49' },
      { 'label': 'Honor', 'pattern': 'ANY-LX1' },
      { 'label': 'Honor', 'pattern': 'RMO-NX3' },
      { 'label': 'Honor', 'pattern': 'CLK-LX1' },
      { 'label': 'Honor', 'pattern': 'LLY-LX1' },
      { 'label': 'Honor', 'pattern': 'ANY-LX2' },
      { 'label': 'Honor', 'pattern': 'ALI-NX1' },
      { 'label': 'Infinix', 'pattern': 'Infinix X6739' },
      { 'label': 'Motorola', 'pattern': 'motorola edge plus (2022)' },
      { 'label': 'Motorola', 'pattern': 'motorola edge plus 5G UW (2022)' },
      { 'label': 'Motorola', 'pattern': 'moto g 5G (2022)' },
      { 'label': 'Motorola', 'pattern': 'moto g 5G - 2023' },
      { 'label': 'Motorola', 'pattern': 'moto g stylus (2023)' },
      { 'label': 'Motorola', 'pattern': 'moto g stylus 5G (2022)' },
      { 'label': 'Motorola', 'pattern': 'moto g72' },
      { 'label': 'Nokia', 'pattern': 'Nokia C22' },
      { 'label': 'Nokia', 'pattern': 'Nokia C32' },
      { 'label': 'Nokia', 'pattern': 'Nokia G310 5G' },
      { 'label': 'OnePlus', 'pattern': 'LE2117' },
      { 'label': 'OnePlus', 'pattern': 'CPH2515' },
      { 'label': 'OPPO', 'pattern': 'CPH2557' },
      { 'label': 'Realme', 'pattern': 'RMX3780' },
      { 'label': 'Vivo', 'pattern': 'V2248' },
      { 'label': 'Xiaomi', 'pattern': '2310FPCA4G' },
      { 'label': 'Xiaomi', 'pattern': '22021211RG' },
      { 'label': 'Xiaomi', 'pattern': '22041219PG' },
      { 'label': 'Xiaomi', 'pattern': '2201117PG' },
      { 'label': 'Xiaomi', 'pattern': '2207117BPG' },
      { 'label': 'Xiaomi', 'pattern': '2312FPCA6G' },
      { 'label': 'Xiaomi', 'pattern': 'M2102J20SG' },
      { 'label': 'Xiaomi', 'pattern': '2201116PG' },
      { 'label': 'Xiaomi', 'pattern': '22101320G' },
      { 'label': 'Xiaomi', 'pattern': '23122PCD1G' },
      { 'label': 'Xiaomi', 'pattern': '21121119SG' },
      { 'label': 'Xiaomi', 'pattern': '22041219NY' },
      { 'label': 'Xiaomi', 'pattern': '220333QAG' },
      { 'label': 'Xiaomi', 'pattern': '23026RN54G' },
      { 'label': 'Xiaomi', 'pattern': '23028RN4DG' },
      { 'label': 'Xiaomi', 'pattern': '23028RNCAG' },
      { 'label': 'Xiaomi', 'pattern': '2201117TL' },
      { 'label': 'Xiaomi', 'pattern': '2201116TI' },
      { 'label': 'Xiaomi', 'pattern': '23124RA7EO' },
      { 'label': 'Xiaomi', 'pattern': '2312DRA50G' },
      { 'label': 'Xiaomi', 'pattern': '23117RA68G' },
      { 'label': 'Xiaomi', 'pattern': '23090RA98G' },
      { 'label': 'ZTE', 'pattern': 'ZTE 8150N' },
      { 'label': 'ZTE', 'pattern': 'NX713J' },
      { 'label': 'Honor', 'pattern': 'CRT-LX1' },
      { 'label': 'Honor', 'pattern': 'RBN-NX1' },
      { 'label': 'Honor', 'pattern': 'VNE-LX1' },
      { 'label': 'Honor', 'pattern': 'RKY-LX1' },
      { 'label': 'Honor', 'pattern': 'VNE-N41' },
      { 'label': 'Infinix', 'pattern': 'Infinix X669C' },
      { 'label': 'Infinix', 'pattern': 'Infinix X6515' },
      { 'label': 'Motorola', 'pattern': 'moto g(60)s' },
      { 'label': 'Motorola', 'pattern': 'moto e22' },
      { 'label': 'Motorola', 'pattern': 'moto e22i' },
      { 'label': 'Motorola', 'pattern': 'moto e32(s)' },
      { 'label': 'Motorola', 'pattern': 'moto g play - 2023' },
      { 'label': 'Motorola', 'pattern': 'moto g power (2022)' },
      { 'label': 'Motorola', 'pattern': 'moto g pure' },
      { 'label': 'Motorola', 'pattern': 'moto g stylus (2022)' },
      { 'label': 'Motorola', 'pattern': 'moto g31' },
      { 'label': 'Motorola', 'pattern': 'moto g31(w)' },
      { 'label': 'Motorola', 'pattern': 'moto g41' },
      { 'label': 'Motorola', 'pattern': 'moto g51 5G' },
      { 'label': 'Nokia', 'pattern': 'N156DL' },
      { 'label': 'Nokia', 'pattern': 'Nokia G22' },
      { 'label': 'Nokia', 'pattern': 'Nokia G400 5G' },
      { 'label': 'OnePlus', 'pattern': 'GN2200' },
      { 'label': 'OPPO', 'pattern': 'CPH2477' },
      { 'label': 'Vivo', 'pattern': 'V2118' },
      { 'label': 'Vivo', 'pattern': 'V2204' },
      { 'label': 'Xiaomi', 'pattern': '22041216G' },
      { 'label': 'Xiaomi', 'pattern': '21061119DG' },
      { 'label': 'Xiaomi', 'pattern': '220333QNY' },
      { 'label': 'Xiaomi', 'pattern': '220733SG' },
      { 'label': 'Xiaomi', 'pattern': '22101317C' },
      { 'label': 'Xiaomi', 'pattern': '22111317PG' },
      { 'label': 'Xiaomi', 'pattern': '23028RA60L' },
      { 'label': 'Honor', 'pattern': 'NTN-L22' },
      { 'label': 'Infinix', 'pattern': 'Infinix X6831' },
      { 'label': 'Infinix', 'pattern': 'Infinix X671B' },
      { 'label': 'Infinix', 'pattern': 'Infinix X6833B' },
      { 'label': 'Infinix', 'pattern': 'Infinix X6711' },
      { 'label': 'Motorola', 'pattern': 'motorola razr plus 2023' },
      { 'label': 'Nokia', 'pattern': 'Nokia C210' },
      { 'label': 'OnePlus', 'pattern': 'NE2217' },
      { 'label': 'OPPO', 'pattern': 'CPH2505' },
      { 'label': 'Xiaomi', 'pattern': '22071219CG' },
      { 'label': 'Xiaomi', 'pattern': '21061110AG' },
      { 'label': 'Motorola', 'pattern': 'moto g stylus 5G' },
      { 'label': 'Nokia', 'pattern': 'N152DL' },
      { 'label': 'Nokia', 'pattern': 'Nokia C300' },
      { 'label': 'Realme', 'pattern': 'RMX3690' },
      { 'label': 'Tecno', 'pattern': 'TECNO LG6n' },
      { 'label': 'Xiaomi', 'pattern': '220733SPI' },
      { 'label': 'Xiaomi', 'pattern': '21061119AG' },
      { 'label': 'Xiaomi', 'pattern': 'M2010J19SY' },
      { 'label': 'Xiaomi', 'pattern': 'M2104K10AC' },
      { 'label': 'ZTE', 'pattern': 'ZTE A2022PG' },
      { 'label': 'ZTE', 'pattern': 'ZTE A7050' },
      { 'label': 'Samsung', 'pattern': 'SM-X610' },
      { 'label': 'Samsung', 'pattern': 'SM-X510' },
      { 'label': 'Samsung', 'pattern': 'SM-X210' },
      { 'label': 'Apple', 'pattern': 'iPhone' },
      { 'label': 'Apple', 'pattern': 'iPad' },
      { 'label': 'Mac OS X', 'pattern': 'Mac OS X 10_15_7' },
    ]);

    /* Detectable operating systems (order is important). */
    var os = getOS([
      'Windows Phone',
      'KaiOS',
      'Android',
      'CentOS',
      { 'label': 'Chrome OS', 'pattern': 'CrOS' },
      'Debian',
      { 'label': 'DragonFly BSD', 'pattern': 'DragonFly' },
      'Fedora',
      'FreeBSD',
      'Gentoo',
      'Haiku',
      'Kubuntu',
      'Linux Mint',
      'OpenBSD',
      'Red Hat',
      'SuSE',
      'Ubuntu',
      'Xubuntu',
      'Cygwin',
      'Symbian OS',
      'hpwOS',
      'webOS ',
      'webOS',
      'Tablet OS',
      'Tizen',
      'Linux',
      'Mac OS X',
      'Macintosh',
      'Mac',
      'Windows 98;',
      'Windows '
    ]);

    /*------------------------------------------------------------------------*/

    /**
     * Picks the layout engine from an array of guesses.
     *
     * @private
     * @param {Array} guesses An array of guesses.
     * @returns {null|string} The detected layout engine.
     */
    function getLayout(guesses) {
      return reduce(guesses, function(result, guess) {
        return result || RegExp('\\b' + (
          guess.pattern || qualify(guess)
        ) + '\\b', 'i').exec(ua) && (guess.label || guess);
      });
    }

    /**
     * Picks the manufacturer from an array of guesses.
     *
     * @private
     * @param {Array} guesses An object of guesses.
     * @returns {null|string} The detected manufacturer.
     */
    function getManufacturer(guesses) {
      return reduce(guesses, function(result, value, key) {
        // Lookup the manufacturer by product or scan the UA for the manufacturer.
        return result || (
          value[product] ||
          value[/^[a-z]+(?: +[a-z]+\b)*/i.exec(product)] ||
          RegExp('\\b' + qualify(key) + '(?:\\b|\\w*\\d)', 'i').exec(ua)
        ) && key;
      });
    }

    /**
     * Picks the browser name from an array of guesses.
     *
     * @private
     * @param {Array} guesses An array of guesses.
     * @returns {null|string} The detected browser name.
     */
    function getName(guesses) {
      return reduce(guesses, function(result, guess) {
        return result || RegExp('\\b' + (
          guess.pattern || qualify(guess)
        ) + '\\b', 'i').exec(ua) && (guess.label || guess);
      });
    }

    /**
     * Picks the OS name from an array of guesses.
     *
     * @private
     * @param {Array} guesses An array of guesses.
     * @returns {null|string} The detected OS name.
     */
    function getOS(guesses) {
      return reduce(guesses, function(result, guess) {
        var pattern = guess.pattern || qualify(guess);
        if (!result && (result =
              RegExp('\\b' + pattern + '(?:/[\\d.]+|[ \\w.]*)', 'i').exec(ua)
            )) {
          result = cleanupOS(result, pattern, guess.label || guess);
        }
        return result;
      });
    }

    /**
     * Picks the product name from an array of guesses.
     *
     * @private
     * @param {Array} guesses An array of guesses.
     * @returns {null|string} The detected product name.
     */
    function getProduct(guesses) {
      return reduce(guesses, function(result, guess) {
        var pattern = guess.pattern || qualify(guess);
        if (!result && (result =
              RegExp('\\b' + pattern + ' *\\d+[.\\w_]*', 'i').exec(ua) ||
              RegExp('\\b' + pattern + ' *\\w+-[\\w]*', 'i').exec(ua) ||
              RegExp('\\b' + pattern + '(?:; *(?:[a-z]+[_-])?[a-z]+\\d+|[^ ();-]*)', 'i').exec(ua)
            )) {
          // Split by forward slash and append product version if needed.
          if ((result = String((guess.label && !RegExp(pattern, 'i').test(guess.label)) ? guess.label : result).split('/'))[1] && !/[\d.]+/.test(result[0])) {
            result[0] += ' ' + result[1];
          }
          // Correct character case and cleanup string.
          guess = guess.label || guess;
          result = format(result[0]
            .replace(RegExp(pattern, 'i'), guess)
            .replace(RegExp('; *(?:' + guess + '[_-])?', 'i'), ' ')
            .replace(RegExp('(' + guess + ')[-_.]?(\\w)', 'i'), '$1 $2'));
        }
        return result;
      });
    }

    /**
     * Resolves the version using an array of UA patterns.
     *
     * @private
     * @param {Array} patterns An array of UA patterns.
     * @returns {null|string} The detected version.
     */
    function getVersion(patterns) {
      return reduce(patterns, function(result, pattern) {
        return result || (RegExp(pattern +
          '(?:-[\\d.]+/|(?: for [\\w-]+)?[ /-])([\\d.]+[^ ();/_-]*)', 'i').exec(ua) || 0)[1] || null;
      });
    }

    /**
     * Returns `platform.description` when the platform object is coerced to a string.
     *
     * @name toString
     * @memberOf platform
     * @returns {string} Returns `platform.description` if available, else an empty string.
     */
    function toStringPlatform() {
      return this.description || '';
    }

    /*------------------------------------------------------------------------*/

    // Convert layout to an array so we can add extra details.
    layout && (layout = [layout]);

    // Detect Android products.
    // Browsers on Android devices typically provide their product IDS after "Android;"
    // up to "Build" or ") AppleWebKit".
    // Example:
    // "Mozilla/5.0 (Linux; Android 8.1.0; Moto G (5) Plus) AppleWebKit/537.36
    // (KHTML, like Gecko) Chrome/70.0.3538.80 Mobile Safari/537.36"
    if (/\bAndroid\b/.test(os) && !product &&
        (data = /\bAndroid[^;]*;(.*?)(?:Build|\) AppleWebKit)\b/i.exec(ua))) {
      product = trim(data[1])
        // Replace any language codes (eg. "en-US").
        .replace(/^[a-z]{2}-[a-z]{2};\s*/i, '')
        || null;
    }
    // Detect product names that contain their manufacturer's name.
    if (manufacturer && !product) {
      product = getProduct([manufacturer]);
    } else if (manufacturer && product) {
      product = product
        .replace(RegExp('^(' + qualify(manufacturer) + ')[-_.\\s]', 'i'), manufacturer + ' ')
        .replace(RegExp('^(' + qualify(manufacturer) + ')[-_.]?(\\w)', 'i'), manufacturer + ' $2');
    }
    // Clean up Google TV.
    if ((data = /\bGoogle TV\b/.exec(product))) {
      product = data[0];
    }
    // Detect simulators.
    if (/\bSimulator\b/i.test(ua)) {
      product = (product ? product + ' ' : '') + 'Simulator';
    }
    // Detect Opera Mini 8+ running in Turbo/Uncompressed mode on iOS.
    if (name == 'Opera Mini' && /\bOPiOS\b/.test(ua)) {
      description.push('running in Turbo/Uncompressed mode');
    }
    // Detect IE Mobile 11.
    if (name == 'IE' && /\blike iPhone OS\b/.test(ua)) {
      data = parse(ua.replace(/like iPhone OS/, ''));
      manufacturer = data.manufacturer;
      product = data.product;
    }
    // Detect iOS.
    else if (/^iP/.test(product)) {
      name || (name = 'Safari');
      os = 'iOS' + ((data = / OS ([\d_]+)/i.exec(ua))
        ? ' ' + data[1].replace(/_/g, '.')
        : '');
    }
    // Detect Kubuntu.
    else if (name == 'Konqueror' && /^Linux\b/i.test(os)) {
      os = 'Kubuntu';
    }
    // Detect Android browsers.
    else if ((manufacturer && manufacturer != 'Google' &&
        ((/Chrome/.test(name) && !/\bMobile Safari\b/i.test(ua)) || /\bVita\b/.test(product))) ||
        (/\bAndroid\b/.test(os) && /^Chrome/.test(name) && /\bVersion\//i.test(ua))) {
      name = 'Android Browser';
      os = /\bAndroid\b/.test(os) ? os : 'Android';
    }
    // Detect Silk desktop/accelerated modes.
    else if (name == 'Silk') {
      if (!/\bMobi/i.test(ua)) {
        os = 'Android';
        description.unshift('desktop mode');
      }
      if (/Accelerated *= *true/i.test(ua)) {
        description.unshift('accelerated');
      }
    }
    // Detect UC Browser speed mode.
    else if (name == 'UC Browser' && /\bUCWEB\b/.test(ua)) {
      description.push('speed mode');
    }
    // Detect PaleMoon identifying as Firefox.
    else if (name == 'PaleMoon' && (data = /\bFirefox\/([\d.]+)\b/.exec(ua))) {
      description.push('identifying as Firefox ' + data[1]);
    }
    // Detect Firefox OS and products running Firefox.
    else if (name == 'Firefox' && (data = /\b(Mobile|Tablet|TV)\b/i.exec(ua))) {
      os || (os = 'Firefox OS');
      product || (product = data[1]);
    }
    // Detect false positives for Firefox/Safari.
    else if (!name || (data = !/\bMinefield\b/i.test(ua) && /\b(?:Firefox|Safari)\b/.exec(name))) {
      // Escape the `/` for Firefox 1.
      if (name && !product && /[\/,]|^[^(]+?\)/.test(ua.slice(ua.indexOf(data + '/') + 8))) {
        // Clear name of false positives.
        name = null;
      }
      // Reassign a generic name.
      if ((data = product || manufacturer || os) &&
          (product || manufacturer || /\b(?:Android|Symbian OS|Tablet OS|webOS)\b/.test(os))) {
        name = /[a-z]+(?: Hat)?/i.exec(/\bAndroid\b/.test(os) ? os : data) + ' Browser';
      }
    }
    // Add Chrome version to description for Electron.
    else if (name == 'Electron' && (data = (/\bChrome\/([\d.]+)\b/.exec(ua) || 0)[1])) {
      description.push('Chromium ' + data);
    }
    // Detect non-Opera (Presto-based) versions (order is important).
    if (!version) {
      version = getVersion([
        '(?:Cloud9|CriOS|CrMo|Edge|Edg|EdgA|EdgiOS|FxiOS|HeadlessChrome|IEMobile|Iron|Opera ?Mini|OPiOS|OPR|Raven|SamsungBrowser|Silk(?!/[\\d.]+$)|UCBrowser|YaBrowser)',
        'Version',
        qualify(name),
        '(?:Firefox|Minefield|NetFront)'
      ]);
    }
    // Detect stubborn layout engines.
    if ((data =
          layout == 'iCab' && parseFloat(version) > 3 && 'WebKit' ||
          /\bOpera\b/.test(name) && (/\bOPR\b/.test(ua) ? 'Blink' : 'Presto') ||
          /\b(?:Midori|Nook|Safari)\b/i.test(ua) && !/^(?:Trident|EdgeHTML)$/.test(layout) && 'WebKit' ||
          !layout && /\bMSIE\b/i.test(ua) && (os == 'Mac OS' ? 'Tasman' : 'Trident') ||
          layout == 'WebKit' && /\bPlayStation\b(?! Vita\b)/i.test(name) && 'NetFront'
        )) {
      layout = [data];
    }
    // Detect Windows Phone 7 desktop mode.
    if (name == 'IE' && (data = (/; *(?:XBLWP|ZuneWP)(\d+)/i.exec(ua) || 0)[1])) {
      name += ' Mobile';
      os = 'Windows Phone ' + (/\+$/.test(data) ? data : data + '.x');
      description.unshift('desktop mode');
    }
    // Detect Windows Phone 8.x desktop mode.
    else if (/\bWPDesktop\b/i.test(ua)) {
      name = 'IE Mobile';
      os = 'Windows Phone 8.x';
      description.unshift('desktop mode');
      version || (version = (/\brv:([\d.]+)/.exec(ua) || 0)[1]);
    }
    // Detect IE 11 identifying as other browsers.
    else if (name != 'IE' && layout == 'Trident' && (data = /\brv:([\d.]+)/.exec(ua))) {
      if (name) {
        description.push('identifying as ' + name + (version ? ' ' + version : ''));
      }
      name = 'IE';
      version = data[1];
    }
    // Leverage environment features.
    if (useFeatures) {
      // Detect server-side environments.
      // Rhino has a global function while others have a global object.
      if (isHostType(context, 'global')) {
        if (java) {
          data = java.lang.System;
          arch = data.getProperty('os.arch');
          os = os || data.getProperty('os.name') + ' ' + data.getProperty('os.version');
        }
        if (rhino) {
          try {
            version = context.require('ringo/engine').version.join('.');
            name = 'RingoJS';
          } catch(e) {
            if ((data = context.system) && data.global.system == context.system) {
              name = 'Narwhal';
              os || (os = data[0].os || null);
            }
          }
          if (!name) {
            name = 'Rhino';
          }
        }
        else if (
          typeof context.process == 'object' && !context.process.browser &&
          (data = context.process)
        ) {
          if (typeof data.versions == 'object') {
            if (typeof data.versions.electron == 'string') {
              description.push('Node ' + data.versions.node);
              name = 'Electron';
              version = data.versions.electron;
            } else if (typeof data.versions.nw == 'string') {
              description.push('Chromium ' + version, 'Node ' + data.versions.node);
              name = 'NW.js';
              version = data.versions.nw;
            }
          }
          if (!name) {
            name = 'Node.js';
            arch = data.arch;
            os = data.platform;
            version = /[\d.]+/.exec(data.version);
            version = version ? version[0] : null;
          }
        }
      }
      // Detect Adobe AIR.
      else if (getClassOf((data = context.runtime)) == airRuntimeClass) {
        name = 'Adobe AIR';
        os = data.flash.system.Capabilities.os;
      }
      // Detect PhantomJS.
      else if (getClassOf((data = context.phantom)) == phantomClass) {
        name = 'PhantomJS';
        version = (data = data.version || null) && (data.major + '.' + data.minor + '.' + data.patch);
      }
      // Detect IE compatibility modes.
      else if (typeof doc.documentMode == 'number' && (data = /\bTrident\/(\d+)/i.exec(ua))) {
        // We're in compatibility mode when the Trident version + 4 doesn't
        // equal the document mode.
        version = [version, doc.documentMode];
        if ((data = +data[1] + 4) != version[1]) {
          description.push('IE ' + version[1] + ' mode');
          layout && (layout[1] = '');
          version[1] = data;
        }
        version = name == 'IE' ? String(version[1].toFixed(1)) : version[0];
      }
      // Detect IE 11 masking as other browsers.
      else if (typeof doc.documentMode == 'number' && /^(?:Chrome|Firefox)\b/.test(name)) {
        description.push('masking as ' + name + ' ' + version);
        name = 'IE';
        version = '11.0';
        layout = ['Trident'];
        os = 'Windows';
      }
      os = os && format(os);
    }
    // Detect prerelease phases.
    if (version && (data =
          /(?:[ab]|dp|pre|[ab]\d+pre)(?:\d+\+?)?$/i.exec(version) ||
          /(?:alpha|beta)(?: ?\d)?/i.exec(ua + ';' + (useFeatures && nav.appMinorVersion)) ||
          /\bMinefield\b/i.test(ua) && 'a'
        )) {
      prerelease = /b/i.test(data) ? 'beta' : 'alpha';
      version = version.replace(RegExp(data + '\\+?$'), '') +
        (prerelease == 'beta' ? beta : alpha) + (/\d+\+?/.exec(data) || '');
    }
    // Detect Firefox Mobile.
    if (name == 'Fennec' || name == 'Firefox' && /\b(?:Android|Firefox OS|KaiOS)\b/.test(os)) {
      name = 'Firefox Mobile';
    }
    // Obscure Maxthon's unreliable version.
    else if (name == 'Maxthon' && version) {
      version = version.replace(/\.[\d.]+/, '.x');
    }
    // Detect Xbox 360 and Xbox One.
    else if (/\bXbox\b/i.test(product)) {
      if (product == 'Xbox 360') {
        os = null;
      }
      if (product == 'Xbox 360' && /\bIEMobile\b/.test(ua)) {
        description.unshift('mobile mode');
      }
    }
    // Add mobile postfix.
    else if ((/^(?:Chrome|IE|Opera)$/.test(name) || name && !product && !/Browser|Mobi/.test(name)) &&
        (os == 'Windows CE' || /Mobi/i.test(ua))) {
      name += ' Mobile';
    }
    // Detect IE platform preview.
    else if (name == 'IE' && useFeatures) {
      try {
        if (context.external === null) {
          description.unshift('platform preview');
        }
      } catch(e) {
        description.unshift('embedded');
      }
    }
    // Detect BlackBerry OS version.
    // http://docs.blackberry.com/en/developers/deliverables/18169/HTTP_headers_sent_by_BB_Browser_1234911_11.jsp
    else if ((/\bBlackBerry\b/.test(product) || /\bBB10\b/.test(ua)) && (data =
          (RegExp(product.replace(/ +/g, ' *') + '/([.\\d]+)', 'i').exec(ua) || 0)[1] ||
          version
        )) {
      data = [data, /BB10/.test(ua)];
      os = (data[1] ? (product = null, manufacturer = 'BlackBerry') : 'Device Software') + ' ' + data[0];
      version = null;
    }
    // Detect Opera identifying/masking itself as another browser.
    // http://www.opera.com/support/kb/view/843/
    else if (this != forOwn && product != 'Wii' && (
          (useFeatures && opera) ||
          (/Opera/.test(name) && /\b(?:MSIE|Firefox)\b/i.test(ua)) ||
          (name == 'Firefox' && /\bOS X (?:\d+\.){2,}/.test(os)) ||
          (name == 'IE' && (
            (os && !/^Win/.test(os) && version > 5.5) ||
            /\bWindows XP\b/.test(os) && version > 8 ||
            version == 8 && !/\bTrident\b/.test(ua)
          ))
        ) && !reOpera.test((data = parse.call(forOwn, ua.replace(reOpera, '') + ';'))) && data.name) {
      // When "identifying", the UA contains both Opera and the other browser's name.
      data = 'ing as ' + data.name + ((data = data.version) ? ' ' + data : '');
      if (reOpera.test(name)) {
        if (/\bIE\b/.test(data) && os == 'Mac OS') {
          os = null;
        }
        data = 'identify' + data;
      }
      // When "masking", the UA contains only the other browser's name.
      else {
        data = 'mask' + data;
        if (operaClass) {
          name = format(operaClass.replace(/([a-z])([A-Z])/g, '$1 $2'));
        } else {
          name = 'Opera';
        }
        if (/\bIE\b/.test(data)) {
          os = null;
        }
        if (!useFeatures) {
          version = null;
        }
      }
      layout = ['Presto'];
      description.push(data);
    }
    // Detect WebKit Nightly and approximate Chrome/Safari versions.
    if ((data = (/\bAppleWebKit\/([\d.]+\+?)/i.exec(ua) || 0)[1])) {
      // Correct build number for numeric comparison.
      // (e.g. "532.5" becomes "532.05")
      data = [parseFloat(data.replace(/\.(\d)$/, '.0$1')), data];
      // Nightly builds are postfixed with a "+".
      if (name == 'Safari' && data[1].slice(-1) == '+') {
        name = 'WebKit Nightly';
        prerelease = 'alpha';
        version = data[1].slice(0, -1);
      }
      // Clear incorrect browser versions.
      else if (version == data[1] ||
          version == (data[2] = (/\bSafari\/([\d.]+\+?)/i.exec(ua) || 0)[1])) {
        version = null;
      }
      // Use the full Chrome version when available.
      data[1] = (/\b(?:Headless)?Chrome\/([\d.]+)/i.exec(ua) || 0)[1];
      // Detect Blink layout engine.
      if (data[0] == 537.36 && data[2] == 537.36 && parseFloat(data[1]) >= 28 && layout == 'WebKit') {
        layout = ['Blink'];
      }
      // Detect JavaScriptCore.
      // http://stackoverflow.com/questions/6768474/how-can-i-detect-which-javascript-engine-v8-or-jsc-is-used-at-runtime-in-androi
      if (!useFeatures || (!likeChrome && !data[1])) {
        layout && (layout[1] = 'like Safari');
        data = (data = data[0], data < 400 ? 1 : data < 500 ? 2 : data < 526 ? 3 : data < 533 ? 4 : data < 534 ? '4+' : data < 535 ? 5 : data < 537 ? 6 : data < 538 ? 7 : data < 601 ? 8 : data < 602 ? 9 : data < 604 ? 10 : data < 606 ? 11 : data < 608 ? 12 : '12');
      } else {
        layout && (layout[1] = 'like Chrome');
        data = data[1] || (data = data[0], data < 530 ? 1 : data < 532 ? 2 : data < 532.05 ? 3 : data < 533 ? 4 : data < 534.03 ? 5 : data < 534.07 ? 6 : data < 534.10 ? 7 : data < 534.13 ? 8 : data < 534.16 ? 9 : data < 534.24 ? 10 : data < 534.30 ? 11 : data < 535.01 ? 12 : data < 535.02 ? '13+' : data < 535.07 ? 15 : data < 535.11 ? 16 : data < 535.19 ? 17 : data < 536.05 ? 18 : data < 536.10 ? 19 : data < 537.01 ? 20 : data < 537.11 ? '21+' : data < 537.13 ? 23 : data < 537.18 ? 24 : data < 537.24 ? 25 : data < 537.36 ? 26 : layout != 'Blink' ? '27' : '28');
      }
      // Add the postfix of ".x" or "+" for approximate versions.
      layout && (layout[1] += ' ' + (data += typeof data == 'number' ? '.x' : /[.+]/.test(data) ? '' : '+'));
      // Obscure version for some Safari 1-2 releases.
      if (name == 'Safari' && (!version || parseInt(version) > 45)) {
        version = data;
      } else if (name == 'Chrome' && /\bHeadlessChrome/i.test(ua)) {
        description.unshift('headless');
      }
    }
    // Detect Opera desktop modes.
    if (name == 'Opera' &&  (data = /\bzbov|zvav$/.exec(os))) {
      name += ' ';
      description.unshift('desktop mode');
      if (data == 'zvav') {
        name += 'Mini';
        version = null;
      } else {
        name += 'Mobile';
      }
      os = os.replace(RegExp(' *' + data + '$'), '');
    }
    // Detect Chrome desktop mode.
    else if (name == 'Safari' && /\bChrome\b/.exec(layout && layout[1])) {
      description.unshift('desktop mode');
      name = 'Chrome Mobile';
      version = null;

      if (/\bOS X\b/.test(os)) {
        manufacturer = 'Apple';
        os = 'iOS 4.3+';
      } else {
        os = null;
      }
    }
    // Newer versions of SRWare Iron uses the Chrome tag to indicate its version number.
    else if (/\bSRWare Iron\b/.test(name) && !version) {
      version = getVersion('Chrome');
    }
    // Strip incorrect OS versions.
    if (version && version.indexOf((data = /[\d.]+$/.exec(os))) == 0 &&
        ua.indexOf('/' + data + '-') > -1) {
      os = trim(os.replace(data, ''));
    }
    // Ensure OS does not include the browser name.
    if (os && os.indexOf(name) != -1 && !RegExp(name + ' OS').test(os)) {
      os = os.replace(RegExp(' *' + qualify(name) + ' *'), '');
    }
    // Add layout engine.
    if (layout && !/\b(?:Avant|Nook)\b/.test(name) && (
        /Browser|Lunascape|Maxthon/.test(name) ||
        name != 'Safari' && /^iOS/.test(os) && /\bSafari\b/.test(layout[1]) ||
        /^(?:Adobe|Arora|Breach|Midori|Opera|Phantom|Rekonq|Rock|Samsung Internet|Sleipnir|SRWare Iron|Vivaldi|Web)/.test(name) && layout[1])) {
      // Don't add layout details to description if they are falsey.
      (data = layout[layout.length - 1]) && description.push(data);
    }
    // Combine contextual information.
    if (description.length) {
      description = ['(' + description.join('; ') + ')'];
    }
    // Append manufacturer to description.
    if (manufacturer && product && product.indexOf(manufacturer) < 0) {
      description.push('on ' + manufacturer);
    }
    // Append product to description.
    if (product) {
      description.push((/^on /.test(description[description.length - 1]) ? '' : 'on ') + product);
    }
    // Parse the OS into an object.
    if (os) {
      data = / ([\d.+]+)$/.exec(os);
      isSpecialCasedOS = data && os.charAt(os.length - data[0].length - 1) == '/';
      os = {
        'architecture': 32,
        'family': (data && !isSpecialCasedOS) ? os.replace(data[0], '') : os,
        'version': data ? data[1] : null,
        'toString': function() {
          var version = this.version;
          return this.family + ((version && !isSpecialCasedOS) ? ' ' + version : '') + (this.architecture == 64 ? ' 64-bit' : '');
        }
      };
    }
    // Add browser/OS architecture.
    if ((data = /\b(?:AMD|IA|Win|WOW|x86_|x)64\b/i.exec(arch)) && !/\bi686\b/i.test(arch)) {
      if (os) {
        os.architecture = 64;
        os.family = os.family.replace(RegExp(' *' + data), '');
      }
      if (
          name && (/\bWOW64\b/i.test(ua) ||
          (useFeatures && /\w(?:86|32)$/.test(nav.cpuClass || nav.platform) && !/\bWin64; x64\b/i.test(ua)))
      ) {
        description.unshift('32-bit');
      }
    }
    // Chrome 39 and above on OS X is always 64-bit.
    else if (
        os && /^OS X/.test(os.family) &&
        name == 'Chrome' && parseFloat(version) >= 39
    ) {
      os.architecture = 64;
    }

    ua || (ua = null);

    /*------------------------------------------------------------------------*/

    /**
     * The platform object.
     *
     * @name platform
     * @type Object
     */
    var platform = {};

    /**
     * The platform description.
     *
     * @memberOf platform
     * @type string|null
     */
    platform.description = ua;

    /**
     * The name of the browser's layout engine.
     *
     * The list of common layout engines include:
     * "Blink", "EdgeHTML", "Gecko", "Trident" and "WebKit"
     *
     * @memberOf platform
     * @type string|null
     */
    platform.layout = layout && layout[0];

    /**
     * The name of the product's manufacturer.
     *
     * The list of manufacturers include:
     * "Apple", "Archos", "Amazon", "Asus", "Barnes & Noble", "BlackBerry",
     * "Google", "HP", "HTC", "LG", "Microsoft", "Motorola", "Nintendo",
     * "Nokia", "Samsung" and "Sony"
     *
     * @memberOf platform
     * @type string|null
     */
    platform.manufacturer = manufacturer;

    /**
     * The name of the browser/environment.
     *
     * The list of common browser names include:
     * "Chrome", "Electron", "Firefox", "Firefox for iOS", "IE",
     * "Microsoft Edge", "PhantomJS", "Safari", "SeaMonkey", "Silk",
     * "Opera Mini" and "Opera"
     *
     * Mobile versions of some browsers have "Mobile" appended to their name:
     * eg. "Chrome Mobile", "Firefox Mobile", "IE Mobile" and "Opera Mobile"
     *
     * @memberOf platform
     * @type string|null
     */
    platform.name = name;

    /**
     * The alpha/beta release indicator.
     *
     * @memberOf platform
     * @type string|null
     */
    platform.prerelease = prerelease;

    /**
     * The name of the product hosting the browser.
     *
     * The list of common products include:
     *
     * "BlackBerry", "Galaxy S4", "Lumia", "iPad", "iPod", "iPhone", "Kindle",
     * "Kindle Fire", "Nexus", "Nook", "PlayBook", "TouchPad" and "Transformer"
     *
     * @memberOf platform
     * @type string|null
     */
    platform.product = product;

    /**
     * The browser's user agent string.
     *
     * @memberOf platform
     * @type string|null
     */
    platform.ua = ua;

    /**
     * The browser/environment version.
     *
     * @memberOf platform
     * @type string|null
     */
    platform.version = name && version;

    /**
     * The name of the operating system.
     *
     * @memberOf platform
     * @type Object
     */
    platform.os = os || {

      /**
       * The CPU architecture the OS is built for.
       *
       * @memberOf platform.os
       * @type number|null
       */
      'architecture': null,

      /**
       * The family of the OS.
       *
       * Common values include:
       * "Windows", "Windows Server 2008 R2 / 7", "Windows Server 2008 / Vista",
       * "Windows XP", "OS X", "Linux", "Ubuntu", "Debian", "Fedora", "Red Hat",
       * "SuSE", "Android", "iOS" and "Windows Phone"
       *
       * @memberOf platform.os
       * @type string|null
       */
      'family': null,

      /**
       * The version of the OS.
       *
       * @memberOf platform.os
       * @type string|null
       */
      'version': null,

      /**
       * Returns the OS string.
       *
       * @memberOf platform.os
       * @returns {string} The OS string.
       */
      'toString': function() { return 'null'; }
    };

    platform.parse = parse;
    platform.toString = toStringPlatform;

    if (platform.version) {
      description.unshift(version);
    }
    if (platform.name) {
      description.unshift(name);
    }
    if (os && name && !(os == String(os).split(' ')[0] && (os == name.split(' ')[0] || product))) {
      description.push(product ? '(' + os + ')' : 'on ' + os);
    }
    if (description.length) {
      platform.description = description.join(' ');
    }
    return platform;
  }

  /*--------------------------------------------------------------------------*/

  // Export platform.
  var platform = parse();

  // Some AMD build optimizers, like r.js, check for condition patterns like the following:
  if (typeof define == 'function' && typeof define.amd == 'object' && define.amd) {
    // Expose platform on the global object to prevent errors when platform is
    // loaded by a script tag in the presence of an AMD loader.
    // See http://requirejs.org/docs/errors.html#mismatch for more details.
    root.platform = platform;

    // Define as an anonymous module so platform can be aliased through path mapping.
    define(function() {
      return platform;
    });
  }
  // Check for `exports` after `define` in case a build optimizer adds an `exports` object.
  else if (freeExports && freeModule) {
    // Export for CommonJS support.
    forOwn(platform, function(value, key) {
      freeExports[key] = value;
    });
  }
  else {
    // Export to the global object.
    root.platform = platform;
  }
}.call(this));
