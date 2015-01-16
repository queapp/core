Blocks Api
===

###@0.7

- **warn(msg)** - Log message to block's console, but with warning priority.
```javascript
que.warn("Hmm, this isn't right.");
```

- **error(msg)** - Log message to block's console, but with error priority.
```javascript
que.warn("Something just went wrong.");
```

###@0.5

- **getActions(thing)** - returns an object containing each action name of the thing as
keys and convenient `.trigger` and `.detrigger` methods to trigger the action.
```javascript
que.getThingByTag("spark", function(thing, n) {
  que.getActions(thing).ACTION.trigger(function() {
    que.log("Triggered action named ACTION on all things with a tag of spark");
  });
});
```

- **whenTime(h, m, s, callback)** - if the time is what has been specified, then run the callback.
Time is specified in 24-hour clock, starting with hours, minutes, then seconds.
```javascript
que.whenTime(12, 0, 0, function() {
  que.log("It's Noon!");
});
```

- **getCanvas(id, key)** - Takes a thing id, and the key of a record inside (hover over the label
to see the key name). Returns an object with all the canvas drawing functions:

  - **clear(x, y, w, h)** - Clear the area specified. If arguments are left out the
  whole canvas will be cleared.

  - **line(nodes, fill, stroke, options)** - Draws a between all points specified in `nodes`.

  - **rect(x, y, w, h, fill, stroke)** - Draws a rectangle.  If arguments are left out the
  rectangle will be the size of the whole canvas.

  - **imageFromUrl(src, x, y)** - Draws an image specified by src, from a HTTP URI,
  at the specified position.

  - **text(text, x, y)** - draw text at the specified position.

```javascript
c = que.getCanvas(1, "key");
c.clear();
c.rect(10, 10, 60, 60);
c.text("Hello, World!", 80, 0);
```

###@v0.4

- **getThingByTag(tag, callback)** - Get a thing by its tag. The callback function
runs once for each thing. Hover over a thing's name to see its tag.
```javascript
que.getThingByTag("sample", function(thing, n) {
  que.log("Thing:", thing, " match number ", n);
});
```

  - **NOTE** - the thing object above contains some helpful atributes:
    - `thing.data` is an object with a thing's controls within it.
    `thing.data.CONTROL.value` will give you the contents.
    - `thing.name` and `thing.desc` contain the thing's name and
    description, respectively.
    - `thing.tags` is an array of tags for the thing.


- **setThingValue(id, key, value, callback)** - Set a thing's data value. Must specify
an id of a thing, the key to change, and the new perspective value. Optional callback -
if the first argument is true the operation succeeded.
```javascript
que.getThingByTag("sample", function(thing) {
  que.setThingValue(thing.id, "showMessage", true);
});
```


- **log(msg)** - Log message to block's console.
```javascript
que.log("Hello World");
```

- **notify(body, title)** - send a notification to the user, which shows up on the
dashboard. **Don't spam the user with unneccisary notifications**
```javascript
que.notify("message contents", "Notification title");
```
