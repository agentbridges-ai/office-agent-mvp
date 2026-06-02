(function () {
  var SOURCE = 'office-agent-frame-bridge';
  var HOST_SOURCE = 'office-agent-host';
  var BRIDGE_CHANNEL = 'office-agent-excel-bridge';
  var AGENT_PANEL_ID = 'left-panel-agent';
  var AGENT_BUTTON_ID = 'left-btn-agent';
  var AGENT_FRAME_ID = 'office-agent-native-frame';
  var NATIVE_LEFT_WIDTH_STORAGE_KEY = 'sse-mainmenu-width';
  var AGENT_LEFT_WIDTH_STORAGE_KEY = 'office-agent-left-width';
  var bridgeChannel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel(BRIDGE_CHANNEL) : null;
  var selectionCallbacksRegistered = false;
  var agentAutoOpened = false;
  var lastSelectionAddress = '';

  function post(message) {
    window.parent.postMessage(Object.assign({ source: SOURCE }, message), '*');
  }

  function channelPost(message) {
    if (!bridgeChannel) return;
    bridgeChannel.postMessage(Object.assign({ source: SOURCE }, message));
  }

  function announce(message) {
    post(message);
    channelPost(message);
  }

  function ok(result, supportLevel) {
    return {
      ok: true,
      supportLevel: supportLevel || 'supported',
      result: result || null,
    };
  }

  function fail(error, supportLevel, result) {
    return {
      ok: false,
      supportLevel: supportLevel || 'unsupported',
      error: error,
      result: result || null,
    };
  }

  function getEditor() {
    var asc = window.Asc || {};
    return asc.editor || window.editor || null;
  }

  function call(obj, names, args) {
    if (!obj) return undefined;
    for (var i = 0; i < names.length; i += 1) {
      var name = names[i];
      if (typeof obj[name] === 'function') {
        return obj[name].apply(obj, args || []);
      }
    }
    return undefined;
  }

  function hasMethod(obj, names) {
    if (!obj) return false;
    for (var i = 0; i < names.length; i += 1) {
      if (typeof obj[names[i]] === 'function') return true;
    }
    return false;
  }

  function scalar(value) {
    if (Array.isArray(value)) {
      return scalar(Array.isArray(value[0]) ? value[0][0] : value[0]);
    }
    return value;
  }

  function firstDefined(values) {
    for (var i = 0; i < values.length; i += 1) {
      if (values[i] !== undefined) return values[i];
    }
    return undefined;
  }

  function toSerializable(value) {
    if (value === undefined || value === null) return null;
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return value;
    try {
      JSON.stringify(value);
      return value;
    } catch (error) {
      return String(value);
    }
  }

  function queryValue(selector) {
    var element = document.querySelector(selector);
    if (!element) return '';
    return typeof element.value === 'string' ? element.value : element.textContent || '';
  }

  function normalizeAddress(address) {
    if (!address) return '';
    var text = String(address).trim();
    var bangIndex = text.lastIndexOf('!');
    if (bangIndex >= 0) text = text.slice(bangIndex + 1);
    return text.replace(/^'/, '').replace(/'$/, '').replace(/\$/g, '');
  }

  function readSelectionName(value) {
    if (!value) return '';
    if (typeof value === 'string') return normalizeAddress(value);
    return normalizeAddress(
      call(value, ['asc_getName'], [true]) ||
        call(value, ['asc_getName', 'getName'], []) ||
        call(value, ['asc_getAddress', 'getAddress'], []) ||
        call(value, ['asc_getSelectionName', 'getSelectionName'], []) ||
        '',
    );
  }

  function rememberSelectionName(value) {
    var address = readSelectionName(value);
    if (address) lastSelectionAddress = address;
    return address;
  }

  function getCurrentAddress() {
    return getActiveRangeAddress(getEditor()) || lastSelectionAddress || normalizeAddress(queryValue('#ce-cell-name')) || 'A1';
  }

  function getActiveRangeAddress(editor) {
    if (!editor || !hasMethod(editor, ['asc_getActiveRangeStr'])) return '';
    var referenceType = enumValue(['Asc', 'referenceType', 'A'], 0);
    var variants = [
      [referenceType, false, true],
      [referenceType, false],
      [referenceType],
      [],
    ];
    for (var i = 0; i < variants.length; i += 1) {
      var value = normalizeAddress(call(editor, ['asc_getActiveRangeStr'], variants[i]));
      if (value) return value;
    }
    return '';
  }

  function getSelectionAddress(info) {
    var editor = getEditor();
    var address =
      getActiveRangeAddress(editor) ||
      readSelectionName(info) ||
      lastSelectionAddress ||
      normalizeAddress(queryValue('#ce-cell-name')) ||
      'A1';
    lastSelectionAddress = address;
    return address;
  }

  function getSheetNames(editor) {
    var count = Number(call(editor, ['asc_getWorksheetsCount'], []) || 0);
    var names = [];
    for (var i = 0; i < count; i += 1) {
      names.push(String(call(editor, ['asc_getWorksheetName'], [i]) || 'Sheet' + (i + 1)));
    }
    return names;
  }

  function getActiveSheetName(editor) {
    var index = Number(call(editor, ['asc_getActiveWorksheetIndex'], []) || 0);
    return String(call(editor, ['asc_getWorksheetName'], [index]) || 'Sheet' + (index + 1));
  }

  function findSheetIndex(editor, sheetName) {
    if (!sheetName) return Number(call(editor, ['asc_getActiveWorksheetIndex'], []) || 0);
    var normalized = String(sheetName).toLowerCase();
    var names = getSheetNames(editor);
    for (var i = 0; i < names.length; i += 1) {
      if (names[i].toLowerCase() === normalized) return i;
    }
    return -1;
  }

  function activateSheet(editor, sheetName) {
    if (!sheetName) return true;
    var index = findSheetIndex(editor, sheetName);
    if (index < 0) return false;
    call(editor, ['asc_showWorksheet'], [index]);
    return true;
  }

  function selectTarget(editor, target) {
    target = target || {};
    if (target.sheetName && !activateSheet(editor, target.sheetName)) {
      throw new Error('Worksheet not found: ' + target.sheetName);
    }
    var address = normalizeAddress(target.address);
    if (!address) return getCurrentAddress();
    call(editor, ['asc_closeCellEditor'], [true]);
    call(editor, ['asc_findCell'], [address]);
    lastSelectionAddress = address;
    return address;
  }

  function makeTextOptions(delimiter) {
    var asc = window.Asc || {};
    if (typeof asc.asc_CTextOptions !== 'function') return null;
    var options = new asc.asc_CTextOptions(46, delimiter || 1, null);
    call(options, ['asc_setNumberDecimalSeparator'], ['.']);
    call(options, ['asc_setNumberGroupSeparator'], [',']);
    call(options, ['asc_setTextQualifier'], ['"']);
    return options;
  }

  function stringifyCell(value) {
    if (value === undefined || value === null) return '';
    var text = typeof value === 'object' ? JSON.stringify(value) : String(value);
    if (/["\t\n\r]/.test(text)) return '"' + text.replace(/"/g, '""') + '"';
    return text;
  }

  function matrixToTsv(value) {
    if (!Array.isArray(value)) return stringifyCell(value);
    if (!Array.isArray(value[0])) return value.map(stringifyCell).join('\t');
    return value
      .map(function (row) {
        return row.map(stringifyCell).join('\t');
      })
      .join('\n');
  }

  function writeDelimitedText(editor, address, value) {
    var options = makeTextOptions(1);
    if (options && hasMethod(editor, ['asc_TextToColumns'])) {
      call(editor, ['asc_TextToColumns'], [options, matrixToTsv(value), address || getCurrentAddress()]);
      return true;
    }

    var input = document.querySelector('#ce-cell-content');
    if (!input) return false;
    input.focus();
    input.value = matrixToTsv(value);
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter', keyCode: 13, which: 13, bubbles: true }));
    call(editor, ['asc_closeCellEditor'], [true]);
    return true;
  }

  function rgbColor(value) {
    if (value === undefined || value === null || value === '') return null;
    if (window.Common && window.Common.Utils && window.Common.Utils.ThemeColor) {
      return window.Common.Utils.ThemeColor.getRgbColor(String(value));
    }
    if (window.Asc && typeof window.Asc.asc_CColor === 'function') {
      var color = String(value).replace('#', '');
      if (color.length === 3) color = color.replace(/(.)/g, '$1$1');
      var parsed = parseInt(color, 16);
      var ascColor = new window.Asc.asc_CColor();
      if (window.Asc.c_oAscColor) call(ascColor, ['put_type'], [window.Asc.c_oAscColor.COLOR_TYPE_SRGB]);
      call(ascColor, ['put_r'], [parsed >> 16]);
      call(ascColor, ['put_g'], [(parsed & 65280) >> 8]);
      call(ascColor, ['put_b'], [parsed & 255]);
      call(ascColor, ['put_a'], [255]);
      return ascColor;
    }
    return value;
  }

  function enumValue(path, fallback) {
    var cursor = window;
    for (var i = 0; i < path.length; i += 1) {
      cursor = cursor && cursor[path[i]];
    }
    return cursor === undefined ? fallback : cursor;
  }

  function applyNumberFormat(editor, format) {
    if (format === undefined || format === null || format === '') return false;
    var text = String(scalar(format));
    var normalized = call(editor, ['asc_convertNumFormatLocal2NumFormat'], [text]) || text;
    call(editor, ['asc_setCellFormat'], [normalized]);
    return true;
  }

  function normalizeHorizontalAlignment(value) {
    if (value === undefined || value === null || value === '') return undefined;
    if (typeof value === 'number') return value;
    var text = String(scalar(value)).trim().toLowerCase().replace(/[\s_-]/g, '');
    if (!text) return undefined;
    if (text === 'general' || text === 'default' || text === 'none' || text === 'auto') return null;
    var ascCommon = window.AscCommon || {};
    var map = {
      left: firstDefined([ascCommon.align_Left, 1]),
      center: firstDefined([ascCommon.align_Center, 2]),
      centre: firstDefined([ascCommon.align_Center, 2]),
      centered: firstDefined([ascCommon.align_Center, 2]),
      middle: firstDefined([ascCommon.align_Center, 2]),
      right: firstDefined([ascCommon.align_Right, 0]),
      justify: firstDefined([ascCommon.align_Justify, 3]),
      justified: firstDefined([ascCommon.align_Justify, 3]),
      distributed: firstDefined([ascCommon.align_Distributed, 4]),
      centercontinuous: firstDefined([ascCommon.align_CenterContinuous, 5]),
      continuouscenter: firstDefined([ascCommon.align_CenterContinuous, 5]),
    };
    return Object.prototype.hasOwnProperty.call(map, text) ? map[text] : undefined;
  }

  function normalizeVerticalAlignment(value) {
    if (value === undefined || value === null || value === '') return undefined;
    if (typeof value === 'number') return value;
    var text = String(scalar(value)).trim().toLowerCase().replace(/[\s_-]/g, '');
    if (!text) return undefined;
    if (text === 'default' || text === 'none' || text === 'auto') return null;
    var ascVAlign = (window.Asc && window.Asc.c_oAscVAlign) || {};
    var map = {
      top: firstDefined([ascVAlign.Top, 4]),
      center: firstDefined([ascVAlign.Center, 1]),
      centre: firstDefined([ascVAlign.Center, 1]),
      middle: firstDefined([ascVAlign.Center, 1]),
      bottom: firstDefined([ascVAlign.Bottom, 0]),
      justify: firstDefined([ascVAlign.Just, 3]),
      justified: firstDefined([ascVAlign.Just, 3]),
      distributed: firstDefined([ascVAlign.Dist, 2]),
      dist: firstDefined([ascVAlign.Dist, 2]),
    };
    return Object.prototype.hasOwnProperty.call(map, text) ? map[text] : undefined;
  }

  function columnNameToNumber(name) {
    var value = 0;
    var text = String(name || '').toUpperCase();
    for (var i = 0; i < text.length; i += 1) {
      value = value * 26 + (text.charCodeAt(i) - 64);
    }
    return value;
  }

  function numberToColumnName(value) {
    var column = '';
    var current = Number(value);
    while (current > 0) {
      var remainder = (current - 1) % 26;
      column = String.fromCharCode(65 + remainder) + column;
      current = Math.floor((current - 1) / 26);
    }
    return column;
  }

  function parseCellAddress(address) {
    var match = String(address || '').replace(/\$/g, '').match(/^([A-Z]+)([1-9][0-9]*)$/i);
    if (!match) return null;
    return {
      column: columnNameToNumber(match[1]),
      row: Number(match[2]),
    };
  }

  function parseFiniteCellRange(address) {
    var normalized = normalizeAddress(address);
    if (!normalized || /[,;]/.test(normalized)) return null;
    var parts = normalized.split(':');
    var start = parseCellAddress(parts[0]);
    var end = parseCellAddress(parts[1] || parts[0]);
    if (!start || !end) return null;
    var fromRow = Math.min(start.row, end.row);
    var toRow = Math.max(start.row, end.row);
    var fromColumn = Math.min(start.column, end.column);
    var toColumn = Math.max(start.column, end.column);
    return {
      fromRow: fromRow,
      toRow: toRow,
      fromColumn: fromColumn,
      toColumn: toColumn,
      cellCount: (toRow - fromRow + 1) * (toColumn - fromColumn + 1),
    };
  }

  function applyCellAlignment(editor, address, methodName, value) {
    if (value === undefined) return;
    var finiteRange = parseFiniteCellRange(address);
    if (finiteRange && finiteRange.cellCount <= 500) {
      for (var row = finiteRange.fromRow; row <= finiteRange.toRow; row += 1) {
        for (var column = finiteRange.fromColumn; column <= finiteRange.toColumn; column += 1) {
          selectTarget(editor, { address: numberToColumnName(column) + row });
          call(editor, [methodName], [value]);
        }
      }
      selectTarget(editor, { address: address });
      return;
    }
    call(editor, [methodName], [value]);
  }

  function applyFormat(editor, args, address) {
    args = args || {};
    var format = args.format || args;
    var font = format.font || args.font || {};
    var fill = format.fill || args.fill || {};
    var merged = Object.assign({}, format, {
      bold: firstDefined([font.bold, format.bold]),
      italic: firstDefined([font.italic, format.italic]),
      underline: firstDefined([font.underline, format.underline]),
      strikeout: firstDefined([font.strikeout, font.strikethrough, format.strikeout, format.strikethrough]),
      fontName: firstDefined([font.name, font.fontName, format.fontName]),
      fontSize: firstDefined([font.size, font.fontSize, format.fontSize]),
      fontColor: firstDefined([font.color, font.fontColor, format.fontColor]),
      fillColor: firstDefined([fill.color, fill.fillColor, format.fillColor]),
    });

    if (merged.bold !== undefined) call(editor, ['asc_setCellBold'], [Boolean(merged.bold)]);
    if (merged.italic !== undefined) call(editor, ['asc_setCellItalic'], [Boolean(merged.italic)]);
    if (merged.underline !== undefined) call(editor, ['asc_setCellUnderline'], [Boolean(merged.underline)]);
    if (merged.strikeout !== undefined) call(editor, ['asc_setCellStrikeout'], [Boolean(merged.strikeout)]);
    if (merged.fontName) call(editor, ['asc_setCellFontName'], [String(merged.fontName)]);
    if (merged.fontSize !== undefined) call(editor, ['asc_setCellFontSize'], [Number(merged.fontSize)]);
    if (merged.fontColor) call(editor, ['asc_setCellTextColor'], [rgbColor(merged.fontColor)]);
    if (merged.fillColor) call(editor, ['asc_setCellBackgroundColor'], [rgbColor(merged.fillColor)]);
    if (merged.numberFormat) applyNumberFormat(editor, merged.numberFormat);
    if (merged.wrap !== undefined || merged.wrapText !== undefined) {
      call(editor, ['asc_setCellTextWrap'], [Boolean(firstDefined([merged.wrapText, merged.wrap]))]);
    }
    var horizontalAlignment = normalizeHorizontalAlignment(
      firstDefined([merged.horizontalAlignment, merged.horizontal, merged.alignHorizontal])
    );
    applyCellAlignment(editor, address, 'asc_setCellAlign', horizontalAlignment);
    var verticalAlignment = normalizeVerticalAlignment(
      firstDefined([merged.verticalAlignment, merged.vertical, merged.alignVertical])
    );
    applyCellAlignment(editor, address, 'asc_setCellVertAlign', verticalAlignment);
  }

  function recalculate(editor) {
    var calcAll = enumValue(['Asc', 'c_oAscCalculateType', 'All'], 0);
    if (hasMethod(editor, ['asc_calculate'])) call(editor, ['asc_calculate'], [calcAll]);
  }

  function serializeContext(editor, options) {
    options = options || {};
    var info = hasMethod(editor, ['asc_getCellInfo']) ? call(editor, ['asc_getCellInfo'], []) : null;
    var formulaBar = queryValue('#ce-cell-content');
    var text = '';
    if (info) text = call(info, ['asc_getText'], []) || call(info, ['asc_getInnerText'], []) || '';
    if (!text && formulaBar && formulaBar.charAt(0) !== '=') text = formulaBar;
    var formula = formulaBar && formulaBar.charAt(0) === '=' ? formulaBar : null;
    var address = getSelectionAddress(info);
    var includeValues = options.includeValues !== false;
    var includeFormulas = Boolean(options.includeFormulas);

    return {
      sheetName: getActiveSheetName(editor),
      activeSheetIndex: Number(call(editor, ['asc_getActiveWorksheetIndex'], []) || 0),
      sheets: getSheetNames(editor),
      address: address,
      selectionType: info ? call(info, ['asc_getSelectionType'], []) : null,
      text: text || '',
      values: includeValues ? [[text || formulaBar || '']] : undefined,
      formulas: includeFormulas ? [[formula || '']] : undefined,
      formulaBar: formulaBar || '',
      numberFormat: null,
    };
  }

  function clearRange(editor, args) {
    var clean = enumValue(['Asc', 'c_oAscCleanOptions'], {});
    var applyTo = String(args.applyTo || args.clearApplyTo || 'all').toLowerCase();
    var option =
      applyTo === 'contents' || applyTo === 'text' || applyTo === 'values'
        ? clean.Text
        : applyTo === 'formats' || applyTo === 'format'
          ? clean.Format
          : clean.All;
    call(editor, ['asc_emptyCells'], [option === undefined ? clean.All : option, false]);
  }

  function callFontOrFill(editor, objectName, member, args) {
    var value = firstDefined([args.value, args[member], args.color, args.size, args.name]);
    if (objectName.indexOf('font') >= 0) {
      if (member === 'bold') call(editor, ['asc_setCellBold'], [Boolean(value)]);
      else if (member === 'italic') call(editor, ['asc_setCellItalic'], [Boolean(value)]);
      else if (member === 'underline') call(editor, ['asc_setCellUnderline'], [Boolean(value)]);
      else if (member === 'strikeout' || member === 'strikethrough') call(editor, ['asc_setCellStrikeout'], [Boolean(value)]);
      else if (member === 'size') call(editor, ['asc_setCellFontSize'], [Number(value)]);
      else if (member === 'name') call(editor, ['asc_setCellFontName'], [String(value)]);
      else if (member === 'color') call(editor, ['asc_setCellTextColor'], [rgbColor(value)]);
      else return false;
      return true;
    }
    if (objectName.indexOf('fill') >= 0 && member === 'color') {
      call(editor, ['asc_setCellBackgroundColor'], [rgbColor(value)]);
      return true;
    }
    return false;
  }

  function callRange(editor, payload) {
    var objectName = String(payload.objectName || '').toLowerCase();
    var member = String(payload.memberName || '').trim();
    var normalizedMember = member.toLowerCase();
    var args = payload.args || {};
    var address = selectTarget(editor, payload.target || {});

    if (callFontOrFill(editor, objectName, normalizedMember, args)) {
      return ok(serializeContext(editor, { includeValues: true }), 'supported');
    }

    if (normalizedMember === 'values' || normalizedMember === 'value' || normalizedMember === 'setvalue') {
      var values = firstDefined([args.values, args.value]);
      if (values !== undefined && !writeDelimitedText(editor, address, values)) {
        return fail('The internal spreadsheet text import API is unavailable.', 'partial');
      }
      return ok(serializeContext(editor, { includeValues: true }), 'supported');
    }

    if (normalizedMember === 'formulas' || normalizedMember === 'formula' || normalizedMember === 'setformula') {
      var formulas = firstDefined([args.formulas, args.formula, args.values, args.value]);
      if (formulas !== undefined && !writeDelimitedText(editor, address, formulas)) {
        return fail('The internal spreadsheet text import API is unavailable.', 'partial');
      }
      recalculate(editor);
      return ok(serializeContext(editor, { includeValues: true, includeFormulas: true }), 'supported');
    }

    if (normalizedMember === 'numberformat') {
      applyNumberFormat(editor, firstDefined([args.numberFormat, args.value, args.values]));
      return ok(serializeContext(editor, { includeValues: true }), 'supported');
    }

    if (normalizedMember === 'horizontalalignment') {
      var horizontalAlignment = firstDefined([args.value, args.horizontalAlignment, args.horizontal, args.align]);
      applyFormat(editor, { horizontalAlignment: horizontalAlignment }, address);
      return ok(serializeContext(editor, { includeValues: true }), 'supported');
    }

    if (normalizedMember === 'verticalalignment') {
      var verticalAlignment = firstDefined([args.value, args.verticalAlignment, args.vertical, args.align]);
      applyFormat(editor, { verticalAlignment: verticalAlignment }, address);
      return ok(serializeContext(editor, { includeValues: true }), 'supported');
    }

    if (normalizedMember === 'columnwidth') {
      var columnWidth = Number(firstDefined([args.columnWidth, args.width, args.value]));
      if (!Number.isFinite(columnWidth)) return fail('columnWidth requires args.value or args.columnWidth.', 'partial');
      call(editor, ['asc_setColumnWidth'], [columnWidth]);
      return ok(serializeContext(editor, { includeValues: true }), 'partial');
    }

    if (normalizedMember === 'rowheight') {
      var rowHeight = Number(firstDefined([args.rowHeight, args.height, args.value]));
      if (!Number.isFinite(rowHeight)) return fail('rowHeight requires args.value or args.rowHeight.', 'partial');
      call(editor, ['asc_setRowHeight'], [rowHeight]);
      return ok(serializeContext(editor, { includeValues: true }), 'partial');
    }

    if (normalizedMember === 'format') {
      applyFormat(editor, args, address);
      return ok(serializeContext(editor, { includeValues: true }), 'partial');
    }

    if (normalizedMember === 'clear' || normalizedMember === 'clearorresetcontents' || normalizedMember === 'clearcontents') {
      clearRange(editor, normalizedMember === 'clearcontents' || normalizedMember === 'clearorresetcontents' ? { applyTo: 'contents' } : args);
      return ok(serializeContext(editor, { includeValues: true }), 'supported');
    }

    if (normalizedMember === 'select') {
      return ok(serializeContext(editor, { includeValues: true }), 'supported');
    }

    if (normalizedMember === 'merge') {
      call(editor, ['asc_mergeCells'], [enumValue(['Asc', 'c_oAscMergeOptions', args.across ? 'MergeAcross' : 'Merge'], 1)]);
      return ok(serializeContext(editor, { includeValues: true }), 'supported');
    }

    if (normalizedMember === 'unmerge') {
      call(editor, ['asc_mergeCells'], [enumValue(['Asc', 'c_oAscMergeOptions', 'None'], 0)]);
      return ok(serializeContext(editor, { includeValues: true }), 'supported');
    }

    if (normalizedMember === 'delete') {
      call(editor, ['asc_deleteCells'], [args.shift]);
      return ok({ deleted: true }, 'partial');
    }

    if (normalizedMember === 'insert') {
      call(editor, ['asc_insertCells'], [args.shift]);
      return ok(serializeContext(editor, { includeValues: true }), 'partial');
    }

    if (normalizedMember === 'calculate') {
      recalculate(editor);
      return ok(serializeContext(editor, { includeValues: true, includeFormulas: true }), 'supported');
    }

    if (normalizedMember === 'address' || normalizedMember === 'text') {
      return ok(serializeContext(editor, { includeValues: true, includeFormulas: normalizedMember === 'text' }), 'supported');
    }

    return fail('Range member is registered but not mapped in the browser bridge: ' + member, 'unsupported');
  }

  function callWorksheet(editor, payload) {
    var objectName = String(payload.objectName || '').toLowerCase();
    var member = String(payload.memberName || '').trim();
    var normalizedMember = member.toLowerCase();
    var args = payload.args || {};
    var target = payload.target || {};

    if (objectName.indexOf('table') >= 0) {
      if (normalizedMember === 'add') {
        var tableAddress = normalizeAddress(args.address || args.sourceAddress || target.address || getCurrentAddress());
        selectTarget(editor, Object.assign({}, target, { address: tableAddress }));
        call(editor, ['asc_addAutoFilter'], [args.styleName || args.tableStyle || null]);
        return ok({ table: 'created', address: tableAddress }, 'partial');
      }
      return fail('Table member is registered but not mapped in the browser bridge: ' + member, 'unsupported');
    }

    if (objectName.indexOf('chart') >= 0) {
      return fail('Chart creation requires an internal chart model that is not safely mapped in phase 1.', 'unsupported');
    }

    if (objectName.indexOf('collection') >= 0 && normalizedMember === 'add') {
      var sheetName = String(args.name || args.value || 'Sheet');
      call(editor, ['asc_addWorksheet'], [sheetName]);
      return ok({ sheetName: getActiveSheetName(editor), sheets: getSheetNames(editor) }, 'partial');
    }

    if (target.sheetName && !activateSheet(editor, target.sheetName)) {
      return fail('Worksheet not found: ' + target.sheetName, 'partial');
    }

    if (normalizedMember === 'activate') {
      var activateName = args.name || args.sheetName || target.sheetName;
      if (activateName && !activateSheet(editor, activateName)) return fail('Worksheet not found: ' + activateName, 'partial');
      return ok({ sheetName: getActiveSheetName(editor) }, 'partial');
    }

    if (normalizedMember === 'delete') {
      var index = findSheetIndex(editor, target.sheetName || args.name || args.sheetName || getActiveSheetName(editor));
      if (index < 0) return fail('Worksheet not found.', 'partial');
      if (getSheetNames(editor).length <= 1) return fail('Cannot delete the last worksheet.', 'partial');
      call(editor, ['asc_deleteWorksheet'], [[index]]);
      return ok({ deleted: true, sheets: getSheetNames(editor) }, 'partial');
    }

    if (normalizedMember === 'name') {
      var newName = firstDefined([args.name, args.value]);
      if (newName !== undefined) call(editor, ['asc_renameWorksheet'], [String(newName)]);
      return ok({ sheetName: getActiveSheetName(editor), sheets: getSheetNames(editor) }, 'partial');
    }

    if (normalizedMember === 'getrange') {
      selectTarget(editor, { sheetName: target.sheetName || args.sheetName, address: args.address || target.address || 'A1' });
      return ok(serializeContext(editor, { includeValues: true, includeFormulas: true }), 'supported');
    }

    if (normalizedMember === 'getusedrange') {
      return fail('The iframe bridge cannot reliably read used-range boundaries from this ONLYOFFICE build yet.', 'unsupported');
    }

    if (normalizedMember === 'calculate') {
      recalculate(editor);
      return ok({ calculated: true, sheetName: getActiveSheetName(editor) }, 'supported');
    }

    return fail('Worksheet member is registered but not mapped in the browser bridge: ' + member, 'unsupported');
  }

  function callWorkbook(editor, payload) {
    var member = String(payload.memberName || '').trim().toLowerCase();

    if (member === 'calculate' || member === 'recalculateallformulas') {
      recalculate(editor);
      return ok({ calculated: true }, 'supported');
    }

    if (member === 'getactivecell' || member === 'getselectedrange' || member === 'getselection') {
      return ok(serializeContext(editor, { includeValues: true, includeFormulas: true }), 'supported');
    }

    if (member === 'getactiveworksheet' || member === 'activeworksheet') {
      return ok({ sheetName: getActiveSheetName(editor), sheets: getSheetNames(editor) }, 'supported');
    }

    if (member === 'focus') {
      window.focus();
      return ok({ focused: true }, 'partial');
    }

    return fail('Workbook/Application member is registered but not mapped in the browser bridge: ' + payload.memberName, 'unsupported');
  }

  function collectMethodNames(object) {
    var names = [];
    var seen = {};
    var cursor = object;
    var depth = 0;
    while (cursor && cursor !== Object.prototype && depth < 8) {
      try {
        Object.getOwnPropertyNames(cursor).forEach(function (name) {
          if (name === 'constructor' || seen[name]) return;
          var descriptor = Object.getOwnPropertyDescriptor(cursor, name);
          var value = descriptor && descriptor.value;
          if (typeof value === 'function') {
            seen[name] = true;
            names.push(name);
          }
        });
      } catch (error) {}
      try {
        cursor = Object.getPrototypeOf(cursor);
      } catch (error) {
        cursor = null;
      }
      depth += 1;
    }
    return names.sort();
  }

  function classifyOfficeApiMethod(name) {
    var lower = String(name || '').toLowerCase();
    if (/^(asc_)?(get|is|can|has|find|query|read|serialize)/.test(lower)) return '读取';
    if (/^(asc_)?(set|put|write|apply|change|rename|activate|show|hide|focus|open|close|save)/.test(lower)) return '写入/状态';
    if (/^(asc_)?(add|create|insert|copy|paste|merge|import)/.test(lower)) return '创建/插入';
    if (/^(asc_)?(delete|remove|clear|empty|unmerge)/.test(lower)) return '删除/清理';
    if (/(format|font|color|align|style|border|width|height|wrap)/.test(lower)) return '格式';
    if (/(callback|event|listener|handler|register|unregister)/.test(lower)) return '事件';
    if (/(calculate|recalculate|formula|function)/.test(lower)) return '公式/计算';
    return '其他';
  }

  function getOfficeApiObjects(editor) {
    var objects = [
      {
        category: '编辑器',
        objectType: 'Editor',
        root: 'editor',
        object: editor,
        description: 'ONLYOFFICE spreadsheet editor runtime API',
      },
      {
        category: '命名空间',
        objectType: 'Asc',
        root: 'Asc',
        object: window.Asc,
        description: 'ONLYOFFICE Asc namespace and constructors',
      },
      {
        category: '命名空间',
        objectType: 'AscCommon',
        root: 'AscCommon',
        object: window.AscCommon,
        description: 'ONLYOFFICE common runtime namespace',
      },
      {
        category: '命名空间',
        objectType: 'AscCommonExcel',
        root: 'AscCommonExcel',
        object: window.AscCommonExcel,
        description: 'ONLYOFFICE spreadsheet common namespace',
      },
      {
        category: '界面',
        objectType: 'Common',
        root: 'Common',
        object: window.Common,
        description: 'ONLYOFFICE web-app UI/common namespace',
      },
      {
        category: '选区',
        objectType: 'CellInfo',
        root: 'cellInfo',
        object: hasMethod(editor, ['asc_getCellInfo']) ? call(editor, ['asc_getCellInfo'], []) : null,
        description: 'Current selection/cell info object',
      },
    ];
    return objects.filter(function (item) {
      return !!item.object;
    });
  }

  function buildOfficeApiCatalog(editor) {
    var records = [];
    getOfficeApiObjects(editor).forEach(function (objectInfo) {
      collectMethodNames(objectInfo.object).forEach(function (methodName) {
        records.push({
          id: objectInfo.objectType + '.' + methodName,
          category: objectInfo.category,
          subcategory: classifyOfficeApiMethod(methodName),
          objectType: objectInfo.objectType,
          root: objectInfo.root,
          memberName: methodName,
          memberKind: 'method',
          supportLevel: 'supported',
          status: 'available',
          description: objectInfo.description,
          invocation: {
            tool: 'office_api_call',
            target: { root: objectInfo.root },
            memberName: methodName,
            args: [],
          },
        });
      });
    });
    return records;
  }

  function summarizeOfficeApiCatalog(records) {
    var categories = {};
    records.forEach(function (record) {
      if (!categories[record.category]) {
        categories[record.category] = {
          category: record.category,
          count: 0,
          objects: {},
          subcategories: {},
        };
      }
      var category = categories[record.category];
      category.count += 1;
      category.objects[record.objectType] = (category.objects[record.objectType] || 0) + 1;
      category.subcategories[record.subcategory] = (category.subcategories[record.subcategory] || 0) + 1;
    });
    return Object.keys(categories)
      .sort()
      .map(function (categoryName) {
        var category = categories[categoryName];
        return {
          category: category.category,
          count: category.count,
          objects: Object.keys(category.objects)
            .sort()
            .map(function (name) {
              return { objectType: name, count: category.objects[name] };
            }),
          subcategories: Object.keys(category.subcategories)
            .sort()
            .map(function (name) {
              return { subcategory: name, count: category.subcategories[name] };
            }),
        };
      });
  }

  function filterOfficeApiRecords(records, payload) {
    var query = String(payload.query || '').trim().toLowerCase();
    var category = String(payload.category || '').trim().toLowerCase();
    var subcategory = String(payload.subcategory || '').trim().toLowerCase();
    var objectType = String(payload.objectType || '').trim().toLowerCase();
    var memberName = String(payload.memberName || '').trim().toLowerCase();
    return records.filter(function (record) {
      if (category && String(record.category).toLowerCase() !== category) return false;
      if (subcategory && String(record.subcategory).toLowerCase() !== subcategory) return false;
      if (objectType && String(record.objectType).toLowerCase() !== objectType) return false;
      if (memberName && String(record.memberName).toLowerCase() !== memberName) return false;
      if (!query) return true;
      return [record.category, record.subcategory, record.objectType, record.memberName, record.description]
        .join(' ')
        .toLowerCase()
        .indexOf(query) >= 0;
    });
  }

  function dispatchOfficeApiCatalog(editor, payload) {
    payload = payload || {};
    var view = payload.view || 'overview';
    var records = buildOfficeApiCatalog(editor);
    var filtered = filterOfficeApiRecords(records, payload);
    var limit = Math.max(1, Math.min(Number(payload.limit || (view === 'overview' ? 80 : 160)), 5000));
    var checkedAt = new Date().toISOString();
    if (view === 'overview') {
      return ok({
        checkedAt: checkedAt,
        total: records.length,
        categories: summarizeOfficeApiCatalog(records),
      });
    }
    if (view === 'category' || view === 'object' || view === 'search') {
      return ok({
        checkedAt: checkedAt,
        total: records.length,
        matched: filtered.length,
        records: filtered.slice(0, limit),
        truncated: filtered.length > limit,
      });
    }
    if (view === 'detail') {
      return ok({
        checkedAt: checkedAt,
        total: records.length,
        matched: filtered.length,
        records: filtered.slice(0, Math.min(limit, 40)),
        truncated: filtered.length > Math.min(limit, 40),
      });
    }
    return fail('Unknown Office API catalog view: ' + view, 'partial');
  }

  function resolveOfficeApiTarget(editor, target) {
    target = target || {};
    var root = target.root || target.objectType || 'editor';
    if (root === 'Editor' || root === 'editor') return editor;
    if (root === 'Asc') return window.Asc;
    if (root === 'AscCommon') return window.AscCommon;
    if (root === 'AscCommonExcel') return window.AscCommonExcel;
    if (root === 'Common') return window.Common;
    if (root === 'CellInfo' || root === 'cellInfo') {
      return hasMethod(editor, ['asc_getCellInfo']) ? call(editor, ['asc_getCellInfo'], []) : null;
    }
    return null;
  }

  function serializeOfficeApiValue(value, depth) {
    depth = depth || 0;
    if (value === undefined || value === null) return null;
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return value;
    if (typeof value === 'function') return '[Function]';
    if (depth >= 2) return String(value);
    if (Array.isArray(value)) {
      return value.slice(0, 80).map(function (item) {
        return serializeOfficeApiValue(item, depth + 1);
      });
    }
    var output = {
      type: Object.prototype.toString.call(value).replace(/^\[object |\]$/g, ''),
    };
    try {
      var methods = collectMethodNames(value).slice(0, 80);
      if (methods.length) output.methods = methods;
      Object.keys(value)
        .slice(0, 40)
        .forEach(function (key) {
          if (typeof value[key] !== 'function') output[key] = serializeOfficeApiValue(value[key], depth + 1);
        });
    } catch (error) {
      output.value = String(value);
    }
    return output;
  }

  function dispatchOfficeApiCall(editor, payload) {
    payload = payload || {};
    var target = resolveOfficeApiTarget(editor, payload.target);
    var memberName = String(payload.memberName || '').trim();
    if (!target) return fail('Office API target is unavailable: ' + JSON.stringify(payload.target || {}), 'partial');
    if (!memberName) return fail('office_api_call requires memberName.', 'partial');
    if (typeof target[memberName] !== 'function') {
      return fail('Office API method is unavailable on target: ' + memberName, 'unsupported');
    }
    var args = Array.isArray(payload.args) ? payload.args.slice() : [];
    if (memberName === 'asc_setCellAlign' && args.length) {
      var horizontalAlignment = normalizeHorizontalAlignment(args[0]);
      if (horizontalAlignment === undefined) return fail('Unsupported horizontal alignment value: ' + args[0], 'partial');
      args[0] = horizontalAlignment;
    }
    if (memberName === 'asc_setCellVertAlign' && args.length) {
      var verticalAlignment = normalizeVerticalAlignment(args[0]);
      if (verticalAlignment === undefined) return fail('Unsupported vertical alignment value: ' + args[0], 'partial');
      args[0] = verticalAlignment;
    }
    var value = target[memberName].apply(target, args);
    return ok(
      {
        target: payload.target || { root: 'editor' },
        memberName: memberName,
        result: serializeOfficeApiValue(value),
      },
      'partial',
    );
  }

  function dispatch(action, payload) {
    payload = payload || {};
    var editor = getEditor();
    if (!editor) return fail('ONLYOFFICE spreadsheet editor is not ready yet.', 'partial');

    if (action === 'getContext') {
      if (payload.scope === 'range' && payload.address) {
        selectTarget(editor, payload);
      } else if (payload.sheetName) {
        activateSheet(editor, payload.sheetName);
      }
      if (payload.scope === 'workbook') {
        return ok({
          activeSheetName: getActiveSheetName(editor),
          sheets: getSheetNames(editor),
          selection: serializeContext(editor, payload),
        });
      }
      if (payload.scope === 'worksheet') {
        return ok({
          sheetName: getActiveSheetName(editor),
          sheets: getSheetNames(editor),
          selection: serializeContext(editor, payload),
          usedRange: null,
        });
      }
      return ok(serializeContext(editor, payload));
    }

    if (action === 'saveDocument') {
      if (!hasMethod(editor, ['asc_Save'])) {
        return fail('ONLYOFFICE save API is unavailable in this editor build.', 'unsupported');
      }
      call(editor, ['asc_setIsForceSaveOnUserSave'], [true]);
      call(editor, ['asc_Save'], []);
      return ok({ requested: true }, 'partial');
    }

    if (action === 'officeApiCatalog') {
      return dispatchOfficeApiCatalog(editor, payload);
    }

    if (action === 'officeApiCall') {
      return dispatchOfficeApiCall(editor, payload);
    }

    if (action !== 'call') return fail('Unknown bridge action: ' + action, 'unsupported');

    var objectName = String(payload.objectName || '').toLowerCase();
    if (objectName.indexOf('range') >= 0 || objectName.indexOf('font') >= 0 || objectName.indexOf('fill') >= 0) {
      return callRange(editor, payload);
    }
    if (objectName.indexOf('worksheet') >= 0 || objectName.indexOf('table') >= 0 || objectName.indexOf('chart') >= 0) {
      return callWorksheet(editor, payload);
    }
    if (objectName.indexOf('workbook') >= 0 || objectName.indexOf('application') >= 0) {
      return callWorkbook(editor, payload);
    }
    return fail('Object is registered but not mapped in the browser bridge: ' + payload.objectName, 'unsupported');
  }

  function summarizeEditor() {
    var editor = getEditor();
    return {
      hasAsc: !!window.Asc,
      hasEditor: !!editor,
      sheetName: editor ? getActiveSheetName(editor) : null,
      sheets: editor ? getSheetNames(editor) : [],
      address: editor ? getCurrentAddress() : null,
      canWriteText: !!(editor && hasMethod(editor, ['asc_TextToColumns'])),
      canSelectRange: !!(editor && hasMethod(editor, ['asc_findCell'])),
      canFormat: !!(editor && hasMethod(editor, ['asc_setCellBold'])),
    };
  }

  function getBasePath() {
    try {
      var pathname = window.parent && window.parent.location ? window.parent.location.pathname : '';
      if (pathname === '/document' || pathname.indexOf('/document/') === 0) return '/document/';
    } catch (error) {}
    return '/';
  }

  function getPanelUrl() {
    return window.location.origin + getBasePath() + 'office-agent-plugin/panel.html';
  }

  function ensureAgentSidebarStyles() {
    if (document.getElementById('office-agent-left-sidebar-style')) return;
    var style = document.createElement('style');
    style.id = 'office-agent-left-sidebar-style';
    style.textContent = [
      '#left-menu.office-agent-left-open{width:var(--office-agent-left-width,360px)!important;}',
      '#left-menu.office-agent-native-open:not(.office-agent-left-open){width:var(--office-agent-native-left-width,300px)!important;}',
      '#left-menu.office-agent-left-open .left-panel{display:block!important;height:100%;padding-left:40px;padding-right:0;background:#f3f3f3!important;border-top:0!important;}',
      '#left-menu #left-panel-agent{height:calc(100% + 1px);display:none;overflow:hidden;background:#f3f3f3;margin-top:-1px;}',
      '#left-menu #left-panel-agent.active{display:block!important;}',
      '#left-menu #office-agent-native-frame{display:block;width:100%;height:100%;border:0;background:#f3f3f3;color-scheme:light;}',
      '#left-menu #office-agent-left-resize-handle{display:none;position:absolute;top:0;right:-3px;bottom:0;width:6px;z-index:50;cursor:col-resize;background:transparent;}',
      '#left-menu.office-agent-left-open #office-agent-left-resize-handle{display:block;}',
      '#left-menu.office-agent-left-resizing,#left-menu.office-agent-left-resizing *{cursor:col-resize!important;user-select:none!important;}',
      '#left-menu #left-btn-agent .office-agent-menu-icon{width:18px;height:18px;background:currentColor;-webkit-mask:url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 16 16%27%3E%3Cpath d=%27M2.8914 10.4028L2.98327 10.6318C3.22909 11.2445 3.5 12.1045 3.5 13C3.5 13.3588 3.4564 13.7131 3.38773 14.0495C3.69637 13.9446 4.01409 13.8159 4.32918 13.6584C4.87888 13.3835 5.33961 13.0611 5.70994 12.7521L6.22471 12.3226L6.88809 12.4196C7.24851 12.4724 7.61994 12.5 8 12.5C11.7843 12.5 14.5 9.85569 14.5 7C14.5 4.14431 11.7843 1.5 8 1.5C4.21574 1.5 1.5 4.14431 1.5 7C1.5 8.18175 1.94229 9.29322 2.73103 10.2153L2.8914 10.4028ZM2.8135 15.7653C1.76096 16 1 16 1 16C1 16 1.43322 15.3097 1.72937 14.4367C1.88317 13.9834 2 13.4808 2 13C2 12.3826 1.80733 11.7292 1.59114 11.1903C0.591845 10.0221 0 8.57152 0 7C0 3.13401 3.58172 0 8 0C12.4183 0 16 3.13401 16 7C16 10.866 12.4183 14 8 14C7.54721 14 7.10321 13.9671 6.67094 13.9038C6.22579 14.2753 5.66881 14.6656 5 15C4.23366 15.3832 3.46733 15.6195 2.8135 15.7653Z%27/%3E%3C/svg%3E") center/18px 18px no-repeat;mask:url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 16 16%27%3E%3Cpath d=%27M2.8914 10.4028L2.98327 10.6318C3.22909 11.2445 3.5 12.1045 3.5 13C3.5 13.3588 3.4564 13.7131 3.38773 14.0495C3.69637 13.9446 4.01409 13.8159 4.32918 13.6584C4.87888 13.3835 5.33961 13.0611 5.70994 12.7521L6.22471 12.3226L6.88809 12.4196C7.24851 12.4724 7.61994 12.5 8 12.5C11.7843 12.5 14.5 9.85569 14.5 7C14.5 4.14431 11.7843 1.5 8 1.5C4.21574 1.5 1.5 4.14431 1.5 7C1.5 8.18175 1.94229 9.29322 2.73103 10.2153L2.8914 10.4028ZM2.8135 15.7653C1.76096 16 1 16 1 16C1 16 1.43322 15.3097 1.72937 14.4367C1.88317 13.9834 2 13.4808 2 13C2 12.3826 1.80733 11.7292 1.59114 11.1903C0.591845 10.0221 0 8.57152 0 7C0 3.13401 3.58172 0 8 0C12.4183 0 16 3.13401 16 7C16 10.866 12.4183 14 8 14C7.54721 14 7.10321 13.9671 6.67094 13.9038C6.22579 14.2753 5.66881 14.6656 5 15C4.23366 15.3832 3.46733 15.6195 2.8135 15.7653Z%27/%3E%3C/svg%3E") center/18px 18px no-repeat;}',
    ].join('\n');
    document.head.appendChild(style);
  }

  function getDefaultAgentPanelWidth() {
    var viewport = Math.max(0, window.innerWidth || document.documentElement.clientWidth || 0);
    var maxWidth = viewport < 760 ? 320 : 400;
    var minWidth = viewport < 760 ? 240 : 300;
    var minimumSheetWidth = viewport < 840 ? 240 : 520;
    var available = Math.max(minWidth, viewport - minimumSheetWidth);
    var proportional = Math.floor(viewport * (viewport < 900 ? 0.36 : 0.32));
    return Math.max(minWidth, Math.min(maxWidth, available, proportional || maxWidth));
  }

  function clampAgentPanelWidth(width) {
    var viewport = Math.max(0, window.innerWidth || document.documentElement.clientWidth || 0);
    var minWidth = viewport < 760 ? 240 : 300;
    var maxWidth = Math.max(minWidth, Math.min(viewport - (viewport < 840 ? 240 : 420), viewport < 760 ? 360 : 560));
    return Math.max(minWidth, Math.min(maxWidth, Number(width) || getDefaultAgentPanelWidth()));
  }

  function getStoredAgentPanelWidth() {
    var raw = null;
    try {
      if (window.Common && window.Common.localStorage) {
        raw = window.Common.localStorage.getItem(AGENT_LEFT_WIDTH_STORAGE_KEY);
      }
    } catch (error) {}
    try {
      raw = raw || window.localStorage.getItem(AGENT_LEFT_WIDTH_STORAGE_KEY);
    } catch (error) {}
    var parsed = Number(raw);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  }

  function setAgentPanelWidthStorage(width) {
    var value = String(clampAgentPanelWidth(width));
    try {
      if (window.Common && window.Common.localStorage) {
        window.Common.localStorage.setItem(AGENT_LEFT_WIDTH_STORAGE_KEY, value);
      }
    } catch (error) {}
    try {
      window.localStorage.setItem(AGENT_LEFT_WIDTH_STORAGE_KEY, value);
    } catch (error) {}
  }

  function getAgentPanelWidth() {
    return clampAgentPanelWidth(getStoredAgentPanelWidth() || getDefaultAgentPanelWidth());
  }

  function getNativeLeftPanelWidth() {
    var viewport = Math.max(0, window.innerWidth || document.documentElement.clientWidth || 0);
    var available = viewport > 0 ? viewport - 280 : 300;
    return Math.max(260, Math.min(300, available || 300));
  }

  function setNativeLeftPanelWidthStorage(width) {
    var value = String(width || getNativeLeftPanelWidth());
    try {
      if (window.Common && window.Common.localStorage) {
        window.Common.localStorage.setItem(NATIVE_LEFT_WIDTH_STORAGE_KEY, value);
      }
    } catch (error) {}
    try {
      window.localStorage.setItem(NATIVE_LEFT_WIDTH_STORAGE_KEY, value);
    } catch (error) {}
  }

  function prepareNativeLeftPanelWidth() {
    var width = getNativeLeftPanelWidth();
    setNativeLeftPanelWidthStorage(width);
    return width;
  }

  function applyAgentPanelWidth(leftMenu, nextWidth) {
    if (!leftMenu) return;
    var width = clampAgentPanelWidth(nextWidth || getAgentPanelWidth());
    leftMenu.style.setProperty('--office-agent-left-width', width + 'px');
    leftMenu.style.width = width + 'px';
    return width;
  }

  function requestLayoutResize() {
    try {
      window.dispatchEvent(new Event('resize'));
      if (window.Common && window.Common.NotificationCenter) {
        window.Common.NotificationCenter.trigger('window:resize');
        window.Common.NotificationCenter.trigger('layout:changed', 'leftmenu');
      }
    } catch (error) {}
  }

  function hideAgentPanel(keepLeftPanel) {
    var leftMenu = document.getElementById('left-menu');
    var panel = document.getElementById(AGENT_PANEL_ID);
    var button = document.getElementById(AGENT_BUTTON_ID);
    if (panel) {
      panel.classList.remove('active');
      panel.style.display = 'none';
    }
    if (button) button.classList.remove('active');
    if (leftMenu) {
      leftMenu.classList.remove('office-agent-left-open');
      leftMenu.classList.remove('office-agent-native-open');
      leftMenu.style.removeProperty('--office-agent-left-width');
      leftMenu.style.removeProperty('--office-agent-native-left-width');
      leftMenu.style.width = '40px';
    }
    requestLayoutResize();
  }

  function constrainNativeLeftPanelWidth() {
    var leftMenu = document.getElementById('left-menu');
    if (!leftMenu || leftMenu.classList.contains('office-agent-left-open')) return;
    var leftPanel = leftMenu.querySelector('.left-panel');
    if (!leftPanel) return;
    var visibleNativePanel = Array.prototype.some.call(leftPanel.children, function (item) {
      if (!item || item.id === AGENT_PANEL_ID) return false;
      return window.getComputedStyle(item).display !== 'none';
    });
    var activeNativeButton = leftMenu.querySelector('.btn-category.active:not(#' + AGENT_BUTTON_ID + ')');
    if (!visibleNativePanel && !activeNativeButton) {
      leftMenu.classList.remove('office-agent-native-open');
      leftMenu.style.removeProperty('--office-agent-native-left-width');
      return;
    }
    var width = prepareNativeLeftPanelWidth();
    leftMenu.classList.add('office-agent-native-open');
    leftMenu.style.setProperty('--office-agent-native-left-width', width + 'px');
    if (Math.abs(leftMenu.getBoundingClientRect().width - width) > 1 || leftMenu.style.width !== width + 'px') {
      leftMenu.style.width = width + 'px';
      requestLayoutResize();
    }
  }

  function ensureAgentResizeHandle(leftMenu) {
    if (!leftMenu || document.getElementById('office-agent-left-resize-handle')) return;
    var handle = document.createElement('div');
    handle.id = 'office-agent-left-resize-handle';
    handle.setAttribute('role', 'separator');
    handle.setAttribute('aria-orientation', 'vertical');
    handle.title = '拖动调整 Agent 面板宽度';
    leftMenu.appendChild(handle);

    handle.addEventListener('pointerdown', function (event) {
      if (!leftMenu.classList.contains('office-agent-left-open')) return;
      event.preventDefault();
      event.stopPropagation();
      var startX = event.clientX;
      var startWidth = leftMenu.getBoundingClientRect().width || getAgentPanelWidth();
      leftMenu.classList.add('office-agent-left-resizing');
      try {
        handle.setPointerCapture(event.pointerId);
      } catch (error) {}

      function onMove(moveEvent) {
        var width = applyAgentPanelWidth(leftMenu, startWidth + moveEvent.clientX - startX);
        setAgentPanelWidthStorage(width);
        requestLayoutResize();
      }

      function onUp(upEvent) {
        leftMenu.classList.remove('office-agent-left-resizing');
        try {
          handle.releasePointerCapture(upEvent.pointerId);
        } catch (error) {}
        document.removeEventListener('pointermove', onMove, true);
        document.removeEventListener('pointerup', onUp, true);
        requestLayoutResize();
      }

      document.addEventListener('pointermove', onMove, true);
      document.addEventListener('pointerup', onUp, true);
    });
  }

  function openAgentPanel() {
    var leftMenu = document.getElementById('left-menu');
    var leftPanel = leftMenu && leftMenu.querySelector('.left-panel');
    var panel = document.getElementById(AGENT_PANEL_ID);
    var button = document.getElementById(AGENT_BUTTON_ID);
    if (!leftMenu || !leftPanel || !panel || !button) return;
    ensureAgentResizeHandle(leftMenu);

    Array.prototype.forEach.call(leftPanel.children, function (item) {
      item.classList.remove('active');
      item.style.display = 'none';
    });
    Array.prototype.forEach.call(leftMenu.querySelectorAll('.btn-category.active'), function (item) {
      item.classList.remove('active');
    });

    if (!document.getElementById(AGENT_FRAME_ID)) {
      var frame = document.createElement('iframe');
      frame.id = AGENT_FRAME_ID;
      frame.title = 'Excel Agent';
      frame.src = getPanelUrl();
      frame.setAttribute('allow', 'clipboard-read; clipboard-write');
      panel.appendChild(frame);
    }

    leftMenu.classList.add('office-agent-left-open');
    leftMenu.classList.remove('office-agent-native-open');
    leftMenu.style.removeProperty('--office-agent-native-left-width');
    applyAgentPanelWidth(leftMenu);
    leftPanel.style.display = 'block';
    panel.style.display = 'block';
    panel.classList.add('active');
    button.classList.add('active');
    requestLayoutResize();
    channelPost({ type: 'ready', result: summarizeEditor() });
  }

  function injectAgentSidePanel() {
    var leftMenu = document.getElementById('left-menu');
    var leftPanel = leftMenu && leftMenu.querySelector('.left-panel');
    var buttons = leftMenu && leftMenu.querySelector('.tool-menu-btns');
    if (!leftMenu || !leftPanel || !buttons) return false;

    ensureAgentSidebarStyles();
    ensureAgentResizeHandle(leftMenu);

    if (!document.getElementById(AGENT_PANEL_ID)) {
      var panel = document.createElement('div');
      panel.id = AGENT_PANEL_ID;
      panel.style.display = 'none';
      panel.style.height = '100%';
      leftPanel.appendChild(panel);
    }

    if (!document.getElementById(AGENT_BUTTON_ID)) {
      var button = document.createElement('button');
      button.id = AGENT_BUTTON_ID;
      button.className = 'btn btn-category';
      button.type = 'button';
      button.title = 'Excel Agent';
      button.setAttribute('data-hint', '0');
      button.setAttribute('data-hint-direction', 'right');
      button.setAttribute('data-hint-offset', 'big');
      button.setAttribute('content-target', AGENT_PANEL_ID);
      button.innerHTML = '<i class="icon toolbar__icon office-agent-menu-icon">&nbsp;</i>';
      buttons.appendChild(button);
    }

    if (!buttons.__officeAgentBound) {
      buttons.__officeAgentBound = true;
      buttons.addEventListener(
        'click',
        function (event) {
          var target = event.target;
          var button = target && target.closest ? target.closest('button.btn-category') : null;
          if (!button) return;
          if (button.id === AGENT_BUTTON_ID) {
            event.preventDefault();
            event.stopPropagation();
            var panel = document.getElementById(AGENT_PANEL_ID);
            if (panel && panel.classList.contains('active')) {
              hideAgentPanel(false);
            } else {
              openAgentPanel();
            }
          } else {
            prepareNativeLeftPanelWidth();
            hideAgentPanel(true);
            window.setTimeout(constrainNativeLeftPanelWidth, 0);
            window.setTimeout(constrainNativeLeftPanelWidth, 120);
          }
        },
        true,
      );
    }

    if (!window.__officeAgentResizeBound) {
      window.__officeAgentResizeBound = true;
      window.addEventListener('resize', function () {
        var menu = document.getElementById('left-menu');
        if (menu && menu.classList.contains('office-agent-left-open')) {
          applyAgentPanelWidth(menu);
        } else {
          constrainNativeLeftPanelWidth();
        }
      });
    }

    if (!window.__officeAgentNativeWidthGuardBound) {
      window.__officeAgentNativeWidthGuardBound = true;
      window.setInterval(constrainNativeLeftPanelWidth, 500);
    }

    return true;
  }

  function autoOpenAgentPanel() {
    if (agentAutoOpened || !getEditor()) return;
    if (!injectAgentSidePanel()) return;
    agentAutoOpened = true;
    window.setTimeout(openAgentPanel, 0);
  }

  function announceReady() {
    var editor = getEditor();
    if (editor && !selectionCallbacksRegistered && hasMethod(editor, ['asc_registerCallback'])) {
      selectionCallbacksRegistered = true;
      call(editor, ['asc_registerCallback'], [
        'asc_onSelectionChanged',
        function () {
          window.setTimeout(function () {
            announce({ type: 'selection', result: serializeContext(editor, { includeValues: true }) });
          }, 0);
        },
      ]);
      call(editor, ['asc_registerCallback'], [
        'asc_onSelectionNameChanged',
        function (selectionName) {
          rememberSelectionName(selectionName);
          announce({ type: 'selection', result: serializeContext(editor, { includeValues: true }) });
        },
      ]);
    }
    injectAgentSidePanel();
    autoOpenAgentPanel();
    announce({ type: 'ready', result: summarizeEditor() });
  }

  function handleBridgeRequest(data, reply) {
    if (!data || data.source !== HOST_SOURCE || data.type !== 'request') return;
    try {
      var response = dispatch(data.action, data.payload);
      reply(Object.assign({ type: 'result', id: data.id }, response));
    } catch (error) {
      reply(
        Object.assign(
          { type: 'result', id: data.id },
          fail(error && error.message ? error.message : String(error), 'partial'),
        ),
      );
    }
  }

  window.addEventListener('message', function (event) {
    handleBridgeRequest(event.data, post);
  });

  if (bridgeChannel) {
    bridgeChannel.addEventListener('message', function (event) {
      var data = event.data;
      if (!data || data.source !== HOST_SOURCE) return;
      if (data.type === 'ping') {
        channelPost({ type: 'ready', result: summarizeEditor() });
        injectAgentSidePanel();
        return;
      }
      handleBridgeRequest(data, channelPost);
    });
  }

  window.setTimeout(announceReady, 1000);
  window.setTimeout(injectAgentSidePanel, 1800);
  window.setInterval(announceReady, 5000);
})();
