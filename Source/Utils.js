/**
 * Создаёт новый объект на основе старого БЕЗ указанных ключей.
 * @template {object} _TyObj
 * @template {keyof _TyObj} _TyKeys
 * @param {_TyObj} Source 
 * @param {_TyKeys[]} Keys 
 * @returns {Omit<_TyObj, _TyKeys>}
 */
export function OmitKeysFrom(Source, ...Keys) {
  const Buf = {};
  for (const K in Source) //@ts-ignore
    if (!Keys.includes(K)) //@ts-ignore
      Buf[K] = Source[K]; //@ts-ignore
  return Buf;
}



/**
 * (форматирование) Дополняет строку до указанной длины пробелами.
 * 
 * Пробелы ставятся **перед строкой**.
 * @param {number} TargetLength
 * @param {string} Str
 * @returns {string}
 */
export function CompleteToLength_Prefix(TargetLength, Str) {
  let Prefix = "";
  const Needed = TargetLength - Str.length;

  if (Needed < 0) {
    console.warn(`INTERNAL BUG: 'Source/Utils: CompleteToLength_Prefix()': Given Str length greater than TargetLength.`);
    return Str;
  }

  if (Needed > 0)
    Prefix += " ".repeat(Needed);
  return Prefix + Str;
}



/**
 * (форматирование) Обрезать / дополнить пробелами строку до указанной длины.
 * 
 * Пробелы ставятся **после строки**. Если строка обрезается - последним символом ставится троеточие.
 * @param {number} TargetLength
 * @param {string} Str
 * @returns {string}
 */
export function ClampToLength(TargetLength, Str) {
  let Buf = Str;
  if (Str.length < TargetLength)
    Buf += (" ".repeat(TargetLength - Str.length));
  else if (Str.length > TargetLength)
    Buf = Buf.slice(0, TargetLength - 2) + "…";
  return Buf;
}



/**
 * @param {number} Min 
 * @param {number} Max 
 * @param {number} Given 
 * @returns {number}
 */
export function ClampNumber(Min, Max, Given) {
  if (Given < Min) return Min;
  if (Given > Max) return Max;
  return Given;
}
/**
 * @param {number} Min 
 * @param {number} Given 
 * @returns {number}
 */
ClampNumber.OnlyMin = function(Min, Given) {
  if (Given < Min) return Min;
  return Given;
}
/**
 * @param {number} Max 
 * @param {number} Given 
 * @returns {number}
 */
ClampNumber.OnlyMax = function(Max, Given) {
  if (Given > Max) return Max;
  return Given;
}



/**
 * Составляет "мозаику" из строк - так, чтобы они укладывались в несколько линий N'й длины.
 * 
 * Если строка слишком длинная - она **обрезается** с помощью {@link ClampToLength()}.
 * @param {string[]} Strings 
 * @param {number} TargetLength 
 * @param {number} [DelimiterLength=0] 
 * @returns {string[][]}
 */
export function FitStringsInLength(Strings, TargetLength, DelimiterLength = 0) {
  if (Strings.length == 0) return [];
  /** @type {string[][]} */
  const Buf = [[]];
  for (const Str of Strings) {
    const CurrentLength = Buf[Buf.length - 1].reduce((accum, cur) => accum + cur.length, 0)
      + Buf[Buf.length - 1].length * DelimiterLength;
    if (CurrentLength + Str.length > TargetLength)
      Buf.push([Str]);
    else
      Buf[Buf.length - 1].push(Str);
  }
  return Buf;
}

/**
 * @param {string} Str 
 * @param {string} Suffix 
 * @returns {string}
 */
export function RemoveSuffix(Str, Suffix) {
  const Index = Str.lastIndexOf(Suffix);
  if (Index == -1)
    return Str;
  else
    return Str.slice(0, Index);
}



/**
 * Проверяет, является ли число целым.
 * @param {number} maybeInteger 
 * @returns {boolean}
 */
export function IsInteger(maybeInteger) {
  return ~~maybeInteger == maybeInteger;
}
