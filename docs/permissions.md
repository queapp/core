Permission List
===

Things
---
- thing.view.all
- thing.view.#id

- thing.create
- thing.edit.#id
- thing.delete.#id

- thing.actions.view.#id

- thing.control.create.#id
- thing.control.delete.#id
- thing.control.read.[name].#id
- thing.control.write.[name].#id

Rooms
---
- room.view.all
- room.view.#id

- room.create
- room.thing.add.#id
- room.thing.delete.#id
- room.delete.#id

Blocks
---
- block.view.all
- block.view.#id

- block.create
- block.delete.#id

- block.code.view.#id
- block.code.edit.#id

- block.disable.#id

Notifys
---
=======
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
token.view |  Allows a user to ... |
token.edit |  Allows a user to ... |

Users
---
Permission                     | Description | Example
-------------------------------|-------------|--------
**Users CRUD Operations** |
user.view.all | Allows a user to view all user accounts |
user.create | Allows a user to create a new user account |
user.delete.`#id` | Allows a user to delete a user account, indicated by `id` | user.delete.2
