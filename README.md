# Welcome

## What is this

Args plus is a command handler made for the [discord.js library][discord.js]

## What can args plus do

Args plus has the ability to do many things, such as:
<br />

-   Load message commands and slash commands with the same run method (Ie you only need to write the code once per command for slash and message commands)
-   Intergrated discord.js V13 and typescript
-   Intergrated MongoDB with mongoose
-   wide settings of customisibility (for example you can get the bot to send embeds or regular text messages by default)
-   Reduces repetitive code with the argument or "args" system. This is because you can look for things like channel mentions (which will look for mention or channel ID) and things like that
-   The abilitiy to load "configurations", which are settings stored on mongoDB, and cached on startup
-   Great built in commands

# Please referto the [wiki][wiki] for documentation

[wiki]: https://github.com/args-plus/args-plus/wiki

<!-- # Installation

This isnt an npm package, rather args plus offers a framework in which you can customise
<br />
<br />

## Getting the framework

### Creating your repository

![Press the "use this template button"][image1]

1. Press the "use this template button"

---

![Answer the fields on the pop up][image2]

1. Enter the name for your new bot
2. Enter the optional description for your new repository
3. Make it private or public
4. Press the button!

### Downloading the base for your new bot

Using the terminal, navigate to the folder you want to save the bot in your pc.

1. Open the terminal
2. Navigate to the folder using commands such as
   `cd`
   For example: `cd Documents`
3. Once you are in the desired folder for your bot run the command:
   `git clone https://github.com/[username]/[new-repository-name]`<br /> Replace [username] with your github username and [new-repository-name] with your new repository name
4. You will be prompted to enter your username and password, it is recommended you follow [this guide][gitcloneguide] to see how to login to github
5. Once you are done the output should look something like:
   ![Succesful clone][image4]

### Opening with our IDE

Now you want to open your new bot, I will be using Visual Studio Code, so I can use this command in the command line:
`code [new-repository-name]`
<br /> Replace [new-repository-name] with your new repository name

---

The project should now open in visual studio code
![Open in visual studio code][image6]

### Getting your bot started for the first time

This can be done in a few clicks

1. Run the command `npm install` in the project terminal, this will automatically install all thenpm packages, including typescript
2. Go to the folder src
3. Create a file just called `.env`
4. Open the file and paste this in:

```
token=BOTTOKEN
mongoURI=MONGOURI
```

5. Replace BOTTOKEN with your discord bot token and MONGOURI with your mongo URI
6. Run `npm run start` in the terminal, the bot will automatically start up

#### Turning on your but a second time

1. Open the terminal and run `npm run start`
2. Everytime you change a typescript file, the bot should automatically restart, if it doesnt, press `CTRL + C` in the terminal to end the current process and run `npm run start` again

### Updating the command handler

This involves a few more steps, but is worth it in the end

1. Open the project terminal and run `git remote add template https://github.com/abisammy/args-plus`
2. Recieve updates by running: `git fetch --all`
3. To update the command handler run `git merge template/master --allow-unrelated-histories`
   <br />
   Replace master with your current branch for your repository, by default it is master

---

You mat get an error which says
`Automatic merge failed; fix conflicts manually an then commit result`
<br />
The simple fix would be to go to the problematic files (you would see an error and a red exclamation mark)
<br />
<br />
In visual studio code press `control + shift + p` to open the command pallete (you may have changed it) and type "Merge Conflict: ", you will see auto complete suggestions such as "Accept all incoming", select the one of your choosing
<br />
<br />
Your command handler _should_ be updated

[discord.js]: https://discord.js.org/#/
[gitcloneguide]: https://stackoverflow.com/questions/68775869/support-for-password-authentication-was-removed-please-use-a-personal-access-to/68781050#68781050
[image1]: https://github.com/abisammy/args-plus-guide/blob/master/images/one.png?raw=true
[image2]: https://github.com/abisammy/args-plus-guide/blob/master/images/two.png?raw=true
[image4]: https://github.com/abisammy/args-plus-guide/blob/master/images/four.png?raw=true
[image5]: https://github.com/abisammy/args-plus-guide/blob/master/images/five.png?raw=true
[image6]: https://github.com/abisammy/args-plus-guide/blob/master/images/six.png?raw=true
[image7]: https://github.com/abisammy/args-plus-guide/blob/master/images/seven.png?raw=true -->
