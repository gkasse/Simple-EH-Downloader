export class CharacterResolver {
  public static resolve(strings: string) {
    strings = strings.replace(/\\/g, "￥");
    strings = strings.replace(/\//g, "／");
    strings = strings.replace(/:/g, "：");
    strings = strings.replace(/\*/g, "＊");
    strings = strings.replace(/\?/g, "？");
    strings = strings.replace(/"/g, "”");
    strings = strings.replace(/</g, "＜");
    strings = strings.replace(/>/g, "＞");
    strings = strings.replace(/\|/g, "｜");
    return strings;
  }
}
