// Expo 環境変数参照用の最小グローバル型宣言
declare const process: {
  readonly env: Readonly<Record<string, string | undefined>>;
};
