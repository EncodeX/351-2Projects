/**
  21/05/18 - Activity 05 (Ray Tracing 01)

  Try to use glMatrix. So I decided to make the project run on a simple server.
  For glMatrix is a module stuctured library.

  + Modularized all classes

  25/04/18 - Activity 03

  I decided to add some update logs here to record what I have done between
  activity submissions.

  + Finally separated VBOBox into "world box" + "particle box"! Look into
    VBOBox.js to get more info.
  + Changed number of particles to 2 temporarily to make spring system.
  ? Seems camera's rotating still have some problems. But not a big deal. Fix
    it when free.
*/

import Main from '/main.js';

window.main = () => {
    var main = new Main();
    main.start();
};

window.drawResize = () => main.drawResize();
