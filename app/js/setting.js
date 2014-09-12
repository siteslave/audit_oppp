var jf = require('jsonfile'),
    config = jf.readFileSync(configFile),
    _ = require('underscore');

var knex = require('knex')({
  client: 'mysql',
  connection: {
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password,
    database: config.database
  }
});

App.controller('SettingCtrl', function ($scope, $rootScope, $activityIndicator, toaster, SettingFactory) {

  $scope.config = jf.readFileSync(configFile);
  $scope.hospitals = jf.readFileSync(hospitalsFile);
  $scope.readySsave = false;

  $scope.newHospitalName = '';
  $scope.newHospitalCode = '';

  $scope.doSave = function () {
    jf.writeFileSync(configFile, $scope.config);
    toaster.pop('success', 'บันทึกข้อมูล', 'บันทึกข้อมูลเสร็จเรียบร้อยแล้ว');
  };

  $scope.searchHospital = function (event) {
    if (event.keyCode == 13) {
      SettingFactory.searchHospital($scope.newHospitalCode)
        .then(function (data) {
          if (_.size(data)) {
            $scope.readySave = true;
            $scope.newHospitalName = data[0].hosptype + data[0].name;
          } else {
            $scope.newHospitalName = '*';
            $scope.readySave = false;
          }

        }, function (err) {
          $scope.readySave = false;
          console.log(err);
        });
    }

  };

  $scope.doAddHospital = function () {
    if ($scope.newHospitalName !== '*') {
      var obj = {
        hospcode: $scope.newHospitalCode,
        hospname: $scope.newHospitalName
      };

      var duplicated = _.findWhere($scope.hospitals, {hospcode: $scope.newHospitalCode});
      if (duplicated) {
        toaster.pop('info', 'ข้อมูลซ้ำ', 'มีรายการนี้อยู่แล้ว กรุณาเลือกรายการอื่น');
      } else {
        $scope.hospitals.push(obj);
        $scope.newHospitalCode = '';
        $scope.newHospitalName = '';
        $scope.readySave = false;
      }
    }
  };

  $scope.doRemoveHospital = function (index) {
    $scope.hospitals.splice(index, 1);
  };

  $scope.doSaveHospital = function () {
    jf.writeFileSync(hospitalsFile, $scope.hospitals);
    toaster.pop('success', 'บันทึก', 'บันทึกข้อมูลเสร็จเรียบร้อยแล้ว');
  }

});

App.factory('SettingFactory', function ($q) {
  var settingFactory = {};

  settingFactory.searchHospital = function ($h) {
    var deferred = $q.defer();

    knex('ref_hospcode')
      .where('hospcode', $h)
      .limit(1)
      .exec(function(err, data) {
        if (err) deferred.reject(err);
        else deferred.resolve(data);
      });

    return deferred.promise;
  };

  return settingFactory;
});