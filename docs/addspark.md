Setting up a Spark
---
### First of all
Make sure before you do anything mentioned here to add a spark token under the settings
tab, the keys section. Acquire a token [here](https://www.spark.io/build) (click on the
cog in the lower left)

### Add the thing
- Go to que's online web ui (if you don't know where that is its probably at
`[IP OF COMPUTER]:8000` or if you're running it locally it may be at `127.0.0.1:8000`);
- Click the "Things" tab on the top of the screen
- Click the green "Add a thing" button, or the plus button in the lower left if
  you've added things in the past.
- Enter in the information for the new thing - here's mine:

![1st screen](docs/spark-new-0.png)

- After clicking next, You'll be presented with a screen to type in your spark's ID
(you can find this in spark's Web IDE, the same page where you found the spark token above)

![spark id](docs/spark-new-1.png)

- On the last page, you'll see a map of the spark's pins. Here, you'll be naming each pin
based on what it does/controls. We're going to be controlling the onboard led in this example,
so in the box next to pin D0 type the name `led` (D0 will be connected to a LED)

![spark led name](docs/spark-new-2.png)

- Click Finish!

### Hardware
Connect your spark, following the diagram below.

![spark led schematic](docs/spark-led-schematic.png)

Plug it in and verify it has already been configured - the Spark should have a
breathing <span style="color: cyan;">cyan</span> light on it. If this is not the case, try
[connecting your spark](http://docs.spark.io/connect/).

### The moment of truth
Go back to the "Things" tab, and click the button. If all has been done right, the led
on the spark should turn on. If this doesn't happen, check to make sure you entered the
correct information for the spark's token and the spark's id. Also make sure that you copied
the block named '<Thing's name> Controller>' is enabled; ie, the Enable switch on the block is set
so it is colored yellow and says 'Disable'.
