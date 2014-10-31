# Flora Query Language

Query Language parser used at the FLexible Open Rest Api with solid test coverage. 
Define your own syntax and create powerful statements to use for example for filtering through your data. 
It identifies the different parts of your input and returns them in a two dimensional array ordered in disjunctive normal form.


## Features

### Statements

Every valid statement consists of three parts. An attribute, an operator and the value. Attributes can be made up of multiple parts, connected with any characters like a dot.

```javascript
var FloraQL = require('flora-ql');
FloraQL.setConfig('api');

FloraQL.parse('id=321');
// [[{ attribute: ['id'], operator: '=', value: 321 }]]

FloraQL.parse('user.id=109369');
// [[{ attribute: ['user', 'id'], operator: '=', value: 109369 }]]

FloraQL.parse('user.created>=9000');
// [[{ attribute: ['user', 'created'], operator: '>=', value: 9000 }]]

FloraQL.parse('user.description="I am the batman"');
// [[{ attribute: ['user', 'description'], operator: '=', value: "I am the batman" }]]
```

### Logical connectives with round brackets

Statements can be connected with AND and OR connectives. For the use of OR, it is necessary to support round brackets. Any nested statements are supported as well.

```javascript
var FloraQL = require('flora-ql');
FloraQL.setConfig('api');

FloraQL.parse('id=321 AND user.id=109369');
/*
 * [
 *   [ 
 *     { attribute: ['id'], operator: '=', value: 321 },
 *     { attribute: ['user', 'id'], operator: '=', value: 109369 }
 *   ]
 * ]
 */

FloraQL.parse('id=321 OR user.id=109369');
/*
 * [
 *   [
 *     { attribute: ['id'], operator: '=', value: 321 }
 *   ], 
 *   [
 *     { attribute: ['user', 'id'], operator: '=', value: 109369 }
 *   ]
 * ]
 */

FloraQL.parse('id=321 AND (user.id=109369 OR user.id=109370)');
/*
 * [
 *   [
 *     { attribute: ['id'], operator: '=', value: 321 },
 *     { attribute: ['user', 'id'], operator: '=', value: 109369 }
 *   ], 
 *   [
 *     { attribute: ['id'], operator: '=', value: 321 }, 
 *     { attribute: ['user', 'id'], operator: '=', value: 109370 }
 *   ]
 * ]
 */
```

### Support for any operators and values

```javascript
var FloraQL = require('flora-ql');
FloraQL.setConfig('api');

FloraQL.parse('type>9000 AND name="Bruce Wayne" AND incognito=true');
/*
 * [
 *   [
 *     { attribute: ['type'], operator: '>', value: 9000 }, 
 *     { attribute: ['name'], operator: '=', value: "Bruce Wayne" },
 *     { attribute: ['incognito'], operator: '=', value: true }
 *   ]
 * ]
 */
```


### Attribute grouping / scoping

In case you can think of a better terminology, please let us know.

```javascript
var FloraQL = require('flora-ql');
FloraQL.setConfig('api');

FloraQL.parse('user[type>9000 AND name="Bruce Wayne"]');
/*
 * [
 *   [
 *     { attribute: ['user', 'type'], operator: '>', value: 9000 }, 
 *     { attribute: ['user', 'name'], operator: '=', value: "Bruce Wayne" }
 *   ]
 * ]
 */

FloraQL.parse('user[external OR internal].type=2');
/*
 * [
 *   [
 *     { attribute: ['user', 'external', 'type'], operator: '=', value: 2 }
 *   ], 
 *   [
 *     { attribute: ['user', 'internal', 'type'], operator: '=', value: 2 }
 *   ],
 * ]
 */
```

### Human readable error statements

```javascript
var FloraQL = require('flora-ql');
FloraQL.setConfig('api');

try {
    FloraQL.parse('name="Bruce Wayne');
} catch(e) {
    // Missing closing quotation mark for string starting at 'me="Bru' (pos: 6) 
}
```


### Highly customizable syntax

```javascript
var FloraQL = require('flora-ql');
FloraQL.setConfig({
    "operators": ["!=", "<=", ">=", "=", "<", ">"], // list of valid operators
    "glue": ":",                                    // glue used to connect multiple attribute parts
    "and": "*",                                     // AND connective
    "or": "+",                                      // OR connective
    "string": "\"",                                 // string indicator
    "roundBracket": ["(", ")"],                     // characters for round brackets
    "squareBracket": ["{", "}"],                    // characters for attribute grouping / scoping
    "relate": "~",                                  // internal, special character used to resolve scopes
    "lookDelimiter": "+"                            // internal, normally the OR connective
});

FloraQL.parse('user{external+internal}:type=2');
/*
 * [
 *   [
 *     { attribute: ['user', 'external', 'type'], operator: '=', value: 2 }
 *   ], 
 *   [
 *     { attribute: ['user', 'internal', 'type'], operator: '=', value: 2 }
 *   ],
 * ]
 */
```