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

; Braces
[(left_brace) (right_brace) (left_paren) (right_paren) (left_bracket) (right_bracket)] @punctuation.bracket

; Operators
[(operator) "=" "->" ":"] @operator

; Delimiters
[(comma) (semicolon) (dot)] @punctuation.delimiter

; External reference
(external_module) @module
(external_identifier) @constant

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

; Comments
(comment) @comment
