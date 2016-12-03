live-property-editor
====================

Demo: http://a13ks3y.github.io/live-property-editor/

Global JavaScript objects properties editor widget. Purposes: edit constants, coefficients etc. without reload page.

Not depend on other libraries

Tested in Chrome. HTML5 futures required (color, number input types, etc).


Usage example:
--------

```html
    <link rel="stylesheet" href="bootstrap.css"/>
    <link rel="stylesheet" href="jpe.css"/>
    <script type="text/javascript" src="jpe.js"></script>
```

```javascript
    var test = {

        foo : 'foo',
        bar : 'bar',
        number : 10,
        float : 42.27,
        color: '#ff0022',
        boolean : false,

        nested : {
            other : 'other',
            another : 'another'
        }

    };

    jpe(document.body, test);
```


Road map
--------

*   Styling (remove bootstrap.css, or update to 3 version)
*   Handle arrays
*   Handle knockout observables
*   Make widget draggable
*   Manual changing type of property handling (for cases when property type can not be detected correctly)
*   Optional slider for number fields


