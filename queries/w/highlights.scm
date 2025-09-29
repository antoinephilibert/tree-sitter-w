; Keywords
["let" "pub" "fn" "enum" "view" "cc" "rotate" "to" "global"] @keyword
(matrix_keyword) @keyword

; Visibility modifiers
["input" "output" "internal"] @keyword

; Primitive and complex types
[(primitive_type) (complex_type_keyword)] @type

; Literal constants
["true" "false"] @boolean

; Numbers and strings
(integer_value) @number
(double_value) @number
(string_value) @string

; Ranges and arrays
(range_value) @number
(array_value "{" @punctuation.bracket "}" @punctuation.bracket)
(complex_value "{" @punctuation.bracket "}" @punctuation.bracket)

; Operators
[(operator) "=" "->" "," ":"] @operator

; Identifiers
(identifier) @variable

; Declarations and definitions
(function_declaration
  name: (identifier) @function)
(variable_declaration
  name: (identifier) @variable)
(parameter
  name: (identifier) @parameter)
(enum_declaration
  name: (identifier) @type)

; Function calls
(function_call
  name: (identifier) @function.call)
(global_function_call
  "." @punctuation.delimiter)

; Comments
(comment) @comment
