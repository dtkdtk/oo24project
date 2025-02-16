import * as aux from "./aAux.js";

/**
 * @internal
 * Словарь операторов.
 * 
 * @type {Dictionary}
 */
export default new Map(Object.entries({

  /* АРИФМЕТИКА */

  "[+]": (S) => {
    aux.AssertStackLength(S, 2);
    const B = aux.Pop_Number(S);
    const A = aux.Pop_Number(S);
    S.Stack.push(A + B);
  },
  "[-]": (S) => {
    aux.AssertStackLength(S, 2);
    const B = aux.Pop_Number(S);
    const A = aux.Pop_Number(S);
    S.Stack.push(A - B);
  },
  "[*]": (S) => {
    aux.AssertStackLength(S, 2);
    const B = aux.Pop_Number(S);
    const A = aux.Pop_Number(S);
    S.Stack.push(A * B);
  },
  "[/]": (S) => {
    aux.AssertStackLength(S, 2);
    const B = aux.Pop_Number(S);
    const A = aux.Pop_Number(S);
    S.Stack.push(A / B);
  },
  "[//]": (S) => {
    aux.AssertStackLength(S, 2);
    const B = aux.Pop_Number(S);
    const A = aux.Pop_Number(S);
    S.Stack.push(Math.floor(A / B));
  },
  "[%]": (S) => {
    aux.AssertStackLength(S, 2);
    const B = aux.Pop_Number(S);
    const A = aux.Pop_Number(S);
    S.Stack.push(A % B);
  },
  increment: (S) => {
    aux.AssertStackLength(S, 1);
    const X = aux.Pop_Number(S);
    S.Stack.push(X + 1);
  },
  decrement: (S) => {
    aux.AssertStackLength(S, 1);
    const X = aux.Pop_Number(S);
    S.Stack.push(X - 1);
  },

  /* СРАВНЕНИЕ */

  "[==]": (S) => {
    aux.AssertStackLength(S, 2);
    const B = aux.Pop_Number(S);
    const A = aux.Pop_Number(S);
    S.Stack.push(A == B ? 1 : 0);
  },
  "[!=]": (S) => {
    aux.AssertStackLength(S, 2);
    const B = aux.Pop_Number(S);
    const A = aux.Pop_Number(S);
    S.Stack.push(A != B ? 1 : 0);
  },
  "[>]": (S) => {
    aux.AssertStackLength(S, 2);
    const B = aux.Pop_Number(S);
    const A = aux.Pop_Number(S);
    S.Stack.push(A > B ? 1 : 0);
  },
  "[>=]": (S) => {
    aux.AssertStackLength(S, 2);
    const B = aux.Pop_Number(S);
    const A = aux.Pop_Number(S);
    S.Stack.push(A >= B ? 1 : 0);
  },
  "[<]": (S) => {
    aux.AssertStackLength(S, 2);
    const B = aux.Pop_Number(S);
    const A = aux.Pop_Number(S);
    S.Stack.push(A < B ? 1 : 0);
  },
  "[<=]": (S) => {
    aux.AssertStackLength(S, 2);
    const B = aux.Pop_Number(S);
    const A = aux.Pop_Number(S);
    S.Stack.push(A <= B ? 1 : 0);
  },

  /* ПОБИТОВЫЕ/ЛОГИЧЕСКИЕ */

  and: (S) => {
    aux.AssertStackLength(S, 2);
    const B = aux.Pop_Number(S);
    const A = aux.Pop_Number(S);
    S.Stack.push(A & B);
  },
  or: (S) => {
    aux.AssertStackLength(S, 2);
    const B = aux.Pop_Number(S);
    const A = aux.Pop_Number(S);
    S.Stack.push(A | B);
  },
  not: (S) => {
    aux.AssertStackLength(S, 1);
    const X = aux.Pop_Number(S);
    S.Stack.push(X ? 0 : 1);
  },
  bitxor: (S) => {
    aux.AssertStackLength(S, 2);
    const B = aux.Pop_Number(S);
    const A = aux.Pop_Number(S);
    S.Stack.push(A ^ B);
  },
  bitnot: (S) => {
    aux.AssertStackLength(S, 1);
    const X = aux.Pop_Number(S);
    S.Stack.push(~ X);
  },
  "[>>]": (S) => {
    aux.AssertStackLength(S, 2);
    const B = aux.Pop_Number(S);
    const A = aux.Pop_Number(S);
    S.Stack.push(A >> B);
  },
  "[>>>]": (S) => {
    aux.AssertStackLength(S, 2);
    const B = aux.Pop_Number(S);
    const A = aux.Pop_Number(S);
    S.Stack.push(A >>> B);
  },
  "[<<]": (S) => {
    aux.AssertStackLength(S, 2);
    const B = aux.Pop_Number(S);
    const A = aux.Pop_Number(S);
    S.Stack.push(A << B);
  },

}));
