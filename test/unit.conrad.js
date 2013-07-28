(function() {
  var tests = [
    function(callback) {
      module('API');
      test('Adding and killing jobs', function() {
        var job = function() { return true; };

        // Test adding one job:
        conrad.addJob('test1', job)
              .addJob('test2', { job: job })
              .addJob({ id: 'test3', job: job });

        ok(conrad.hasJob('test1'), 'conrad.addJob(string id, function job) works.');
        ok(conrad.hasJob('test2'), 'conrad.addJob(string id, { job: function }) works.');
        ok(conrad.hasJob('test3'), 'conrad.addJob({ id: string, job: function }) works.');

        // Test adding several jobs:
        conrad.addJob({ test4: job, test5: job })
              .addJob({ test6: { job: job }, test7: { job: job } })
              .addJob([{ id: 'test8', job: job }, { id: 'test9', job: job }]);

        ok(conrad.hasJob('test4') && conrad.hasJob('test5'), 'conrad.addJob({ id1: function, id2: function }) works.');
        ok(conrad.hasJob('test6') && conrad.hasJob('test7'), 'conrad.addJob({ id1: { job: function }, id2: { job: function } }) works.');
        ok(conrad.hasJob('test8') && conrad.hasJob('test9'), 'conrad.addJob([{ id: string, job: function }, { id: string, job: function }]) works.');

        // Test adding existing jobs:
        throws(
          function() {
            conrad.addJob('test1', job);
          },
          /Job with id "test1" already exists/,
          'conrad.addJob throws an error when adding a job with an already existing id.'
        );
        throws(
          function() {
            conrad.addJob([{ id: 'test10', job: job }, { id: 'test10', job: job }]);
          },
          /Job with id "test10" already exists/,
          'conrad.addJob throws an error when adding several jobs with the same id.'
        );

        // Test killing some jobs:
        conrad.killJob('test1')
              .killJob(['test2', 'test3']);

        ok(!conrad.hasJob('test1'), 'conrad.killJob(string id) works.');
        ok(!conrad.hasJob('test2') && !conrad.hasJob('test3'), 'conrad.killJob([ strings ]) works.');
        throws(
          function() {
            conrad.killJob('unaddedTest', job);
          },
          /Job "unaddedTest" not found/,
          'conrad.killJob throws an error when the requested job hasn\'t been added.'
        );

        // Test killing all jobs:
        conrad.killAll().clearHistory();
        ok('123456789'.split('').every(function(i) { return !conrad.hasJob('test' + i); }), 'conrad.killAll() works.');

        if (callback)
          callback();
      });
    },
    function(callback) {
      module('API');
      asyncTest('Statistics', function() {
        conrad.addJob({
          jobDone1: function() {},
          jobDone2: function() {},
          jobRunning1: function() { return true; },
          jobRunning2: function() { return true; },
          jobWaiting1: {
            job: function() {},
            after: 'jobRunning1'
          },
          jobWaiting2: {
            job: function() {},
            after: 'jobRunning2'
          }
        });

        setTimeout(function() {
          start();
          var stats = conrad.getStats();

          deepEqual(
            conrad.getStats().map(function(o) { return o.id; }).sort(),
            ['jobDone1', 'jobDone2', 'jobRunning1', 'jobRunning2', 'jobWaiting1', 'jobWaiting2'],
            'There are all the jobs in conrad.getStats()'
          );

          deepEqual(
            conrad.getStats('running').map(function(o) { return o.id; }).sort(),
            ['jobRunning1', 'jobRunning2'],
            'There are all and only the running jobs in conrad.getStats("running")'
          );

          deepEqual(
            conrad.getStats('waiting').map(function(o) { return o.id; }).sort(),
            ['jobWaiting1', 'jobWaiting2'],
            'There are all and only the waiting jobs in conrad.getStats("waiting")'
          );

          deepEqual(
            conrad.getStats('done').map(function(o) { return o.id; }).sort(),
            ['jobDone1', 'jobDone2'],
            'There are all and only the done jobs in conrad.getStats("done")'
          );

          deepEqual(
            conrad.getStats('jobDone1').map(function(o) { return o.id; }).sort(),
            ['jobDone1'],
            'There are all and only the jobs with id "jobDone1" in conrad.getStats("jobDone1")'
          );

          deepEqual(
            conrad.getStats(/jobDone/).map(function(o) { return o.id; }).sort(),
            ['jobDone1', 'jobDone2'],
            'There are all and only the jobs with id matching /jobDone1/ in conrad.getStats(/jobDone/)'
          );

          deepEqual(
            conrad.getStats('running', 'jobRunning1').map(function(o) { return o.id; }).sort(),
            ['jobRunning1'],
            'There are all and only the running jobs with id "jobRunning1" in conrad.getStats("running", "jobRunning1")'
          );

          deepEqual(
            conrad.getStats('running', /1/).map(function(o) { return o.id; }).sort(),
            ['jobRunning1'],
            'There are all and only the running jobs with id /1/ in conrad.getStats("running", /1/)'
          );

          if (callback)
            callback();
        }, 0);
      });
    },
    function(callback) {
      module('Scheduling');
      asyncTest('Dying jobs', function() {
        test1();

        function test1() {
          var count = 5;

          conrad.addJob({
            id: 'job1',
            job: function() {
              return !!(--count);
            }
          });

          setTimeout(function() {
            start();
            ok(!count, 'When a job returns false, it stops.');
            conrad.killAll().clearHistory();

            stop();
            test2();
          }, 50);
        }

        function test2() {
          var count = 5;

          conrad.addJob({
            id: 'job1',
            job: function() {
              return !!(--count);
            },
            end: function() {
              start();
              ok(!count, 'The "end" callback is executed when the job is done.');
              conrad.killAll().clearHistory();

              stop();
              test3();
            }
          });
        }

        function test3() {
          var count = 0;

          conrad.addJob({
            id: 'job1',
            count: 5,
            job: function() {
              count++;
              return true;
            },
            end: function() {
              start();
              equal(count, 5, 'When a "count" value is given, the job is executed this exact amount of times, and then stops.');
              conrad.killAll().clearHistory();

              stop();
              test4();
            }
          });
        }

        function test4() {
          var array = [];

          conrad.addJob({
            job1: {
              job: function() { array.push('a'); return true; },
              count: 10
            },
            job2: {
              job: function() { array.push('b'); return true; },
              count: 2,
              after: 'job1',
              end: function() {
                start();
                deepEqual(array, 'aaaaaaaaaabb'.split(''), 'When adding two jobs A and B, B having "A" as an "after" value, B starts only when A ends.');

                if (callback)
                  callback();
              }
            }
          });
        }
      });
    },
    function(callback) {
      module('Scheduling');
      asyncTest('Weight and jobs length', function() {
        function sleepJobFactory(time, callback) {
          return function() {
            var t = new Date().getTime();

            if (callback) callback();
            while (new Date().getTime() - t < time) {}

            return true;
          };
        }

        function checkError(v1, v2, error) {
          return Math.abs(v1 - v2) / (v1 / 2 + v2 / 2) < error;
        }

        var ERROR_MARGIN = 0.15;

        // Start first test:
        test1();

        function test1() {
          var count1 = 0,
              count2 = 0;

          conrad.addJob({
            job1: sleepJobFactory(3, function() { count1++; }),
            job2: sleepJobFactory(3, function() { count2++; })
          });

          setTimeout(function() {
            start();

            ok(checkError(count1, count2, 0.15), 'Two jobs taking the same time are executed "approximatively" the same number of times.');
            conrad.killAll().clearHistory();

            stop();
            test2();
          }, 100);
        }

        function test2() {
          var count1 = 0,
              count2 = 0;

          conrad.addJob({
            job1: sleepJobFactory(3, function() { count1++; }),
            job2: sleepJobFactory(6, function() { count2++; })
          });

          setTimeout(function() {
            start();

            ok(checkError(count1, count2 * 2, ERROR_MARGIN), 'A job taking twice more time than another is executed "approximatively" twice less times.');
            conrad.killAll().clearHistory();

            stop();
            test3();
          }, 100);
        }

        function test3() {
          var count1 = 0,
              count2 = 0;

          conrad.addJob({
            job1: sleepJobFactory(3, function() { count1++; }),
            job2: {
              job: sleepJobFactory(3, function() { count2++; }),
              weight: 0.5
            }
          });

          setTimeout(function() {
            start();

            ok(checkError(count1, count2 * 2, ERROR_MARGIN), 'A job weighting twice less time than another is executed "approximatively" twice less times.');

            if (callback)
              callback();
          }, 100);
        }
      });
    }
  ];

  var i = 0;

  function callNext() {
    var nextTest = tests[i++];

    conrad.killAll().clearHistory();
    if (nextTest)
      nextTest(callNext);
  }

  callNext();
})();
