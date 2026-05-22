export const REQUIRED_BROWSER_FONT_FILES = ['LiberationSans-Regular.ttf', 'NotoSansSC-VF.ttf'] as const;
export const REQUIRED_CHINESE_FONT_ALIASES = ['Microsoft YaHei', 'SimSun'] as const;
export const ONLYOFFICE_INVALID_FONT_PATH_NEEDLES = ['/fonts//fonts', 'C:\\Windows\\Fonts', 'core-fonts'] as const;

export function isInvalidOnlyOfficeFontPath(path: string): boolean {
  return ONLYOFFICE_INVALID_FONT_PATH_NEEDLES.some((needle) => path.includes(needle));
}
