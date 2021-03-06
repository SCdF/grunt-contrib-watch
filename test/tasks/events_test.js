'use strict';

var grunt = require('grunt');
var path = require('path');
var fs = require('fs');
var helper = require('./helper');

var fixtures = helper.fixtures;

function cleanUp() {
  helper.cleanUp([
    'events/node_modules',
    'events/lib/added.js'
  ]);
}

function writeAll(cwd) {
  var write = 'var one = true;';
  grunt.file.write(path.join(cwd, 'lib', 'added.js'), write);
  setTimeout(function() {
    grunt.file.write(path.join(cwd, 'lib', 'one.js'), write);
  }, 500);
  setTimeout(function() {
    grunt.file.delete(path.join(cwd, 'lib', 'added.js'));
  }, 500);
}

exports.events = {
  setUp: function(done) {
    cleanUp();
    fs.symlinkSync(path.join(__dirname, '../../node_modules'), path.join(fixtures, 'events', 'node_modules'));
    done();
  },
  tearDown: function(done) {
    cleanUp();
    done();
  },
  events: function(test) {
    test.expect(3);
    var cwd = path.resolve(fixtures, 'events');
    var assertWatch = helper.assertTask('watch:all', {cwd: cwd});
    assertWatch([function() {
      writeAll(cwd);
    }], function(result) {
      result = helper.unixify(result);
      helper.verboseLog(result);
      test.ok(result.indexOf('lib/added.js was indeed added') !== -1,
        'event not emitted when file added');
      test.ok(result.indexOf('lib/one.js was indeed changed') !== -1,
        'event not emitted when file changed');
      test.ok(result.indexOf('lib/added.js was indeed deleted') !== -1,
        'event not emitted when file deleted');
      test.done();
    });
  },
  onlyAdded: function(test) {
    test.expect(3);
    var cwd = path.resolve(fixtures, 'events');
    var assertWatch = helper.assertTask('watch:onlyAdded', {cwd: cwd});
    assertWatch([function() {
      writeAll(cwd);
    }], function(result) {
      result = helper.unixify(result);
      helper.verboseLog(result);
      test.ok(result.indexOf('lib/added.js was indeed added') !== -1,
        'event not emitted when file added');
      test.ok(result.indexOf('lib/one.js was indeed changed') === -1,
        'event should NOT have emitted when file changed');
      test.ok(result.indexOf('lib/added.js was indeed deleted') === -1,
        'event should NOT have emitted when file deleted');
      test.done();
    });
  },
  onlyChanged: function(test) {
    test.expect(3);
    var cwd = path.resolve(fixtures, 'events');
    var assertWatch = helper.assertTask('watch:onlyChanged', {cwd: cwd});
    assertWatch([function() {
      writeAll(cwd);
    }], function(result) {
      result = helper.unixify(result);
      helper.verboseLog(result);
      test.ok(result.indexOf('lib/added.js was indeed added') === -1,
        'event should NOT have emitted when file added');
      test.ok(result.indexOf('lib/one.js was indeed changed') !== -1,
        'event should have emitted when file changed');
      test.ok(result.indexOf('lib/added.js was indeed deleted') === -1,
        'event should NOT have emitted when file deleted');
      test.done();
    });
  },
  onlyDeleted: function(test) {
    test.expect(3);
    var cwd = path.resolve(fixtures, 'events');
    var assertWatch = helper.assertTask('watch:onlyDeleted', {cwd: cwd});
    assertWatch([function() {
      writeAll(cwd);
    }], function(result) {
      result = helper.unixify(result);
      helper.verboseLog(result);
      test.ok(result.indexOf('lib/added.js was indeed added') === -1,
        'event should NOT have emitted when file added');
      test.ok(result.indexOf('lib/one.js was indeed changed') === -1,
        'event should NOT have emitted when file changed');
      test.ok(result.indexOf('lib/added.js was indeed deleted') !== -1,
        'event should have emitted when file deleted');
      test.done();
    });
  },
  onlyAddedAndDeleted: function(test) {
    test.expect(3);
    var cwd = path.resolve(fixtures, 'events');
    var assertWatch = helper.assertTask('watch:onlyAddedAndDeleted', {cwd: cwd});
    assertWatch([function() {
      writeAll(cwd);
    }], function(result) {
      result = helper.unixify(result);
      helper.verboseLog(result);
      test.ok(result.indexOf('lib/added.js was indeed added') !== -1,
        'event should have emitted when file added');
      test.ok(result.indexOf('lib/one.js was indeed changed') === -1,
        'event should NOT have emitted when file changed');
      test.ok(result.indexOf('lib/added.js was indeed deleted') !== -1,

        'event should have emitted when file deleted');
      test.done();
    });
  },
  targetSpecific: function(test) {
    test.expect(2);
    var cwd = path.resolve(fixtures, 'events');
    var assertWatch = helper.assertTask('watch', {cwd: cwd});
    assertWatch([function() {
      var write = 'var test = false;';
      setTimeout(function() {
        grunt.file.write(path.join(cwd, 'lib/one', 'test.js'), write);
      }, 300);
      setTimeout(function() {
        grunt.file.write(path.join(cwd, 'lib/two', 'test.js'), write);
      }, 300);
    }], function(result) {
      result = helper.unixify(result);
      helper.verboseLog(result);
      test.ok(result.indexOf('lib/one/test.js was indeed changed\ntargetOne specific event was fired') !== -1,
        'event should have been emitted with targetOne specified');
      test.ok(result.indexOf('lib/two/test.js was indeed changed\ntargetTwo specific event was fired') !== -1,
        'event should have been emitted with targetTwo specified');
      test.done();
    });
  },
  changeTasks: function(test) {
    test.expect(2);
    var cwd = path.resolve(fixtures, 'events');
    var assertWatch = helper.assertTask('watch:changeTasks', {cwd: cwd});
    assertWatch([function() {
      writeAll(cwd);
    }], function(result) {
      result = helper.unixify(result);
      helper.verboseLog(result);
      test.ok(result.indexOf('I havent changed') === -1, 'should not run task that was previously set');
      test.ok(result.indexOf('Ive changed') !== -1, 'should run task set in event listener');
      test.done();
    });
  }
};
