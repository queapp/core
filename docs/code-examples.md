Code Examples
===

These code examples are meant to be used as a starting point; *They cannot just be pasted in and expected to work*.


Trigger a pin when a control's value matches a specified value
---
```javascript
// trigger all of the pin 7's on all things with tag 'spark'
que.getThingByTag("spark", function(thing, n) {
  if (thing.data.control.value == "abc") {
    que.getActions(thing).PIND7.trigger(function(a,b,c) {
      que.log("ok");
    });
  }
});
```

Keep canvas up to date with an image source
---
```javascript
c = que.getCanvas(3, "aaavvv");
c.clear();
c.imageFromUrl("http://placehold.it/350x150", 0, 0);
```
