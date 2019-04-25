# Flora Query Language

[![Build Status](https://travis-ci.org/godmodelabs/flora-ql.svg?branch=master)](https://travis-ci.org/godmodelabs/flora-ql)
[![NPM version](https://badge.fury.io/js/flora-ql.svg)](https://www.npmjs.com/package/flora-ql)
[![Dependencies](https://img.shields.io/david/godmodelabs/flora-ql.svg)](https://david-dm.org/godmodelabs/flora-ql)

Standalone Query Language parser used at the FLexible Open Rest Api with solid test coverage. Define your own powerful syntax to use for example for filtering through your data. It identifies the different parts of your input and returns these statements in a two dimensional array resolved in disjunctive normal form.

## Features

### Statements

A valid statement consists of three parts. An attribute, an operator and the value. Attributes can be made up of multiple fields, connected with a dot for example.

```js
const FloraQL = require('flora-ql');

FloraQL.setConfig('api');

FloraQL.parse('id=321');
/*
 * [ [
 *     { attribute: ['id'], operator: '=', value: 321 }
 * ] ]
 */

FloraQL.parse('user.id=109369');
/* 
 * [ [
 *     { attribute: ['user', 'id'], operator: '=', value: 109369 }
 * ] ]
 */

FloraQL.parse('user.created>=9000');
/*
 * [ [
 *     { attribute: ['user', 'created'], operator: '>=', value: 9000 }
 * ] ]
 */

FloraQL.parse('user.description="I am the batman"');
/*
 * [ [
 *     { attribute: ['user', 'description'], operator: '=', value: "I am the batman" }
 * ] ]
```

### Logical connectives with round brackets

Statements can be connected with AND and OR connectives. For the use of OR, it is necessary to support round brackets. Deeply nested constructions are supported as well and will be resolved.

```js
const FloraQL = require('flora-ql');

FloraQL.setConfig('api');

FloraQL.parse('id=321 AND user.id=109369');
/*
 * [ [
 *     { attribute: ['id'], operator: '=', value: 321 },
 *     { attribute: ['user', 'id'], operator: '=', value: 109369 }
 * ] ]
 */

FloraQL.parse('id=321 OR user.id=109369');
/*
 * [ [
 *     { attribute: ['id'], operator: '=', value: 321 }
 *   ], 
 *   [
 *     { attribute: ['user', 'id'], operator: '=', value: 109369 }
 * ] ]
 */

FloraQL.parse('id=321 AND (user.id=109369 OR user.id=109370)');
/*
 * [ [
 *     { attribute: ['id'], operator: '=', value: 321 },
 *     { attribute: ['user', 'id'], operator: '=', value: 109369 }
 *   ], 
 *   [
 *     { attribute: ['id'], operator: '=', value: 321 }, 
 *     { attribute: ['user', 'id'], operator: '=', value: 109370 }
 * ] ]
 */
```

### Support for any operator and value

The parser does not necessarily need to understand different operator types. Thus you can use any operator you define. The values will be parsed, numbers will become numbers, strings will remain strings and boolean/null/undefined will become their corresponding data type. You can then use strictly equal operations on the value of every statement.

```js
const FloraQL = require('flora-ql');

FloraQL.setConfig('api');

FloraQL.parse('type>9000 AND name="Bruce Wayne" AND incognito=true');
/*
 * [ [
 *     { attribute: ['type'], operator: '>', value: 9000 }, 
 *     { attribute: ['name'], operator: '=', value: "Bruce Wayne" },
 *     { attribute: ['incognito'], operator: '=', value: true }
 * ] ]
 */
```

### Attribute grouping / scoping

If you got multiple statements with similar attributes, you can shorten your query by using square brackets for grouping/scoping. These can even be used between your attributes and each bracket can itself contain deeply complex constructions with more brackets and connectives.

In case you can think of a better terminology, please let us know. :)

```js
const FloraQL = require('flora-ql');

FloraQL.setConfig('api');

FloraQL.parse('user[type>9000 AND name="Bruce Wayne"]');
/*
 * [ [
 *     { attribute: ['user', 'type'], operator: '>', value: 9000 }, 
 *     { attribute: ['user', 'name'], operator: '=', value: "Bruce Wayne" }
 * ] ]
 */

FloraQL.parse('user[external OR internal].type=2');
/*
 * [ [
 *     { attribute: ['user', 'external', 'type'], operator: '=', value: 2 }
 *   ], 
 *   [
 *     { attribute: ['user', 'internal', 'type'], operator: '=', value: 2 }
 * ] ]
 */
```

### Human readable error statements

Every operation is synchronous and will throw a custom error object named ArgumentError if something is invalid. The message will provide additional information if possible about the error type and position inside the query string. Every Error type has a unique Error code as 'code' parameter and is available under /error/codes.json.

```js
const FloraQL = require('flora-ql');

FloraQL.setConfig('api');

try {
    FloraQL.parse('name="Bruce Wayne');
} catch(e) {
    // e.code    -> 2213
    // e.message -> Missing closing quotation mark for string starting at 'me="Bru' (pos: 6) 
}
```

### Highly customizable syntax

Special characters used in the queries are defined by a .json file under /config. There are already two predefined sets, called 'api' and 'alerting' and a default configuration. You can either use one of them by passing the name as string to setConfig() or provide an object with custom values which will extend the default configuration.  

```js
const FloraQL = require('flora-ql');

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
 * [ [
 *     { attribute: ['user', 'external', 'type'], operator: '=', value: 2 }
 *   ], 
 *   [
 *     { attribute: ['user', 'internal', 'type'], operator: '=', value: 2 }
 * ] ]
 */
```

## Developer Doc

### Input

```
article[id=1 AND (author[firstname AND lastname][str="true" OR master=true])]
```

### tokenizer()

```
e0[e1 AND (e2[e3 AND e4][e5 OR e6])]

 { e0: { attribute: 'article', operator: null, value: [], config: [Object] },
   e1: { attribute: 'id', operator: '=', value: 1, config: [Object] },
   e2: { attribute: 'author', operator: null, value: [], config: [Object] },
   e3: { attribute: 'firstname', operator: null, value: [], config: [Object] },
   e4: { attribute: 'lastname', operator: null, value: [], config: [Object] },
   e5: { attribute: 'str', operator: '=', value: 'hel lo', config: [Object] },
   e6: { attribute: 'master', operator: '=', value: true, config: [Object] } }
```

### replaceOperators()

```
e0[e1*(e2[e3*e4+e7~e5+e6])]
```

### clearSquare()

```
(e0_1*e0_2_3_5*e0_2_4_5+e0_1*e0_2_3_6*e0_2_4_6)

  { e0: { attribute: 'article', operator: null, value: [], config: [Object] },
    e1: { attribute: 'id', operator: '=', value: 1, config: [Object] },
    e2: { attribute: 'author', operator: null, value: [], config: [Object] },
    e3: { attribute: 'firstname', operator: null, value: [], config: [Object] },
    e4: { attribute: 'lastname', operator: null, value: [], config: [Object] },
    e5: { attribute: 'str',operator: '=', value: 'hel lo', config: [Object] },
    e6: { attribute: 'master', operator: '=', value: true, config: [Object] },
    e0_1: { attribute: 'article.id', operator: '=', value: 1, config: [Object] },
    e0_2: { attribute: 'article.author', operator: null, value: [], config: [Object] },
    e0_2_3: { attribute: 'article.author.firstname', operator: null, value: [], config: [Object] },
    e0_2_3_5: { attribute: 'article.author.firstname.str', operator: '=', value: 'hel lo', config: [Object] },
    e0_2_4: { attribute: 'article.author.lastname', operator: null, value: [], config: [Object] },
    e0_2_4_5: { attribute: 'article.author.lastname.str', operator: '=', value: 'hel lo', config: [Object] },
    e0_2_3_6: { attribute: 'article.author.firstname.master', operator: '=', value: true, config: [Object] },
    e0_2_4_6: { attribute: 'article.author.lastname.master', operator: '=', value: true, config: [Object] } }
```

### simplify()

```
e0_1*e0_2_3_5*e0_2_4_5+e0_1*e0_2_3_6*e0_2_4_6
```

### beautify()

```
[  [  {"attribute":["article","id"],"operator":"=","value":1},
      {"attribute":["article","author","firstname","str"],"operator":"=","value":"hel lo"},
      {"attribute":["article","author","lastname","str"],"operator":"=","value":"hel lo"}
   ],
   [  {"attribute":["article","id"],"operator":"=","value":1},
      {"attribute":["article","author","firstname","master"],"operator":"=","value":true},
      {"attribute":["article","author","lastname","master"],"operator":"=","value":[null,2,true,4]}
]  ]
```

## CHANGELOG

### 2.5.0

- Feature: Allow whitespaces anywhere

### 2.4.1

- Bugfix: multiple ANDs behind/ahead a bracket

## License

[MIT](LICENSE)
