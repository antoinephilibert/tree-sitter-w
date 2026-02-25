// grammar.js

// Précédence pour la gestion des opérateurs
const PREC = {
  assign: 0,
  binary: 1,
};

module.exports = grammar({
  name: 'w',

  conflicts: $ => [
    [$.array_value, $.complex_value],
  ],

  // Les extras sont des tokens qui peuvent apparaître n'importe où dans le code,
  // comme les espaces et les commentaires.
  extras: $ => [
    /\s/, // Espaces, tabulations, nouvelles lignes
    $.comment,
  ],

  // 'word' aide Tree-sitter à mieux gérer les conflits entre les mots-clés et les identifiants.
  word: $ => $.identifier,

  // Définition des règles de la grammaire
  rules: {
    // Règle de départ, équivalente à 'DOC' dans le fichier PEST
    source_file: $ => repeat($._statement),

    // Un 'statement' peut être l'une des déclarations ou assignations suivantes.
    _statement: $ => choice(
      $.variable_declaration,
      $.function_declaration,
      $.assignment,
      $.view_assignment,
      $.enum_declaration,
      $.coherence_check,
      $.optional,
    ),

    // Définitions des différents types de 'statements'
    coherence_check: $ => seq('cc', $.identifier, $.semicolon),
    optional: $ => seq('optional', $.identifier, $.semicolon),
    view_assignment: $ => seq(
      'view',
      field('name', $.identifier),
      repeat1($.identifier),
      $.semicolon
    ),
    assignment: $ => seq(
      $.identifier,
      '=',
      optional($.matrix_keyword),
      $._expression,
      $.semicolon
    ),

    // Déclaration d'énumération
    enum_declaration: $ => seq(
      'enum',
      field('name', $.identifier),
      $.left_brace,
      optional(seq(
        sepBy1($.comma, $.identifier),
        optional($.comma)
      )),
      $.right_brace
    ),

    // Déclaration de variable
    variable_declaration: $ => seq(
      choice('let', 'pub'),
      optional($.visibility),
      field('name', $.identifier),
      optional($.rotate_to),
      ':',
      $.variable_assignment,
      $.semicolon
    ),

    rotate_to: $ => seq('rotate', 'to', $.identifier),
    visibility: $ => choice('input', 'output', 'internal'),

    // Assignation de variable lors de la déclaration
    variable_assignment: $ => seq(
      $._type,
      optional(seq('=', $._value))
    ),

    // Déclaration de fonction
    function_declaration: $ => seq(
      'fn',
      field('name', $.identifier),
      field('parameters', $.parameters),
      optional($.return_type),
      optional(field('body', $.function_body))
    ),

    parameters: $ => seq(
      $.left_paren,
      optional(seq(
        sepBy1($.comma, $.parameter),
        optional($.comma)
      )),
      $.right_paren
    ),

    parameter: $ => seq(
      field('name', $.identifier),
      ':',
      field('type', $._type)
    ),

    return_type: $ => seq('->', $._type),
    function_body: $ => seq($.left_brace, repeat1($.string_value), $.right_brace),

    // Gestion des types
    _type: $ => choice(
      $.array_type,
      $.template_type,
      $.base_type
    ),

    array_type: $ => seq($._type, '[]'),
    template_type: $ => seq(
      $.complex_type_keyword,
      '<',
      $.identifier,
      '>'
    ),
    base_type: $ => choice(
      $.complex_type_keyword,
      $.primitive_type,
      $.identifier // Pour les types custom comme les enums
    ),
    primitive_type: $ => choice('int', 'dbl', 'bool', 'str', 'range'),
    complex_type_keyword: $ => choice(
      'intDecision', 'strDecision', 'rangeDecision', 'boolDecision', 'enumDecision'
    ),

    // Expressions et littéraux
    _expression: $ => choice(
      $.if_expression,
      $.match_expression,
      $.literal,
      $.binary_expression,
      $.parenthesized_expression
    ),

    if_expression: $ => prec.right(PREC.assign, seq(
      $.if_keyword,
      field('condition', $._expression),
      field('consequence', $.block),
      repeat(field('else_if', $.else_if_clause)),
      optional(field('alternative', $.else_clause))
    )),

    else_if_clause: $ => seq(
      $.else_keyword,
      $.if_keyword,
      field('condition', $._expression),
      field('consequence', $.block)
    ),

    else_clause: $ => seq(
      $.else_keyword,
      field('alternative', $.block)
    ),

    block: $ => seq(
      $.left_brace,
      optional($._expression),
      $.right_brace
    ),

    match_expression: $ => seq(
      $.match_keyword,
      field('value', $._expression),
      $.left_brace,
      optional(seq(
        sepBy1($.comma, $.match_arm),
        optional($.comma)
      )),
      $.right_brace
    ),

    match_arm: $ => seq(
      field('pattern', $.match_pattern),
      $.fat_arrow,
      field('body', $._expression)
    ),

    match_pattern: $ => choice(
      $.enum_value,
      '_',
      $.identifier
    ),

    parenthesized_expression: $ => seq($.left_paren, $._expression, $.right_paren),

    binary_expression: $ => prec.left(PREC.binary, seq(
      field('left', $._expression),
      field('operator', $.operator),
      field('right', $._expression)
    )),

    operator: $ => choice('+', '-', '*', '/'),

    matrix_keyword: $ => 'mat',

    if_keyword: $ => 'if',
    else_keyword: $ => 'else',
    match_keyword: $ => 'match',
    fat_arrow: $ => '=>',

    literal: $ => prec(PREC.assign, choice(
      $._value,
      $.function_call,
      $.global_function_call,
      $.external_variable,
      $.identifier,
    )),

    _value: $ => choice(
      $.integer_value,
      $.double_value,
      $.boolean_value,
      $.string_value,
      $.range_value,
      $.enum_value,
      $.array_value,
      $.complex_value
    ),

    // Appels de fonction
    function_call: $ => seq(
      field('name', $.identifier),
      $.left_paren,
      optional(sepBy($.comma, $.literal)),
      $.right_paren
    ),

    global_function_call: $ => seq(
      'global',
      $.dot,
      $.function_call
    ),

    external_module: $ => seq('@', alias($.identifier, $.module_identifier)),
    external_variable: $ => seq($.external_module, $.dot, alias($.identifier, $.external_identifier)),

    // Valeurs littérales
    array_value: $ => seq(
      $.left_brace,
      optional(seq(
        sepBy1($.comma, $._value),
        optional($.comma)
      )),
      $.right_brace
    ),

    complex_value: $ => seq(
      $.left_brace,
      optional(seq(
        sepBy1($.comma, $.key_value_pair),
        optional($.comma)
      )),
      $.right_brace
    ),

    key_value_pair: $ => seq(
        field('key', $.identifier),
        ':',
        field('value', $._value)
    ),

    enum_value: $ => seq($.identifier, $.dot, $.identifier),
    range_value: $ => seq(
      $.left_bracket,
      $.integer_value,
      '/',
      $.integer_value,
      $.right_bracket
    ),

    // --- TOKENS ---
    // Les tokens sont les unités lexicales de base reconnues par l'analyseur.
    // Ils sont souvent définis avec des expressions régulières.

    comment: $ => token(seq('//', /.*/)),

    left_brace: $ => '{',
    right_brace: $ => '}',
    left_paren: $ => '(',
    right_paren: $ => ')',
    left_bracket: $ => '[',
    right_bracket: $ => ']',
    comma: $ => ',',
    dot: $ => '.',
    semicolon: $ => ';',

    identifier: $ => /[a-zA-Z_][a-zA-Z0-9_]*/,

    integer_value: $ => /-?\d+/,
    double_value: $ => /-?\d+\.\d+/,
    boolean_value: $ => choice('true', 'false'),

    string_value: $ => token(seq(
      '"',
      repeat(choice(
        /[^"\\]+/, // Tout caractère qui n'est pas un guillemet ou un backslash
        /\\./       // Séquence d'échappement (ex: \", \\, \n)
      )),
      '"'
    )),
  }
});

/**
 * Crée une règle pour une séquence d'éléments séparés par un délimiteur.
 * @param {Rule} delimiter - Le délimiteur.
 * @param {Rule} rule - La règle à répéter.
 * @return {SeqRule}
 */
function sepBy(delimiter, rule) {
  return optional(sepBy1(delimiter, rule));
}

/**
 * Crée une règle pour une séquence d'au moins un élément séparé par un délimiteur.
 * @param {Rule} delimiter - Le délimiteur.
 * @param {Rule} rule - La règle à répéter.
 * @return {SeqRule}
 */
function sepBy1(delimiter, rule) {
  return seq(rule, repeat(seq(delimiter, rule)));
}
