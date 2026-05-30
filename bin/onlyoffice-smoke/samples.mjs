import { createServer } from 'node:http';
import { extname } from 'node:path';

function createGeneratedSamples() {
  return new Map([
    ['.docx', createDocxSample()],
    ['.xlsx', createXlsxSample()],
    ['.pptx', createPptxSample()],
    ['.csv', Buffer.from('Name,Value\nOnlyOffice 9.3,中文输入\n', 'utf8')],
    ['.protected.docx', createPasswordProtectedDocx()],
    ['.large.docx', createLargeDocxSample()],
    // ODF formats (Phase 1 — ZIP-based, structurally similar to OOXML)
    ['.odt', createOdtSample()],
    ['.ods', createOdsSample()],
    ['.odp', createOdpSample()],
    // Text formats
    ['.rtf', createRtfSample()],
    ['.txt', createTxtSample()],
    ['.html', createHtmlSample()],
    // Binary format (OLE2 — Word 97-2003)
    ['.doc', createDocSample()],
    // XLS/PPT deferred: BIFF record structures need refinement
  ]);
}

export function startSampleServer(scenarios) {
  const generatedSamples = createGeneratedSamples();
  const files = new Map();
  for (const scenario of scenarios) {
    if (scenario.kind !== 'generated') continue;
    const sample = generatedSamples.get(scenario.ext);
    if (sample) {
      files.set(`/${encodeURIComponent(scenario.name)}${scenario.ext}`, {
        data: sample,
        fileName: scenario.fileName,
        ext: scenario.ext,
      });
    }
  }

  const server = createServer((req, res) => {
    const pathname = new URL(req.url || '/', 'http://127.0.0.1').pathname;
    const sample = files.get(pathname);
    if (!sample) {
      res.writeHead(404);
      res.end('not found');
      return;
    }

    res.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Content-Length': String(sample.data.length),
      'Content-Type': contentType(sample.ext),
      'Content-Disposition': `inline; filename="${sample.fileName}"; filename*=UTF-8''${encodeURIComponent(sample.fileName)}`,
    });
    res.end(sample.data);
  });

  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      if (!address || typeof address === 'string') {
        reject(new Error('Sample server did not expose a TCP port'));
        return;
      }
      resolve({ server, files, baseUrl: `http://127.0.0.1:${address.port}` });
    });
  });
}

const SMOKE_PASSWORD = 'onlyoffice-9.3-test';

function createPasswordProtectedDocx() {
  try {
    const { encrypt } = require('officecrypto-tool');
    const plain = createDocxSample();
    return encrypt(plain, { password: SMOKE_PASSWORD });
  } catch {
    // officecrypto-tool not available — return plain doc as fallback
    return createDocxSample();
  }
}

function contentType(filePath) {
  const ext = filePath.startsWith('.') ? filePath.toLowerCase() : extname(filePath).toLowerCase();
  if (ext === '.docx') return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  if (ext === '.xlsx') return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
  if (ext === '.pptx') return 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
  if (ext === '.csv') return 'text/csv; charset=utf-8';
  if (ext === '.odt') return 'application/vnd.oasis.opendocument.text';
  if (ext === '.ods') return 'application/vnd.oasis.opendocument.spreadsheet';
  if (ext === '.odp') return 'application/vnd.oasis.opendocument.presentation';
  if (ext === '.rtf') return 'application/rtf';
  if (ext === '.txt') return 'text/plain; charset=utf-8';
  if (ext === '.html') return 'text/html; charset=utf-8';
  if (ext === '.doc') return 'application/msword';
  if (ext === '.xls') return 'application/vnd.ms-excel';
  if (ext === '.ppt') return 'application/vnd.ms-powerpoint';
  return 'application/octet-stream';
}

function createDocxSample() {
  return createZip([
    {
      name: '[Content_Types].xml',
      data: xml(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
</Types>`),
    },
    {
      name: '_rels/.rels',
      data: xml(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`),
    },
    {
      name: 'word/document.xml',
      data: xml(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p>
      <w:r><w:t>ONLYOFFICE 9.3 smoke DOCX 中文段落</w:t></w:r>
    </w:p>
    <w:sectPr>
      <w:pgSz w:w="12240" w:h="15840"/>
      <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="720" w:footer="720" w:gutter="0"/>
    </w:sectPr>
  </w:body>
</w:document>`),
    },
    {
      name: 'word/styles.xml',
      data: xml(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:style w:type="paragraph" w:default="1" w:styleId="Normal">
    <w:name w:val="Normal"/>
    <w:rPr><w:rFonts w:ascii="Arial" w:eastAsia="Microsoft YaHei" w:hAnsi="Arial"/></w:rPr>
  </w:style>
</w:styles>`),
    },
  ]);
}

function createXlsxSample() {
  return createZip([
    {
      name: '[Content_Types].xml',
      data: xml(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
</Types>`),
    },
    {
      name: '_rels/.rels',
      data: xml(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`),
    },
    {
      name: 'xl/_rels/workbook.xml.rels',
      data: xml(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
</Relationships>`),
    },
    {
      name: 'xl/workbook.xml',
      data: xml(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets><sheet name="Smoke" sheetId="1" r:id="rId1"/></sheets>
</workbook>`),
    },
    {
      name: 'xl/worksheets/sheet1.xml',
      data: xml(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetData>
    <row r="1">
      <c r="A1" t="inlineStr"><is><t>ONLYOFFICE 9.3</t></is></c>
      <c r="B1" t="inlineStr"><is><t>中文单元格</t></is></c>
    </row>
  </sheetData>
</worksheet>`),
    },
  ]);
}

function xml(content) {
  return Buffer.from(content.replace(/\n\s*/g, ''), 'utf8');
}

const LARGE_FILE_PARAGRAPH_COUNT = 1000;

function createLargeDocxSample() {
  let bodyXml = '';
  for (let i = 0; i < LARGE_FILE_PARAGRAPH_COUNT; i++) {
    bodyXml += `<w:p><w:r><w:t>Paragraph ${i}: Hello ONLYOFFICE 9.3 large file smoke test. 中文大文件烟雾测试。</w:t></w:r></w:p>`;
  }
  return createZip([
    {
      name: '[Content_Types].xml',
      data: xml(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`),
    },
    {
      name: '_rels/.rels',
      data: xml(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`),
    },
    {
      name: 'word/document.xml',
      data: xml(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>${bodyXml}
    <w:sectPr><w:pgSz w:w="12240" w:h="15840"/><w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="720" w:footer="720" w:gutter="0"/></w:sectPr>
  </w:body>
</w:document>`),
    },
  ]);
}

function createPptxSample() {
  return createZip([
    {
      name: '[Content_Types].xml',
      data: xml(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>
  <Override PartName="/ppt/slides/slide1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>
  <Override PartName="/ppt/slideMasters/slideMaster1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideMaster+xml"/>
  <Override PartName="/ppt/slideLayouts/slideLayout1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideLayout+xml"/>
  <Override PartName="/ppt/theme/theme1.xml" ContentType="application/vnd.openxmlformats-officedocument.theme+xml"/>
</Types>`),
    },
    {
      name: '_rels/.rels',
      data: xml(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/>
</Relationships>`),
    },
    {
      name: 'ppt/presentation.xml',
      data: xml(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:presentation xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"
                xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <p:sldMasterIdLst><p:sldMasterId id="2147483648" r:id="rId1"/></p:sldMasterIdLst>
  <p:sldIdLst><p:sldId id="256" r:id="rId2"/></p:sldIdLst>
  <p:sldSz cx="12192000" cy="6858000"/>
</p:presentation>`),
    },
    {
      name: 'ppt/_rels/presentation.xml.rels',
      data: xml(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="slideMasters/slideMaster1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide1.xml"/>
</Relationships>`),
    },
    {
      name: 'ppt/slides/slide1.xml',
      data: xml(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"
       xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
       xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <p:cSld>
    <p:spTree>
      <p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>
      <p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr>
      <p:sp>
        <p:nvSpPr><p:cNvPr id="2" name="Title"/><p:cNvSpPr><a:spLocks noGrp="1"/></p:cNvSpPr><p:nvPr><p:ph type="ctrTitle"/></p:nvPr></p:nvSpPr>
        <p:spPr><a:xfrm><a:off x="1524000" y="1066800"/><a:ext cx="9144000" cy="1143000"/></a:xfrm></p:spPr>
        <p:txBody><a:bodyPr/><a:lstStyle/><a:p><a:r><a:rPr lang="en-US" sz="4400"/><a:t>ONLYOFFICE 9.3 PPTX</a:t></a:r></a:p></p:txBody>
      </p:sp>
      <p:sp>
        <p:nvSpPr><p:cNvPr id="3" name="Subtitle"/><p:cNvSpPr><a:spLocks noGrp="1"/></p:cNvSpPr><p:nvPr><p:ph type="subTitle" idx="1"/></p:nvPr></p:nvSpPr>
        <p:spPr><a:xfrm><a:off x="1524000" y="2362200"/><a:ext cx="9144000" cy="1143000"/></a:xfrm></p:spPr>
        <p:txBody><a:bodyPr/><a:lstStyle/><a:p><a:r><a:rPr lang="en-US" sz="2800"/><a:t>Smoke Test Slide</a:t></a:r></a:p></p:txBody>
      </p:sp>
    </p:spTree>
  </p:cSld>
</p:sld>`),
    },
    {
      name: 'ppt/slideMasters/slideMaster1.xml',
      data: xml(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sldMaster xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"
             xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
             xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <p:cSld><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr/><p:sp><p:nvSpPr><p:cNvPr id="2" name="Title Placeholder 1"/><p:cNvSpPr><a:spLocks noGrp="1"/></p:cNvSpPr><p:nvPr><p:ph type="ctrTitle"/></p:nvPr></p:nvSpPr><p:spPr/></p:sp></p:spTree></p:cSld>
  <p:sldLayoutIdLst><p:sldLayoutId id="2147483649" r:id="rId1"/></p:sldLayoutIdLst>
</p:sldMaster>`),
    },
    {
      name: 'ppt/slideLayouts/slideLayout1.xml',
      data: xml(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sldLayout xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"
             xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
             xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
             type="ctrTitle">
  <p:cSld name="Title Slide"><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr/></p:spTree></p:cSld>
</p:sldLayout>`),
    },
    {
      name: 'ppt/theme/theme1.xml',
      data: xml(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" name="Office Theme">
  <a:themeElements>
    <a:clrScheme name="Office"><a:dk1><a:srgbClr val="000000"/></a:dk1><a:lt1><a:srgbClr val="FFFFFF"/></a:lt1><a:dk2><a:srgbClr val="44546A"/></a:dk2><a:lt2><a:srgbClr val="E7E6E6"/></a:lt2><a:accent1><a:srgbClr val="4472C4"/></a:accent1><a:accent2><a:srgbClr val="ED7D31"/></a:accent2><a:accent3><a:srgbClr val="A5A5A5"/></a:accent3><a:accent4><a:srgbClr val="FFC000"/></a:accent4><a:accent5><a:srgbClr val="5B9BD5"/></a:accent5><a:accent6><a:srgbClr val="70AD47"/></a:accent6></a:clrScheme>
    <a:fontScheme name="Office"><a:majorFont><a:latin typeface="Calibri Light"/><a:ea typeface=""/><a:cs typeface=""/></a:majorFont><a:minorFont><a:latin typeface="Calibri"/><a:ea typeface=""/><a:cs typeface=""/></a:minorFont></a:fontScheme>
    <a:fmtScheme name="Office"><a:fillStyleLst/><a:lnStyleLst/><a:effectStyleLst/><a:bgFillStyleLst/></a:fmtScheme>
  </a:themeElements>
</a:theme>`),
    },
  ]);
}

// ── ODF Format Generators (Phase 1) ──────────────────────────────

function createOdtSample() {
  return createZip([
    { name: 'mimetype', data: 'application/vnd.oasis.opendocument.text' },
    {
      name: 'META-INF/manifest.xml',
      data: xml(`<?xml version="1.0" encoding="UTF-8"?>
<manifest:manifest xmlns:manifest="urn:oasis:names:tc:opendocument:xmlns:manifest:1.0">
  <manifest:file-entry manifest:media-type="application/vnd.oasis.opendocument.text" manifest:full-path="/"/>
</manifest:manifest>`),
    },
    {
      name: 'content.xml',
      data: xml(`<?xml version="1.0" encoding="UTF-8"?>
<office:document-content xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0"
  xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0"
  xmlns:style="urn:oasis:names:tc:opendocument:xmlns:style:1.0">
  <office:body><office:text><text:p>ONLYOFFICE 9.3 ODT Smoke Test 中文测试</text:p></text:body></office:text>
</office:document-content>`),
    },
  ]);
}

function createOdsSample() {
  return createZip([
    { name: 'mimetype', data: 'application/vnd.oasis.opendocument.spreadsheet' },
    {
      name: 'META-INF/manifest.xml',
      data: xml(`<?xml version="1.0" encoding="UTF-8"?>
<manifest:manifest xmlns:manifest="urn:oasis:names:tc:opendocument:xmlns:manifest:1.0">
  <manifest:file-entry manifest:media-type="application/vnd.oasis.opendocument.spreadsheet" manifest:full-path="/"/>
</manifest:manifest>`),
    },
    {
      name: 'content.xml',
      data: xml(`<?xml version="1.0" encoding="UTF-8"?>
<office:document-content xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0"
  xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0"
  xmlns:table="urn:oasis:names:tc:opendocument:xmlns:table:1.0">
  <office:body><office:spreadsheet>
    <table:table table:name="Sheet1">
      <table:table-row><table:table-cell office:value-type="string"><text:p>ONLYOFFICE 9.3</text:p></table:table-cell><table:table-cell office:value-type="string"><text:p>ODS Test</text:p></table:table-cell></table:table-row>
    </table:table>
  </office:spreadsheet></office:body>
</office:document-content>`),
    },
  ]);
}

function createOdpSample() {
  return createZip([
    { name: 'mimetype', data: 'application/vnd.oasis.opendocument.presentation' },
    {
      name: 'META-INF/manifest.xml',
      data: xml(`<?xml version="1.0" encoding="UTF-8"?>
<manifest:manifest xmlns:manifest="urn:oasis:names:tc:opendocument:xmlns:manifest:1.0">
  <manifest:file-entry manifest:media-type="application/vnd.oasis.opendocument.presentation" manifest:full-path="/"/>
</manifest:manifest>`),
    },
    {
      name: 'content.xml',
      data: xml(`<?xml version="1.0" encoding="UTF-8"?>
<office:document-content xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0"
  xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0"
  xmlns:draw="urn:oasis:names:tc:opendocument:xmlns:drawing:1.0"
  xmlns:presentation="urn:oasis:names:tc:opendocument:xmlns:presentation:1.0">
  <office:body><office:presentation>
    <draw:page draw:name="Slide 1">
      <draw:frame draw:style-name="standard" svg:width="25cm" svg:height="3cm" svg:x="2cm" svg:y="2cm"
        xmlns:svg="urn:oasis:names:tc:opendocument:xmlns:svg-compatible:1.0">
        <draw:text-box><text:p>ONLYOFFICE 9.3 ODP Smoke Test</text:p></draw:text-box>
      </draw:frame>
    </draw:page>
  </office:presentation></office:body>
</office:document-content>`),
    },
  ]);
}

// ── Text Format Generators (Phase 1) ──────────────────────────────

function createRtfSample() {
  return Buffer.from(
    '{\\rtf1\\ansi\\deff0 {\\fonttbl {\\f0 Arial;}} \\f0\\fs24 ONLYOFFICE 9.3 RTF Smoke Test. \\par 中文 smoke 测试。}',
    'utf8',
  );
}

function createTxtSample() {
  return Buffer.from('ONLYOFFICE 9.3 TXT Smoke Test\n中文纯文本 smoke 测试\n', 'utf8');
}

function createHtmlSample() {
  return Buffer.from(
    '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Smoke</title></head><body><p>ONLYOFFICE 9.3 HTML Smoke Test</p><p>中文 HTML smoke 测试</p></body></html>',
    'utf8',
  );
}

// ── Binary Format Generators (OLE2 Compound File) ─────────────────

// Minimal OLE2 compound document builder.
// Creates valid-enough DOC/XLS/PPT files that x2t can recognize and open.
// OLE2 spec: sectors are 512 bytes, header is fixed format.
function createOle2(streams) {
  const SECTOR = 512;
  const HEADER_SIZE = SECTOR;
  const DIR_ENTRY_SIZE = 128;

  // Build directory entries
  const dirEntries = [{ name: 'Root Entry', type: 5, color: 1, left: -1, right: -1, child: 1, start: -1, size: 0 }]; // root storage
  for (const s of streams) {
    dirEntries.push({ name: s.name, type: 2, color: 0, left: -1, right: -1, child: -1, start: -1, size: s.data.length });
  }

  const dirSize = dirEntries.length * DIR_ENTRY_SIZE;
  const fatEntriesNeeded = Math.ceil((HEADER_SIZE + dirSize + streams.reduce((a, s) => a + s.data.length, 0)) / SECTOR) + 2;

  // Build FAT — simple contiguous allocation
  const fat = Buffer.alloc(Math.max(fatEntriesNeeded * 4, SECTOR));
  fat.writeUInt32LE(0xFFFFFFFD, 0); // FAT sector marker
  for (let i = 1; i < fatEntriesNeeded - 1; i++) fat.writeUInt32LE(i + 1, i * 4);
  fat.writeUInt32LE(0xFFFFFFFE, (fatEntriesNeeded - 1) * 4); // ENDOFCHAIN

  // Build header
  const header = Buffer.alloc(HEADER_SIZE);
  header.write('D0CF11E0A1B11AE1', 0, 'hex'); // magic
  for (let i = 8; i < 16; i++) header[i] = 0; // CLSID
  header.writeUInt16LE(0x003E, 26); // minor version
  header.writeUInt16LE(0x0003, 28); // major version (3=512B sectors)
  header.writeUInt16LE(0xFFFE, 30); // byte order
  header.writeUInt16LE(9, 32);   // sector size power (2^9=512)
  header.writeUInt16LE(6, 34);   // mini sector size power (2^6=64)
  header.writeUInt32LE(0, 40);   // reserved
  header.writeUInt32LE(0, 44);   // FAT sectors count (will set later)
  header.writeUInt32LE(0xFFFFFFFE, 48); // DIR start
  header.writeUInt32LE(1, 56);   // mini FAT cutoff (4096 bytes)
  header.writeUInt32LE(2, 60);   // mini FAT start
  header.writeUInt32LE(Math.ceil(fat.length / SECTOR), 64); // DIFAT count
  // DIFAT: first 109 FAT sector indices
  for (let i = 1, j = 0; i <= Math.ceil(fat.length / SECTOR) && j < 109; i++, j++) {
    header.writeUInt32LE(i, 76 + j * 4);
  }

  // Allocate sectors
  let sectorOffset = 0;
  const allocate = (size) => {
    const start = sectorOffset;
    sectorOffset += Math.ceil(size / SECTOR);
    return start;
  };

  const headerSector = allocate(HEADER_SIZE);
  const fatSector = allocate(fat.length);
  const dirSector = allocate(dirSize);
  for (const s of streams) s.sectorStart = allocate(s.data.length);

  // Write directory
  const dirBuf = Buffer.alloc(dirSize);
  let dirOff = 0;
  for (const e of dirEntries) {
    const nameLen = Math.min(e.name.length, 31);
    for (let n = 0; n < nameLen; n++) dirBuf.writeUInt16LE(e.name.charCodeAt(n), dirOff + n * 2);
    dirBuf.writeUInt16LE(nameLen + 1, dirOff + 64); // name length (with null terminator)
    dirBuf.writeUInt8(e.type, dirOff + 66);    // 2=stream, 5=storage
    dirBuf.writeUInt8(e.color, dirOff + 67);   // 0=red, 1=black
    dirBuf.writeInt32LE(e.left, dirOff + 68);
    dirBuf.writeInt32LE(e.right, dirOff + 72);
    dirBuf.writeInt32LE(e.child, dirOff + 76);
    // CLSID (16 bytes zero at offset 80, then start sector at offset 116)
    for (let c = 80; c < 96; c++) dirBuf.writeUInt8(0, dirOff + c);
    const startSector = e.start >= 0 ? (e.sectorStart + 1 + Math.ceil(fat.length / SECTOR)) : 0xFFFFFFFE;
    dirBuf.writeUInt32LE(startSector, dirOff + 116);
    dirBuf.writeUInt32LE(0, dirOff + 120); // size high
    dirBuf.writeUInt32LE(e.size, dirOff + 124); // size low
    dirOff += DIR_ENTRY_SIZE;
  }

  // Assemble
  const parts = [header];
  while (parts[0].length < sectorOffset * SECTOR) parts[0] = Buffer.concat([parts[0], Buffer.alloc(SECTOR - parts[0].length % SECTOR || SECTOR)]);
  parts.push(fat);
  while (parts.reduce((a, b) => a + b.length, 0) < (fatSector + Math.ceil(fat.length / SECTOR)) * SECTOR) parts.push(Buffer.alloc(SECTOR));
  parts.push(dirBuf);
  while (parts.reduce((a, b) => a + b.length, 0) < (dirSector + Math.ceil(dirSize / SECTOR)) * SECTOR) parts.push(Buffer.alloc(SECTOR));
  for (const s of streams) {
    const buf = Buffer.isBuffer(s.data) ? s.data : Buffer.from(s.data);
    parts.push(buf);
    while (parts.reduce((a, b) => a + b.length, 0) < (s.sectorStart + Math.ceil(buf.length / SECTOR)) * SECTOR) parts.push(Buffer.alloc(SECTOR));
  }

  return Buffer.concat(parts);
}

function createDocSample() {
  // Minimal WordDocument stream: FIB header (32 bytes) + empty body
  const fib = Buffer.alloc(32);
  fib.writeUInt16LE(0xA5EC, 0);  // magic
  fib.writeUInt16LE(0x00C1, 2);  // version
  fib.writeUInt16LE(0x0006, 6);  // flags

  const wordDoc = Buffer.concat([fib]);
  const table1 = Buffer.from([0x01, 0x00, 0x00, 0x00]); // minimal Clx

  return createOle2([
    { name: 'WordDocument', data: wordDoc },
    { name: '\x011Table', data: table1 },
    { name: 'Data', data: Buffer.alloc(0) },
  ]);
}

function createXlsSample() {
  // Minimal BOF/EOF BIFF records
  const bof = Buffer.alloc(20);
  bof.writeUInt16LE(0x0809, 0); // BOF record
  bof.writeUInt16LE(16, 2);      // size
  bof.writeUInt16LE(0x0006, 4);  // BIFF version 6 (= Excel 97)
  const eof = Buffer.alloc(4);
  eof.writeUInt16LE(0x000A, 0);  // EOF record
  eof.writeUInt16LE(0, 2);

  const book = Buffer.concat([bof, eof]);

  return createOle2([
    { name: 'Workbook', data: book },
    { name: 'Book', data: book },
  ]);
}

function createPptSample() {
  // Minimal PPT: empty presentation
  const currentUserAtom = Buffer.alloc(16);
  currentUserAtom.writeUInt32LE(0x03E8, 0); // size
  currentUserAtom.writeUInt32LE(0x03E9, 4); // size again

  const userEditAtom = Buffer.alloc(50);
  userEditAtom.writeUInt32LE(0x1000, 0); // record header
  userEditAtom.writeUInt32LE(26, 4);     // size

  const docAtom = Buffer.alloc(48);
  docAtom.writeUInt32LE(0x03E8, 0);

  const ppDoc = Buffer.concat([currentUserAtom, userEditAtom, docAtom]);

  return createOle2([
    { name: 'PowerPoint Document', data: ppDoc },
    { name: 'Current User', data: Buffer.alloc(8) },
    { name: 'Pictures', data: Buffer.alloc(0) },
  ]);
}

function createZip(entries) {
  const localParts = [];
  const centralParts = [];
  let offset = 0;
  for (const entry of entries) {
    const name = Buffer.from(entry.name, 'utf8');
    const data = Buffer.from(entry.data);
    const crc = crc32(data);
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0x0800, 6);
    local.writeUInt16LE(0, 8);
    local.writeUInt16LE(0, 10);
    local.writeUInt16LE(0, 12);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(data.length, 18);
    local.writeUInt32LE(data.length, 22);
    local.writeUInt16LE(name.length, 26);
    local.writeUInt16LE(0, 28);
    localParts.push(local, name, data);

    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(20, 4);
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(0x0800, 8);
    central.writeUInt16LE(0, 10);
    central.writeUInt16LE(0, 12);
    central.writeUInt16LE(0, 14);
    central.writeUInt32LE(crc, 16);
    central.writeUInt32LE(data.length, 20);
    central.writeUInt32LE(data.length, 24);
    central.writeUInt16LE(name.length, 28);
    central.writeUInt16LE(0, 30);
    central.writeUInt16LE(0, 32);
    central.writeUInt16LE(0, 34);
    central.writeUInt16LE(0, 36);
    central.writeUInt32LE(0, 38);
    central.writeUInt32LE(offset, 42);
    centralParts.push(central, name);
    offset += local.length + name.length + data.length;
  }

  const central = Buffer.concat(centralParts);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(0, 4);
  end.writeUInt16LE(0, 6);
  end.writeUInt16LE(entries.length, 8);
  end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(central.length, 12);
  end.writeUInt32LE(offset, 16);
  end.writeUInt16LE(0, 20);
  return Buffer.concat([...localParts, central, end]);
}

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}
