Permission List
===

Things
---

Permission                     | Description | Example
-------------------------------|-------------|--------
**Thing CRUD Operations** |
thing.view.all                 | Allows a user to view a list of all things |
thing.view.`#id`                 | Allows a user to view the controls for a specific thing, identified by `#id` | thing.view.2
thing.create                   | Allows a user to create a new thing |
thing.edit.`#id`                 | Allows a user to modify the name, description, tags, actions, or controls associated with a thing, identified by `#id`  | thing.edit.2
thing.delete.`#id`               | Allows a user to delete a thing, identified by `#id` | thing.view.2
**Action Reading** |
thing.actions.view.`#id`         | Allows a user to view a thing's actions, identified by `#id` | thing.actions.view.2
**Control CRUD Operations** |
thing.control.create.`#id`       | Allows a user to create a new control, within a thing | thing.control.create.2
thing.control.delete.`#id`       | Allows a user to delete controls from a thing identified by `#id` | thing.control.delete.2
thing.control.read.`#name`.`#id`  | Allows a user to read the data contained within a control, identified by `#name`, within a thing identified by `#id` | thing.control.read.control.2
thing.control.write.`#name`.`#id` | Allows a user to update the data contained within a control, identified by `#name`, within a thing identified by `#id` | thing.control.write.control.2


Rooms
---
<!-- TODO: room.view.#id does what exactly? -->

Permission                     | Description | Example
-------------------------------|-------------|--------
**Room CRUD Operations** |
room.view.all           | Allows a user to view a list of all rooms |
room.create             | Allows a user to create a new room |
room.edit.`#id`         | Allows a user to modify the name, description, and tags associated with a room, identified by `#id`  | room.edit.2
room.delete.`#id`       | Allows a user to delete a room, identified by `#id` | room.view.2
**Adding/removing things within a room** |
room.thing.add.`#id`    | Allows a user to add a thing to a room identified by `#id` | room.thing.add.2
room.thing.delete.`#id` | Allows a user to delete a thing to a room identified by `#id` | room.code.delete.2

Blocks
---
<!-- TODO: block.view.#id does what exactly? -->

Permission                     | Description | Example
-------------------------------|-------------|--------
**Block CRUD Operations** |
block.view.all           | Allows a user to view a list of all blocks |
block.create             | Allows a user to create a new block |
block.edit.`#id`         | Allows a user to modify the name, description, and tags associated with a block, identified by `#id`  | block.edit.2
block.delete.`#id`       | Allows a user to delete a block, identified by `#id` | block.view.2
**Adding/removing things within a block** |
block.code.view.`#id`    | Allows a user to view code in a block identified by `#id` | block.code.view.2
block.code.edit.`#id`    | Allows a user to edit code in a block identified by `#id` | block.code.edit.2
block.disable.`#id` | Allows a user to disable code execution within a block identified by `#id` | block.disable.2


Notifys
---
- notify.create
- notify.view.all
- notify.delete.`#id`

Auth Tokens
---
- token.view
- token.edit

Users
---
- user.view.all
- user.create
- user.delete.`#id`
