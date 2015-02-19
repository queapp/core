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
---


Rooms
---
- room.view.all
- room.view.`#id`

- room.create
- room.thing.add.`#id`
- room.thing.delete.`#id`
- room.delete.`#id`

Blocks
---
- block.view.all
- block.view.`#id`

- block.create
- block.delete.`#id`

- block.code.view.`#id`
- block.code.edit.`#id`

- block.disable.`#id`

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
