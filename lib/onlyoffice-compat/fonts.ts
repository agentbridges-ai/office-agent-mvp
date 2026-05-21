export const REQUIRED_BROWSER_FONT_FILES = ['LiberationSans-Regular.ttf', 'NotoSansSC-VF.ttf'] as const;
export const REQUIRED_CHINESE_FONT_ALIASES = ['Microsoft YaHei', 'SimSun'] as const;

export function isInvalidOnlyOfficeFontPath(path: string): boolean {
  return path.includes('/fonts//fonts') || path.includes('C:\\Windows\\Fonts') || path.includes('core-fonts');
}
