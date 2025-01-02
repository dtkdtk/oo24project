# 2. Стек и Значения.

Стек - это последовательность Значений.

Значение - это фрагмент памяти некоторой длины, который может содержать данные любого вида:
- **Числового** (представлены как атомарное число некоторого размера: `i8`, `u8`, `i16`, `u16`, `i32`, `u32`, `i64`, `u64`, `f32`, `f64`).
- **Типа "массив"**.

Именно на этих двух типах строятся другие типы:
- **Строки** (кодировка UTF-8) это массивы из номеров символов.
- **Указатели** это числа с адресами ячеек (тип `u32/u64`, в зависимости от архитектуры).
- **Сложные типы данных**.

## Представление и Значение

**Значение** - это некий набор байтов, не имеющих никакого типа данных. Со значениями никак нельзя взаимодействовать: необходимо **представить** их как данные какого-либо типа: числового, массив, строкового, указателя и проч.

С одними и теми же данными можно взаимодействовать по-разному: Конкатенировать (если представить как строки), Вычитать (если представить как числа), Переходить по адресу (если представить как указатель) и т.д.

Наглядно:
- Значение: `A1B2C3D4`
- Представление (числовое): `2712847316`
- Представление (строковое, кодировка ASCII): `¡²ÃÔ`
- Представление (массив): *ошибка представления*

## Реализация массивов

первый байт - размер каждого элемента; если "0" - значит, сложный тип данных