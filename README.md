conrad.js
=========

***conrad* is a tiny JavaScript scheduler, developped by [Alexis Jacomy](http://github.com/jacomyal) at the [médialab](http://github.com/medialab). It is released under the [MIT License](https://raw.github.com/jacomyal/conrad.js/master/LICENSE.txt).**

It has been initially built to replace the internal scheduler in *an upcoming version of* [sigma.js](http://sigmajs.org), that deals with graph layout algorithms and heavy canvas drawing processes.

Here is how it works:

 1. First, you need to cut your tasks as small jobs.
 2. These jobs are functions that will be executed many times to complete the task.
 3. *conrad* will execute these jobs such that they each take the same "computation time".
 4. To avoid interface freezing, rendering frames are requested when needed.

## Documentation

#### Add a single job

By default, a job is executed until it returns a "falsy" value:

```javascript
var executed = 0;

conrad.addJob('myJob', function() {
  return ++executed < 10;
});
```

#### Add several jobs simultaneously

It is possible to add several jobs at the same time, to avoid a job starting before others are actually added:

```javascript
var executed1 = 0,
    executed2 = 0;

conrad.addJob({
  myJob1: function() {
    return ++executed1 < 10;
  },
  myJob2: function() {
    return ++executed2 < 10;
  }
});
```

#### Specify how much times a job must be executed

Instead of waiting for the job to return `false` to end it, it is possible to specify a number of times it as to be executed, with the key `count`:

```javascript
var executed = 0;

conrad.addJob('myJob', {
  count: 10,
  job: function() {
    executed++;
  }
});
```

#### Catch a job end

If an `end` function is specified, it will be executed when the job is ended or killed.

```javascript
var executed = 0;

conrad.addJob('myJob', {
  job: function() {
    return ++executed < 10;
  },
  end: function() {
    console.log('Job executed ' + executed + ' times.');
  }
});
```

#### Queue jobs

Adding an `after` string to a job will make it start only when a job with the specified id ends.

```javascript
var executed1 = 0,
    executed2 = 0;

conrad.addJob({
  myJob1: function() {
    return ++executed1 < 10;
  },
  myJob2: {
    after: 'job1',
    job: function() {
      return ++executed2 < 10;
    }
  }
});
```

#### Weighted jobs

It is possible to weight jobs to modify the priorities. The default `weight` value is 1. In the following example, both `"myJob1"` and  `"myJob2"` last around 10ms. `"myJob1"` must be executed 10 times and `"myJob2"` 20. They will both end at the same time, because  `"myJob2"` as a `weight` of 2, and so will have twice more "*computer time*" than `"myJob1"`.

```javascript
var executed1 = 0,
    executed2 = 0;

function sleep(t) {
  var d = new Date().getTime();
  while (new Date().getTime() - d < t) {}
}

conrad.addJob({
  myJob1: function() {
    sleep(10);
    return ++executed1 < 10;
  },
  myJob2: {
    weight: 2,
    job: function() {
      sleep(10);
      return ++executed2 < 20;
    }
  }
});
```

#### Kill jobs

*conrad* provides two different methods to kill manually jobs that are running.

```javascript
// Kill one job:
if (conrad.hasJob('myJob1'))
  conrad.killJob('myJob1');

// Kill some jobs:
var jobsToKill = ['myJob1', 'myJob2', 'myJob3'];
if (jobsToKill.every(conrad.hasJob))
  conrad.killJob(jobsToKill);

// Kill all jobs:
conrad.killAll();
```

#### Monitoring

There are two features dedicated to monitor what is happening in *conrad*. First, the method `conrad.getStats()` returns an array of jobs, with every data stored about them (average time per job, number of times the job has been executed yet, etc...):

```javascript
// Getting all done jobs:
conrad.getStats('done');

// Getting all running jobs:
conrad.getStats('running');

// Getting all jobs with id "myJobId":
conrad.getStats('myJobId');

// Getting all jobs with id matching a regular expression:
conrad.getStats(/^myJob_/);

// Getting all running jobs with id matching a regular expression:
conrad.getStats('running', /^myJob_/);

// Logging in the console the average time per running job:
conrad.getStats('running').forEach(function(job) {
  console.log(job.id, job.averageTime);
});
```

Since storing everything about the jobs when they die can be memory expensive, it is possible to disable the history. Also, the method `conrad.clearHistory()` empties every data about done jobs.

```javascript
// Keeping conrad from storing history:
conrad.settings('history', false);

// Clearing history:
conrad.clearHistory();
```

Also, *conrad* dispatches custom events when some actions are executed (`"start"`, `"stop"`, `"enterFrame"`...). The methods `conrad.bind()` and `conrad.unbind()` make possible to bind and unbind functions to these events.

```javascript
var jobAddedHandler = function(e) {
      console.log('Job "' + e.data.id + '" added.');
    },
    jobStartedHandler = function(e) {
      console.log('Job "' + e.data.id + '" started.');
    },
    jobEndedHandler = function(e) {
      console.log('Job "' + e.data.id + '" ended.');
    },
    stopHandler = function(e) {
      console.log('conrad has stopped, let\'s unbind our handlers.');
      conrad.unbind('jobAdded', jobAddedHandler)
            .unbind('jobStarted', jobStartedHandler)
            .unbind('jobEnded', jobEndedHandler)
            .unbind('stop', stopHandler);
    },
    executed = 0;

// Bind handlers:
conrad.bind('jobAdded', jobAddedHandler)
      .bind('jobStarted', jobStartedHandler)
      .bind('jobEnded', jobEndedHandler)
      .bind('stop', stopHandler);

// Add the job:
conrad.addJob('myJob', function() {
  return ++executed < 10;
});
```

The events dispatched by *conrad* are:

 - `jobAdded`
 - `jobStarted`
 - `jobEnded`
 - `stop`
 - `start`
 - `enterFrame`

#### Some guidelines

Here are some tips and guidelines about how and when to use *conrad*:

 - To make *conrad* works well, jobs have to last less than the expected time of a frame - something like 20ms. Also, it is adviced to design your jobs such that they are not too quick, to reduce the number a function calls.
 - It is possible to use *conrad* to avoid interface freezing during drawing. Nevertheless, it should not be used to deal with animations, since the speed of the processing will strongly depends on the client computer power.
 - *conrad* works only with `window.setTimeout(fn, 0)` and does not use Web Workers (at least yet). It will work well until you call too often `window.setTimeout()` by yourself while *conrad* is running.

## Build

To use it, clone the repository:

```
git clone git@github.com:jacomyal/conrad.js.git
```

The latest minified version is available here:

[https://raw.github.com/jacomyal/conrad.js/master/build/conrad.min.js](https://raw.github.com/jacomyal/conrad.js/master/build/conrad.min.js)

You can also minify your own version with [Grunt](http://gruntjs.com/):

 - Install [Node.js](http://nodejs.org/), [NPM](https://npmjs.org/) and [Grunt](http://gruntjs.com/installing-grunt).
 - Use `npm install` to install *conrad* development dependencies.
 - Use `grunt` to check sources linting, launch unit tests, and minify the code with [Uglify](https://github.com/mishoo/UglifyJS).

## Contribute

**Contributions are welcome!** You can contribute by submitting [issues](http://github.com/jacomyal/conrad.js/issues) and proposing [pull requests](http://github.com/jacomyal/conrad.js/pulls). Be sure to successfully run `grunt` **before submitting any pull request**, to check unit tests and sources lint.

The whole source code is validated by the [Google Closure Linter](https://developers.google.com/closure/utilities/), and the comments are written in [JSDoc](http://en.wikipedia.org/wiki/JSDoc) (tags description is available [here](https://developers.google.com/closure/compiler/docs/js-for-compiler)).
