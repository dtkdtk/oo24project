require("./One3L.js");

One3L_EXECUTE(`
11
[[
  dup print
  AE! print

  dup 55 [<] (COND)
  [[ (THEN)
    11 [+]
  ]]
  [[ (ELSE)
    BREAK_LOOP
  ]]
  CONDITION
]] LOOP
`);
