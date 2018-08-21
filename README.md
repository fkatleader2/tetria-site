# tetria
A live team based game where players compete against each other by stacking tetrominoes to clear lines to knock opponents out.

#### quick links:
- [site](#site)
- [TODO](#TODO)
- [versions](#versions)
<a name="site"></a>
## Site 
Default area users should be in when not playing. Includes user management, eg login / store / profile / setting up games, and general info about the tetria game(s).

**index.html** by default the page just loads news, about, shop, and login. Once user is logged in the page then preloads profile, game lobby. Note that some areas do not fully load until they are needed (to prevent large downloads).

**app.js** manages the page's naviation and general functionality. Also provides easy plugins and general utilities for those modules.
<a name="TODO"></a>
## TODO 
- implement captcha for signup / signin
<a name="versions"></a>
## Versions 
**3.0** initial beta version of game
