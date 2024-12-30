function Power(Num, Grade) {
  let Temp = Num
  for (let i = 1; i < Grade; i++)
    Temp *= Num
  return Temp
}

console.log("Test: 5**2", "\n\tExpected:", 25, "\n\tGot:", Power(5, 2))
console.log("Test: 3**3", "\n\tExpected:", 27, "\n\tGot:", Power(3, 3))
