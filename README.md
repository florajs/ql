# Flora Query Language

Standalone Query Language parser used at the FLexible Open Rest Api with solid test coverage. 
Define your own powerful syntax to use for example for filtering through your data. 
It identifies the different parts of your input and returns these statements in 
a two dimensional array resolved in disjunctive normal form.


## Features

### Statements

A valid statement consists of three parts. An attribute, an operator and 
the value. Attributes can be made up of multiple fields, connected with a dot 
for example.

```javascript
var FloraQL = require('flora-ql');
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

Statements can be connected with AND and OR connectives. For the use of OR, it 
is necessary to support round brackets. Deeply nested constructions are supported 
as well and will be resolved.

```javascript
var FloraQL = require('flora-ql');
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

The parser does not necessarily need to understand different operator types. Thus you 
can use any operator you define. The values will be parsed, numbers will become numbers, 
strings will remain strings and boolean/null/undefined will become their corresponding data 
type. You can then use strictly equal operations on the value of every statement. 

```javascript
var FloraQL = require('flora-ql');
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

If you got multiple statements with similar attributes, you can shorten your query 
by using square brackets for grouping/scoping. These can even be used between your 
attributes and each bracket can itself contain deeply complex constructions with 
more brackets and connectives.

In case you can think of a better terminology, please let us know. :)

```javascript
var FloraQL = require('flora-ql');
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

Every operation is synchronous and will throw a custom error object named ArgumentError 
if something is invalid. The message will provide additional information if possible 
about the error type and position inside the query string. Every Error type has a 
unique Error code as 'code' parameter and is available under /error/codes.json.

```javascript
var FloraQL = require('flora-ql');
FloraQL.setConfig('api');

try {
    FloraQL.parse('name="Bruce Wayne');
} catch(e) {
    // e.code    -> 2213
    // e.message -> Missing closing quotation mark for string starting at 'me="Bru' (pos: 6) 
}
```


### Highly customizable syntax

Special characters used in the queries are defined by a .json file under /config. 
There are already two predefined sets, called 'api' and 'alerting' and a default 
configuration. You can either use one of them by passing the name as string to 
setConfig() or provide an object with custom values which will extend the 
default configuration.  


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
 * [ [
 *     { attribute: ['user', 'external', 'type'], operator: '=', value: 2 }
 *   ], 
 *   [
 *     { attribute: ['user', 'internal', 'type'], operator: '=', value: 2 }
 * ] ]
 */
```