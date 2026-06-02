(function () {
  var HOST_SOURCE = 'office-agent-host';
  var BRIDGE_SOURCE = 'office-agent-bridge';

  function post(message) {
    window.top.postMessage(
      Object.assign(
        {
          source: BRIDGE_SOURCE,
        },
        message,
      ),
      '*',
    );
  }

  function result(id, ok, supportLevel, value, error) {
    post({
      type: 'result',
      id: id,
      ok: ok,
      supportLevel: supportLevel || (ok ? 'supported' : 'partial'),
      result: value,
      error: error,
    });
  }

  function runInEditor(action, payload, callback) {
    window.Asc.scope.__agentAction = action;
    window.Asc.scope.__agentPayload = payload || {};
    window.Asc.plugin.callCommand(
      function () {
        function ok(value, supportLevel) {
          return JSON.stringify({
            ok: true,
            supportLevel: supportLevel || 'supported',
            result: value || null,
          });
        }

        function fail(message, supportLevel) {
          return JSON.stringify({
            ok: false,
            supportLevel: supportLevel || 'unsupported',
            error: message,
          });
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

        function toPlain(value) {
          if (value === undefined) return null;
          if (value === null) return null;
          if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return value;
          try {
            JSON.stringify(value);
            return value;
          } catch (error) {
            return String(value);
          }
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

        function normalizeApiRangeHorizontalAlignment(value) {
          if (value === undefined || value === null || value === '') return undefined;
          if (typeof value === 'number') {
            return value === 0
              ? 'right'
              : value === 1
                ? 'left'
                : value === 2
                  ? 'center'
                  : value === 3
                    ? 'justify'
                    : value === 4
                      ? 'distributed'
                      : value === 5
                        ? 'centerContinuous'
                        : undefined;
          }
          var text = String(scalar(value)).trim().toLowerCase().replace(/[\s_-]/g, '');
          var map = {
            left: 'left',
            center: 'center',
            centre: 'center',
            centered: 'center',
            middle: 'center',
            right: 'right',
            justify: 'justify',
            justified: 'justify',
            distributed: 'distributed',
            centercontinuous: 'centerContinuous',
            continuouscenter: 'centerContinuous',
          };
          return Object.prototype.hasOwnProperty.call(map, text) ? map[text] : undefined;
        }

        function normalizeApiRangeVerticalAlignment(value) {
          if (value === undefined || value === null || value === '') return undefined;
          if (typeof value === 'number') {
            return value === 0
              ? 'bottom'
              : value === 1
                ? 'center'
                : value === 2
                  ? 'distributed'
                  : value === 3
                    ? 'justify'
                    : value === 4
                      ? 'top'
                      : undefined;
          }
          var text = String(scalar(value)).trim().toLowerCase().replace(/[\s_-]/g, '');
          var map = {
            top: 'top',
            center: 'center',
            centre: 'center',
            middle: 'center',
            bottom: 'bottom',
            justify: 'justify',
            justified: 'justify',
            distributed: 'distributed',
            dist: 'distributed',
          };
          return Object.prototype.hasOwnProperty.call(map, text) ? map[text] : undefined;
        }

        function makeColor(value) {
          if (!value) return null;
          var text = String(value).trim();
          if (text.charAt(0) === '#') text = text.slice(1);
          if (/^[0-9a-fA-F]{6}$/.test(text)) {
            var r = parseInt(text.slice(0, 2), 16);
            var g = parseInt(text.slice(2, 4), 16);
            var b = parseInt(text.slice(4, 6), 16);
            return call(Api, ['CreateColorFromRGB', 'CreateRGBColor', 'RGB'], [r, g, b]);
          }
          return call(Api, ['CreateColorByName', 'CreatePresetColor'], [String(value)]);
        }

        function getSheet(payload) {
          if (payload && payload.sheetName) {
            var named = call(Api, ['GetSheet'], [payload.sheetName]);
            if (named) return named;
          }
          return call(Api, ['GetActiveSheet'], []);
        }

        function getRange(payload) {
          payload = payload || {};
          var sheet = getSheet(payload);
          if (!sheet) throw new Error('No active worksheet.');
          if (payload.address) {
            return call(sheet, ['GetRange'], [payload.address]);
          }
          return call(Api, ['GetSelection'], []) || call(sheet, ['GetActiveCell'], []);
        }

        function getSheetName(sheet) {
          return (
            call(sheet, ['GetName'], []) ||
            call(sheet, ['getName'], []) ||
            sheet.Name ||
            sheet.name ||
            'Sheet'
          );
        }

        function serializeRange(range, options) {
          options = options || {};
          var cells = Number(call(range, ['GetCellsCount'], []) || 1);
          var includeValues = options.includeValues !== false && cells <= (options.maxCells || 200);
          var includeFormulas = Boolean(options.includeFormulas) && cells <= (options.maxCells || 200);
          var sheet = call(range, ['GetWorksheet'], []);
          return {
            sheetName: sheet ? getSheetName(sheet) : getSheetName(getSheet({})),
            address: call(range, ['GetAddress'], []),
            row: call(range, ['GetRow'], []),
            column: call(range, ['GetCol'], []),
            rowCount: call(range, ['GetRowsCount'], []),
            columnCount: call(range, ['GetColumnsCount'], []),
            cellCount: cells,
            values: includeValues ? toPlain(call(range, ['GetValue'], [])) : undefined,
            text: includeValues ? toPlain(call(range, ['GetText'], [])) : undefined,
            formulas: includeFormulas ? toPlain(call(range, ['GetFormula'], [])) : undefined,
            numberFormat: call(range, ['GetNumberFormat'], []),
          };
        }

        function applyFormat(range, format) {
          if (!format) return;
          if (format.fillColor) call(range, ['SetFillColor'], [makeColor(format.fillColor)]);
          if (format.fontColor) call(range, ['SetFontColor'], [makeColor(format.fontColor)]);
          if (format.bold !== undefined) call(range, ['SetBold'], [Boolean(format.bold)]);
          if (format.italic !== undefined) call(range, ['SetItalic'], [Boolean(format.italic)]);
          if (format.underline !== undefined) call(range, ['SetUnderline'], [Boolean(format.underline)]);
          if (format.strikeout !== undefined) call(range, ['SetStrikeout'], [Boolean(format.strikeout)]);
          if (format.fontName) call(range, ['SetFontName'], [String(format.fontName)]);
          if (format.fontSize) call(range, ['SetFontSize'], [Number(format.fontSize)]);
          if (format.numberFormat) call(range, ['SetNumberFormat'], [String(format.numberFormat)]);
          if (format.wrap !== undefined) call(range, ['SetWrap', 'SetWrapText'], [Boolean(format.wrap)]);
          var horizontalAlignment = normalizeApiRangeHorizontalAlignment(
            firstDefined([format.horizontalAlignment, format.horizontal, format.alignHorizontal])
          );
          if (horizontalAlignment !== undefined) call(range, ['SetAlignHorizontal'], [horizontalAlignment]);
          var verticalAlignment = normalizeApiRangeVerticalAlignment(
            firstDefined([format.verticalAlignment, format.vertical, format.alignVertical])
          );
          if (verticalAlignment !== undefined) call(range, ['SetAlignVertical'], [verticalAlignment]);
          if (format.columnWidth) call(range, ['SetColumnWidth'], [Number(format.columnWidth)]);
          if (format.rowHeight) call(range, ['SetRowHeight'], [Number(format.rowHeight)]);
        }

        function callRange(member, payload) {
          var range = getRange(Object.assign({}, payload.target || {}, payload.args || {}));
          var args = payload.args || {};
          var normalizedMember = String(member || '').trim().toLowerCase();
          if (!range) return fail('Range not found.', 'partial');

          if (member === 'values' || member === 'value' || member === 'set' || member === 'SetValue') {
            if (args.value !== undefined || args.values !== undefined) {
              call(range, ['SetValue'], [args.value !== undefined ? args.value : args.values]);
              return ok(serializeRange(range, { includeValues: true }), 'supported');
            }
            return ok(serializeRange(range, { includeValues: true }), 'supported');
          }

          if (member === 'formulas' || member === 'formula' || member === 'SetFormula') {
            if (args.formula !== undefined || args.formulas !== undefined) {
              call(range, ['SetFormula'], [args.formula !== undefined ? args.formula : args.formulas]);
              call(Api, ['RecalculateAllFormulas'], []);
              return ok(serializeRange(range, { includeValues: true, includeFormulas: true }), 'supported');
            }
            return ok(serializeRange(range, { includeFormulas: true }), 'supported');
          }

          if (member === 'numberFormat') {
            if (args.numberFormat) call(range, ['SetNumberFormat'], [String(args.numberFormat)]);
            return ok(serializeRange(range, { includeValues: true }), 'supported');
          }

          if (normalizedMember === 'horizontalalignment') {
            applyFormat(range, {
              horizontalAlignment: firstDefined([args.value, args.horizontalAlignment, args.horizontal, args.align]),
            });
            return ok(serializeRange(range, { includeValues: true }), 'supported');
          }

          if (normalizedMember === 'verticalalignment') {
            applyFormat(range, {
              verticalAlignment: firstDefined([args.value, args.verticalAlignment, args.vertical, args.align]),
            });
            return ok(serializeRange(range, { includeValues: true }), 'supported');
          }

          if (member === 'columnWidth') {
            var columnWidth = Number(args.columnWidth || args.width || args.value);
            if (!isFinite(columnWidth)) return fail('columnWidth requires args.value or args.columnWidth.', 'partial');
            call(range, ['SetColumnWidth'], [columnWidth]);
            return ok(serializeRange(range, { includeValues: true }), 'partial');
          }

          if (member === 'rowHeight') {
            var rowHeight = Number(args.rowHeight || args.height || args.value);
            if (!isFinite(rowHeight)) return fail('rowHeight requires args.value or args.rowHeight.', 'partial');
            call(range, ['SetRowHeight'], [rowHeight]);
            return ok(serializeRange(range, { includeValues: true }), 'partial');
          }

          if (member === 'format' || member === 'SetFormat') {
            applyFormat(range, args.format || args);
            return ok(serializeRange(range, { includeValues: true }), 'partial');
          }

          if (member === 'clear') {
            if (args.applyTo === 'contents') call(range, ['ClearContents'], []);
            else if (args.applyTo === 'formats') call(range, ['ClearFormats'], []);
            else call(range, ['Clear'], []);
            return ok(serializeRange(range, { includeValues: true }), 'supported');
          }

          if (member === 'clearOrResetContents' || member === 'clearContents') {
            call(range, ['ClearContents'], []);
            return ok(serializeRange(range, { includeValues: true }), 'supported');
          }

          if (member === 'select') {
            call(range, ['Select'], []);
            return ok(serializeRange(range, { includeValues: true }), 'supported');
          }

          if (member === 'merge') {
            call(range, ['Merge'], [args.across || false]);
            return ok(serializeRange(range, { includeValues: true }), 'supported');
          }

          if (member === 'unmerge') {
            call(range, ['UnMerge', 'Unmerge'], []);
            return ok(serializeRange(range, { includeValues: true }), 'supported');
          }

          if (member === 'delete') {
            call(range, ['Delete'], [args.shift]);
            return ok({ deleted: true }, 'partial');
          }

          if (member === 'insert') {
            call(range, ['Insert'], [args.shift]);
            return ok(serializeRange(range, { includeValues: true }), 'partial');
          }

          if (member === 'replace') {
            if (!args.what && !args.find) return fail('replace requires args.what or args.find.', 'partial');
            call(range, ['Replace'], [args.what || args.find, args.replacement || args.replace || '']);
            return ok(serializeRange(range, { includeValues: true }), 'partial');
          }

          if (member === 'calculate') {
            call(Api, ['RecalculateAllFormulas'], []);
            return ok(serializeRange(range, { includeValues: true, includeFormulas: true }), 'supported');
          }

          if (member === 'address') {
            return ok(serializeRange(range, { includeValues: false }), 'supported');
          }

          return fail('Range member is registered but not mapped in the bridge: ' + member, 'unsupported');
        }

        function callWorksheet(member, payload) {
          var args = payload.args || {};
          var sheet = getSheet(Object.assign({}, payload.target || {}, args || {}));

          if (member === 'add') {
            var newSheet = call(Api, ['AddSheet'], [args.name || 'Sheet']);
            return ok({ sheetName: newSheet ? getSheetName(newSheet) : args.name || 'Sheet' }, 'partial');
          }

          if (!sheet) return fail('Worksheet not found.', 'partial');

          if (member === 'activate') {
            call(sheet, ['SetActive', 'Activate'], []);
            try {
              sheet.Active = true;
            } catch (error) {}
            return ok({ sheetName: getSheetName(sheet) }, 'partial');
          }

          if (member === 'delete') {
            call(sheet, ['Delete'], []);
            return ok({ deleted: true }, 'partial');
          }

          if (member === 'getRange') {
            return ok(serializeRange(call(sheet, ['GetRange'], [args.address || (payload.target || {}).address || 'A1'])), 'supported');
          }

          if (member === 'getUsedRange' || member === 'getRangeAreas') {
            var used = call(sheet, ['GetUsedRange'], []);
            return used ? ok(serializeRange(used, { includeValues: true }), 'partial') : fail('GetUsedRange is unavailable.', 'unsupported');
          }

          if (member === 'calculate') {
            call(Api, ['RecalculateAllFormulas'], []);
            return ok({ calculated: true }, 'supported');
          }

          if (member === 'name') {
            if (args.name && hasMethod(sheet, ['SetName'])) call(sheet, ['SetName'], [String(args.name)]);
            return ok({ sheetName: getSheetName(sheet) }, 'partial');
          }

          if (member === 'addChart') {
            var source = args.sourceAddress ? call(sheet, ['GetRange'], [args.sourceAddress]) : getRange(payload.target || {});
            if (!hasMethod(sheet, ['AddChart'])) return fail('OnlyOffice AddChart is unavailable in this build.', 'unsupported');
            var chart = call(sheet, ['AddChart'], [String(args.chartType || args.type || 'bar'), source]);
            return ok({ chart: chart ? 'created' : 'requested' }, 'partial');
          }

          return fail('Worksheet member is registered but not mapped in the bridge: ' + member, 'unsupported');
        }

        function callWorkbook(member, payload) {
          if (member === 'calculate' || member === 'RecalculateAllFormulas') {
            call(Api, ['RecalculateAllFormulas'], []);
            return ok({ calculated: true }, 'supported');
          }

          if (member === 'getActiveCell') {
            return ok(serializeRange(call(Api, ['GetSelection'], []), { includeValues: true, includeFormulas: true }), 'supported');
          }

          if (member === 'getActiveWorksheet' || member === 'activeWorksheet') {
            var sheet = getSheet(payload.target || {});
            return ok({ sheetName: getSheetName(sheet) }, 'supported');
          }

          if (member === 'getSelectedRange' || member === 'getSelection') {
            return ok(serializeRange(call(Api, ['GetSelection'], []), { includeValues: true, includeFormulas: true }), 'supported');
          }

          if (member === 'comments' || member === 'getComments') {
            return ok({ comments: toPlain(call(Api, ['GetAllComments', 'GetComments'], [])) }, 'partial');
          }

          if (member === 'save') {
            return ok({ saved: call(Api, ['Save'], []) }, 'partial');
          }

          return fail('Workbook/Application member is registered but not mapped in the bridge: ' + member, 'unsupported');
        }

        function dispatch(action, payload) {
          payload = payload || {};
          if (action === 'getContext') {
            if (payload.scope === 'workbook') {
              var activeSheet = getSheet(payload);
              return ok({
                activeSheetName: getSheetName(activeSheet),
                selection: serializeRange(call(Api, ['GetSelection'], []), payload),
              });
            }
            if (payload.scope === 'worksheet') {
              var sheet = getSheet(payload);
              return ok({
                sheetName: getSheetName(sheet),
                usedRange: hasMethod(sheet, ['GetUsedRange'])
                  ? serializeRange(call(sheet, ['GetUsedRange'], []), payload)
                  : null,
                selection: serializeRange(call(Api, ['GetSelection'], []), payload),
              });
            }
            return ok(serializeRange(getRange(payload), payload));
          }

          if (action !== 'call') return fail('Unknown bridge action: ' + action, 'unsupported');

          var objectName = String(payload.objectName || '').toLowerCase();
          var member = String(payload.memberName || '');
          if (objectName.indexOf('range') >= 0 || objectName.indexOf('font') >= 0 || objectName.indexOf('fill') >= 0) {
            return callRange(member, payload);
          }
          if (objectName.indexOf('worksheet') >= 0 || objectName.indexOf('table') >= 0 || objectName.indexOf('chart') >= 0) {
            return callWorksheet(member, payload);
          }
          if (objectName.indexOf('workbook') >= 0 || objectName.indexOf('application') >= 0) {
            return callWorkbook(member, payload);
          }
          return fail('Object is registered but not mapped in the bridge: ' + payload.objectName, 'unsupported');
        }

        try {
          return dispatch(window.Asc.scope.__agentAction, window.Asc.scope.__agentPayload);
        } catch (error) {
          return fail(error && error.message ? error.message : String(error), 'partial');
        }
      },
      false,
      true,
      function (raw) {
        callback(raw);
      },
    );
  }

  function handleRequest(event) {
    var data = event.data;
    if (!data || data.source !== HOST_SOURCE || data.type !== 'request') return;
    runInEditor(data.action, data.payload, function (raw) {
      try {
        var parsed = typeof raw === 'string' ? JSON.parse(raw) : raw || {};
        result(data.id, Boolean(parsed.ok), parsed.supportLevel, parsed.result, parsed.error);
      } catch (error) {
        result(data.id, false, 'partial', null, error && error.message ? error.message : String(error));
      }
    });
  }

  window.addEventListener('message', handleRequest);

  window.Asc.plugin.init = function () {
    post({ type: 'ready' });
  };

  window.Asc.plugin.button = function () {};
})();
