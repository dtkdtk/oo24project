# 4. Стандартные конструкции языка

Стандартные конструкции языка отличаются обычных слов:
1. Как правило, они написаны капсом (заглавными буквами).
2. **Они влияют на интерпретацию / ход выполнения кода**.
3. Они могут нарушать *постфиксную нотацию*, используя *инфиксную* (реже - *префиксную*).

**Все блоки (`SOME_CONSTRUCTION... code ...END`) являются ЛЕНИВЫМИ - фрагмент кода сохраняется в словарь, однако при чтении не интерпретируется**

На данный момент, присутствуют следующие конструкции: (про конструкции Прелюдии - позже)

### Управление словарём:

1. `DEFINE` — объявление слова
>- `[value] [wordname] DEFINE`
2. `DEFINE...` — *(infix)* начало блока с объявлением слова
>- `[wordname] DEFINE... [codeblock] ...END`
3. `SET` — установка значения уже существующему слову
>- `[value] [wordname] SET`
4. `SET...` — *(infix)* начало блока с новым значением слова
>- `[wordname] SET... [codeblock] ...END`
5. `DELETE` — удаление слова
>- `[wordname] DELETE`

### Условия:

> Вместо `true|false` используется `1|0`. Условие вынимается из стека только если какая-то ветка выполняется успешно.
6. `THEN...` — *(infix)* начало блока с кодом, выполняющимся если условие ИСТИННО (=1)
>- `[condition] THEN... [codeblock] ...END`
7. `ELSE...` — *(infix)* начало блока с кодом, выполняющимся если условие ЛОЖНО (=0)
>- `[condition] ELSE... [codeblock] ...END`

### Циклы:

8. `LOOP...` — *(prefix)* начало блока с циклом
>- `LOOP... [codeblock] ...END`
9. `BREAK-LOOP` — выход из цикла, его остановка
10. `SKIP-ITERATION` — переход в начало цикла; аналог `continue` в популярных языках

### (остальное):

11. `...END` — конец последнего блока кода
