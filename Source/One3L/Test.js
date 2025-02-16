require("./One3L.js");

One3L_EXECUTE(`
11
[[
  dup
  [[
    dup print

    dupsub 11 [+] dupsub [==]
    [[ (THEN)
      1 [+]
    ]]
    [[ (ELSE)
      BREAK_LOOP
    ]]
    CONDITION
  ]] LOOP
  drop

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
