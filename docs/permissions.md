Permission List
===

Que permissions are pretty powerful. First of all, as many permissions can be added
for each user, which makes customization easy. Second of all, Que's permission's
system supports wildcards - so `a.*.c` matches both `a.b.c` and `a.foo.c` (the
[wildcard](https://www.npmjs.com/package/wildcard) package is used).

Reading this Document
---
When reading this document, keep in mind some of the conventions:
- `#id` - This refers to the id of something. It's totally ok to put a `*` here
  to match all ids.
- `#name` - This refers to the name of a control, within a thing (buttons,
  textboxes, etc). Again, it's totally ok to put a `*` here to match all names.

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
Permission                     | Description | Example
-------------------------------|-------------|--------
**Notifys CRUD Operations** |
notify.create | Allows a user to create a new notification |
notify.view.all | Allows a user to view all notifications |
notify.delete.`#id` | Allows a user to delete a notification, indicated by `id` | notify.delete.2

Auth Tokens
---
Permission                     | Description
-------------------------------|------------
**Auth CRUD Operations** |
token.view |  Allows a user to view all session tokens |
token.edit |  Allows a user to edit all session tokens |

Users
---
Permission                     | Description | Example
-------------------------------|-------------|--------
**Users CRUD Operations** |
user.view.all | Allows a user to view all user accounts |
user.create | Allows a user to create a new user account |
user.delete.`#id` | Allows a user to delete a user account, indicated by `id` | user.delete.2
