import { LLL_EXECUTE } from "../../Source/oo24LLL/Interpreter.js"

LLL_EXECUTE(`
; Copyright 2024-2025 Demyan 'dtkdtk0' Tk.
; This file is part of oo24project.

; oo24project is free software: you can redistribute it and/or modify
; it under the terms of the GNU General Public License as published by
; the Demyan 'dtkdtk0' Tk., either version 3 of the License, or
; (at your option) any later version.

; oo24project is distributed in the hope that it will be useful,
; but WITHOUT ANY WARRANTY; without even the implied warranty of
; MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
; GNU General Public License for more details.

; You should have received a copy of the GNU General Public License
; along with oo24project.  If not, see <https://www.gnu.org/licenses/>.

META Author dtkdtk0
META License: GNU General Public License

STRINGS-TABLE:

STRING the first string!

STRING Привет, Россия!

STRING Multiline!\n2nd\n3nd\n\tTab!

STRING Real multiline!
2nd
3rd
  Do not trim!  

STRING Fake END hehe

STRING END

END
`)
