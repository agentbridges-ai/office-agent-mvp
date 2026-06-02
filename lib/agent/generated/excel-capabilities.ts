import type { ExcelCapability } from '../types';

export const excelCapabilities: ExcelCapability[] = [
  {
    "id": "Excel.Workbook.autorunEventCompleted.method",
    "category": "工作簿与应用",
    "objectName": "Excel.Workbook",
    "memberName": "autorunEventCompleted",
    "memberKind": "method",
    "signature": "autorunEventCompleted(options)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "options": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "partial",
    "onlyOfficeMapping": "partial object coverage through the Office Agent bridge",
    "notes": "Registered from the Office.js reference table; bridge support is best-effort for this member."
  },
  {
    "id": "Excel.Workbook.close.method",
    "category": "工作簿与应用",
    "objectName": "Excel.Workbook",
    "memberName": "close",
    "memberKind": "method",
    "signature": "close(closeBehavior)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "closeBehavior": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "partial",
    "onlyOfficeMapping": "partial object coverage through the Office Agent bridge",
    "notes": "Registered from the Office.js reference table; bridge support is best-effort for this member."
  },
  {
    "id": "Excel.Workbook.focus.method",
    "category": "工作簿与应用",
    "objectName": "Excel.Workbook",
    "memberName": "focus",
    "memberKind": "method",
    "signature": "focus()",
    "supportLevel": "partial",
    "onlyOfficeMapping": "Editor already focused by the browser UI"
  },
  {
    "id": "Excel.Workbook.getActiveCell.method",
    "category": "工作簿与应用",
    "objectName": "Excel.Workbook",
    "memberName": "getActiveCell",
    "memberKind": "method",
    "signature": "getActiveCell()",
    "supportLevel": "supported",
    "onlyOfficeMapping": "Api.GetSelection()"
  },
  {
    "id": "Excel.Workbook.getActiveChart.method",
    "category": "工作簿与应用",
    "objectName": "Excel.Workbook",
    "memberName": "getActiveChart",
    "memberKind": "method",
    "signature": "getActiveChart()",
    "supportLevel": "partial",
    "onlyOfficeMapping": "partial object coverage through the Office Agent bridge",
    "notes": "Registered from the Office.js reference table; bridge support is best-effort for this member."
  },
  {
    "id": "Excel.Workbook.getActiveChartOrNullObject.method",
    "category": "工作簿与应用",
    "objectName": "Excel.Workbook",
    "memberName": "getActiveChartOrNullObject",
    "memberKind": "method",
    "signature": "getActiveChartOrNullObject()",
    "supportLevel": "partial",
    "onlyOfficeMapping": "partial object coverage through the Office Agent bridge",
    "notes": "Registered from the Office.js reference table; bridge support is best-effort for this member."
  },
  {
    "id": "Excel.Workbook.application.property",
    "category": "工作簿与应用",
    "objectName": "Excel.Workbook",
    "memberName": "application",
    "memberKind": "property",
    "signature": "application",
    "supportLevel": "partial",
    "onlyOfficeMapping": "partial object coverage through the Office Agent bridge",
    "notes": "Registered from the Office.js reference table; bridge support is best-effort for this member."
  },
  {
    "id": "Excel.Workbook.autoSave.property",
    "category": "工作簿与应用",
    "objectName": "Excel.Workbook",
    "memberName": "autoSave",
    "memberKind": "property",
    "signature": "autoSave",
    "supportLevel": "partial",
    "onlyOfficeMapping": "partial object coverage through the Office Agent bridge",
    "notes": "Registered from the Office.js reference table; bridge support is best-effort for this member."
  },
  {
    "id": "Excel.Workbook.bindings.property",
    "category": "工作簿与应用",
    "objectName": "Excel.Workbook",
    "memberName": "bindings",
    "memberKind": "property",
    "signature": "bindings",
    "supportLevel": "partial",
    "onlyOfficeMapping": "partial object coverage through the Office Agent bridge",
    "notes": "Registered from the Office.js reference table; bridge support is best-effort for this member."
  },
  {
    "id": "Excel.Workbook.calculationEngineVersion.property",
    "category": "工作簿与应用",
    "objectName": "Excel.Workbook",
    "memberName": "calculationEngineVersion",
    "memberKind": "property",
    "signature": "calculationEngineVersion",
    "supportLevel": "partial",
    "onlyOfficeMapping": "partial object coverage through the Office Agent bridge",
    "notes": "Registered from the Office.js reference table; bridge support is best-effort for this member."
  },
  {
    "id": "Excel.Workbook.chartDataPointTrack.property",
    "category": "工作簿与应用",
    "objectName": "Excel.Workbook",
    "memberName": "chartDataPointTrack",
    "memberKind": "property",
    "signature": "chartDataPointTrack",
    "supportLevel": "partial",
    "onlyOfficeMapping": "partial object coverage through the Office Agent bridge",
    "notes": "Registered from the Office.js reference table; bridge support is best-effort for this member."
  },
  {
    "id": "Excel.Workbook.comments.property",
    "category": "工作簿与应用",
    "objectName": "Excel.Workbook",
    "memberName": "comments",
    "memberKind": "property",
    "signature": "comments",
    "supportLevel": "partial",
    "onlyOfficeMapping": "partial object coverage through the Office Agent bridge",
    "notes": "Registered from the Office.js reference table; bridge support is best-effort for this member."
  },
  {
    "id": "Excel.Workbook.onActivated.event",
    "category": "工作簿与应用",
    "objectName": "Excel.Workbook",
    "memberName": "onActivated",
    "memberKind": "event",
    "signature": "onActivated",
    "supportLevel": "partial",
    "onlyOfficeMapping": "partial object coverage through the Office Agent bridge",
    "notes": "Registered from the Office.js reference table; bridge support is best-effort for this member."
  },
  {
    "id": "Excel.Workbook.onAutoSaveSettingChanged.event",
    "category": "工作簿与应用",
    "objectName": "Excel.Workbook",
    "memberName": "onAutoSaveSettingChanged",
    "memberKind": "event",
    "signature": "onAutoSaveSettingChanged",
    "supportLevel": "partial",
    "onlyOfficeMapping": "partial object coverage through the Office Agent bridge",
    "notes": "Registered from the Office.js reference table; bridge support is best-effort for this member."
  },
  {
    "id": "Excel.Workbook.onSelectionChanged.event",
    "category": "工作簿与应用",
    "objectName": "Excel.Workbook",
    "memberName": "onSelectionChanged",
    "memberKind": "event",
    "signature": "onSelectionChanged",
    "supportLevel": "partial",
    "onlyOfficeMapping": "partial object coverage through the Office Agent bridge",
    "notes": "Registered from the Office.js reference table; bridge support is best-effort for this member."
  },
  {
    "id": "Excel.Workbook_Range_Areas.getRangeAreasBySheet.method",
    "category": "工作簿与应用",
    "objectName": "Excel.Workbook Range Areas",
    "memberName": "getRangeAreasBySheet",
    "memberKind": "method",
    "signature": "getRangeAreasBySheet(key)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "key": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Workbook_Range_Areas.getRangeAreasOrNullObjectBySheet.method",
    "category": "工作簿与应用",
    "objectName": "Excel.Workbook Range Areas",
    "memberName": "getRangeAreasOrNullObjectBySheet",
    "memberKind": "method",
    "signature": "getRangeAreasOrNullObjectBySheet(key)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "key": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Workbook_Range_Areas.load.method",
    "category": "工作簿与应用",
    "objectName": "Excel.Workbook Range Areas",
    "memberName": "load",
    "memberKind": "method",
    "signature": "load(options)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "options": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Workbook_Range_Areas.load.method",
    "category": "工作簿与应用",
    "objectName": "Excel.Workbook Range Areas",
    "memberName": "load",
    "memberKind": "method",
    "signature": "load(propertyNames)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "propertyNames": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Workbook_Range_Areas.load.method",
    "category": "工作簿与应用",
    "objectName": "Excel.Workbook Range Areas",
    "memberName": "load",
    "memberKind": "method",
    "signature": "load(propertyNamesAndPaths)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "propertyNamesAndPaths": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Workbook_Range_Areas.toJSON.method",
    "category": "工作簿与应用",
    "objectName": "Excel.Workbook Range Areas",
    "memberName": "toJSON",
    "memberKind": "method",
    "signature": "toJSON()",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Workbook_Range_Areas.addresses.property",
    "category": "工作簿与应用",
    "objectName": "Excel.Workbook Range Areas",
    "memberName": "addresses",
    "memberKind": "property",
    "signature": "addresses",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Workbook_Range_Areas.areas.property",
    "category": "工作簿与应用",
    "objectName": "Excel.Workbook Range Areas",
    "memberName": "areas",
    "memberKind": "property",
    "signature": "areas",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Workbook_Range_Areas.context.property",
    "category": "工作簿与应用",
    "objectName": "Excel.Workbook Range Areas",
    "memberName": "context",
    "memberKind": "property",
    "signature": "context",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Workbook_Range_Areas.ranges.property",
    "category": "工作簿与应用",
    "objectName": "Excel.Workbook Range Areas",
    "memberName": "ranges",
    "memberKind": "property",
    "signature": "ranges",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Worksheet.activate.method",
    "category": "工作表",
    "objectName": "Excel.Worksheet",
    "memberName": "activate",
    "memberKind": "method",
    "signature": "activate()",
    "supportLevel": "partial",
    "onlyOfficeMapping": "Api.GetSheet(name).SetActive()/Active"
  },
  {
    "id": "Excel.Worksheet.calculate.method",
    "category": "工作表",
    "objectName": "Excel.Worksheet",
    "memberName": "calculate",
    "memberKind": "method",
    "signature": "calculate(markAllDirty)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "markAllDirty": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "supported",
    "onlyOfficeMapping": "Api.RecalculateAllFormulas()"
  },
  {
    "id": "Excel.Worksheet.checkSpelling.method",
    "category": "工作表",
    "objectName": "Excel.Worksheet",
    "memberName": "checkSpelling",
    "memberKind": "method",
    "signature": "checkSpelling(options)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "options": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "partial",
    "onlyOfficeMapping": "partial object coverage through the Office Agent bridge",
    "notes": "Registered from the Office.js reference table; bridge support is best-effort for this member."
  },
  {
    "id": "Excel.Worksheet.clearArrows.method",
    "category": "工作表",
    "objectName": "Excel.Worksheet",
    "memberName": "clearArrows",
    "memberKind": "method",
    "signature": "clearArrows()",
    "supportLevel": "partial",
    "onlyOfficeMapping": "partial object coverage through the Office Agent bridge",
    "notes": "Registered from the Office.js reference table; bridge support is best-effort for this member."
  },
  {
    "id": "Excel.Worksheet.copy.method",
    "category": "工作表",
    "objectName": "Excel.Worksheet",
    "memberName": "copy",
    "memberKind": "method",
    "signature": "copy(positionType, relativeTo)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "positionType": {
          "type": "unknown"
        },
        "relativeTo": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "partial",
    "onlyOfficeMapping": "partial object coverage through the Office Agent bridge",
    "notes": "Registered from the Office.js reference table; bridge support is best-effort for this member."
  },
  {
    "id": "Excel.Worksheet.delete.method",
    "category": "工作表",
    "objectName": "Excel.Worksheet",
    "memberName": "delete",
    "memberKind": "method",
    "signature": "delete()",
    "supportLevel": "partial",
    "onlyOfficeMapping": "ApiWorksheet.Delete()"
  },
  {
    "id": "Excel.Worksheet.autoFilter.property",
    "category": "工作表",
    "objectName": "Excel.Worksheet",
    "memberName": "autoFilter",
    "memberKind": "property",
    "signature": "autoFilter",
    "supportLevel": "partial",
    "onlyOfficeMapping": "partial object coverage through the Office Agent bridge",
    "notes": "Registered from the Office.js reference table; bridge support is best-effort for this member."
  },
  {
    "id": "Excel.Worksheet.charts.property",
    "category": "工作表",
    "objectName": "Excel.Worksheet",
    "memberName": "charts",
    "memberKind": "property",
    "signature": "charts",
    "supportLevel": "partial",
    "onlyOfficeMapping": "partial object coverage through the Office Agent bridge",
    "notes": "Registered from the Office.js reference table; bridge support is best-effort for this member."
  },
  {
    "id": "Excel.Worksheet.comments.property",
    "category": "工作表",
    "objectName": "Excel.Worksheet",
    "memberName": "comments",
    "memberKind": "property",
    "signature": "comments",
    "supportLevel": "partial",
    "onlyOfficeMapping": "partial object coverage through the Office Agent bridge",
    "notes": "Registered from the Office.js reference table; bridge support is best-effort for this member."
  },
  {
    "id": "Excel.Worksheet.context.property",
    "category": "工作表",
    "objectName": "Excel.Worksheet",
    "memberName": "context",
    "memberKind": "property",
    "signature": "context",
    "supportLevel": "partial",
    "onlyOfficeMapping": "partial object coverage through the Office Agent bridge",
    "notes": "Registered from the Office.js reference table; bridge support is best-effort for this member."
  },
  {
    "id": "Excel.Worksheet.customProperties.property",
    "category": "工作表",
    "objectName": "Excel.Worksheet",
    "memberName": "customProperties",
    "memberKind": "property",
    "signature": "customProperties",
    "supportLevel": "partial",
    "onlyOfficeMapping": "partial object coverage through the Office Agent bridge",
    "notes": "Registered from the Office.js reference table; bridge support is best-effort for this member."
  },
  {
    "id": "Excel.Worksheet.enableCalculation.property",
    "category": "工作表",
    "objectName": "Excel.Worksheet",
    "memberName": "enableCalculation",
    "memberKind": "property",
    "signature": "enableCalculation",
    "supportLevel": "partial",
    "onlyOfficeMapping": "partial object coverage through the Office Agent bridge",
    "notes": "Registered from the Office.js reference table; bridge support is best-effort for this member."
  },
  {
    "id": "Excel.Worksheet.onActivated.event",
    "category": "工作表",
    "objectName": "Excel.Worksheet",
    "memberName": "onActivated",
    "memberKind": "event",
    "signature": "onActivated",
    "supportLevel": "partial",
    "onlyOfficeMapping": "partial object coverage through the Office Agent bridge",
    "notes": "Registered from the Office.js reference table; bridge support is best-effort for this member."
  },
  {
    "id": "Excel.Worksheet.onCalculated.event",
    "category": "工作表",
    "objectName": "Excel.Worksheet",
    "memberName": "onCalculated",
    "memberKind": "event",
    "signature": "onCalculated",
    "supportLevel": "partial",
    "onlyOfficeMapping": "partial object coverage through the Office Agent bridge",
    "notes": "Registered from the Office.js reference table; bridge support is best-effort for this member."
  },
  {
    "id": "Excel.Worksheet.onChanged.event",
    "category": "工作表",
    "objectName": "Excel.Worksheet",
    "memberName": "onChanged",
    "memberKind": "event",
    "signature": "onChanged",
    "supportLevel": "partial",
    "onlyOfficeMapping": "partial object coverage through the Office Agent bridge",
    "notes": "Registered from the Office.js reference table; bridge support is best-effort for this member."
  },
  {
    "id": "Excel.Worksheet.onColumnSorted.event",
    "category": "工作表",
    "objectName": "Excel.Worksheet",
    "memberName": "onColumnSorted",
    "memberKind": "event",
    "signature": "onColumnSorted",
    "supportLevel": "partial",
    "onlyOfficeMapping": "partial object coverage through the Office Agent bridge",
    "notes": "Registered from the Office.js reference table; bridge support is best-effort for this member."
  },
  {
    "id": "Excel.Worksheet.onDeactivated.event",
    "category": "工作表",
    "objectName": "Excel.Worksheet",
    "memberName": "onDeactivated",
    "memberKind": "event",
    "signature": "onDeactivated",
    "supportLevel": "partial",
    "onlyOfficeMapping": "partial object coverage through the Office Agent bridge",
    "notes": "Registered from the Office.js reference table; bridge support is best-effort for this member."
  },
  {
    "id": "Excel.Worksheet.onFiltered.event",
    "category": "工作表",
    "objectName": "Excel.Worksheet",
    "memberName": "onFiltered",
    "memberKind": "event",
    "signature": "onFiltered",
    "supportLevel": "partial",
    "onlyOfficeMapping": "partial object coverage through the Office Agent bridge",
    "notes": "Registered from the Office.js reference table; bridge support is best-effort for this member."
  },
  {
    "id": "Excel.Worksheet_Collection.add.method",
    "category": "工作表",
    "objectName": "Excel.Worksheet Collection",
    "memberName": "add",
    "memberKind": "method",
    "signature": "add(name)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "name": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "partial",
    "onlyOfficeMapping": "Api.AddSheet(name)"
  },
  {
    "id": "Excel.Worksheet_Collection.addFromBase64.method",
    "category": "工作表",
    "objectName": "Excel.Worksheet Collection",
    "memberName": "addFromBase64",
    "memberKind": "method",
    "signature": "addFromBase64(base64File, sheetNamesToInsert, positionType, relativeTo)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "base64File": {
          "type": "unknown"
        },
        "sheetNamesToInsert": {
          "type": "unknown"
        },
        "positionType": {
          "type": "unknown"
        },
        "relativeTo": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "partial",
    "onlyOfficeMapping": "partial object coverage through the Office Agent bridge",
    "notes": "Registered from the Office.js reference table; bridge support is best-effort for this member."
  },
  {
    "id": "Excel.Worksheet_Collection.getActiveWorksheet.method",
    "category": "工作表",
    "objectName": "Excel.Worksheet Collection",
    "memberName": "getActiveWorksheet",
    "memberKind": "method",
    "signature": "getActiveWorksheet()",
    "supportLevel": "partial",
    "onlyOfficeMapping": "partial object coverage through the Office Agent bridge",
    "notes": "Registered from the Office.js reference table; bridge support is best-effort for this member."
  },
  {
    "id": "Excel.Worksheet_Collection.getCount.method",
    "category": "工作表",
    "objectName": "Excel.Worksheet Collection",
    "memberName": "getCount",
    "memberKind": "method",
    "signature": "getCount(visibleOnly)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "visibleOnly": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "partial",
    "onlyOfficeMapping": "partial object coverage through the Office Agent bridge",
    "notes": "Registered from the Office.js reference table; bridge support is best-effort for this member."
  },
  {
    "id": "Excel.Worksheet_Collection.getFirst.method",
    "category": "工作表",
    "objectName": "Excel.Worksheet Collection",
    "memberName": "getFirst",
    "memberKind": "method",
    "signature": "getFirst(visibleOnly)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "visibleOnly": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "partial",
    "onlyOfficeMapping": "partial object coverage through the Office Agent bridge",
    "notes": "Registered from the Office.js reference table; bridge support is best-effort for this member."
  },
  {
    "id": "Excel.Worksheet_Collection.getItem.method",
    "category": "工作表",
    "objectName": "Excel.Worksheet Collection",
    "memberName": "getItem",
    "memberKind": "method",
    "signature": "getItem(key)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "key": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "partial",
    "onlyOfficeMapping": "partial object coverage through the Office Agent bridge",
    "notes": "Registered from the Office.js reference table; bridge support is best-effort for this member."
  },
  {
    "id": "Excel.Worksheet_Collection.context.property",
    "category": "工作表",
    "objectName": "Excel.Worksheet Collection",
    "memberName": "context",
    "memberKind": "property",
    "signature": "context",
    "supportLevel": "partial",
    "onlyOfficeMapping": "partial object coverage through the Office Agent bridge",
    "notes": "Registered from the Office.js reference table; bridge support is best-effort for this member."
  },
  {
    "id": "Excel.Worksheet_Collection.items.property",
    "category": "工作表",
    "objectName": "Excel.Worksheet Collection",
    "memberName": "items",
    "memberKind": "property",
    "signature": "items",
    "supportLevel": "partial",
    "onlyOfficeMapping": "partial object coverage through the Office Agent bridge",
    "notes": "Registered from the Office.js reference table; bridge support is best-effort for this member."
  },
  {
    "id": "Excel.Worksheet_Collection.onActivated.event",
    "category": "工作表",
    "objectName": "Excel.Worksheet Collection",
    "memberName": "onActivated",
    "memberKind": "event",
    "signature": "onActivated",
    "supportLevel": "partial",
    "onlyOfficeMapping": "partial object coverage through the Office Agent bridge",
    "notes": "Registered from the Office.js reference table; bridge support is best-effort for this member."
  },
  {
    "id": "Excel.Worksheet_Collection.onAdded.event",
    "category": "工作表",
    "objectName": "Excel.Worksheet Collection",
    "memberName": "onAdded",
    "memberKind": "event",
    "signature": "onAdded",
    "supportLevel": "partial",
    "onlyOfficeMapping": "partial object coverage through the Office Agent bridge",
    "notes": "Registered from the Office.js reference table; bridge support is best-effort for this member."
  },
  {
    "id": "Excel.Worksheet_Collection.onCalculated.event",
    "category": "工作表",
    "objectName": "Excel.Worksheet Collection",
    "memberName": "onCalculated",
    "memberKind": "event",
    "signature": "onCalculated",
    "supportLevel": "partial",
    "onlyOfficeMapping": "partial object coverage through the Office Agent bridge",
    "notes": "Registered from the Office.js reference table; bridge support is best-effort for this member."
  },
  {
    "id": "Excel.Worksheet_Collection.onChanged.event",
    "category": "工作表",
    "objectName": "Excel.Worksheet Collection",
    "memberName": "onChanged",
    "memberKind": "event",
    "signature": "onChanged",
    "supportLevel": "partial",
    "onlyOfficeMapping": "partial object coverage through the Office Agent bridge",
    "notes": "Registered from the Office.js reference table; bridge support is best-effort for this member."
  },
  {
    "id": "Excel.Worksheet_Collection.onColumnSorted.event",
    "category": "工作表",
    "objectName": "Excel.Worksheet Collection",
    "memberName": "onColumnSorted",
    "memberKind": "event",
    "signature": "onColumnSorted",
    "supportLevel": "partial",
    "onlyOfficeMapping": "partial object coverage through the Office Agent bridge",
    "notes": "Registered from the Office.js reference table; bridge support is best-effort for this member."
  },
  {
    "id": "Excel.Worksheet_Collection.onDeactivated.event",
    "category": "工作表",
    "objectName": "Excel.Worksheet Collection",
    "memberName": "onDeactivated",
    "memberKind": "event",
    "signature": "onDeactivated",
    "supportLevel": "partial",
    "onlyOfficeMapping": "partial object coverage through the Office Agent bridge",
    "notes": "Registered from the Office.js reference table; bridge support is best-effort for this member."
  },
  {
    "id": "Excel.Worksheet_Protection.checkPassword.method",
    "category": "工作表",
    "objectName": "Excel.Worksheet Protection",
    "memberName": "checkPassword",
    "memberKind": "method",
    "signature": "checkPassword(password)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "password": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Worksheet_Protection.load.method",
    "category": "工作表",
    "objectName": "Excel.Worksheet Protection",
    "memberName": "load",
    "memberKind": "method",
    "signature": "load(options)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "options": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Worksheet_Protection.load.method",
    "category": "工作表",
    "objectName": "Excel.Worksheet Protection",
    "memberName": "load",
    "memberKind": "method",
    "signature": "load(propertyNames)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "propertyNames": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Worksheet_Protection.load.method",
    "category": "工作表",
    "objectName": "Excel.Worksheet Protection",
    "memberName": "load",
    "memberKind": "method",
    "signature": "load(propertyNamesAndPaths)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "propertyNamesAndPaths": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Worksheet_Protection.pauseProtection.method",
    "category": "工作表",
    "objectName": "Excel.Worksheet Protection",
    "memberName": "pauseProtection",
    "memberKind": "method",
    "signature": "pauseProtection(password)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "password": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Worksheet_Protection.protect.method",
    "category": "工作表",
    "objectName": "Excel.Worksheet Protection",
    "memberName": "protect",
    "memberKind": "method",
    "signature": "protect(options, password)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "options": {
          "type": "unknown"
        },
        "password": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Worksheet_Protection.allowEditRanges.property",
    "category": "工作表",
    "objectName": "Excel.Worksheet Protection",
    "memberName": "allowEditRanges",
    "memberKind": "property",
    "signature": "allowEditRanges",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Worksheet_Protection.canPauseProtection.property",
    "category": "工作表",
    "objectName": "Excel.Worksheet Protection",
    "memberName": "canPauseProtection",
    "memberKind": "property",
    "signature": "canPauseProtection",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Worksheet_Protection.context.property",
    "category": "工作表",
    "objectName": "Excel.Worksheet Protection",
    "memberName": "context",
    "memberKind": "property",
    "signature": "context",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Worksheet_Protection.isPasswordProtected.property",
    "category": "工作表",
    "objectName": "Excel.Worksheet Protection",
    "memberName": "isPasswordProtected",
    "memberKind": "property",
    "signature": "isPasswordProtected",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Worksheet_Protection.isPaused.property",
    "category": "工作表",
    "objectName": "Excel.Worksheet Protection",
    "memberName": "isPaused",
    "memberKind": "property",
    "signature": "isPaused",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Worksheet_Protection.options.property",
    "category": "工作表",
    "objectName": "Excel.Worksheet Protection",
    "memberName": "options",
    "memberKind": "property",
    "signature": "options",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Range.autoFill.method",
    "category": "区域",
    "objectName": "Excel.Range",
    "memberName": "autoFill",
    "memberKind": "method",
    "signature": "autoFill(destinationRange, autoFillType)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "destinationRange": {
          "type": "unknown"
        },
        "autoFillType": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "partial",
    "onlyOfficeMapping": "partial object coverage through the Office Agent bridge",
    "notes": "Registered from the Office.js reference table; bridge support is best-effort for this member."
  },
  {
    "id": "Excel.Range.calculate.method",
    "category": "区域",
    "objectName": "Excel.Range",
    "memberName": "calculate",
    "memberKind": "method",
    "signature": "calculate()",
    "supportLevel": "supported",
    "onlyOfficeMapping": "Api.RecalculateAllFormulas()"
  },
  {
    "id": "Excel.Range.checkSpelling.method",
    "category": "区域",
    "objectName": "Excel.Range",
    "memberName": "checkSpelling",
    "memberKind": "method",
    "signature": "checkSpelling(options)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "options": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "partial",
    "onlyOfficeMapping": "partial object coverage through the Office Agent bridge",
    "notes": "Registered from the Office.js reference table; bridge support is best-effort for this member."
  },
  {
    "id": "Excel.Range.clear.method",
    "category": "区域",
    "objectName": "Excel.Range",
    "memberName": "clear",
    "memberKind": "method",
    "signature": "clear(applyTo)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "applyTo": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "supported",
    "onlyOfficeMapping": "ApiRange.Clear()/ClearContents()/ClearFormats()"
  },
  {
    "id": "Excel.Range.clearOrResetContents.method",
    "category": "区域",
    "objectName": "Excel.Range",
    "memberName": "clearOrResetContents",
    "memberKind": "method",
    "signature": "clearOrResetContents()",
    "supportLevel": "supported",
    "onlyOfficeMapping": "ApiRange.ClearContents()"
  },
  {
    "id": "Excel.Range.convertDataTypeToText.method",
    "category": "区域",
    "objectName": "Excel.Range",
    "memberName": "convertDataTypeToText",
    "memberKind": "method",
    "signature": "convertDataTypeToText()",
    "supportLevel": "partial",
    "onlyOfficeMapping": "partial object coverage through the Office Agent bridge",
    "notes": "Registered from the Office.js reference table; bridge support is best-effort for this member."
  },
  {
    "id": "Excel.Range.address.property",
    "category": "区域",
    "objectName": "Excel.Range",
    "memberName": "address",
    "memberKind": "property",
    "signature": "address",
    "supportLevel": "supported",
    "onlyOfficeMapping": "ApiRange.GetAddress()"
  },
  {
    "id": "Excel.Range.addressLocal.property",
    "category": "区域",
    "objectName": "Excel.Range",
    "memberName": "addressLocal",
    "memberKind": "property",
    "signature": "addressLocal",
    "supportLevel": "partial",
    "onlyOfficeMapping": "partial object coverage through the Office Agent bridge",
    "notes": "Registered from the Office.js reference table; bridge support is best-effort for this member."
  },
  {
    "id": "Excel.Range.cellCount.property",
    "category": "区域",
    "objectName": "Excel.Range",
    "memberName": "cellCount",
    "memberKind": "property",
    "signature": "cellCount",
    "supportLevel": "partial",
    "onlyOfficeMapping": "partial object coverage through the Office Agent bridge",
    "notes": "Registered from the Office.js reference table; bridge support is best-effort for this member."
  },
  {
    "id": "Excel.Range.columnCount.property",
    "category": "区域",
    "objectName": "Excel.Range",
    "memberName": "columnCount",
    "memberKind": "property",
    "signature": "columnCount",
    "supportLevel": "partial",
    "onlyOfficeMapping": "partial object coverage through the Office Agent bridge",
    "notes": "Registered from the Office.js reference table; bridge support is best-effort for this member."
  },
  {
    "id": "Excel.Range.columnHidden.property",
    "category": "区域",
    "objectName": "Excel.Range",
    "memberName": "columnHidden",
    "memberKind": "property",
    "signature": "columnHidden",
    "supportLevel": "partial",
    "onlyOfficeMapping": "partial object coverage through the Office Agent bridge",
    "notes": "Registered from the Office.js reference table; bridge support is best-effort for this member."
  },
  {
    "id": "Excel.Range.columnIndex.property",
    "category": "区域",
    "objectName": "Excel.Range",
    "memberName": "columnIndex",
    "memberKind": "property",
    "signature": "columnIndex",
    "supportLevel": "partial",
    "onlyOfficeMapping": "partial object coverage through the Office Agent bridge",
    "notes": "Registered from the Office.js reference table; bridge support is best-effort for this member."
  },
  {
    "id": "Excel.Range_Areas.calculate.method",
    "category": "区域",
    "objectName": "Excel.Range Areas",
    "memberName": "calculate",
    "memberKind": "method",
    "signature": "calculate()",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Range_Areas.clear.method",
    "category": "区域",
    "objectName": "Excel.Range Areas",
    "memberName": "clear",
    "memberKind": "method",
    "signature": "clear(applyTo)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "applyTo": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Range_Areas.clearOrResetContents.method",
    "category": "区域",
    "objectName": "Excel.Range Areas",
    "memberName": "clearOrResetContents",
    "memberKind": "method",
    "signature": "clearOrResetContents()",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Range_Areas.convertDataTypeToText.method",
    "category": "区域",
    "objectName": "Excel.Range Areas",
    "memberName": "convertDataTypeToText",
    "memberKind": "method",
    "signature": "convertDataTypeToText()",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Range_Areas.convertToLinkedDataType.method",
    "category": "区域",
    "objectName": "Excel.Range Areas",
    "memberName": "convertToLinkedDataType",
    "memberKind": "method",
    "signature": "convertToLinkedDataType(serviceID, languageCulture)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "serviceID": {
          "type": "unknown"
        },
        "languageCulture": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Range_Areas.copyFrom.method",
    "category": "区域",
    "objectName": "Excel.Range Areas",
    "memberName": "copyFrom",
    "memberKind": "method",
    "signature": "copyFrom(sourceRange, copyType, skipBlanks, transpose)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "sourceRange": {
          "type": "unknown"
        },
        "copyType": {
          "type": "unknown"
        },
        "skipBlanks": {
          "type": "unknown"
        },
        "transpose": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Range_Areas.address.property",
    "category": "区域",
    "objectName": "Excel.Range Areas",
    "memberName": "address",
    "memberKind": "property",
    "signature": "address",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Range_Areas.addressLocal.property",
    "category": "区域",
    "objectName": "Excel.Range Areas",
    "memberName": "addressLocal",
    "memberKind": "property",
    "signature": "addressLocal",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Range_Areas.areaCount.property",
    "category": "区域",
    "objectName": "Excel.Range Areas",
    "memberName": "areaCount",
    "memberKind": "property",
    "signature": "areaCount",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Range_Areas.areas.property",
    "category": "区域",
    "objectName": "Excel.Range Areas",
    "memberName": "areas",
    "memberKind": "property",
    "signature": "areas",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Range_Areas.cellCount.property",
    "category": "区域",
    "objectName": "Excel.Range Areas",
    "memberName": "cellCount",
    "memberKind": "property",
    "signature": "cellCount",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Range_Areas.conditionalFormats.property",
    "category": "区域",
    "objectName": "Excel.Range Areas",
    "memberName": "conditionalFormats",
    "memberKind": "property",
    "signature": "conditionalFormats",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Range_View.getRange.method",
    "category": "区域",
    "objectName": "Excel.Range View",
    "memberName": "getRange",
    "memberKind": "method",
    "signature": "getRange()",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Range_View.load.method",
    "category": "区域",
    "objectName": "Excel.Range View",
    "memberName": "load",
    "memberKind": "method",
    "signature": "load(options)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "options": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Range_View.load.method",
    "category": "区域",
    "objectName": "Excel.Range View",
    "memberName": "load",
    "memberKind": "method",
    "signature": "load(propertyNames)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "propertyNames": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Range_View.load.method",
    "category": "区域",
    "objectName": "Excel.Range View",
    "memberName": "load",
    "memberKind": "method",
    "signature": "load(propertyNamesAndPaths)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "propertyNamesAndPaths": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Range_View.set.method",
    "category": "区域",
    "objectName": "Excel.Range View",
    "memberName": "set",
    "memberKind": "method",
    "signature": "set(properties, options)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "properties": {
          "type": "unknown"
        },
        "options": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Range_View.set.method",
    "category": "区域",
    "objectName": "Excel.Range View",
    "memberName": "set",
    "memberKind": "method",
    "signature": "set(properties)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "properties": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Range_View.cellAddresses.property",
    "category": "区域",
    "objectName": "Excel.Range View",
    "memberName": "cellAddresses",
    "memberKind": "property",
    "signature": "cellAddresses",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Range_View.columnCount.property",
    "category": "区域",
    "objectName": "Excel.Range View",
    "memberName": "columnCount",
    "memberKind": "property",
    "signature": "columnCount",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Range_View.context.property",
    "category": "区域",
    "objectName": "Excel.Range View",
    "memberName": "context",
    "memberKind": "property",
    "signature": "context",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Range_View.formulas.property",
    "category": "区域",
    "objectName": "Excel.Range View",
    "memberName": "formulas",
    "memberKind": "property",
    "signature": "formulas",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Range_View.formulasLocal.property",
    "category": "区域",
    "objectName": "Excel.Range View",
    "memberName": "formulasLocal",
    "memberKind": "property",
    "signature": "formulasLocal",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Range_View.formulasR1C1.property",
    "category": "区域",
    "objectName": "Excel.Range View",
    "memberName": "formulasR1C1",
    "memberKind": "property",
    "signature": "formulasR1C1",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Range_Format.adjustIndent.method",
    "category": "格式",
    "objectName": "Excel.Range Format",
    "memberName": "adjustIndent",
    "memberKind": "method",
    "signature": "adjustIndent(amount)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "amount": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "partial",
    "onlyOfficeMapping": "partial object coverage through the Office Agent bridge",
    "notes": "Registered from the Office.js reference table; bridge support is best-effort for this member."
  },
  {
    "id": "Excel.Range_Format.autofitColumns.method",
    "category": "格式",
    "objectName": "Excel.Range Format",
    "memberName": "autofitColumns",
    "memberKind": "method",
    "signature": "autofitColumns()",
    "supportLevel": "partial",
    "onlyOfficeMapping": "ApiRange.AutoFit()"
  },
  {
    "id": "Excel.Range_Format.autofitRows.method",
    "category": "格式",
    "objectName": "Excel.Range Format",
    "memberName": "autofitRows",
    "memberKind": "method",
    "signature": "autofitRows()",
    "supportLevel": "partial",
    "onlyOfficeMapping": "ApiRange.AutoFit()"
  },
  {
    "id": "Excel.Range_Format.load.method",
    "category": "格式",
    "objectName": "Excel.Range Format",
    "memberName": "load",
    "memberKind": "method",
    "signature": "load(options)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "options": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "partial",
    "onlyOfficeMapping": "partial object coverage through the Office Agent bridge",
    "notes": "Registered from the Office.js reference table; bridge support is best-effort for this member."
  },
  {
    "id": "Excel.Range_Format.load.method",
    "category": "格式",
    "objectName": "Excel.Range Format",
    "memberName": "load",
    "memberKind": "method",
    "signature": "load(propertyNames)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "propertyNames": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "partial",
    "onlyOfficeMapping": "partial object coverage through the Office Agent bridge",
    "notes": "Registered from the Office.js reference table; bridge support is best-effort for this member."
  },
  {
    "id": "Excel.Range_Format.load.method",
    "category": "格式",
    "objectName": "Excel.Range Format",
    "memberName": "load",
    "memberKind": "method",
    "signature": "load(propertyNamesAndPaths)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "propertyNamesAndPaths": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "partial",
    "onlyOfficeMapping": "partial object coverage through the Office Agent bridge",
    "notes": "Registered from the Office.js reference table; bridge support is best-effort for this member."
  },
  {
    "id": "Excel.Range_Format.autoIndent.property",
    "category": "格式",
    "objectName": "Excel.Range Format",
    "memberName": "autoIndent",
    "memberKind": "property",
    "signature": "autoIndent",
    "supportLevel": "partial",
    "onlyOfficeMapping": "partial object coverage through the Office Agent bridge",
    "notes": "Registered from the Office.js reference table; bridge support is best-effort for this member."
  },
  {
    "id": "Excel.Range_Format.borders.property",
    "category": "格式",
    "objectName": "Excel.Range Format",
    "memberName": "borders",
    "memberKind": "property",
    "signature": "borders",
    "supportLevel": "partial",
    "onlyOfficeMapping": "partial object coverage through the Office Agent bridge",
    "notes": "Registered from the Office.js reference table; bridge support is best-effort for this member."
  },
  {
    "id": "Excel.Range_Format.columnWidth.property",
    "category": "格式",
    "objectName": "Excel.Range Format",
    "memberName": "columnWidth",
    "memberKind": "property",
    "signature": "columnWidth",
    "supportLevel": "partial",
    "onlyOfficeMapping": "partial object coverage through the Office Agent bridge",
    "notes": "Registered from the Office.js reference table; bridge support is best-effort for this member."
  },
  {
    "id": "Excel.Range_Format.context.property",
    "category": "格式",
    "objectName": "Excel.Range Format",
    "memberName": "context",
    "memberKind": "property",
    "signature": "context",
    "supportLevel": "partial",
    "onlyOfficeMapping": "partial object coverage through the Office Agent bridge",
    "notes": "Registered from the Office.js reference table; bridge support is best-effort for this member."
  },
  {
    "id": "Excel.Range_Format.fill.property",
    "category": "格式",
    "objectName": "Excel.Range Format",
    "memberName": "fill",
    "memberKind": "property",
    "signature": "fill",
    "supportLevel": "partial",
    "onlyOfficeMapping": "partial object coverage through the Office Agent bridge",
    "notes": "Registered from the Office.js reference table; bridge support is best-effort for this member."
  },
  {
    "id": "Excel.Range_Format.font.property",
    "category": "格式",
    "objectName": "Excel.Range Format",
    "memberName": "font",
    "memberKind": "property",
    "signature": "font",
    "supportLevel": "partial",
    "onlyOfficeMapping": "partial object coverage through the Office Agent bridge",
    "notes": "Registered from the Office.js reference table; bridge support is best-effort for this member."
  },
  {
    "id": "Excel.Range_Font.load.method",
    "category": "格式",
    "objectName": "Excel.Range Font",
    "memberName": "load",
    "memberKind": "method",
    "signature": "load(options)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "options": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "partial",
    "onlyOfficeMapping": "partial object coverage through the Office Agent bridge",
    "notes": "Registered from the Office.js reference table; bridge support is best-effort for this member."
  },
  {
    "id": "Excel.Range_Font.load.method",
    "category": "格式",
    "objectName": "Excel.Range Font",
    "memberName": "load",
    "memberKind": "method",
    "signature": "load(propertyNames)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "propertyNames": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "partial",
    "onlyOfficeMapping": "partial object coverage through the Office Agent bridge",
    "notes": "Registered from the Office.js reference table; bridge support is best-effort for this member."
  },
  {
    "id": "Excel.Range_Font.load.method",
    "category": "格式",
    "objectName": "Excel.Range Font",
    "memberName": "load",
    "memberKind": "method",
    "signature": "load(propertyNamesAndPaths)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "propertyNamesAndPaths": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "partial",
    "onlyOfficeMapping": "partial object coverage through the Office Agent bridge",
    "notes": "Registered from the Office.js reference table; bridge support is best-effort for this member."
  },
  {
    "id": "Excel.Range_Font.set.method",
    "category": "格式",
    "objectName": "Excel.Range Font",
    "memberName": "set",
    "memberKind": "method",
    "signature": "set(properties, options)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "properties": {
          "type": "unknown"
        },
        "options": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "partial",
    "onlyOfficeMapping": "partial object coverage through the Office Agent bridge",
    "notes": "Registered from the Office.js reference table; bridge support is best-effort for this member."
  },
  {
    "id": "Excel.Range_Font.set.method",
    "category": "格式",
    "objectName": "Excel.Range Font",
    "memberName": "set",
    "memberKind": "method",
    "signature": "set(properties)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "properties": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "partial",
    "onlyOfficeMapping": "partial object coverage through the Office Agent bridge",
    "notes": "Registered from the Office.js reference table; bridge support is best-effort for this member."
  },
  {
    "id": "Excel.Range_Font.toJSON.method",
    "category": "格式",
    "objectName": "Excel.Range Font",
    "memberName": "toJSON",
    "memberKind": "method",
    "signature": "toJSON()",
    "supportLevel": "partial",
    "onlyOfficeMapping": "partial object coverage through the Office Agent bridge",
    "notes": "Registered from the Office.js reference table; bridge support is best-effort for this member."
  },
  {
    "id": "Excel.Range_Font.bold.property",
    "category": "格式",
    "objectName": "Excel.Range Font",
    "memberName": "bold",
    "memberKind": "property",
    "signature": "bold",
    "supportLevel": "supported",
    "onlyOfficeMapping": "ApiRange.SetBold()"
  },
  {
    "id": "Excel.Range_Font.color.property",
    "category": "格式",
    "objectName": "Excel.Range Font",
    "memberName": "color",
    "memberKind": "property",
    "signature": "color",
    "supportLevel": "supported",
    "onlyOfficeMapping": "ApiRange.SetFontColor()"
  },
  {
    "id": "Excel.Range_Font.context.property",
    "category": "格式",
    "objectName": "Excel.Range Font",
    "memberName": "context",
    "memberKind": "property",
    "signature": "context",
    "supportLevel": "partial",
    "onlyOfficeMapping": "partial object coverage through the Office Agent bridge",
    "notes": "Registered from the Office.js reference table; bridge support is best-effort for this member."
  },
  {
    "id": "Excel.Range_Font.italic.property",
    "category": "格式",
    "objectName": "Excel.Range Font",
    "memberName": "italic",
    "memberKind": "property",
    "signature": "italic",
    "supportLevel": "supported",
    "onlyOfficeMapping": "ApiRange.SetItalic()"
  },
  {
    "id": "Excel.Range_Font.size.property",
    "category": "格式",
    "objectName": "Excel.Range Font",
    "memberName": "size",
    "memberKind": "property",
    "signature": "size",
    "supportLevel": "supported",
    "onlyOfficeMapping": "ApiRange.SetFontSize()"
  },
  {
    "id": "Excel.Range_Font.strikethrough.property",
    "category": "格式",
    "objectName": "Excel.Range Font",
    "memberName": "strikethrough",
    "memberKind": "property",
    "signature": "strikethrough",
    "supportLevel": "partial",
    "onlyOfficeMapping": "partial object coverage through the Office Agent bridge",
    "notes": "Registered from the Office.js reference table; bridge support is best-effort for this member."
  },
  {
    "id": "Excel.Range_Fill.clear.method",
    "category": "格式",
    "objectName": "Excel.Range Fill",
    "memberName": "clear",
    "memberKind": "method",
    "signature": "clear()",
    "supportLevel": "partial",
    "onlyOfficeMapping": "partial object coverage through the Office Agent bridge",
    "notes": "Registered from the Office.js reference table; bridge support is best-effort for this member."
  },
  {
    "id": "Excel.Range_Fill.load.method",
    "category": "格式",
    "objectName": "Excel.Range Fill",
    "memberName": "load",
    "memberKind": "method",
    "signature": "load(options)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "options": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "partial",
    "onlyOfficeMapping": "partial object coverage through the Office Agent bridge",
    "notes": "Registered from the Office.js reference table; bridge support is best-effort for this member."
  },
  {
    "id": "Excel.Range_Fill.load.method",
    "category": "格式",
    "objectName": "Excel.Range Fill",
    "memberName": "load",
    "memberKind": "method",
    "signature": "load(propertyNames)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "propertyNames": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "partial",
    "onlyOfficeMapping": "partial object coverage through the Office Agent bridge",
    "notes": "Registered from the Office.js reference table; bridge support is best-effort for this member."
  },
  {
    "id": "Excel.Range_Fill.load.method",
    "category": "格式",
    "objectName": "Excel.Range Fill",
    "memberName": "load",
    "memberKind": "method",
    "signature": "load(propertyNamesAndPaths)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "propertyNamesAndPaths": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "partial",
    "onlyOfficeMapping": "partial object coverage through the Office Agent bridge",
    "notes": "Registered from the Office.js reference table; bridge support is best-effort for this member."
  },
  {
    "id": "Excel.Range_Fill.set.method",
    "category": "格式",
    "objectName": "Excel.Range Fill",
    "memberName": "set",
    "memberKind": "method",
    "signature": "set(properties, options)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "properties": {
          "type": "unknown"
        },
        "options": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "partial",
    "onlyOfficeMapping": "partial object coverage through the Office Agent bridge",
    "notes": "Registered from the Office.js reference table; bridge support is best-effort for this member."
  },
  {
    "id": "Excel.Range_Fill.set.method",
    "category": "格式",
    "objectName": "Excel.Range Fill",
    "memberName": "set",
    "memberKind": "method",
    "signature": "set(properties)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "properties": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "partial",
    "onlyOfficeMapping": "partial object coverage through the Office Agent bridge",
    "notes": "Registered from the Office.js reference table; bridge support is best-effort for this member."
  },
  {
    "id": "Excel.Range_Fill.color.property",
    "category": "格式",
    "objectName": "Excel.Range Fill",
    "memberName": "color",
    "memberKind": "property",
    "signature": "color",
    "supportLevel": "supported",
    "onlyOfficeMapping": "ApiRange.SetFillColor()"
  },
  {
    "id": "Excel.Range_Fill.context.property",
    "category": "格式",
    "objectName": "Excel.Range Fill",
    "memberName": "context",
    "memberKind": "property",
    "signature": "context",
    "supportLevel": "partial",
    "onlyOfficeMapping": "partial object coverage through the Office Agent bridge",
    "notes": "Registered from the Office.js reference table; bridge support is best-effort for this member."
  },
  {
    "id": "Excel.Range_Fill.pattern.property",
    "category": "格式",
    "objectName": "Excel.Range Fill",
    "memberName": "pattern",
    "memberKind": "property",
    "signature": "pattern",
    "supportLevel": "partial",
    "onlyOfficeMapping": "partial object coverage through the Office Agent bridge",
    "notes": "Registered from the Office.js reference table; bridge support is best-effort for this member."
  },
  {
    "id": "Excel.Range_Fill.patternColor.property",
    "category": "格式",
    "objectName": "Excel.Range Fill",
    "memberName": "patternColor",
    "memberKind": "property",
    "signature": "patternColor",
    "supportLevel": "partial",
    "onlyOfficeMapping": "partial object coverage through the Office Agent bridge",
    "notes": "Registered from the Office.js reference table; bridge support is best-effort for this member."
  },
  {
    "id": "Excel.Range_Fill.patternTintAndShade.property",
    "category": "格式",
    "objectName": "Excel.Range Fill",
    "memberName": "patternTintAndShade",
    "memberKind": "property",
    "signature": "patternTintAndShade",
    "supportLevel": "partial",
    "onlyOfficeMapping": "partial object coverage through the Office Agent bridge",
    "notes": "Registered from the Office.js reference table; bridge support is best-effort for this member."
  },
  {
    "id": "Excel.Range_Fill.tintAndShade.property",
    "category": "格式",
    "objectName": "Excel.Range Fill",
    "memberName": "tintAndShade",
    "memberKind": "property",
    "signature": "tintAndShade",
    "supportLevel": "partial",
    "onlyOfficeMapping": "partial object coverage through the Office Agent bridge",
    "notes": "Registered from the Office.js reference table; bridge support is best-effort for this member."
  },
  {
    "id": "Excel.Range_Border.load.method",
    "category": "格式",
    "objectName": "Excel.Range Border",
    "memberName": "load",
    "memberKind": "method",
    "signature": "load(options)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "options": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Range_Border.load.method",
    "category": "格式",
    "objectName": "Excel.Range Border",
    "memberName": "load",
    "memberKind": "method",
    "signature": "load(propertyNames)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "propertyNames": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Range_Border.load.method",
    "category": "格式",
    "objectName": "Excel.Range Border",
    "memberName": "load",
    "memberKind": "method",
    "signature": "load(propertyNamesAndPaths)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "propertyNamesAndPaths": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Range_Border.set.method",
    "category": "格式",
    "objectName": "Excel.Range Border",
    "memberName": "set",
    "memberKind": "method",
    "signature": "set(properties, options)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "properties": {
          "type": "unknown"
        },
        "options": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Range_Border.set.method",
    "category": "格式",
    "objectName": "Excel.Range Border",
    "memberName": "set",
    "memberKind": "method",
    "signature": "set(properties)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "properties": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Range_Border.toJSON.method",
    "category": "格式",
    "objectName": "Excel.Range Border",
    "memberName": "toJSON",
    "memberKind": "method",
    "signature": "toJSON()",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Range_Border.color.property",
    "category": "格式",
    "objectName": "Excel.Range Border",
    "memberName": "color",
    "memberKind": "property",
    "signature": "color",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Range_Border.context.property",
    "category": "格式",
    "objectName": "Excel.Range Border",
    "memberName": "context",
    "memberKind": "property",
    "signature": "context",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Range_Border.sideIndex.property",
    "category": "格式",
    "objectName": "Excel.Range Border",
    "memberName": "sideIndex",
    "memberKind": "property",
    "signature": "sideIndex",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Range_Border.style.property",
    "category": "格式",
    "objectName": "Excel.Range Border",
    "memberName": "style",
    "memberKind": "property",
    "signature": "style",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Range_Border.tintAndShade.property",
    "category": "格式",
    "objectName": "Excel.Range Border",
    "memberName": "tintAndShade",
    "memberKind": "property",
    "signature": "tintAndShade",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Range_Border.weight.property",
    "category": "格式",
    "objectName": "Excel.Range Border",
    "memberName": "weight",
    "memberKind": "property",
    "signature": "weight",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Table.clearFilters.method",
    "category": "表格",
    "objectName": "Excel.Table",
    "memberName": "clearFilters",
    "memberKind": "method",
    "signature": "clearFilters()",
    "supportLevel": "partial",
    "onlyOfficeMapping": "partial object coverage through the Office Agent bridge",
    "notes": "Registered from the Office.js reference table; bridge support is best-effort for this member."
  },
  {
    "id": "Excel.Table.clearStyle.method",
    "category": "表格",
    "objectName": "Excel.Table",
    "memberName": "clearStyle",
    "memberKind": "method",
    "signature": "clearStyle()",
    "supportLevel": "partial",
    "onlyOfficeMapping": "partial object coverage through the Office Agent bridge",
    "notes": "Registered from the Office.js reference table; bridge support is best-effort for this member."
  },
  {
    "id": "Excel.Table.convertToRange.method",
    "category": "表格",
    "objectName": "Excel.Table",
    "memberName": "convertToRange",
    "memberKind": "method",
    "signature": "convertToRange()",
    "supportLevel": "partial",
    "onlyOfficeMapping": "partial object coverage through the Office Agent bridge",
    "notes": "Registered from the Office.js reference table; bridge support is best-effort for this member."
  },
  {
    "id": "Excel.Table.delete.method",
    "category": "表格",
    "objectName": "Excel.Table",
    "memberName": "delete",
    "memberKind": "method",
    "signature": "delete()",
    "supportLevel": "partial",
    "onlyOfficeMapping": "partial object coverage through the Office Agent bridge",
    "notes": "Registered from the Office.js reference table; bridge support is best-effort for this member."
  },
  {
    "id": "Excel.Table.getDataBodyRange.method",
    "category": "表格",
    "objectName": "Excel.Table",
    "memberName": "getDataBodyRange",
    "memberKind": "method",
    "signature": "getDataBodyRange()",
    "supportLevel": "partial",
    "onlyOfficeMapping": "partial object coverage through the Office Agent bridge",
    "notes": "Registered from the Office.js reference table; bridge support is best-effort for this member."
  },
  {
    "id": "Excel.Table.getHeaderRowRange.method",
    "category": "表格",
    "objectName": "Excel.Table",
    "memberName": "getHeaderRowRange",
    "memberKind": "method",
    "signature": "getHeaderRowRange()",
    "supportLevel": "partial",
    "onlyOfficeMapping": "partial object coverage through the Office Agent bridge",
    "notes": "Registered from the Office.js reference table; bridge support is best-effort for this member."
  },
  {
    "id": "Excel.Table.altTextDescription.property",
    "category": "表格",
    "objectName": "Excel.Table",
    "memberName": "altTextDescription",
    "memberKind": "property",
    "signature": "altTextDescription",
    "supportLevel": "partial",
    "onlyOfficeMapping": "partial object coverage through the Office Agent bridge",
    "notes": "Registered from the Office.js reference table; bridge support is best-effort for this member."
  },
  {
    "id": "Excel.Table.altTextTitle.property",
    "category": "表格",
    "objectName": "Excel.Table",
    "memberName": "altTextTitle",
    "memberKind": "property",
    "signature": "altTextTitle",
    "supportLevel": "partial",
    "onlyOfficeMapping": "partial object coverage through the Office Agent bridge",
    "notes": "Registered from the Office.js reference table; bridge support is best-effort for this member."
  },
  {
    "id": "Excel.Table.autoFilter.property",
    "category": "表格",
    "objectName": "Excel.Table",
    "memberName": "autoFilter",
    "memberKind": "property",
    "signature": "autoFilter",
    "supportLevel": "partial",
    "onlyOfficeMapping": "partial object coverage through the Office Agent bridge",
    "notes": "Registered from the Office.js reference table; bridge support is best-effort for this member."
  },
  {
    "id": "Excel.Table.columns.property",
    "category": "表格",
    "objectName": "Excel.Table",
    "memberName": "columns",
    "memberKind": "property",
    "signature": "columns",
    "supportLevel": "partial",
    "onlyOfficeMapping": "partial object coverage through the Office Agent bridge",
    "notes": "Registered from the Office.js reference table; bridge support is best-effort for this member."
  },
  {
    "id": "Excel.Table.comment.property",
    "category": "表格",
    "objectName": "Excel.Table",
    "memberName": "comment",
    "memberKind": "property",
    "signature": "comment",
    "supportLevel": "partial",
    "onlyOfficeMapping": "partial object coverage through the Office Agent bridge",
    "notes": "Registered from the Office.js reference table; bridge support is best-effort for this member."
  },
  {
    "id": "Excel.Table.context.property",
    "category": "表格",
    "objectName": "Excel.Table",
    "memberName": "context",
    "memberKind": "property",
    "signature": "context",
    "supportLevel": "partial",
    "onlyOfficeMapping": "partial object coverage through the Office Agent bridge",
    "notes": "Registered from the Office.js reference table; bridge support is best-effort for this member."
  },
  {
    "id": "Excel.Table.onChanged.event",
    "category": "表格",
    "objectName": "Excel.Table",
    "memberName": "onChanged",
    "memberKind": "event",
    "signature": "onChanged",
    "supportLevel": "partial",
    "onlyOfficeMapping": "partial object coverage through the Office Agent bridge",
    "notes": "Registered from the Office.js reference table; bridge support is best-effort for this member."
  },
  {
    "id": "Excel.Table.onFiltered.event",
    "category": "表格",
    "objectName": "Excel.Table",
    "memberName": "onFiltered",
    "memberKind": "event",
    "signature": "onFiltered",
    "supportLevel": "partial",
    "onlyOfficeMapping": "partial object coverage through the Office Agent bridge",
    "notes": "Registered from the Office.js reference table; bridge support is best-effort for this member."
  },
  {
    "id": "Excel.Table.onSelectionChanged.event",
    "category": "表格",
    "objectName": "Excel.Table",
    "memberName": "onSelectionChanged",
    "memberKind": "event",
    "signature": "onSelectionChanged",
    "supportLevel": "partial",
    "onlyOfficeMapping": "partial object coverage through the Office Agent bridge",
    "notes": "Registered from the Office.js reference table; bridge support is best-effort for this member."
  },
  {
    "id": "Excel.Table_Collection.add.method",
    "category": "表格",
    "objectName": "Excel.Table Collection",
    "memberName": "add",
    "memberKind": "method",
    "signature": "add(address, hasHeaders)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "address": {
          "type": "unknown"
        },
        "hasHeaders": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "partial",
    "onlyOfficeMapping": "partial object coverage through the Office Agent bridge",
    "notes": "Registered from the Office.js reference table; bridge support is best-effort for this member."
  },
  {
    "id": "Excel.Table_Collection.getCount.method",
    "category": "表格",
    "objectName": "Excel.Table Collection",
    "memberName": "getCount",
    "memberKind": "method",
    "signature": "getCount()",
    "supportLevel": "partial",
    "onlyOfficeMapping": "partial object coverage through the Office Agent bridge",
    "notes": "Registered from the Office.js reference table; bridge support is best-effort for this member."
  },
  {
    "id": "Excel.Table_Collection.getItem.method",
    "category": "表格",
    "objectName": "Excel.Table Collection",
    "memberName": "getItem",
    "memberKind": "method",
    "signature": "getItem(key)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "key": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "partial",
    "onlyOfficeMapping": "partial object coverage through the Office Agent bridge",
    "notes": "Registered from the Office.js reference table; bridge support is best-effort for this member."
  },
  {
    "id": "Excel.Table_Collection.getItemAt.method",
    "category": "表格",
    "objectName": "Excel.Table Collection",
    "memberName": "getItemAt",
    "memberKind": "method",
    "signature": "getItemAt(index)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "index": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "partial",
    "onlyOfficeMapping": "partial object coverage through the Office Agent bridge",
    "notes": "Registered from the Office.js reference table; bridge support is best-effort for this member."
  },
  {
    "id": "Excel.Table_Collection.getItemOrNullObject.method",
    "category": "表格",
    "objectName": "Excel.Table Collection",
    "memberName": "getItemOrNullObject",
    "memberKind": "method",
    "signature": "getItemOrNullObject(key)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "key": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "partial",
    "onlyOfficeMapping": "partial object coverage through the Office Agent bridge",
    "notes": "Registered from the Office.js reference table; bridge support is best-effort for this member."
  },
  {
    "id": "Excel.Table_Collection.load.method",
    "category": "表格",
    "objectName": "Excel.Table Collection",
    "memberName": "load",
    "memberKind": "method",
    "signature": "load(options)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "options": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "partial",
    "onlyOfficeMapping": "partial object coverage through the Office Agent bridge",
    "notes": "Registered from the Office.js reference table; bridge support is best-effort for this member."
  },
  {
    "id": "Excel.Table_Collection.context.property",
    "category": "表格",
    "objectName": "Excel.Table Collection",
    "memberName": "context",
    "memberKind": "property",
    "signature": "context",
    "supportLevel": "partial",
    "onlyOfficeMapping": "partial object coverage through the Office Agent bridge",
    "notes": "Registered from the Office.js reference table; bridge support is best-effort for this member."
  },
  {
    "id": "Excel.Table_Collection.count.property",
    "category": "表格",
    "objectName": "Excel.Table Collection",
    "memberName": "count",
    "memberKind": "property",
    "signature": "count",
    "supportLevel": "partial",
    "onlyOfficeMapping": "partial object coverage through the Office Agent bridge",
    "notes": "Registered from the Office.js reference table; bridge support is best-effort for this member."
  },
  {
    "id": "Excel.Table_Collection.items.property",
    "category": "表格",
    "objectName": "Excel.Table Collection",
    "memberName": "items",
    "memberKind": "property",
    "signature": "items",
    "supportLevel": "partial",
    "onlyOfficeMapping": "partial object coverage through the Office Agent bridge",
    "notes": "Registered from the Office.js reference table; bridge support is best-effort for this member."
  },
  {
    "id": "Excel.Table_Collection.onAdded.event",
    "category": "表格",
    "objectName": "Excel.Table Collection",
    "memberName": "onAdded",
    "memberKind": "event",
    "signature": "onAdded",
    "supportLevel": "partial",
    "onlyOfficeMapping": "partial object coverage through the Office Agent bridge",
    "notes": "Registered from the Office.js reference table; bridge support is best-effort for this member."
  },
  {
    "id": "Excel.Table_Collection.onChanged.event",
    "category": "表格",
    "objectName": "Excel.Table Collection",
    "memberName": "onChanged",
    "memberKind": "event",
    "signature": "onChanged",
    "supportLevel": "partial",
    "onlyOfficeMapping": "partial object coverage through the Office Agent bridge",
    "notes": "Registered from the Office.js reference table; bridge support is best-effort for this member."
  },
  {
    "id": "Excel.Table_Collection.onDeleted.event",
    "category": "表格",
    "objectName": "Excel.Table Collection",
    "memberName": "onDeleted",
    "memberKind": "event",
    "signature": "onDeleted",
    "supportLevel": "partial",
    "onlyOfficeMapping": "partial object coverage through the Office Agent bridge",
    "notes": "Registered from the Office.js reference table; bridge support is best-effort for this member."
  },
  {
    "id": "Excel.Table_Column.delete.method",
    "category": "表格",
    "objectName": "Excel.Table Column",
    "memberName": "delete",
    "memberKind": "method",
    "signature": "delete()",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Table_Column.getDataBodyRange.method",
    "category": "表格",
    "objectName": "Excel.Table Column",
    "memberName": "getDataBodyRange",
    "memberKind": "method",
    "signature": "getDataBodyRange()",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Table_Column.getHeaderRowRange.method",
    "category": "表格",
    "objectName": "Excel.Table Column",
    "memberName": "getHeaderRowRange",
    "memberKind": "method",
    "signature": "getHeaderRowRange()",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Table_Column.getRange.method",
    "category": "表格",
    "objectName": "Excel.Table Column",
    "memberName": "getRange",
    "memberKind": "method",
    "signature": "getRange()",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Table_Column.getTotalRowRange.method",
    "category": "表格",
    "objectName": "Excel.Table Column",
    "memberName": "getTotalRowRange",
    "memberKind": "method",
    "signature": "getTotalRowRange()",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Table_Column.load.method",
    "category": "表格",
    "objectName": "Excel.Table Column",
    "memberName": "load",
    "memberKind": "method",
    "signature": "load(options)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "options": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Table_Column.context.property",
    "category": "表格",
    "objectName": "Excel.Table Column",
    "memberName": "context",
    "memberKind": "property",
    "signature": "context",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Table_Column.filter.property",
    "category": "表格",
    "objectName": "Excel.Table Column",
    "memberName": "filter",
    "memberKind": "property",
    "signature": "filter",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Table_Column.id.property",
    "category": "表格",
    "objectName": "Excel.Table Column",
    "memberName": "id",
    "memberKind": "property",
    "signature": "id",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Table_Column.index.property",
    "category": "表格",
    "objectName": "Excel.Table Column",
    "memberName": "index",
    "memberKind": "property",
    "signature": "index",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Table_Column.values.property",
    "category": "表格",
    "objectName": "Excel.Table Column",
    "memberName": "values",
    "memberKind": "property",
    "signature": "values",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Table_Column.valuesAsJson.property",
    "category": "表格",
    "objectName": "Excel.Table Column",
    "memberName": "valuesAsJson",
    "memberKind": "property",
    "signature": "valuesAsJson",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Table_Column_Collection.add.method",
    "category": "表格",
    "objectName": "Excel.Table Column Collection",
    "memberName": "add",
    "memberKind": "method",
    "signature": "add(index, values, name)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "index": {
          "type": "unknown"
        },
        "values": {
          "type": "unknown"
        },
        "name": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Table_Column_Collection.addAsJson.method",
    "category": "表格",
    "objectName": "Excel.Table Column Collection",
    "memberName": "addAsJson",
    "memberKind": "method",
    "signature": "addAsJson(index, values, name)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "index": {
          "type": "unknown"
        },
        "values": {
          "type": "unknown"
        },
        "name": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Table_Column_Collection.getCount.method",
    "category": "表格",
    "objectName": "Excel.Table Column Collection",
    "memberName": "getCount",
    "memberKind": "method",
    "signature": "getCount()",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Table_Column_Collection.getItem.method",
    "category": "表格",
    "objectName": "Excel.Table Column Collection",
    "memberName": "getItem",
    "memberKind": "method",
    "signature": "getItem(key)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "key": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Table_Column_Collection.getItemAt.method",
    "category": "表格",
    "objectName": "Excel.Table Column Collection",
    "memberName": "getItemAt",
    "memberKind": "method",
    "signature": "getItemAt(index)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "index": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Table_Column_Collection.getItemOrNullObject.method",
    "category": "表格",
    "objectName": "Excel.Table Column Collection",
    "memberName": "getItemOrNullObject",
    "memberKind": "method",
    "signature": "getItemOrNullObject(key)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "key": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Table_Column_Collection.context.property",
    "category": "表格",
    "objectName": "Excel.Table Column Collection",
    "memberName": "context",
    "memberKind": "property",
    "signature": "context",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Table_Column_Collection.count.property",
    "category": "表格",
    "objectName": "Excel.Table Column Collection",
    "memberName": "count",
    "memberKind": "property",
    "signature": "count",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Table_Column_Collection.items.property",
    "category": "表格",
    "objectName": "Excel.Table Column Collection",
    "memberName": "items",
    "memberKind": "property",
    "signature": "items",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Table_Row.delete.method",
    "category": "表格",
    "objectName": "Excel.Table Row",
    "memberName": "delete",
    "memberKind": "method",
    "signature": "delete()",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Table_Row.getRange.method",
    "category": "表格",
    "objectName": "Excel.Table Row",
    "memberName": "getRange",
    "memberKind": "method",
    "signature": "getRange()",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Table_Row.load.method",
    "category": "表格",
    "objectName": "Excel.Table Row",
    "memberName": "load",
    "memberKind": "method",
    "signature": "load(options)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "options": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Table_Row.load.method",
    "category": "表格",
    "objectName": "Excel.Table Row",
    "memberName": "load",
    "memberKind": "method",
    "signature": "load(propertyNames)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "propertyNames": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Table_Row.load.method",
    "category": "表格",
    "objectName": "Excel.Table Row",
    "memberName": "load",
    "memberKind": "method",
    "signature": "load(propertyNamesAndPaths)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "propertyNamesAndPaths": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Table_Row.set.method",
    "category": "表格",
    "objectName": "Excel.Table Row",
    "memberName": "set",
    "memberKind": "method",
    "signature": "set(properties, options)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "properties": {
          "type": "unknown"
        },
        "options": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Table_Row.context.property",
    "category": "表格",
    "objectName": "Excel.Table Row",
    "memberName": "context",
    "memberKind": "property",
    "signature": "context",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Table_Row.index.property",
    "category": "表格",
    "objectName": "Excel.Table Row",
    "memberName": "index",
    "memberKind": "property",
    "signature": "index",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Table_Row.values.property",
    "category": "表格",
    "objectName": "Excel.Table Row",
    "memberName": "values",
    "memberKind": "property",
    "signature": "values",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Table_Row.valuesAsJson.property",
    "category": "表格",
    "objectName": "Excel.Table Row",
    "memberName": "valuesAsJson",
    "memberKind": "property",
    "signature": "valuesAsJson",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Table_Row.valuesAsJsonLocal.property",
    "category": "表格",
    "objectName": "Excel.Table Row",
    "memberName": "valuesAsJsonLocal",
    "memberKind": "property",
    "signature": "valuesAsJsonLocal",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Table_Row_Collection.add.method",
    "category": "表格",
    "objectName": "Excel.Table Row Collection",
    "memberName": "add",
    "memberKind": "method",
    "signature": "add(index, values, alwaysInsert)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "index": {
          "type": "unknown"
        },
        "values": {
          "type": "unknown"
        },
        "alwaysInsert": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Table_Row_Collection.addAsJson.method",
    "category": "表格",
    "objectName": "Excel.Table Row Collection",
    "memberName": "addAsJson",
    "memberKind": "method",
    "signature": "addAsJson(index, values, alwaysInsert)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "index": {
          "type": "unknown"
        },
        "values": {
          "type": "unknown"
        },
        "alwaysInsert": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Table_Row_Collection.deleteRows.method",
    "category": "表格",
    "objectName": "Excel.Table Row Collection",
    "memberName": "deleteRows",
    "memberKind": "method",
    "signature": "deleteRows(rows)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "rows": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Table_Row_Collection.deleteRowsAt.method",
    "category": "表格",
    "objectName": "Excel.Table Row Collection",
    "memberName": "deleteRowsAt",
    "memberKind": "method",
    "signature": "deleteRowsAt(index, count)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "index": {
          "type": "unknown"
        },
        "count": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Table_Row_Collection.getCount.method",
    "category": "表格",
    "objectName": "Excel.Table Row Collection",
    "memberName": "getCount",
    "memberKind": "method",
    "signature": "getCount()",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Table_Row_Collection.getItemAt.method",
    "category": "表格",
    "objectName": "Excel.Table Row Collection",
    "memberName": "getItemAt",
    "memberKind": "method",
    "signature": "getItemAt(index)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "index": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Table_Row_Collection.context.property",
    "category": "表格",
    "objectName": "Excel.Table Row Collection",
    "memberName": "context",
    "memberKind": "property",
    "signature": "context",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Table_Row_Collection.count.property",
    "category": "表格",
    "objectName": "Excel.Table Row Collection",
    "memberName": "count",
    "memberKind": "property",
    "signature": "count",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Table_Row_Collection.items.property",
    "category": "表格",
    "objectName": "Excel.Table Row Collection",
    "memberName": "items",
    "memberKind": "property",
    "signature": "items",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Table_Sort.apply.method",
    "category": "表格",
    "objectName": "Excel.Table Sort",
    "memberName": "apply",
    "memberKind": "method",
    "signature": "apply(fields, matchCase, method)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "fields": {
          "type": "unknown"
        },
        "matchCase": {
          "type": "unknown"
        },
        "method": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Table_Sort.clear.method",
    "category": "表格",
    "objectName": "Excel.Table Sort",
    "memberName": "clear",
    "memberKind": "method",
    "signature": "clear()",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Table_Sort.load.method",
    "category": "表格",
    "objectName": "Excel.Table Sort",
    "memberName": "load",
    "memberKind": "method",
    "signature": "load(options)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "options": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Table_Sort.load.method",
    "category": "表格",
    "objectName": "Excel.Table Sort",
    "memberName": "load",
    "memberKind": "method",
    "signature": "load(propertyNames)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "propertyNames": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Table_Sort.load.method",
    "category": "表格",
    "objectName": "Excel.Table Sort",
    "memberName": "load",
    "memberKind": "method",
    "signature": "load(propertyNamesAndPaths)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "propertyNamesAndPaths": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Table_Sort.reapply.method",
    "category": "表格",
    "objectName": "Excel.Table Sort",
    "memberName": "reapply",
    "memberKind": "method",
    "signature": "reapply()",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Table_Sort.context.property",
    "category": "表格",
    "objectName": "Excel.Table Sort",
    "memberName": "context",
    "memberKind": "property",
    "signature": "context",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Table_Sort.fields.property",
    "category": "表格",
    "objectName": "Excel.Table Sort",
    "memberName": "fields",
    "memberKind": "property",
    "signature": "fields",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Table_Sort.matchCase.property",
    "category": "表格",
    "objectName": "Excel.Table Sort",
    "memberName": "matchCase",
    "memberKind": "property",
    "signature": "matchCase",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Table_Sort.method.property",
    "category": "表格",
    "objectName": "Excel.Table Sort",
    "memberName": "method",
    "memberKind": "property",
    "signature": "method",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Table_Style_Collection.add.method",
    "category": "表格",
    "objectName": "Excel.Table Style Collection",
    "memberName": "add",
    "memberKind": "method",
    "signature": "add(name, makeUniqueName)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "name": {
          "type": "unknown"
        },
        "makeUniqueName": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Table_Style_Collection.getCount.method",
    "category": "表格",
    "objectName": "Excel.Table Style Collection",
    "memberName": "getCount",
    "memberKind": "method",
    "signature": "getCount()",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Table_Style_Collection.getDefault.method",
    "category": "表格",
    "objectName": "Excel.Table Style Collection",
    "memberName": "getDefault",
    "memberKind": "method",
    "signature": "getDefault()",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Table_Style_Collection.getItem.method",
    "category": "表格",
    "objectName": "Excel.Table Style Collection",
    "memberName": "getItem",
    "memberKind": "method",
    "signature": "getItem(name)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "name": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Table_Style_Collection.getItemOrNullObject.method",
    "category": "表格",
    "objectName": "Excel.Table Style Collection",
    "memberName": "getItemOrNullObject",
    "memberKind": "method",
    "signature": "getItemOrNullObject(name)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "name": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Table_Style_Collection.load.method",
    "category": "表格",
    "objectName": "Excel.Table Style Collection",
    "memberName": "load",
    "memberKind": "method",
    "signature": "load(options)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "options": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Table_Style_Collection.context.property",
    "category": "表格",
    "objectName": "Excel.Table Style Collection",
    "memberName": "context",
    "memberKind": "property",
    "signature": "context",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Table_Style_Collection.items.property",
    "category": "表格",
    "objectName": "Excel.Table Style Collection",
    "memberName": "items",
    "memberKind": "property",
    "signature": "items",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Filter.apply.method",
    "category": "筛选",
    "objectName": "Excel.Filter",
    "memberName": "apply",
    "memberKind": "method",
    "signature": "apply(criteria)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "criteria": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Filter.applyBottomItemsFilter.method",
    "category": "筛选",
    "objectName": "Excel.Filter",
    "memberName": "applyBottomItemsFilter",
    "memberKind": "method",
    "signature": "applyBottomItemsFilter(count)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "count": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Filter.applyBottomPercentFilter.method",
    "category": "筛选",
    "objectName": "Excel.Filter",
    "memberName": "applyBottomPercentFilter",
    "memberKind": "method",
    "signature": "applyBottomPercentFilter(percent)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "percent": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Filter.applyCellColorFilter.method",
    "category": "筛选",
    "objectName": "Excel.Filter",
    "memberName": "applyCellColorFilter",
    "memberKind": "method",
    "signature": "applyCellColorFilter(color)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "color": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Filter.applyCustomFilter.method",
    "category": "筛选",
    "objectName": "Excel.Filter",
    "memberName": "applyCustomFilter",
    "memberKind": "method",
    "signature": "applyCustomFilter(criteria1, criteria2, oper)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "criteria1": {
          "type": "unknown"
        },
        "criteria2": {
          "type": "unknown"
        },
        "oper": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Filter.applyDynamicFilter.method",
    "category": "筛选",
    "objectName": "Excel.Filter",
    "memberName": "applyDynamicFilter",
    "memberKind": "method",
    "signature": "applyDynamicFilter(criteria)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "criteria": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Filter.context.property",
    "category": "筛选",
    "objectName": "Excel.Filter",
    "memberName": "context",
    "memberKind": "property",
    "signature": "context",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Filter.criteria.property",
    "category": "筛选",
    "objectName": "Excel.Filter",
    "memberName": "criteria",
    "memberKind": "property",
    "signature": "criteria",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Filter_Pivot_Hierarchy.load.method",
    "category": "数据透视/筛选",
    "objectName": "Excel.Filter Pivot Hierarchy",
    "memberName": "load",
    "memberKind": "method",
    "signature": "load(options)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "options": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Filter_Pivot_Hierarchy.load.method",
    "category": "数据透视/筛选",
    "objectName": "Excel.Filter Pivot Hierarchy",
    "memberName": "load",
    "memberKind": "method",
    "signature": "load(propertyNames)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "propertyNames": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Filter_Pivot_Hierarchy.load.method",
    "category": "数据透视/筛选",
    "objectName": "Excel.Filter Pivot Hierarchy",
    "memberName": "load",
    "memberKind": "method",
    "signature": "load(propertyNamesAndPaths)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "propertyNamesAndPaths": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Filter_Pivot_Hierarchy.set.method",
    "category": "数据透视/筛选",
    "objectName": "Excel.Filter Pivot Hierarchy",
    "memberName": "set",
    "memberKind": "method",
    "signature": "set(properties, options)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "properties": {
          "type": "unknown"
        },
        "options": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Filter_Pivot_Hierarchy.set.method",
    "category": "数据透视/筛选",
    "objectName": "Excel.Filter Pivot Hierarchy",
    "memberName": "set",
    "memberKind": "method",
    "signature": "set(properties)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "properties": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Filter_Pivot_Hierarchy.setToDefault.method",
    "category": "数据透视/筛选",
    "objectName": "Excel.Filter Pivot Hierarchy",
    "memberName": "setToDefault",
    "memberKind": "method",
    "signature": "setToDefault()",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Filter_Pivot_Hierarchy.context.property",
    "category": "数据透视/筛选",
    "objectName": "Excel.Filter Pivot Hierarchy",
    "memberName": "context",
    "memberKind": "property",
    "signature": "context",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Filter_Pivot_Hierarchy.enableMultipleFilterItems.property",
    "category": "数据透视/筛选",
    "objectName": "Excel.Filter Pivot Hierarchy",
    "memberName": "enableMultipleFilterItems",
    "memberKind": "property",
    "signature": "enableMultipleFilterItems",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Filter_Pivot_Hierarchy.fields.property",
    "category": "数据透视/筛选",
    "objectName": "Excel.Filter Pivot Hierarchy",
    "memberName": "fields",
    "memberKind": "property",
    "signature": "fields",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Filter_Pivot_Hierarchy.id.property",
    "category": "数据透视/筛选",
    "objectName": "Excel.Filter Pivot Hierarchy",
    "memberName": "id",
    "memberKind": "property",
    "signature": "id",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Filter_Pivot_Hierarchy.position.property",
    "category": "数据透视/筛选",
    "objectName": "Excel.Filter Pivot Hierarchy",
    "memberName": "position",
    "memberKind": "property",
    "signature": "position",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Filter_Pivot_Hierarchy_Collection.add.method",
    "category": "数据透视/筛选",
    "objectName": "Excel.Filter Pivot Hierarchy Collection",
    "memberName": "add",
    "memberKind": "method",
    "signature": "add(pivotHierarchy)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "pivotHierarchy": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Filter_Pivot_Hierarchy_Collection.getCount.method",
    "category": "数据透视/筛选",
    "objectName": "Excel.Filter Pivot Hierarchy Collection",
    "memberName": "getCount",
    "memberKind": "method",
    "signature": "getCount()",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Filter_Pivot_Hierarchy_Collection.getItem.method",
    "category": "数据透视/筛选",
    "objectName": "Excel.Filter Pivot Hierarchy Collection",
    "memberName": "getItem",
    "memberKind": "method",
    "signature": "getItem(name)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "name": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Filter_Pivot_Hierarchy_Collection.getItemOrNullObject.method",
    "category": "数据透视/筛选",
    "objectName": "Excel.Filter Pivot Hierarchy Collection",
    "memberName": "getItemOrNullObject",
    "memberKind": "method",
    "signature": "getItemOrNullObject(name)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "name": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Filter_Pivot_Hierarchy_Collection.load.method",
    "category": "数据透视/筛选",
    "objectName": "Excel.Filter Pivot Hierarchy Collection",
    "memberName": "load",
    "memberKind": "method",
    "signature": "load(options)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "options": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Filter_Pivot_Hierarchy_Collection.load.method",
    "category": "数据透视/筛选",
    "objectName": "Excel.Filter Pivot Hierarchy Collection",
    "memberName": "load",
    "memberKind": "method",
    "signature": "load(propertyNames)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "propertyNames": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Filter_Pivot_Hierarchy_Collection.context.property",
    "category": "数据透视/筛选",
    "objectName": "Excel.Filter Pivot Hierarchy Collection",
    "memberName": "context",
    "memberKind": "property",
    "signature": "context",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Filter_Pivot_Hierarchy_Collection.items.property",
    "category": "数据透视/筛选",
    "objectName": "Excel.Filter Pivot Hierarchy Collection",
    "memberName": "items",
    "memberKind": "property",
    "signature": "items",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart.activate.method",
    "category": "图表",
    "objectName": "Excel.Chart",
    "memberName": "activate",
    "memberKind": "method",
    "signature": "activate()",
    "supportLevel": "partial",
    "onlyOfficeMapping": "partial object coverage through the Office Agent bridge",
    "notes": "Registered from the Office.js reference table; bridge support is best-effort for this member."
  },
  {
    "id": "Excel.Chart.delete.method",
    "category": "图表",
    "objectName": "Excel.Chart",
    "memberName": "delete",
    "memberKind": "method",
    "signature": "delete()",
    "supportLevel": "partial",
    "onlyOfficeMapping": "partial object coverage through the Office Agent bridge",
    "notes": "Registered from the Office.js reference table; bridge support is best-effort for this member."
  },
  {
    "id": "Excel.Chart.getDataRange.method",
    "category": "图表",
    "objectName": "Excel.Chart",
    "memberName": "getDataRange",
    "memberKind": "method",
    "signature": "getDataRange()",
    "supportLevel": "partial",
    "onlyOfficeMapping": "partial object coverage through the Office Agent bridge",
    "notes": "Registered from the Office.js reference table; bridge support is best-effort for this member."
  },
  {
    "id": "Excel.Chart.getDataRangeOrNullObject.method",
    "category": "图表",
    "objectName": "Excel.Chart",
    "memberName": "getDataRangeOrNullObject",
    "memberKind": "method",
    "signature": "getDataRangeOrNullObject()",
    "supportLevel": "partial",
    "onlyOfficeMapping": "partial object coverage through the Office Agent bridge",
    "notes": "Registered from the Office.js reference table; bridge support is best-effort for this member."
  },
  {
    "id": "Excel.Chart.getDataTable.method",
    "category": "图表",
    "objectName": "Excel.Chart",
    "memberName": "getDataTable",
    "memberKind": "method",
    "signature": "getDataTable()",
    "supportLevel": "partial",
    "onlyOfficeMapping": "partial object coverage through the Office Agent bridge",
    "notes": "Registered from the Office.js reference table; bridge support is best-effort for this member."
  },
  {
    "id": "Excel.Chart.getDataTableOrNullObject.method",
    "category": "图表",
    "objectName": "Excel.Chart",
    "memberName": "getDataTableOrNullObject",
    "memberKind": "method",
    "signature": "getDataTableOrNullObject()",
    "supportLevel": "partial",
    "onlyOfficeMapping": "partial object coverage through the Office Agent bridge",
    "notes": "Registered from the Office.js reference table; bridge support is best-effort for this member."
  },
  {
    "id": "Excel.Chart.axes.property",
    "category": "图表",
    "objectName": "Excel.Chart",
    "memberName": "axes",
    "memberKind": "property",
    "signature": "axes",
    "supportLevel": "partial",
    "onlyOfficeMapping": "partial object coverage through the Office Agent bridge",
    "notes": "Registered from the Office.js reference table; bridge support is best-effort for this member."
  },
  {
    "id": "Excel.Chart.categoryLabelLevel.property",
    "category": "图表",
    "objectName": "Excel.Chart",
    "memberName": "categoryLabelLevel",
    "memberKind": "property",
    "signature": "categoryLabelLevel",
    "supportLevel": "partial",
    "onlyOfficeMapping": "partial object coverage through the Office Agent bridge",
    "notes": "Registered from the Office.js reference table; bridge support is best-effort for this member."
  },
  {
    "id": "Excel.Chart.chartType.property",
    "category": "图表",
    "objectName": "Excel.Chart",
    "memberName": "chartType",
    "memberKind": "property",
    "signature": "chartType",
    "supportLevel": "partial",
    "onlyOfficeMapping": "partial object coverage through the Office Agent bridge",
    "notes": "Registered from the Office.js reference table; bridge support is best-effort for this member."
  },
  {
    "id": "Excel.Chart.context.property",
    "category": "图表",
    "objectName": "Excel.Chart",
    "memberName": "context",
    "memberKind": "property",
    "signature": "context",
    "supportLevel": "partial",
    "onlyOfficeMapping": "partial object coverage through the Office Agent bridge",
    "notes": "Registered from the Office.js reference table; bridge support is best-effort for this member."
  },
  {
    "id": "Excel.Chart.dataLabels.property",
    "category": "图表",
    "objectName": "Excel.Chart",
    "memberName": "dataLabels",
    "memberKind": "property",
    "signature": "dataLabels",
    "supportLevel": "partial",
    "onlyOfficeMapping": "partial object coverage through the Office Agent bridge",
    "notes": "Registered from the Office.js reference table; bridge support is best-effort for this member."
  },
  {
    "id": "Excel.Chart.displayBlanksAs.property",
    "category": "图表",
    "objectName": "Excel.Chart",
    "memberName": "displayBlanksAs",
    "memberKind": "property",
    "signature": "displayBlanksAs",
    "supportLevel": "partial",
    "onlyOfficeMapping": "partial object coverage through the Office Agent bridge",
    "notes": "Registered from the Office.js reference table; bridge support is best-effort for this member."
  },
  {
    "id": "Excel.Chart.onActivated.event",
    "category": "图表",
    "objectName": "Excel.Chart",
    "memberName": "onActivated",
    "memberKind": "event",
    "signature": "onActivated",
    "supportLevel": "partial",
    "onlyOfficeMapping": "partial object coverage through the Office Agent bridge",
    "notes": "Registered from the Office.js reference table; bridge support is best-effort for this member."
  },
  {
    "id": "Excel.Chart.onDeactivated.event",
    "category": "图表",
    "objectName": "Excel.Chart",
    "memberName": "onDeactivated",
    "memberKind": "event",
    "signature": "onDeactivated",
    "supportLevel": "partial",
    "onlyOfficeMapping": "partial object coverage through the Office Agent bridge",
    "notes": "Registered from the Office.js reference table; bridge support is best-effort for this member."
  },
  {
    "id": "Excel.Chart_Collection.add.method",
    "category": "图表",
    "objectName": "Excel.Chart Collection",
    "memberName": "add",
    "memberKind": "method",
    "signature": "add(type, sourceData, seriesBy)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "type": {
          "type": "unknown"
        },
        "sourceData": {
          "type": "unknown"
        },
        "seriesBy": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "partial",
    "onlyOfficeMapping": "ApiWorksheet.AddChart() when available"
  },
  {
    "id": "Excel.Chart_Collection.getCount.method",
    "category": "图表",
    "objectName": "Excel.Chart Collection",
    "memberName": "getCount",
    "memberKind": "method",
    "signature": "getCount()",
    "supportLevel": "partial",
    "onlyOfficeMapping": "partial object coverage through the Office Agent bridge",
    "notes": "Registered from the Office.js reference table; bridge support is best-effort for this member."
  },
  {
    "id": "Excel.Chart_Collection.getItem.method",
    "category": "图表",
    "objectName": "Excel.Chart Collection",
    "memberName": "getItem",
    "memberKind": "method",
    "signature": "getItem(name)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "name": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "partial",
    "onlyOfficeMapping": "partial object coverage through the Office Agent bridge",
    "notes": "Registered from the Office.js reference table; bridge support is best-effort for this member."
  },
  {
    "id": "Excel.Chart_Collection.getItemAt.method",
    "category": "图表",
    "objectName": "Excel.Chart Collection",
    "memberName": "getItemAt",
    "memberKind": "method",
    "signature": "getItemAt(index)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "index": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "partial",
    "onlyOfficeMapping": "partial object coverage through the Office Agent bridge",
    "notes": "Registered from the Office.js reference table; bridge support is best-effort for this member."
  },
  {
    "id": "Excel.Chart_Collection.getItemOrNullObject.method",
    "category": "图表",
    "objectName": "Excel.Chart Collection",
    "memberName": "getItemOrNullObject",
    "memberKind": "method",
    "signature": "getItemOrNullObject(name)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "name": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "partial",
    "onlyOfficeMapping": "partial object coverage through the Office Agent bridge",
    "notes": "Registered from the Office.js reference table; bridge support is best-effort for this member."
  },
  {
    "id": "Excel.Chart_Collection.load.method",
    "category": "图表",
    "objectName": "Excel.Chart Collection",
    "memberName": "load",
    "memberKind": "method",
    "signature": "load(options)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "options": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "partial",
    "onlyOfficeMapping": "partial object coverage through the Office Agent bridge",
    "notes": "Registered from the Office.js reference table; bridge support is best-effort for this member."
  },
  {
    "id": "Excel.Chart_Collection.context.property",
    "category": "图表",
    "objectName": "Excel.Chart Collection",
    "memberName": "context",
    "memberKind": "property",
    "signature": "context",
    "supportLevel": "partial",
    "onlyOfficeMapping": "partial object coverage through the Office Agent bridge",
    "notes": "Registered from the Office.js reference table; bridge support is best-effort for this member."
  },
  {
    "id": "Excel.Chart_Collection.count.property",
    "category": "图表",
    "objectName": "Excel.Chart Collection",
    "memberName": "count",
    "memberKind": "property",
    "signature": "count",
    "supportLevel": "partial",
    "onlyOfficeMapping": "partial object coverage through the Office Agent bridge",
    "notes": "Registered from the Office.js reference table; bridge support is best-effort for this member."
  },
  {
    "id": "Excel.Chart_Collection.items.property",
    "category": "图表",
    "objectName": "Excel.Chart Collection",
    "memberName": "items",
    "memberKind": "property",
    "signature": "items",
    "supportLevel": "partial",
    "onlyOfficeMapping": "partial object coverage through the Office Agent bridge",
    "notes": "Registered from the Office.js reference table; bridge support is best-effort for this member."
  },
  {
    "id": "Excel.Chart_Collection.onActivated.event",
    "category": "图表",
    "objectName": "Excel.Chart Collection",
    "memberName": "onActivated",
    "memberKind": "event",
    "signature": "onActivated",
    "supportLevel": "partial",
    "onlyOfficeMapping": "partial object coverage through the Office Agent bridge",
    "notes": "Registered from the Office.js reference table; bridge support is best-effort for this member."
  },
  {
    "id": "Excel.Chart_Collection.onAdded.event",
    "category": "图表",
    "objectName": "Excel.Chart Collection",
    "memberName": "onAdded",
    "memberKind": "event",
    "signature": "onAdded",
    "supportLevel": "partial",
    "onlyOfficeMapping": "partial object coverage through the Office Agent bridge",
    "notes": "Registered from the Office.js reference table; bridge support is best-effort for this member."
  },
  {
    "id": "Excel.Chart_Collection.onDeactivated.event",
    "category": "图表",
    "objectName": "Excel.Chart Collection",
    "memberName": "onDeactivated",
    "memberKind": "event",
    "signature": "onDeactivated",
    "supportLevel": "partial",
    "onlyOfficeMapping": "partial object coverage through the Office Agent bridge",
    "notes": "Registered from the Office.js reference table; bridge support is best-effort for this member."
  },
  {
    "id": "Excel.Chart_Collection.onDeleted.event",
    "category": "图表",
    "objectName": "Excel.Chart Collection",
    "memberName": "onDeleted",
    "memberKind": "event",
    "signature": "onDeleted",
    "supportLevel": "partial",
    "onlyOfficeMapping": "partial object coverage through the Office Agent bridge",
    "notes": "Registered from the Office.js reference table; bridge support is best-effort for this member."
  },
  {
    "id": "Excel.Chart_Axes.getItem.method",
    "category": "图表",
    "objectName": "Excel.Chart Axes",
    "memberName": "getItem",
    "memberKind": "method",
    "signature": "getItem(type, group)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "type": {
          "type": "unknown"
        },
        "group": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Axes.load.method",
    "category": "图表",
    "objectName": "Excel.Chart Axes",
    "memberName": "load",
    "memberKind": "method",
    "signature": "load(options)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "options": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Axes.load.method",
    "category": "图表",
    "objectName": "Excel.Chart Axes",
    "memberName": "load",
    "memberKind": "method",
    "signature": "load(propertyNames)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "propertyNames": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Axes.load.method",
    "category": "图表",
    "objectName": "Excel.Chart Axes",
    "memberName": "load",
    "memberKind": "method",
    "signature": "load(propertyNamesAndPaths)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "propertyNamesAndPaths": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Axes.set.method",
    "category": "图表",
    "objectName": "Excel.Chart Axes",
    "memberName": "set",
    "memberKind": "method",
    "signature": "set(properties, options)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "properties": {
          "type": "unknown"
        },
        "options": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Axes.set.method",
    "category": "图表",
    "objectName": "Excel.Chart Axes",
    "memberName": "set",
    "memberKind": "method",
    "signature": "set(properties)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "properties": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Axes.categoryAxis.property",
    "category": "图表",
    "objectName": "Excel.Chart Axes",
    "memberName": "categoryAxis",
    "memberKind": "property",
    "signature": "categoryAxis",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Axes.context.property",
    "category": "图表",
    "objectName": "Excel.Chart Axes",
    "memberName": "context",
    "memberKind": "property",
    "signature": "context",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Axes.seriesAxis.property",
    "category": "图表",
    "objectName": "Excel.Chart Axes",
    "memberName": "seriesAxis",
    "memberKind": "property",
    "signature": "seriesAxis",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Axes.valueAxis.property",
    "category": "图表",
    "objectName": "Excel.Chart Axes",
    "memberName": "valueAxis",
    "memberKind": "property",
    "signature": "valueAxis",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Axis.load.method",
    "category": "图表",
    "objectName": "Excel.Chart Axis",
    "memberName": "load",
    "memberKind": "method",
    "signature": "load(options)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "options": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Axis.load.method",
    "category": "图表",
    "objectName": "Excel.Chart Axis",
    "memberName": "load",
    "memberKind": "method",
    "signature": "load(propertyNames)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "propertyNames": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Axis.load.method",
    "category": "图表",
    "objectName": "Excel.Chart Axis",
    "memberName": "load",
    "memberKind": "method",
    "signature": "load(propertyNamesAndPaths)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "propertyNamesAndPaths": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Axis.set.method",
    "category": "图表",
    "objectName": "Excel.Chart Axis",
    "memberName": "set",
    "memberKind": "method",
    "signature": "set(properties, options)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "properties": {
          "type": "unknown"
        },
        "options": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Axis.set.method",
    "category": "图表",
    "objectName": "Excel.Chart Axis",
    "memberName": "set",
    "memberKind": "method",
    "signature": "set(properties)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "properties": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Axis.setCategoryNames.method",
    "category": "图表",
    "objectName": "Excel.Chart Axis",
    "memberName": "setCategoryNames",
    "memberKind": "method",
    "signature": "setCategoryNames(sourceData)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "sourceData": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Axis.alignment.property",
    "category": "图表",
    "objectName": "Excel.Chart Axis",
    "memberName": "alignment",
    "memberKind": "property",
    "signature": "alignment",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Axis.axisGroup.property",
    "category": "图表",
    "objectName": "Excel.Chart Axis",
    "memberName": "axisGroup",
    "memberKind": "property",
    "signature": "axisGroup",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Axis.baseTimeUnit.property",
    "category": "图表",
    "objectName": "Excel.Chart Axis",
    "memberName": "baseTimeUnit",
    "memberKind": "property",
    "signature": "baseTimeUnit",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Axis.categoryType.property",
    "category": "图表",
    "objectName": "Excel.Chart Axis",
    "memberName": "categoryType",
    "memberKind": "property",
    "signature": "categoryType",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Axis.context.property",
    "category": "图表",
    "objectName": "Excel.Chart Axis",
    "memberName": "context",
    "memberKind": "property",
    "signature": "context",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Axis.customDisplayUnit.property",
    "category": "图表",
    "objectName": "Excel.Chart Axis",
    "memberName": "customDisplayUnit",
    "memberKind": "property",
    "signature": "customDisplayUnit",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Axis_Format.load.method",
    "category": "图表",
    "objectName": "Excel.Chart Axis Format",
    "memberName": "load",
    "memberKind": "method",
    "signature": "load(options)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "options": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Axis_Format.load.method",
    "category": "图表",
    "objectName": "Excel.Chart Axis Format",
    "memberName": "load",
    "memberKind": "method",
    "signature": "load(propertyNames)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "propertyNames": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Axis_Format.load.method",
    "category": "图表",
    "objectName": "Excel.Chart Axis Format",
    "memberName": "load",
    "memberKind": "method",
    "signature": "load(propertyNamesAndPaths)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "propertyNamesAndPaths": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Axis_Format.set.method",
    "category": "图表",
    "objectName": "Excel.Chart Axis Format",
    "memberName": "set",
    "memberKind": "method",
    "signature": "set(properties, options)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "properties": {
          "type": "unknown"
        },
        "options": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Axis_Format.set.method",
    "category": "图表",
    "objectName": "Excel.Chart Axis Format",
    "memberName": "set",
    "memberKind": "method",
    "signature": "set(properties)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "properties": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Axis_Format.toJSON.method",
    "category": "图表",
    "objectName": "Excel.Chart Axis Format",
    "memberName": "toJSON",
    "memberKind": "method",
    "signature": "toJSON()",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Axis_Format.context.property",
    "category": "图表",
    "objectName": "Excel.Chart Axis Format",
    "memberName": "context",
    "memberKind": "property",
    "signature": "context",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Axis_Format.fill.property",
    "category": "图表",
    "objectName": "Excel.Chart Axis Format",
    "memberName": "fill",
    "memberKind": "property",
    "signature": "fill",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Axis_Format.font.property",
    "category": "图表",
    "objectName": "Excel.Chart Axis Format",
    "memberName": "font",
    "memberKind": "property",
    "signature": "font",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Axis_Format.line.property",
    "category": "图表",
    "objectName": "Excel.Chart Axis Format",
    "memberName": "line",
    "memberKind": "property",
    "signature": "line",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Axis_Title.load.method",
    "category": "图表",
    "objectName": "Excel.Chart Axis Title",
    "memberName": "load",
    "memberKind": "method",
    "signature": "load(options)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "options": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Axis_Title.load.method",
    "category": "图表",
    "objectName": "Excel.Chart Axis Title",
    "memberName": "load",
    "memberKind": "method",
    "signature": "load(propertyNames)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "propertyNames": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Axis_Title.load.method",
    "category": "图表",
    "objectName": "Excel.Chart Axis Title",
    "memberName": "load",
    "memberKind": "method",
    "signature": "load(propertyNamesAndPaths)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "propertyNamesAndPaths": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Axis_Title.set.method",
    "category": "图表",
    "objectName": "Excel.Chart Axis Title",
    "memberName": "set",
    "memberKind": "method",
    "signature": "set(properties, options)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "properties": {
          "type": "unknown"
        },
        "options": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Axis_Title.set.method",
    "category": "图表",
    "objectName": "Excel.Chart Axis Title",
    "memberName": "set",
    "memberKind": "method",
    "signature": "set(properties)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "properties": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Axis_Title.setFormula.method",
    "category": "图表",
    "objectName": "Excel.Chart Axis Title",
    "memberName": "setFormula",
    "memberKind": "method",
    "signature": "setFormula(formula)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "formula": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Axis_Title.context.property",
    "category": "图表",
    "objectName": "Excel.Chart Axis Title",
    "memberName": "context",
    "memberKind": "property",
    "signature": "context",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Axis_Title.format.property",
    "category": "图表",
    "objectName": "Excel.Chart Axis Title",
    "memberName": "format",
    "memberKind": "property",
    "signature": "format",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Axis_Title.text.property",
    "category": "图表",
    "objectName": "Excel.Chart Axis Title",
    "memberName": "text",
    "memberKind": "property",
    "signature": "text",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Axis_Title.textOrientation.property",
    "category": "图表",
    "objectName": "Excel.Chart Axis Title",
    "memberName": "textOrientation",
    "memberKind": "property",
    "signature": "textOrientation",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Axis_Title.visible.property",
    "category": "图表",
    "objectName": "Excel.Chart Axis Title",
    "memberName": "visible",
    "memberKind": "property",
    "signature": "visible",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Axis_Title_Format.load.method",
    "category": "图表",
    "objectName": "Excel.Chart Axis Title Format",
    "memberName": "load",
    "memberKind": "method",
    "signature": "load(options)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "options": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Axis_Title_Format.load.method",
    "category": "图表",
    "objectName": "Excel.Chart Axis Title Format",
    "memberName": "load",
    "memberKind": "method",
    "signature": "load(propertyNames)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "propertyNames": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Axis_Title_Format.load.method",
    "category": "图表",
    "objectName": "Excel.Chart Axis Title Format",
    "memberName": "load",
    "memberKind": "method",
    "signature": "load(propertyNamesAndPaths)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "propertyNamesAndPaths": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Axis_Title_Format.set.method",
    "category": "图表",
    "objectName": "Excel.Chart Axis Title Format",
    "memberName": "set",
    "memberKind": "method",
    "signature": "set(properties, options)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "properties": {
          "type": "unknown"
        },
        "options": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Axis_Title_Format.set.method",
    "category": "图表",
    "objectName": "Excel.Chart Axis Title Format",
    "memberName": "set",
    "memberKind": "method",
    "signature": "set(properties)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "properties": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Axis_Title_Format.toJSON.method",
    "category": "图表",
    "objectName": "Excel.Chart Axis Title Format",
    "memberName": "toJSON",
    "memberKind": "method",
    "signature": "toJSON()",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Axis_Title_Format.border.property",
    "category": "图表",
    "objectName": "Excel.Chart Axis Title Format",
    "memberName": "border",
    "memberKind": "property",
    "signature": "border",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Axis_Title_Format.context.property",
    "category": "图表",
    "objectName": "Excel.Chart Axis Title Format",
    "memberName": "context",
    "memberKind": "property",
    "signature": "context",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Axis_Title_Format.fill.property",
    "category": "图表",
    "objectName": "Excel.Chart Axis Title Format",
    "memberName": "fill",
    "memberKind": "property",
    "signature": "fill",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Axis_Title_Format.font.property",
    "category": "图表",
    "objectName": "Excel.Chart Axis Title Format",
    "memberName": "font",
    "memberKind": "property",
    "signature": "font",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Series.delete.method",
    "category": "图表",
    "objectName": "Excel.Chart Series",
    "memberName": "delete",
    "memberKind": "method",
    "signature": "delete()",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Series.getDimensionDataSourceString.method",
    "category": "图表",
    "objectName": "Excel.Chart Series",
    "memberName": "getDimensionDataSourceString",
    "memberKind": "method",
    "signature": "getDimensionDataSourceString(dimension)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "dimension": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Series.getDimensionDataSourceType.method",
    "category": "图表",
    "objectName": "Excel.Chart Series",
    "memberName": "getDimensionDataSourceType",
    "memberKind": "method",
    "signature": "getDimensionDataSourceType(dimension)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "dimension": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Series.getDimensionValues.method",
    "category": "图表",
    "objectName": "Excel.Chart Series",
    "memberName": "getDimensionValues",
    "memberKind": "method",
    "signature": "getDimensionValues(dimension)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "dimension": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Series.load.method",
    "category": "图表",
    "objectName": "Excel.Chart Series",
    "memberName": "load",
    "memberKind": "method",
    "signature": "load(options)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "options": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Series.load.method",
    "category": "图表",
    "objectName": "Excel.Chart Series",
    "memberName": "load",
    "memberKind": "method",
    "signature": "load(propertyNames)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "propertyNames": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Series.axisGroup.property",
    "category": "图表",
    "objectName": "Excel.Chart Series",
    "memberName": "axisGroup",
    "memberKind": "property",
    "signature": "axisGroup",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Series.binOptions.property",
    "category": "图表",
    "objectName": "Excel.Chart Series",
    "memberName": "binOptions",
    "memberKind": "property",
    "signature": "binOptions",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Series.boxwhiskerOptions.property",
    "category": "图表",
    "objectName": "Excel.Chart Series",
    "memberName": "boxwhiskerOptions",
    "memberKind": "property",
    "signature": "boxwhiskerOptions",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Series.bubbleScale.property",
    "category": "图表",
    "objectName": "Excel.Chart Series",
    "memberName": "bubbleScale",
    "memberKind": "property",
    "signature": "bubbleScale",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Series.chartType.property",
    "category": "图表",
    "objectName": "Excel.Chart Series",
    "memberName": "chartType",
    "memberKind": "property",
    "signature": "chartType",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Series.context.property",
    "category": "图表",
    "objectName": "Excel.Chart Series",
    "memberName": "context",
    "memberKind": "property",
    "signature": "context",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Series_Collection.add.method",
    "category": "图表",
    "objectName": "Excel.Chart Series Collection",
    "memberName": "add",
    "memberKind": "method",
    "signature": "add(name, index)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "name": {
          "type": "unknown"
        },
        "index": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Series_Collection.getCount.method",
    "category": "图表",
    "objectName": "Excel.Chart Series Collection",
    "memberName": "getCount",
    "memberKind": "method",
    "signature": "getCount()",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Series_Collection.getItemAt.method",
    "category": "图表",
    "objectName": "Excel.Chart Series Collection",
    "memberName": "getItemAt",
    "memberKind": "method",
    "signature": "getItemAt(index)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "index": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Series_Collection.load.method",
    "category": "图表",
    "objectName": "Excel.Chart Series Collection",
    "memberName": "load",
    "memberKind": "method",
    "signature": "load(options)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "options": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Series_Collection.load.method",
    "category": "图表",
    "objectName": "Excel.Chart Series Collection",
    "memberName": "load",
    "memberKind": "method",
    "signature": "load(propertyNames)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "propertyNames": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Series_Collection.load.method",
    "category": "图表",
    "objectName": "Excel.Chart Series Collection",
    "memberName": "load",
    "memberKind": "method",
    "signature": "load(propertyNamesAndPaths)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "propertyNamesAndPaths": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Series_Collection.context.property",
    "category": "图表",
    "objectName": "Excel.Chart Series Collection",
    "memberName": "context",
    "memberKind": "property",
    "signature": "context",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Series_Collection.count.property",
    "category": "图表",
    "objectName": "Excel.Chart Series Collection",
    "memberName": "count",
    "memberKind": "property",
    "signature": "count",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Series_Collection.items.property",
    "category": "图表",
    "objectName": "Excel.Chart Series Collection",
    "memberName": "items",
    "memberKind": "property",
    "signature": "items",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Point.load.method",
    "category": "图表",
    "objectName": "Excel.Chart Point",
    "memberName": "load",
    "memberKind": "method",
    "signature": "load(options)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "options": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Point.load.method",
    "category": "图表",
    "objectName": "Excel.Chart Point",
    "memberName": "load",
    "memberKind": "method",
    "signature": "load(propertyNames)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "propertyNames": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Point.load.method",
    "category": "图表",
    "objectName": "Excel.Chart Point",
    "memberName": "load",
    "memberKind": "method",
    "signature": "load(propertyNamesAndPaths)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "propertyNamesAndPaths": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Point.set.method",
    "category": "图表",
    "objectName": "Excel.Chart Point",
    "memberName": "set",
    "memberKind": "method",
    "signature": "set(properties, options)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "properties": {
          "type": "unknown"
        },
        "options": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Point.set.method",
    "category": "图表",
    "objectName": "Excel.Chart Point",
    "memberName": "set",
    "memberKind": "method",
    "signature": "set(properties)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "properties": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Point.toJSON.method",
    "category": "图表",
    "objectName": "Excel.Chart Point",
    "memberName": "toJSON",
    "memberKind": "method",
    "signature": "toJSON()",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Point.context.property",
    "category": "图表",
    "objectName": "Excel.Chart Point",
    "memberName": "context",
    "memberKind": "property",
    "signature": "context",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Point.dataLabel.property",
    "category": "图表",
    "objectName": "Excel.Chart Point",
    "memberName": "dataLabel",
    "memberKind": "property",
    "signature": "dataLabel",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Point.format.property",
    "category": "图表",
    "objectName": "Excel.Chart Point",
    "memberName": "format",
    "memberKind": "property",
    "signature": "format",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Point.hasDataLabel.property",
    "category": "图表",
    "objectName": "Excel.Chart Point",
    "memberName": "hasDataLabel",
    "memberKind": "property",
    "signature": "hasDataLabel",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Point.markerBackgroundColor.property",
    "category": "图表",
    "objectName": "Excel.Chart Point",
    "memberName": "markerBackgroundColor",
    "memberKind": "property",
    "signature": "markerBackgroundColor",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Point.markerForegroundColor.property",
    "category": "图表",
    "objectName": "Excel.Chart Point",
    "memberName": "markerForegroundColor",
    "memberKind": "property",
    "signature": "markerForegroundColor",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Title.getSubstring.method",
    "category": "图表",
    "objectName": "Excel.Chart Title",
    "memberName": "getSubstring",
    "memberKind": "method",
    "signature": "getSubstring(start, length)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "start": {
          "type": "unknown"
        },
        "length": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Title.load.method",
    "category": "图表",
    "objectName": "Excel.Chart Title",
    "memberName": "load",
    "memberKind": "method",
    "signature": "load(options)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "options": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Title.load.method",
    "category": "图表",
    "objectName": "Excel.Chart Title",
    "memberName": "load",
    "memberKind": "method",
    "signature": "load(propertyNames)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "propertyNames": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Title.load.method",
    "category": "图表",
    "objectName": "Excel.Chart Title",
    "memberName": "load",
    "memberKind": "method",
    "signature": "load(propertyNamesAndPaths)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "propertyNamesAndPaths": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Title.set.method",
    "category": "图表",
    "objectName": "Excel.Chart Title",
    "memberName": "set",
    "memberKind": "method",
    "signature": "set(properties, options)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "properties": {
          "type": "unknown"
        },
        "options": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Title.set.method",
    "category": "图表",
    "objectName": "Excel.Chart Title",
    "memberName": "set",
    "memberKind": "method",
    "signature": "set(properties)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "properties": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Title.context.property",
    "category": "图表",
    "objectName": "Excel.Chart Title",
    "memberName": "context",
    "memberKind": "property",
    "signature": "context",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Title.format.property",
    "category": "图表",
    "objectName": "Excel.Chart Title",
    "memberName": "format",
    "memberKind": "property",
    "signature": "format",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Title.height.property",
    "category": "图表",
    "objectName": "Excel.Chart Title",
    "memberName": "height",
    "memberKind": "property",
    "signature": "height",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Title.horizontalAlignment.property",
    "category": "图表",
    "objectName": "Excel.Chart Title",
    "memberName": "horizontalAlignment",
    "memberKind": "property",
    "signature": "horizontalAlignment",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Title.left.property",
    "category": "图表",
    "objectName": "Excel.Chart Title",
    "memberName": "left",
    "memberKind": "property",
    "signature": "left",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Title.overlay.property",
    "category": "图表",
    "objectName": "Excel.Chart Title",
    "memberName": "overlay",
    "memberKind": "property",
    "signature": "overlay",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Title_Format.load.method",
    "category": "图表",
    "objectName": "Excel.Chart Title Format",
    "memberName": "load",
    "memberKind": "method",
    "signature": "load(options)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "options": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Title_Format.load.method",
    "category": "图表",
    "objectName": "Excel.Chart Title Format",
    "memberName": "load",
    "memberKind": "method",
    "signature": "load(propertyNames)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "propertyNames": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Title_Format.load.method",
    "category": "图表",
    "objectName": "Excel.Chart Title Format",
    "memberName": "load",
    "memberKind": "method",
    "signature": "load(propertyNamesAndPaths)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "propertyNamesAndPaths": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Title_Format.set.method",
    "category": "图表",
    "objectName": "Excel.Chart Title Format",
    "memberName": "set",
    "memberKind": "method",
    "signature": "set(properties, options)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "properties": {
          "type": "unknown"
        },
        "options": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Title_Format.set.method",
    "category": "图表",
    "objectName": "Excel.Chart Title Format",
    "memberName": "set",
    "memberKind": "method",
    "signature": "set(properties)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "properties": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Title_Format.toJSON.method",
    "category": "图表",
    "objectName": "Excel.Chart Title Format",
    "memberName": "toJSON",
    "memberKind": "method",
    "signature": "toJSON()",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Title_Format.border.property",
    "category": "图表",
    "objectName": "Excel.Chart Title Format",
    "memberName": "border",
    "memberKind": "property",
    "signature": "border",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Title_Format.context.property",
    "category": "图表",
    "objectName": "Excel.Chart Title Format",
    "memberName": "context",
    "memberKind": "property",
    "signature": "context",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Title_Format.fill.property",
    "category": "图表",
    "objectName": "Excel.Chart Title Format",
    "memberName": "fill",
    "memberKind": "property",
    "signature": "fill",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Title_Format.font.property",
    "category": "图表",
    "objectName": "Excel.Chart Title Format",
    "memberName": "font",
    "memberKind": "property",
    "signature": "font",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Legend.load.method",
    "category": "图表",
    "objectName": "Excel.Chart Legend",
    "memberName": "load",
    "memberKind": "method",
    "signature": "load(options)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "options": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Legend.load.method",
    "category": "图表",
    "objectName": "Excel.Chart Legend",
    "memberName": "load",
    "memberKind": "method",
    "signature": "load(propertyNames)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "propertyNames": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Legend.load.method",
    "category": "图表",
    "objectName": "Excel.Chart Legend",
    "memberName": "load",
    "memberKind": "method",
    "signature": "load(propertyNamesAndPaths)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "propertyNamesAndPaths": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Legend.set.method",
    "category": "图表",
    "objectName": "Excel.Chart Legend",
    "memberName": "set",
    "memberKind": "method",
    "signature": "set(properties, options)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "properties": {
          "type": "unknown"
        },
        "options": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Legend.set.method",
    "category": "图表",
    "objectName": "Excel.Chart Legend",
    "memberName": "set",
    "memberKind": "method",
    "signature": "set(properties)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "properties": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Legend.toJSON.method",
    "category": "图表",
    "objectName": "Excel.Chart Legend",
    "memberName": "toJSON",
    "memberKind": "method",
    "signature": "toJSON()",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Legend.context.property",
    "category": "图表",
    "objectName": "Excel.Chart Legend",
    "memberName": "context",
    "memberKind": "property",
    "signature": "context",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Legend.format.property",
    "category": "图表",
    "objectName": "Excel.Chart Legend",
    "memberName": "format",
    "memberKind": "property",
    "signature": "format",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Legend.height.property",
    "category": "图表",
    "objectName": "Excel.Chart Legend",
    "memberName": "height",
    "memberKind": "property",
    "signature": "height",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Legend.left.property",
    "category": "图表",
    "objectName": "Excel.Chart Legend",
    "memberName": "left",
    "memberKind": "property",
    "signature": "left",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Legend.legendEntries.property",
    "category": "图表",
    "objectName": "Excel.Chart Legend",
    "memberName": "legendEntries",
    "memberKind": "property",
    "signature": "legendEntries",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Legend.overlay.property",
    "category": "图表",
    "objectName": "Excel.Chart Legend",
    "memberName": "overlay",
    "memberKind": "property",
    "signature": "overlay",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Legend_Format.load.method",
    "category": "图表",
    "objectName": "Excel.Chart Legend Format",
    "memberName": "load",
    "memberKind": "method",
    "signature": "load(options)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "options": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Legend_Format.load.method",
    "category": "图表",
    "objectName": "Excel.Chart Legend Format",
    "memberName": "load",
    "memberKind": "method",
    "signature": "load(propertyNames)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "propertyNames": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Legend_Format.load.method",
    "category": "图表",
    "objectName": "Excel.Chart Legend Format",
    "memberName": "load",
    "memberKind": "method",
    "signature": "load(propertyNamesAndPaths)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "propertyNamesAndPaths": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Legend_Format.set.method",
    "category": "图表",
    "objectName": "Excel.Chart Legend Format",
    "memberName": "set",
    "memberKind": "method",
    "signature": "set(properties, options)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "properties": {
          "type": "unknown"
        },
        "options": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Legend_Format.set.method",
    "category": "图表",
    "objectName": "Excel.Chart Legend Format",
    "memberName": "set",
    "memberKind": "method",
    "signature": "set(properties)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "properties": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Legend_Format.toJSON.method",
    "category": "图表",
    "objectName": "Excel.Chart Legend Format",
    "memberName": "toJSON",
    "memberKind": "method",
    "signature": "toJSON()",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Legend_Format.border.property",
    "category": "图表",
    "objectName": "Excel.Chart Legend Format",
    "memberName": "border",
    "memberKind": "property",
    "signature": "border",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Legend_Format.context.property",
    "category": "图表",
    "objectName": "Excel.Chart Legend Format",
    "memberName": "context",
    "memberKind": "property",
    "signature": "context",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Legend_Format.fill.property",
    "category": "图表",
    "objectName": "Excel.Chart Legend Format",
    "memberName": "fill",
    "memberKind": "property",
    "signature": "fill",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Legend_Format.font.property",
    "category": "图表",
    "objectName": "Excel.Chart Legend Format",
    "memberName": "font",
    "memberKind": "property",
    "signature": "font",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Legend_Entry.load.method",
    "category": "图表",
    "objectName": "Excel.Chart Legend Entry",
    "memberName": "load",
    "memberKind": "method",
    "signature": "load(options)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "options": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Legend_Entry.load.method",
    "category": "图表",
    "objectName": "Excel.Chart Legend Entry",
    "memberName": "load",
    "memberKind": "method",
    "signature": "load(propertyNames)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "propertyNames": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Legend_Entry.load.method",
    "category": "图表",
    "objectName": "Excel.Chart Legend Entry",
    "memberName": "load",
    "memberKind": "method",
    "signature": "load(propertyNamesAndPaths)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "propertyNamesAndPaths": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Legend_Entry.set.method",
    "category": "图表",
    "objectName": "Excel.Chart Legend Entry",
    "memberName": "set",
    "memberKind": "method",
    "signature": "set(properties, options)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "properties": {
          "type": "unknown"
        },
        "options": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Legend_Entry.set.method",
    "category": "图表",
    "objectName": "Excel.Chart Legend Entry",
    "memberName": "set",
    "memberKind": "method",
    "signature": "set(properties)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "properties": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Legend_Entry.toJSON.method",
    "category": "图表",
    "objectName": "Excel.Chart Legend Entry",
    "memberName": "toJSON",
    "memberKind": "method",
    "signature": "toJSON()",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Legend_Entry.context.property",
    "category": "图表",
    "objectName": "Excel.Chart Legend Entry",
    "memberName": "context",
    "memberKind": "property",
    "signature": "context",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Legend_Entry.height.property",
    "category": "图表",
    "objectName": "Excel.Chart Legend Entry",
    "memberName": "height",
    "memberKind": "property",
    "signature": "height",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Legend_Entry.index.property",
    "category": "图表",
    "objectName": "Excel.Chart Legend Entry",
    "memberName": "index",
    "memberKind": "property",
    "signature": "index",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Legend_Entry.left.property",
    "category": "图表",
    "objectName": "Excel.Chart Legend Entry",
    "memberName": "left",
    "memberKind": "property",
    "signature": "left",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Legend_Entry.top.property",
    "category": "图表",
    "objectName": "Excel.Chart Legend Entry",
    "memberName": "top",
    "memberKind": "property",
    "signature": "top",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Legend_Entry.visible.property",
    "category": "图表",
    "objectName": "Excel.Chart Legend Entry",
    "memberName": "visible",
    "memberKind": "property",
    "signature": "visible",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Plot_Area.load.method",
    "category": "图表",
    "objectName": "Excel.Chart Plot Area",
    "memberName": "load",
    "memberKind": "method",
    "signature": "load(options)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "options": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Plot_Area.load.method",
    "category": "图表",
    "objectName": "Excel.Chart Plot Area",
    "memberName": "load",
    "memberKind": "method",
    "signature": "load(propertyNames)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "propertyNames": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Plot_Area.load.method",
    "category": "图表",
    "objectName": "Excel.Chart Plot Area",
    "memberName": "load",
    "memberKind": "method",
    "signature": "load(propertyNamesAndPaths)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "propertyNamesAndPaths": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Plot_Area.set.method",
    "category": "图表",
    "objectName": "Excel.Chart Plot Area",
    "memberName": "set",
    "memberKind": "method",
    "signature": "set(properties, options)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "properties": {
          "type": "unknown"
        },
        "options": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Plot_Area.set.method",
    "category": "图表",
    "objectName": "Excel.Chart Plot Area",
    "memberName": "set",
    "memberKind": "method",
    "signature": "set(properties)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "properties": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Plot_Area.toJSON.method",
    "category": "图表",
    "objectName": "Excel.Chart Plot Area",
    "memberName": "toJSON",
    "memberKind": "method",
    "signature": "toJSON()",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Plot_Area.context.property",
    "category": "图表",
    "objectName": "Excel.Chart Plot Area",
    "memberName": "context",
    "memberKind": "property",
    "signature": "context",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Plot_Area.format.property",
    "category": "图表",
    "objectName": "Excel.Chart Plot Area",
    "memberName": "format",
    "memberKind": "property",
    "signature": "format",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Plot_Area.height.property",
    "category": "图表",
    "objectName": "Excel.Chart Plot Area",
    "memberName": "height",
    "memberKind": "property",
    "signature": "height",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Plot_Area.insideHeight.property",
    "category": "图表",
    "objectName": "Excel.Chart Plot Area",
    "memberName": "insideHeight",
    "memberKind": "property",
    "signature": "insideHeight",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Plot_Area.insideLeft.property",
    "category": "图表",
    "objectName": "Excel.Chart Plot Area",
    "memberName": "insideLeft",
    "memberKind": "property",
    "signature": "insideLeft",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Plot_Area.insideTop.property",
    "category": "图表",
    "objectName": "Excel.Chart Plot Area",
    "memberName": "insideTop",
    "memberKind": "property",
    "signature": "insideTop",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Area_Format.load.method",
    "category": "图表",
    "objectName": "Excel.Chart Area Format",
    "memberName": "load",
    "memberKind": "method",
    "signature": "load(options)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "options": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Area_Format.load.method",
    "category": "图表",
    "objectName": "Excel.Chart Area Format",
    "memberName": "load",
    "memberKind": "method",
    "signature": "load(propertyNames)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "propertyNames": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Area_Format.load.method",
    "category": "图表",
    "objectName": "Excel.Chart Area Format",
    "memberName": "load",
    "memberKind": "method",
    "signature": "load(propertyNamesAndPaths)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "propertyNamesAndPaths": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Area_Format.set.method",
    "category": "图表",
    "objectName": "Excel.Chart Area Format",
    "memberName": "set",
    "memberKind": "method",
    "signature": "set(properties, options)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "properties": {
          "type": "unknown"
        },
        "options": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Area_Format.set.method",
    "category": "图表",
    "objectName": "Excel.Chart Area Format",
    "memberName": "set",
    "memberKind": "method",
    "signature": "set(properties)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "properties": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Area_Format.toJSON.method",
    "category": "图表",
    "objectName": "Excel.Chart Area Format",
    "memberName": "toJSON",
    "memberKind": "method",
    "signature": "toJSON()",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Area_Format.border.property",
    "category": "图表",
    "objectName": "Excel.Chart Area Format",
    "memberName": "border",
    "memberKind": "property",
    "signature": "border",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Area_Format.colorScheme.property",
    "category": "图表",
    "objectName": "Excel.Chart Area Format",
    "memberName": "colorScheme",
    "memberKind": "property",
    "signature": "colorScheme",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Area_Format.context.property",
    "category": "图表",
    "objectName": "Excel.Chart Area Format",
    "memberName": "context",
    "memberKind": "property",
    "signature": "context",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Area_Format.fill.property",
    "category": "图表",
    "objectName": "Excel.Chart Area Format",
    "memberName": "fill",
    "memberKind": "property",
    "signature": "fill",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Area_Format.font.property",
    "category": "图表",
    "objectName": "Excel.Chart Area Format",
    "memberName": "font",
    "memberKind": "property",
    "signature": "font",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Area_Format.roundedCorners.property",
    "category": "图表",
    "objectName": "Excel.Chart Area Format",
    "memberName": "roundedCorners",
    "memberKind": "property",
    "signature": "roundedCorners",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Border.clear.method",
    "category": "图表",
    "objectName": "Excel.Chart Border",
    "memberName": "clear",
    "memberKind": "method",
    "signature": "clear()",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Border.load.method",
    "category": "图表",
    "objectName": "Excel.Chart Border",
    "memberName": "load",
    "memberKind": "method",
    "signature": "load(options)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "options": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Border.load.method",
    "category": "图表",
    "objectName": "Excel.Chart Border",
    "memberName": "load",
    "memberKind": "method",
    "signature": "load(propertyNames)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "propertyNames": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Border.load.method",
    "category": "图表",
    "objectName": "Excel.Chart Border",
    "memberName": "load",
    "memberKind": "method",
    "signature": "load(propertyNamesAndPaths)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "propertyNamesAndPaths": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Border.set.method",
    "category": "图表",
    "objectName": "Excel.Chart Border",
    "memberName": "set",
    "memberKind": "method",
    "signature": "set(properties, options)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "properties": {
          "type": "unknown"
        },
        "options": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Border.set.method",
    "category": "图表",
    "objectName": "Excel.Chart Border",
    "memberName": "set",
    "memberKind": "method",
    "signature": "set(properties)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "properties": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Border.color.property",
    "category": "图表",
    "objectName": "Excel.Chart Border",
    "memberName": "color",
    "memberKind": "property",
    "signature": "color",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Border.context.property",
    "category": "图表",
    "objectName": "Excel.Chart Border",
    "memberName": "context",
    "memberKind": "property",
    "signature": "context",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Border.lineStyle.property",
    "category": "图表",
    "objectName": "Excel.Chart Border",
    "memberName": "lineStyle",
    "memberKind": "property",
    "signature": "lineStyle",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Border.weight.property",
    "category": "图表",
    "objectName": "Excel.Chart Border",
    "memberName": "weight",
    "memberKind": "property",
    "signature": "weight",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Line_Format.clear.method",
    "category": "图表",
    "objectName": "Excel.Chart Line Format",
    "memberName": "clear",
    "memberKind": "method",
    "signature": "clear()",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Line_Format.load.method",
    "category": "图表",
    "objectName": "Excel.Chart Line Format",
    "memberName": "load",
    "memberKind": "method",
    "signature": "load(options)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "options": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Line_Format.load.method",
    "category": "图表",
    "objectName": "Excel.Chart Line Format",
    "memberName": "load",
    "memberKind": "method",
    "signature": "load(propertyNames)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "propertyNames": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Line_Format.load.method",
    "category": "图表",
    "objectName": "Excel.Chart Line Format",
    "memberName": "load",
    "memberKind": "method",
    "signature": "load(propertyNamesAndPaths)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "propertyNamesAndPaths": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Line_Format.set.method",
    "category": "图表",
    "objectName": "Excel.Chart Line Format",
    "memberName": "set",
    "memberKind": "method",
    "signature": "set(properties, options)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "properties": {
          "type": "unknown"
        },
        "options": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Line_Format.set.method",
    "category": "图表",
    "objectName": "Excel.Chart Line Format",
    "memberName": "set",
    "memberKind": "method",
    "signature": "set(properties)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "properties": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Line_Format.color.property",
    "category": "图表",
    "objectName": "Excel.Chart Line Format",
    "memberName": "color",
    "memberKind": "property",
    "signature": "color",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Line_Format.context.property",
    "category": "图表",
    "objectName": "Excel.Chart Line Format",
    "memberName": "context",
    "memberKind": "property",
    "signature": "context",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Line_Format.lineStyle.property",
    "category": "图表",
    "objectName": "Excel.Chart Line Format",
    "memberName": "lineStyle",
    "memberKind": "property",
    "signature": "lineStyle",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Line_Format.weight.property",
    "category": "图表",
    "objectName": "Excel.Chart Line Format",
    "memberName": "weight",
    "memberKind": "property",
    "signature": "weight",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Font.load.method",
    "category": "图表",
    "objectName": "Excel.Chart Font",
    "memberName": "load",
    "memberKind": "method",
    "signature": "load(options)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "options": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Font.load.method",
    "category": "图表",
    "objectName": "Excel.Chart Font",
    "memberName": "load",
    "memberKind": "method",
    "signature": "load(propertyNames)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "propertyNames": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Font.load.method",
    "category": "图表",
    "objectName": "Excel.Chart Font",
    "memberName": "load",
    "memberKind": "method",
    "signature": "load(propertyNamesAndPaths)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "propertyNamesAndPaths": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Font.set.method",
    "category": "图表",
    "objectName": "Excel.Chart Font",
    "memberName": "set",
    "memberKind": "method",
    "signature": "set(properties, options)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "properties": {
          "type": "unknown"
        },
        "options": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Font.set.method",
    "category": "图表",
    "objectName": "Excel.Chart Font",
    "memberName": "set",
    "memberKind": "method",
    "signature": "set(properties)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "properties": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Font.toJSON.method",
    "category": "图表",
    "objectName": "Excel.Chart Font",
    "memberName": "toJSON",
    "memberKind": "method",
    "signature": "toJSON()",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Font.bold.property",
    "category": "图表",
    "objectName": "Excel.Chart Font",
    "memberName": "bold",
    "memberKind": "property",
    "signature": "bold",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Font.color.property",
    "category": "图表",
    "objectName": "Excel.Chart Font",
    "memberName": "color",
    "memberKind": "property",
    "signature": "color",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Font.context.property",
    "category": "图表",
    "objectName": "Excel.Chart Font",
    "memberName": "context",
    "memberKind": "property",
    "signature": "context",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Font.italic.property",
    "category": "图表",
    "objectName": "Excel.Chart Font",
    "memberName": "italic",
    "memberKind": "property",
    "signature": "italic",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Font.size.property",
    "category": "图表",
    "objectName": "Excel.Chart Font",
    "memberName": "size",
    "memberKind": "property",
    "signature": "size",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Font.underline.property",
    "category": "图表",
    "objectName": "Excel.Chart Font",
    "memberName": "underline",
    "memberKind": "property",
    "signature": "underline",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Error_Bars.load.method",
    "category": "图表",
    "objectName": "Excel.Chart Error Bars",
    "memberName": "load",
    "memberKind": "method",
    "signature": "load(options)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "options": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Error_Bars.load.method",
    "category": "图表",
    "objectName": "Excel.Chart Error Bars",
    "memberName": "load",
    "memberKind": "method",
    "signature": "load(propertyNames)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "propertyNames": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Error_Bars.load.method",
    "category": "图表",
    "objectName": "Excel.Chart Error Bars",
    "memberName": "load",
    "memberKind": "method",
    "signature": "load(propertyNamesAndPaths)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "propertyNamesAndPaths": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Error_Bars.set.method",
    "category": "图表",
    "objectName": "Excel.Chart Error Bars",
    "memberName": "set",
    "memberKind": "method",
    "signature": "set(properties, options)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "properties": {
          "type": "unknown"
        },
        "options": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Error_Bars.set.method",
    "category": "图表",
    "objectName": "Excel.Chart Error Bars",
    "memberName": "set",
    "memberKind": "method",
    "signature": "set(properties)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "properties": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Error_Bars.toJSON.method",
    "category": "图表",
    "objectName": "Excel.Chart Error Bars",
    "memberName": "toJSON",
    "memberKind": "method",
    "signature": "toJSON()",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Error_Bars.context.property",
    "category": "图表",
    "objectName": "Excel.Chart Error Bars",
    "memberName": "context",
    "memberKind": "property",
    "signature": "context",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Error_Bars.endStyleCap.property",
    "category": "图表",
    "objectName": "Excel.Chart Error Bars",
    "memberName": "endStyleCap",
    "memberKind": "property",
    "signature": "endStyleCap",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Error_Bars.format.property",
    "category": "图表",
    "objectName": "Excel.Chart Error Bars",
    "memberName": "format",
    "memberKind": "property",
    "signature": "format",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Error_Bars.include.property",
    "category": "图表",
    "objectName": "Excel.Chart Error Bars",
    "memberName": "include",
    "memberKind": "property",
    "signature": "include",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Error_Bars.type.property",
    "category": "图表",
    "objectName": "Excel.Chart Error Bars",
    "memberName": "type",
    "memberKind": "property",
    "signature": "type",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Error_Bars.visible.property",
    "category": "图表",
    "objectName": "Excel.Chart Error Bars",
    "memberName": "visible",
    "memberKind": "property",
    "signature": "visible",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Trendline.delete.method",
    "category": "图表",
    "objectName": "Excel.Chart Trendline",
    "memberName": "delete",
    "memberKind": "method",
    "signature": "delete()",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Trendline.load.method",
    "category": "图表",
    "objectName": "Excel.Chart Trendline",
    "memberName": "load",
    "memberKind": "method",
    "signature": "load(options)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "options": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Trendline.load.method",
    "category": "图表",
    "objectName": "Excel.Chart Trendline",
    "memberName": "load",
    "memberKind": "method",
    "signature": "load(propertyNames)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "propertyNames": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Trendline.load.method",
    "category": "图表",
    "objectName": "Excel.Chart Trendline",
    "memberName": "load",
    "memberKind": "method",
    "signature": "load(propertyNamesAndPaths)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "propertyNamesAndPaths": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Trendline.set.method",
    "category": "图表",
    "objectName": "Excel.Chart Trendline",
    "memberName": "set",
    "memberKind": "method",
    "signature": "set(properties, options)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "properties": {
          "type": "unknown"
        },
        "options": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Trendline.set.method",
    "category": "图表",
    "objectName": "Excel.Chart Trendline",
    "memberName": "set",
    "memberKind": "method",
    "signature": "set(properties)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "properties": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Trendline.backwardPeriod.property",
    "category": "图表",
    "objectName": "Excel.Chart Trendline",
    "memberName": "backwardPeriod",
    "memberKind": "property",
    "signature": "backwardPeriod",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Trendline.context.property",
    "category": "图表",
    "objectName": "Excel.Chart Trendline",
    "memberName": "context",
    "memberKind": "property",
    "signature": "context",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Trendline.format.property",
    "category": "图表",
    "objectName": "Excel.Chart Trendline",
    "memberName": "format",
    "memberKind": "property",
    "signature": "format",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Trendline.forwardPeriod.property",
    "category": "图表",
    "objectName": "Excel.Chart Trendline",
    "memberName": "forwardPeriod",
    "memberKind": "property",
    "signature": "forwardPeriod",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Trendline.intercept.property",
    "category": "图表",
    "objectName": "Excel.Chart Trendline",
    "memberName": "intercept",
    "memberKind": "property",
    "signature": "intercept",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Trendline.label.property",
    "category": "图表",
    "objectName": "Excel.Chart Trendline",
    "memberName": "label",
    "memberKind": "property",
    "signature": "label",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Trendline_Label.load.method",
    "category": "图表",
    "objectName": "Excel.Chart Trendline Label",
    "memberName": "load",
    "memberKind": "method",
    "signature": "load(options)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "options": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Trendline_Label.load.method",
    "category": "图表",
    "objectName": "Excel.Chart Trendline Label",
    "memberName": "load",
    "memberKind": "method",
    "signature": "load(propertyNames)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "propertyNames": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Trendline_Label.load.method",
    "category": "图表",
    "objectName": "Excel.Chart Trendline Label",
    "memberName": "load",
    "memberKind": "method",
    "signature": "load(propertyNamesAndPaths)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "propertyNamesAndPaths": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Trendline_Label.set.method",
    "category": "图表",
    "objectName": "Excel.Chart Trendline Label",
    "memberName": "set",
    "memberKind": "method",
    "signature": "set(properties, options)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "properties": {
          "type": "unknown"
        },
        "options": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Trendline_Label.set.method",
    "category": "图表",
    "objectName": "Excel.Chart Trendline Label",
    "memberName": "set",
    "memberKind": "method",
    "signature": "set(properties)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "properties": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Trendline_Label.toJSON.method",
    "category": "图表",
    "objectName": "Excel.Chart Trendline Label",
    "memberName": "toJSON",
    "memberKind": "method",
    "signature": "toJSON()",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Trendline_Label.autoText.property",
    "category": "图表",
    "objectName": "Excel.Chart Trendline Label",
    "memberName": "autoText",
    "memberKind": "property",
    "signature": "autoText",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Trendline_Label.context.property",
    "category": "图表",
    "objectName": "Excel.Chart Trendline Label",
    "memberName": "context",
    "memberKind": "property",
    "signature": "context",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Trendline_Label.format.property",
    "category": "图表",
    "objectName": "Excel.Chart Trendline Label",
    "memberName": "format",
    "memberKind": "property",
    "signature": "format",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Trendline_Label.formula.property",
    "category": "图表",
    "objectName": "Excel.Chart Trendline Label",
    "memberName": "formula",
    "memberKind": "property",
    "signature": "formula",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Trendline_Label.height.property",
    "category": "图表",
    "objectName": "Excel.Chart Trendline Label",
    "memberName": "height",
    "memberKind": "property",
    "signature": "height",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Chart_Trendline_Label.horizontalAlignment.property",
    "category": "图表",
    "objectName": "Excel.Chart Trendline Label",
    "memberName": "horizontalAlignment",
    "memberKind": "property",
    "signature": "horizontalAlignment",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Shape.copyTo.method",
    "category": "形状",
    "objectName": "Excel.Shape",
    "memberName": "copyTo",
    "memberKind": "method",
    "signature": "copyTo(destinationSheet)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "destinationSheet": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Shape.delete.method",
    "category": "形状",
    "objectName": "Excel.Shape",
    "memberName": "delete",
    "memberKind": "method",
    "signature": "delete()",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Shape.getAsImage.method",
    "category": "形状",
    "objectName": "Excel.Shape",
    "memberName": "getAsImage",
    "memberKind": "method",
    "signature": "getAsImage(format)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "format": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Shape.incrementLeft.method",
    "category": "形状",
    "objectName": "Excel.Shape",
    "memberName": "incrementLeft",
    "memberKind": "method",
    "signature": "incrementLeft(increment)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "increment": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Shape.incrementRotation.method",
    "category": "形状",
    "objectName": "Excel.Shape",
    "memberName": "incrementRotation",
    "memberKind": "method",
    "signature": "incrementRotation(increment)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "increment": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Shape.incrementTop.method",
    "category": "形状",
    "objectName": "Excel.Shape",
    "memberName": "incrementTop",
    "memberKind": "method",
    "signature": "incrementTop(increment)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "increment": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Shape.altTextDescription.property",
    "category": "形状",
    "objectName": "Excel.Shape",
    "memberName": "altTextDescription",
    "memberKind": "property",
    "signature": "altTextDescription",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Shape.altTextTitle.property",
    "category": "形状",
    "objectName": "Excel.Shape",
    "memberName": "altTextTitle",
    "memberKind": "property",
    "signature": "altTextTitle",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Shape.connectionSiteCount.property",
    "category": "形状",
    "objectName": "Excel.Shape",
    "memberName": "connectionSiteCount",
    "memberKind": "property",
    "signature": "connectionSiteCount",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Shape.context.property",
    "category": "形状",
    "objectName": "Excel.Shape",
    "memberName": "context",
    "memberKind": "property",
    "signature": "context",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Shape.displayName.property",
    "category": "形状",
    "objectName": "Excel.Shape",
    "memberName": "displayName",
    "memberKind": "property",
    "signature": "displayName",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Shape.fill.property",
    "category": "形状",
    "objectName": "Excel.Shape",
    "memberName": "fill",
    "memberKind": "property",
    "signature": "fill",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Shape.onActivated.event",
    "category": "形状",
    "objectName": "Excel.Shape",
    "memberName": "onActivated",
    "memberKind": "event",
    "signature": "onActivated",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Shape.onDeactivated.event",
    "category": "形状",
    "objectName": "Excel.Shape",
    "memberName": "onDeactivated",
    "memberKind": "event",
    "signature": "onDeactivated",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Shape_Collection.addGeometricShape.method",
    "category": "形状",
    "objectName": "Excel.Shape Collection",
    "memberName": "addGeometricShape",
    "memberKind": "method",
    "signature": "addGeometricShape(type)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "type": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Shape_Collection.addGroup.method",
    "category": "形状",
    "objectName": "Excel.Shape Collection",
    "memberName": "addGroup",
    "memberKind": "method",
    "signature": "addGroup(values)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "values": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Shape_Collection.addImage.method",
    "category": "形状",
    "objectName": "Excel.Shape Collection",
    "memberName": "addImage",
    "memberKind": "method",
    "signature": "addImage(base64ImageString)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "base64ImageString": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Shape_Collection.addLine.method",
    "category": "形状",
    "objectName": "Excel.Shape Collection",
    "memberName": "addLine",
    "memberKind": "method",
    "signature": "addLine(startLeft, startTop, endLeft, endTop, connectorType)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "startLeft": {
          "type": "unknown"
        },
        "startTop": {
          "type": "unknown"
        },
        "endLeft": {
          "type": "unknown"
        },
        "endTop": {
          "type": "unknown"
        },
        "connectorType": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Shape_Collection.addLocalImageReference.method",
    "category": "形状",
    "objectName": "Excel.Shape Collection",
    "memberName": "addLocalImageReference",
    "memberKind": "method",
    "signature": "addLocalImageReference(address)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "address": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Shape_Collection.addSvg.method",
    "category": "形状",
    "objectName": "Excel.Shape Collection",
    "memberName": "addSvg",
    "memberKind": "method",
    "signature": "addSvg(xml)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "xml": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Shape_Collection.context.property",
    "category": "形状",
    "objectName": "Excel.Shape Collection",
    "memberName": "context",
    "memberKind": "property",
    "signature": "context",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Shape_Collection.items.property",
    "category": "形状",
    "objectName": "Excel.Shape Collection",
    "memberName": "items",
    "memberKind": "property",
    "signature": "items",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Shape_Font.load.method",
    "category": "形状",
    "objectName": "Excel.Shape Font",
    "memberName": "load",
    "memberKind": "method",
    "signature": "load(options)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "options": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Shape_Font.load.method",
    "category": "形状",
    "objectName": "Excel.Shape Font",
    "memberName": "load",
    "memberKind": "method",
    "signature": "load(propertyNames)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "propertyNames": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Shape_Font.load.method",
    "category": "形状",
    "objectName": "Excel.Shape Font",
    "memberName": "load",
    "memberKind": "method",
    "signature": "load(propertyNamesAndPaths)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "propertyNamesAndPaths": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Shape_Font.set.method",
    "category": "形状",
    "objectName": "Excel.Shape Font",
    "memberName": "set",
    "memberKind": "method",
    "signature": "set(properties, options)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "properties": {
          "type": "unknown"
        },
        "options": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Shape_Font.set.method",
    "category": "形状",
    "objectName": "Excel.Shape Font",
    "memberName": "set",
    "memberKind": "method",
    "signature": "set(properties)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "properties": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Shape_Font.toJSON.method",
    "category": "形状",
    "objectName": "Excel.Shape Font",
    "memberName": "toJSON",
    "memberKind": "method",
    "signature": "toJSON()",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Shape_Font.bold.property",
    "category": "形状",
    "objectName": "Excel.Shape Font",
    "memberName": "bold",
    "memberKind": "property",
    "signature": "bold",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Shape_Font.color.property",
    "category": "形状",
    "objectName": "Excel.Shape Font",
    "memberName": "color",
    "memberKind": "property",
    "signature": "color",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Shape_Font.context.property",
    "category": "形状",
    "objectName": "Excel.Shape Font",
    "memberName": "context",
    "memberKind": "property",
    "signature": "context",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Shape_Font.italic.property",
    "category": "形状",
    "objectName": "Excel.Shape Font",
    "memberName": "italic",
    "memberKind": "property",
    "signature": "italic",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Shape_Font.size.property",
    "category": "形状",
    "objectName": "Excel.Shape Font",
    "memberName": "size",
    "memberKind": "property",
    "signature": "size",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Shape_Font.strikethrough.property",
    "category": "形状",
    "objectName": "Excel.Shape Font",
    "memberName": "strikethrough",
    "memberKind": "property",
    "signature": "strikethrough",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Shape_Fill.clear.method",
    "category": "形状",
    "objectName": "Excel.Shape Fill",
    "memberName": "clear",
    "memberKind": "method",
    "signature": "clear()",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Shape_Fill.load.method",
    "category": "形状",
    "objectName": "Excel.Shape Fill",
    "memberName": "load",
    "memberKind": "method",
    "signature": "load(options)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "options": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Shape_Fill.load.method",
    "category": "形状",
    "objectName": "Excel.Shape Fill",
    "memberName": "load",
    "memberKind": "method",
    "signature": "load(propertyNames)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "propertyNames": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Shape_Fill.load.method",
    "category": "形状",
    "objectName": "Excel.Shape Fill",
    "memberName": "load",
    "memberKind": "method",
    "signature": "load(propertyNamesAndPaths)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "propertyNamesAndPaths": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Shape_Fill.set.method",
    "category": "形状",
    "objectName": "Excel.Shape Fill",
    "memberName": "set",
    "memberKind": "method",
    "signature": "set(properties, options)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "properties": {
          "type": "unknown"
        },
        "options": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Shape_Fill.set.method",
    "category": "形状",
    "objectName": "Excel.Shape Fill",
    "memberName": "set",
    "memberKind": "method",
    "signature": "set(properties)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "properties": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Shape_Fill.context.property",
    "category": "形状",
    "objectName": "Excel.Shape Fill",
    "memberName": "context",
    "memberKind": "property",
    "signature": "context",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Shape_Fill.foregroundColor.property",
    "category": "形状",
    "objectName": "Excel.Shape Fill",
    "memberName": "foregroundColor",
    "memberKind": "property",
    "signature": "foregroundColor",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Shape_Fill.transparency.property",
    "category": "形状",
    "objectName": "Excel.Shape Fill",
    "memberName": "transparency",
    "memberKind": "property",
    "signature": "transparency",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Shape_Fill.type.property",
    "category": "形状",
    "objectName": "Excel.Shape Fill",
    "memberName": "type",
    "memberKind": "property",
    "signature": "type",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Shape_Line_Format.load.method",
    "category": "形状",
    "objectName": "Excel.Shape Line Format",
    "memberName": "load",
    "memberKind": "method",
    "signature": "load(options)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "options": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Shape_Line_Format.load.method",
    "category": "形状",
    "objectName": "Excel.Shape Line Format",
    "memberName": "load",
    "memberKind": "method",
    "signature": "load(propertyNames)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "propertyNames": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Shape_Line_Format.load.method",
    "category": "形状",
    "objectName": "Excel.Shape Line Format",
    "memberName": "load",
    "memberKind": "method",
    "signature": "load(propertyNamesAndPaths)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "propertyNamesAndPaths": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Shape_Line_Format.set.method",
    "category": "形状",
    "objectName": "Excel.Shape Line Format",
    "memberName": "set",
    "memberKind": "method",
    "signature": "set(properties, options)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "properties": {
          "type": "unknown"
        },
        "options": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Shape_Line_Format.set.method",
    "category": "形状",
    "objectName": "Excel.Shape Line Format",
    "memberName": "set",
    "memberKind": "method",
    "signature": "set(properties)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "properties": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Shape_Line_Format.toJSON.method",
    "category": "形状",
    "objectName": "Excel.Shape Line Format",
    "memberName": "toJSON",
    "memberKind": "method",
    "signature": "toJSON()",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Shape_Line_Format.color.property",
    "category": "形状",
    "objectName": "Excel.Shape Line Format",
    "memberName": "color",
    "memberKind": "property",
    "signature": "color",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Shape_Line_Format.context.property",
    "category": "形状",
    "objectName": "Excel.Shape Line Format",
    "memberName": "context",
    "memberKind": "property",
    "signature": "context",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Shape_Line_Format.dashStyle.property",
    "category": "形状",
    "objectName": "Excel.Shape Line Format",
    "memberName": "dashStyle",
    "memberKind": "property",
    "signature": "dashStyle",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Shape_Line_Format.style.property",
    "category": "形状",
    "objectName": "Excel.Shape Line Format",
    "memberName": "style",
    "memberKind": "property",
    "signature": "style",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Shape_Line_Format.transparency.property",
    "category": "形状",
    "objectName": "Excel.Shape Line Format",
    "memberName": "transparency",
    "memberKind": "property",
    "signature": "transparency",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Shape_Line_Format.visible.property",
    "category": "形状",
    "objectName": "Excel.Shape Line Format",
    "memberName": "visible",
    "memberKind": "property",
    "signature": "visible",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Comment.assignTask.method",
    "category": "批注",
    "objectName": "Excel.Comment",
    "memberName": "assignTask",
    "memberKind": "method",
    "signature": "assignTask(assignee)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "assignee": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "partial",
    "onlyOfficeMapping": "partial object coverage through the Office Agent bridge",
    "notes": "Registered from the Office.js reference table; bridge support is best-effort for this member."
  },
  {
    "id": "Excel.Comment.delete.method",
    "category": "批注",
    "objectName": "Excel.Comment",
    "memberName": "delete",
    "memberKind": "method",
    "signature": "delete()",
    "supportLevel": "partial",
    "onlyOfficeMapping": "partial object coverage through the Office Agent bridge",
    "notes": "Registered from the Office.js reference table; bridge support is best-effort for this member."
  },
  {
    "id": "Excel.Comment.getLocation.method",
    "category": "批注",
    "objectName": "Excel.Comment",
    "memberName": "getLocation",
    "memberKind": "method",
    "signature": "getLocation()",
    "supportLevel": "partial",
    "onlyOfficeMapping": "partial object coverage through the Office Agent bridge",
    "notes": "Registered from the Office.js reference table; bridge support is best-effort for this member."
  },
  {
    "id": "Excel.Comment.getTask.method",
    "category": "批注",
    "objectName": "Excel.Comment",
    "memberName": "getTask",
    "memberKind": "method",
    "signature": "getTask()",
    "supportLevel": "partial",
    "onlyOfficeMapping": "partial object coverage through the Office Agent bridge",
    "notes": "Registered from the Office.js reference table; bridge support is best-effort for this member."
  },
  {
    "id": "Excel.Comment.getTaskOrNullObject.method",
    "category": "批注",
    "objectName": "Excel.Comment",
    "memberName": "getTaskOrNullObject",
    "memberKind": "method",
    "signature": "getTaskOrNullObject()",
    "supportLevel": "partial",
    "onlyOfficeMapping": "partial object coverage through the Office Agent bridge",
    "notes": "Registered from the Office.js reference table; bridge support is best-effort for this member."
  },
  {
    "id": "Excel.Comment.load.method",
    "category": "批注",
    "objectName": "Excel.Comment",
    "memberName": "load",
    "memberKind": "method",
    "signature": "load(options)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "options": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "partial",
    "onlyOfficeMapping": "partial object coverage through the Office Agent bridge",
    "notes": "Registered from the Office.js reference table; bridge support is best-effort for this member."
  },
  {
    "id": "Excel.Comment.authorEmail.property",
    "category": "批注",
    "objectName": "Excel.Comment",
    "memberName": "authorEmail",
    "memberKind": "property",
    "signature": "authorEmail",
    "supportLevel": "partial",
    "onlyOfficeMapping": "partial object coverage through the Office Agent bridge",
    "notes": "Registered from the Office.js reference table; bridge support is best-effort for this member."
  },
  {
    "id": "Excel.Comment.authorName.property",
    "category": "批注",
    "objectName": "Excel.Comment",
    "memberName": "authorName",
    "memberKind": "property",
    "signature": "authorName",
    "supportLevel": "partial",
    "onlyOfficeMapping": "partial object coverage through the Office Agent bridge",
    "notes": "Registered from the Office.js reference table; bridge support is best-effort for this member."
  },
  {
    "id": "Excel.Comment.content.property",
    "category": "批注",
    "objectName": "Excel.Comment",
    "memberName": "content",
    "memberKind": "property",
    "signature": "content",
    "supportLevel": "partial",
    "onlyOfficeMapping": "partial object coverage through the Office Agent bridge",
    "notes": "Registered from the Office.js reference table; bridge support is best-effort for this member."
  },
  {
    "id": "Excel.Comment.contentType.property",
    "category": "批注",
    "objectName": "Excel.Comment",
    "memberName": "contentType",
    "memberKind": "property",
    "signature": "contentType",
    "supportLevel": "partial",
    "onlyOfficeMapping": "partial object coverage through the Office Agent bridge",
    "notes": "Registered from the Office.js reference table; bridge support is best-effort for this member."
  },
  {
    "id": "Excel.Comment.context.property",
    "category": "批注",
    "objectName": "Excel.Comment",
    "memberName": "context",
    "memberKind": "property",
    "signature": "context",
    "supportLevel": "partial",
    "onlyOfficeMapping": "partial object coverage through the Office Agent bridge",
    "notes": "Registered from the Office.js reference table; bridge support is best-effort for this member."
  },
  {
    "id": "Excel.Comment.creationDate.property",
    "category": "批注",
    "objectName": "Excel.Comment",
    "memberName": "creationDate",
    "memberKind": "property",
    "signature": "creationDate",
    "supportLevel": "partial",
    "onlyOfficeMapping": "partial object coverage through the Office Agent bridge",
    "notes": "Registered from the Office.js reference table; bridge support is best-effort for this member."
  },
  {
    "id": "Excel.Comment_Collection.add.method",
    "category": "批注",
    "objectName": "Excel.Comment Collection",
    "memberName": "add",
    "memberKind": "method",
    "signature": "add(cellAddress, content, contentType)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "cellAddress": {
          "type": "unknown"
        },
        "content": {
          "type": "unknown"
        },
        "contentType": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "partial",
    "onlyOfficeMapping": "partial object coverage through the Office Agent bridge",
    "notes": "Registered from the Office.js reference table; bridge support is best-effort for this member."
  },
  {
    "id": "Excel.Comment_Collection.getCount.method",
    "category": "批注",
    "objectName": "Excel.Comment Collection",
    "memberName": "getCount",
    "memberKind": "method",
    "signature": "getCount()",
    "supportLevel": "partial",
    "onlyOfficeMapping": "partial object coverage through the Office Agent bridge",
    "notes": "Registered from the Office.js reference table; bridge support is best-effort for this member."
  },
  {
    "id": "Excel.Comment_Collection.getItem.method",
    "category": "批注",
    "objectName": "Excel.Comment Collection",
    "memberName": "getItem",
    "memberKind": "method",
    "signature": "getItem(commentId)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "commentId": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "partial",
    "onlyOfficeMapping": "partial object coverage through the Office Agent bridge",
    "notes": "Registered from the Office.js reference table; bridge support is best-effort for this member."
  },
  {
    "id": "Excel.Comment_Collection.getItemAt.method",
    "category": "批注",
    "objectName": "Excel.Comment Collection",
    "memberName": "getItemAt",
    "memberKind": "method",
    "signature": "getItemAt(index)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "index": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "partial",
    "onlyOfficeMapping": "partial object coverage through the Office Agent bridge",
    "notes": "Registered from the Office.js reference table; bridge support is best-effort for this member."
  },
  {
    "id": "Excel.Comment_Collection.getItemByCell.method",
    "category": "批注",
    "objectName": "Excel.Comment Collection",
    "memberName": "getItemByCell",
    "memberKind": "method",
    "signature": "getItemByCell(cellAddress)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "cellAddress": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "partial",
    "onlyOfficeMapping": "partial object coverage through the Office Agent bridge",
    "notes": "Registered from the Office.js reference table; bridge support is best-effort for this member."
  },
  {
    "id": "Excel.Comment_Collection.getItemByReplyId.method",
    "category": "批注",
    "objectName": "Excel.Comment Collection",
    "memberName": "getItemByReplyId",
    "memberKind": "method",
    "signature": "getItemByReplyId(replyId)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "replyId": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "partial",
    "onlyOfficeMapping": "partial object coverage through the Office Agent bridge",
    "notes": "Registered from the Office.js reference table; bridge support is best-effort for this member."
  },
  {
    "id": "Excel.Comment_Collection.context.property",
    "category": "批注",
    "objectName": "Excel.Comment Collection",
    "memberName": "context",
    "memberKind": "property",
    "signature": "context",
    "supportLevel": "partial",
    "onlyOfficeMapping": "partial object coverage through the Office Agent bridge",
    "notes": "Registered from the Office.js reference table; bridge support is best-effort for this member."
  },
  {
    "id": "Excel.Comment_Collection.items.property",
    "category": "批注",
    "objectName": "Excel.Comment Collection",
    "memberName": "items",
    "memberKind": "property",
    "signature": "items",
    "supportLevel": "partial",
    "onlyOfficeMapping": "partial object coverage through the Office Agent bridge",
    "notes": "Registered from the Office.js reference table; bridge support is best-effort for this member."
  },
  {
    "id": "Excel.Comment_Collection.onAdded.event",
    "category": "批注",
    "objectName": "Excel.Comment Collection",
    "memberName": "onAdded",
    "memberKind": "event",
    "signature": "onAdded",
    "supportLevel": "partial",
    "onlyOfficeMapping": "partial object coverage through the Office Agent bridge",
    "notes": "Registered from the Office.js reference table; bridge support is best-effort for this member."
  },
  {
    "id": "Excel.Comment_Collection.onChanged.event",
    "category": "批注",
    "objectName": "Excel.Comment Collection",
    "memberName": "onChanged",
    "memberKind": "event",
    "signature": "onChanged",
    "supportLevel": "partial",
    "onlyOfficeMapping": "partial object coverage through the Office Agent bridge",
    "notes": "Registered from the Office.js reference table; bridge support is best-effort for this member."
  },
  {
    "id": "Excel.Comment_Collection.onDeleted.event",
    "category": "批注",
    "objectName": "Excel.Comment Collection",
    "memberName": "onDeleted",
    "memberKind": "event",
    "signature": "onDeleted",
    "supportLevel": "partial",
    "onlyOfficeMapping": "partial object coverage through the Office Agent bridge",
    "notes": "Registered from the Office.js reference table; bridge support is best-effort for this member."
  },
  {
    "id": "Excel.Comment_Reply.assignTask.method",
    "category": "批注",
    "objectName": "Excel.Comment Reply",
    "memberName": "assignTask",
    "memberKind": "method",
    "signature": "assignTask(assignee)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "assignee": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Comment_Reply.delete.method",
    "category": "批注",
    "objectName": "Excel.Comment Reply",
    "memberName": "delete",
    "memberKind": "method",
    "signature": "delete()",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Comment_Reply.getLocation.method",
    "category": "批注",
    "objectName": "Excel.Comment Reply",
    "memberName": "getLocation",
    "memberKind": "method",
    "signature": "getLocation()",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Comment_Reply.getParentComment.method",
    "category": "批注",
    "objectName": "Excel.Comment Reply",
    "memberName": "getParentComment",
    "memberKind": "method",
    "signature": "getParentComment()",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Comment_Reply.getTask.method",
    "category": "批注",
    "objectName": "Excel.Comment Reply",
    "memberName": "getTask",
    "memberKind": "method",
    "signature": "getTask()",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Comment_Reply.getTaskOrNullObject.method",
    "category": "批注",
    "objectName": "Excel.Comment Reply",
    "memberName": "getTaskOrNullObject",
    "memberKind": "method",
    "signature": "getTaskOrNullObject()",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Comment_Reply.authorEmail.property",
    "category": "批注",
    "objectName": "Excel.Comment Reply",
    "memberName": "authorEmail",
    "memberKind": "property",
    "signature": "authorEmail",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Comment_Reply.authorName.property",
    "category": "批注",
    "objectName": "Excel.Comment Reply",
    "memberName": "authorName",
    "memberKind": "property",
    "signature": "authorName",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Comment_Reply.content.property",
    "category": "批注",
    "objectName": "Excel.Comment Reply",
    "memberName": "content",
    "memberKind": "property",
    "signature": "content",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Comment_Reply.contentType.property",
    "category": "批注",
    "objectName": "Excel.Comment Reply",
    "memberName": "contentType",
    "memberKind": "property",
    "signature": "contentType",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Comment_Reply.context.property",
    "category": "批注",
    "objectName": "Excel.Comment Reply",
    "memberName": "context",
    "memberKind": "property",
    "signature": "context",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Comment_Reply.creationDate.property",
    "category": "批注",
    "objectName": "Excel.Comment Reply",
    "memberName": "creationDate",
    "memberKind": "property",
    "signature": "creationDate",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Comment_Reply_Collection.add.method",
    "category": "批注",
    "objectName": "Excel.Comment Reply Collection",
    "memberName": "add",
    "memberKind": "method",
    "signature": "add(content, contentType)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "content": {
          "type": "unknown"
        },
        "contentType": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Comment_Reply_Collection.getCount.method",
    "category": "批注",
    "objectName": "Excel.Comment Reply Collection",
    "memberName": "getCount",
    "memberKind": "method",
    "signature": "getCount()",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Comment_Reply_Collection.getItem.method",
    "category": "批注",
    "objectName": "Excel.Comment Reply Collection",
    "memberName": "getItem",
    "memberKind": "method",
    "signature": "getItem(commentReplyId)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "commentReplyId": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Comment_Reply_Collection.getItemAt.method",
    "category": "批注",
    "objectName": "Excel.Comment Reply Collection",
    "memberName": "getItemAt",
    "memberKind": "method",
    "signature": "getItemAt(index)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "index": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Comment_Reply_Collection.getItemOrNullObject.method",
    "category": "批注",
    "objectName": "Excel.Comment Reply Collection",
    "memberName": "getItemOrNullObject",
    "memberKind": "method",
    "signature": "getItemOrNullObject(commentReplyId)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "commentReplyId": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Comment_Reply_Collection.load.method",
    "category": "批注",
    "objectName": "Excel.Comment Reply Collection",
    "memberName": "load",
    "memberKind": "method",
    "signature": "load(options)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "options": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Comment_Reply_Collection.context.property",
    "category": "批注",
    "objectName": "Excel.Comment Reply Collection",
    "memberName": "context",
    "memberKind": "property",
    "signature": "context",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Comment_Reply_Collection.items.property",
    "category": "批注",
    "objectName": "Excel.Comment Reply Collection",
    "memberName": "items",
    "memberKind": "property",
    "signature": "items",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Binding.delete.method",
    "category": "绑定",
    "objectName": "Excel.Binding",
    "memberName": "delete",
    "memberKind": "method",
    "signature": "delete()",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Binding.getRange.method",
    "category": "绑定",
    "objectName": "Excel.Binding",
    "memberName": "getRange",
    "memberKind": "method",
    "signature": "getRange()",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Binding.getTable.method",
    "category": "绑定",
    "objectName": "Excel.Binding",
    "memberName": "getTable",
    "memberKind": "method",
    "signature": "getTable()",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Binding.getText.method",
    "category": "绑定",
    "objectName": "Excel.Binding",
    "memberName": "getText",
    "memberKind": "method",
    "signature": "getText()",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Binding.load.method",
    "category": "绑定",
    "objectName": "Excel.Binding",
    "memberName": "load",
    "memberKind": "method",
    "signature": "load(options)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "options": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Binding.load.method",
    "category": "绑定",
    "objectName": "Excel.Binding",
    "memberName": "load",
    "memberKind": "method",
    "signature": "load(propertyNames)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "propertyNames": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Binding.context.property",
    "category": "绑定",
    "objectName": "Excel.Binding",
    "memberName": "context",
    "memberKind": "property",
    "signature": "context",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Binding.id.property",
    "category": "绑定",
    "objectName": "Excel.Binding",
    "memberName": "id",
    "memberKind": "property",
    "signature": "id",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Binding.type.property",
    "category": "绑定",
    "objectName": "Excel.Binding",
    "memberName": "type",
    "memberKind": "property",
    "signature": "type",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Binding.onDataChanged.event",
    "category": "绑定",
    "objectName": "Excel.Binding",
    "memberName": "onDataChanged",
    "memberKind": "event",
    "signature": "onDataChanged",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Binding.onSelectionChanged.event",
    "category": "绑定",
    "objectName": "Excel.Binding",
    "memberName": "onSelectionChanged",
    "memberKind": "event",
    "signature": "onSelectionChanged",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Binding_Collection.add.method",
    "category": "绑定",
    "objectName": "Excel.Binding Collection",
    "memberName": "add",
    "memberKind": "method",
    "signature": "add(range, bindingType, id)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "range": {
          "type": "unknown"
        },
        "bindingType": {
          "type": "unknown"
        },
        "id": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Binding_Collection.addFromNamedItem.method",
    "category": "绑定",
    "objectName": "Excel.Binding Collection",
    "memberName": "addFromNamedItem",
    "memberKind": "method",
    "signature": "addFromNamedItem(name, bindingType, id)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "name": {
          "type": "unknown"
        },
        "bindingType": {
          "type": "unknown"
        },
        "id": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Binding_Collection.addFromSelection.method",
    "category": "绑定",
    "objectName": "Excel.Binding Collection",
    "memberName": "addFromSelection",
    "memberKind": "method",
    "signature": "addFromSelection(bindingType, id)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "bindingType": {
          "type": "unknown"
        },
        "id": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Binding_Collection.getCount.method",
    "category": "绑定",
    "objectName": "Excel.Binding Collection",
    "memberName": "getCount",
    "memberKind": "method",
    "signature": "getCount()",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Binding_Collection.getItem.method",
    "category": "绑定",
    "objectName": "Excel.Binding Collection",
    "memberName": "getItem",
    "memberKind": "method",
    "signature": "getItem(id)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "id": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Binding_Collection.getItemAt.method",
    "category": "绑定",
    "objectName": "Excel.Binding Collection",
    "memberName": "getItemAt",
    "memberKind": "method",
    "signature": "getItemAt(index)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "index": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Binding_Collection.context.property",
    "category": "绑定",
    "objectName": "Excel.Binding Collection",
    "memberName": "context",
    "memberKind": "property",
    "signature": "context",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Binding_Collection.count.property",
    "category": "绑定",
    "objectName": "Excel.Binding Collection",
    "memberName": "count",
    "memberKind": "property",
    "signature": "count",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Binding_Collection.items.property",
    "category": "绑定",
    "objectName": "Excel.Binding Collection",
    "memberName": "items",
    "memberKind": "property",
    "signature": "items",
    "supportLevel": "unsupported",
    "onlyOfficeMapping": "unsupported",
    "notes": "Registered from the Office.js reference table, but no reliable browser ONLYOFFICE mapping is available in phase 1."
  },
  {
    "id": "Excel.Range.values.property",
    "category": "区域",
    "objectName": "Excel.Range",
    "memberName": "values",
    "memberKind": "property",
    "signature": "values",
    "supportLevel": "supported",
    "onlyOfficeMapping": "ApiRange.GetValue()/SetValue()"
  },
  {
    "id": "Excel.Range.formulas.property",
    "category": "区域",
    "objectName": "Excel.Range",
    "memberName": "formulas",
    "memberKind": "property",
    "signature": "formulas",
    "supportLevel": "supported",
    "onlyOfficeMapping": "ApiRange.GetFormula()/SetFormula()"
  },
  {
    "id": "Excel.Range.numberFormat.property",
    "category": "区域",
    "objectName": "Excel.Range",
    "memberName": "numberFormat",
    "memberKind": "property",
    "signature": "numberFormat",
    "supportLevel": "supported",
    "onlyOfficeMapping": "ApiRange.GetNumberFormat()/SetNumberFormat()"
  },
  {
    "id": "Excel.Range_Format.horizontalAlignment.property",
    "category": "格式",
    "objectName": "Excel.Range Format",
    "memberName": "horizontalAlignment",
    "memberKind": "property",
    "signature": "horizontalAlignment",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "value": {
          "type": "string",
          "enum": ["left", "center", "right", "justify", "distributed"]
        }
      }
    },
    "supportLevel": "supported",
    "onlyOfficeMapping": "ApiRange.SetAlignHorizontal()/internal asc_setCellAlign()"
  },
  {
    "id": "Excel.Range_Format.verticalAlignment.property",
    "category": "格式",
    "objectName": "Excel.Range Format",
    "memberName": "verticalAlignment",
    "memberKind": "property",
    "signature": "verticalAlignment",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "value": {
          "type": "string",
          "enum": ["top", "center", "bottom", "justify", "distributed"]
        }
      }
    },
    "supportLevel": "supported",
    "onlyOfficeMapping": "ApiRange.SetAlignVertical()/internal asc_setCellVertAlign()"
  },
  {
    "id": "Excel.Range.format.property",
    "category": "格式",
    "objectName": "Excel.Range",
    "memberName": "format",
    "memberKind": "property",
    "signature": "format",
    "supportLevel": "partial",
    "onlyOfficeMapping": "ApiRange formatting setters"
  },
  {
    "id": "Excel.Range.columnWidth.property",
    "category": "格式",
    "objectName": "Excel.Range",
    "memberName": "columnWidth",
    "memberKind": "property",
    "signature": "columnWidth",
    "supportLevel": "partial",
    "onlyOfficeMapping": "ApiRange.SetColumnWidth()/internal asc_setColumnWidth()"
  },
  {
    "id": "Excel.Range.rowHeight.property",
    "category": "格式",
    "objectName": "Excel.Range",
    "memberName": "rowHeight",
    "memberKind": "property",
    "signature": "rowHeight",
    "supportLevel": "partial",
    "onlyOfficeMapping": "ApiRange.SetRowHeight()/internal asc_setRowHeight()"
  },
  {
    "id": "Excel.Worksheet.getUsedRange.method",
    "category": "工作表",
    "objectName": "Excel.Worksheet",
    "memberName": "getUsedRange",
    "memberKind": "method",
    "signature": "getUsedRange(valuesOnly)",
    "argumentSchema": {
      "type": "object",
      "properties": {
        "valuesOnly": {
          "type": "unknown"
        }
      }
    },
    "supportLevel": "partial",
    "onlyOfficeMapping": "ApiWorksheet.GetUsedRange() when present"
  }
];
