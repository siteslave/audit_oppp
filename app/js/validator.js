/**
 * Validator controller
 */
var path = require('path'),
fs = require('fs'),
jf = require('jsonfile'),
_ = require('underscore'),
gui = require('nw.gui');

var appPath = gui.App.dataPath,
    configFile = path.join(appPath, 'config.json'),

    config = jf.readFileSync(configFile);

var knex = require('knex')({
  client: 'mysql',
  connection: {
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password,
    database: config.database
  },
  pool: {
    min: 0,
    max: 20
  }
});

App.controller('ValidatorCtrl', function ($scope, $rootScope, ValidatorFactory, $activityIndicator, toaster) {

  $activityIndicator.startAnimating();
  $rootScope.showLoading = false;
  $scope.isChecking = false;

  ValidatorFactory.getFiles()
    .then(function (rows) {
      var files = [];
      _.each(rows, function (v) {
        files.push(v.file_id);
      });

      $scope.files = files;
    }, function (err) {
      toaster.pop('error', 'เกิดข้อผิดพลาด', err, 5000);
    });

  $scope.doCheckFile = function (file) {

    $rootScope.showLoading = true;
    $scope.results = [];
    $scope.isChecking = true;

    ValidatorFactory.clearFlags('person', file)
      .then(function () {
        return ValidatorFactory.getPerson(file);
      })
      .then(function (data) {
        return ValidatorFactory.doCheckPerson(data);
      })
      .then(function (data) {
        // update data
        return ValidatorFactory.doUpdateErrorCode('person', data);
      })
      .then(function () {
        return ValidatorFactory.getResult('person', file);
      })
      .then(function(data) {
        $scope.results.push({
          file_name: 'PERSON',
          total: data.total,
          total_pass: data.total_pass,
          total_error: data.total_error
        });

        //return ValidatorFactory.setImported(file);
      })
      .then(function() {
        var indexFile = _.indexOf($scope.files, file);
        $scope.files.splice(indexFile, 1);
        $rootScope.showLoading = false;
        $scope.isChecking = false;
        toaster.pop('success', 'Success', 'ตรวจสอบข้อมูลเสร็จเรียบร้อยแล้ว', 5000);
      }, function (err) {
        toaster.pop('error', 'เกิดข้อผิดพลาด', err, 5000);
      })
  };

});

App.factory('ValidatorFactory', function ($q) {

  var validatorFactory = {};

  validatorFactory.getFiles = function () {
    var q = $q.defer();
    knex('imported_files')
      .where('validated', 'N')
      .exec(function (err, rows) {
        if (err) q.reject(err);
        else q.resolve(rows);
      });

    return q.promise;
  };

  // clear flags
  validatorFactory.clearFlags = function (table, file_id) {

    var q = $q.defer();
    knex(table)
      .where('FILE_ID', file_id)
      .update({
        ERROR_CODE: ''
      })
      .exec(function (err) {
        if (err) q.reject(err);
        else q.resolve();
      });

    return q.promise;

  };

  // Get person
  validatorFactory.getPerson = function (f) {
    var q = $q.defer();
    /*
     select p.*, cm.mstatus as mstatus_code, co.id_occupation_new as occupation_new_code,
     cr.id_race as race_code, cn.nationcode as nation_code,
     cl.id_religion as religion_code, ce.educationcode as education_code,
     cd.dischargecode as discharge_code, cb.id_labor as labor_code,
     cf.id_fstatus as fstatus_code, cv.vstatuscode as vstatus_code,
     ca.abocode as abo_code, crh.rhcode as rh_code
     from person as p
     left join cmstatus as cm on cm.mstatus=p.MSTATUS
     left join coccupation_new as co on co.id_occupation_new=p.OCCUPATION_NEW
     left join crace as cr on cr.id_race=p.RACE
     left join cnation as cn on cn.nationcode=p.NATION
     left join creligion cl on cl.id_religion=p.RELIGION
     left join ceducation as ce on ce.educationcode=p.EDUCATION
     left join cdischarge as cd on cd.dischargecode=p.DISCHARGE
     left join clabor as cb on cb.id_labor=p.LABOR
     left join cfstatus as cf on cf.id_fstatus=p.FSTATUS
     left join cvstatus as cv on cv.vstatuscode=p.VSTATUS
     left join cabogroup as ca on ca.abocode=p.ABOGROUP
     left join crhgroup as crh on crh.rhcode=p.RHGROUP
     */
    knex('person as p')
      .select(
        'p.*', 'cm.mstatus as mstatus_code', 'co.id_occupation_new as occupation_new_code',
        'cr.id_race as race_code', 'cn.nationcode as nation_code',
        'cl.id_religion as religion_code', 'ce.educationcode as education_code',
        'cd.dischargecode as discharge_code', 'cb.id_labor as labor_code',
        'cf.id_fstatus as fstatus_code', 'cv.vstatuscode as vstatus_code',
        'ca.abocode as abo_code', 'crh.rhcode as rh_code'
      )
      .leftJoin('cmstatus as cm', 'cm.mstatus', 'p.MSTATUS')
      .leftJoin('coccupation_new as co', 'co.id_occupation_new', 'p.OCCUPATION_NEW')
      .leftJoin('crace as cr', 'cr.id_race', 'p.RACE')
      .leftJoin('cnation as cn', 'cn.nationcode', 'p.NATION')
      .leftJoin('creligion as cl', 'cl.id_religion', 'p.RELIGION')
      .leftJoin('ceducation as ce', 'ce.educationcode', 'p.EDUCATION')
      .leftJoin('cdischarge as cd', 'cd.dischargecode', 'p.DISCHARGE')
      .leftJoin('clabor as cb', 'cb.id_labor', 'p.LABOR')
      .leftJoin('cfstatus as cf', 'cf.id_fstatus', 'p.FSTATUS')
      .leftJoin('cvstatus as cv', 'cv.vstatuscode', 'p.VSTATUS')
      .leftJoin('cabogroup as ca', 'ca.abocode', 'p.ABOGROUP')
      .leftJoin('crhgroup as crh', 'crh.rhcode', 'p.RHGROUP')
      .where('p.FILE_ID', f)
      //.limit(10)
      .exec(function (err, rows) {
        if (err) q.reject(err);
        else q.resolve(rows);
      });

    return q.promise;

  };

  validatorFactory.getHome = function (f) {
    /*
     select h.*, ch.housetype as housetype_code, ct.tamboncode as tambon_code,
     ca.ampurcode as ampure_code, cw.changwatcode as changwat_code,
     p.PID as person_id, cl.id_locatype as locatype_code, cto.id_toilet as toilet_code,
     cwt.id_water as water_code, cwtt.id_watertype as watertype_code, cg.id_garbage as garbage_code,
     cho.id_housing as housing_code, cd.id_durability as durability_code,
     ccl.id_cleanliness as cleanliness_code, cv.id_ventilation as ventilation_code,
     cli.id_light as light_code, cwa.id_watertm as watertm_code, cmf.id_mfood as mfood_code,
     cbc.id_bcontrol as bcontrol_code, cac.id_acontrol as acontrol_code,
     cch.id_chemical as chemical_code

     from home as h
     left join chousetype as ch on ch.housetype=h.HOUSETYPE
     left join ctambon as ct on ct.tamboncode=h.TAMBON
     left join campur as ca on ca.ampurcode=h.AMPUR
     left join cchangwat as cw on cw.changwatcode=h.CHANGWAT
     left join person as p on p.HOSPCODE=h.HOSPCODE and p.HID=h.HID
     left join clocatype as cl on cl.id_locatype=h.LOCATYPE
     left join ctoilet as cto on cto.id_toilet=h.TOILET
     left join cwater as cwt on cwt.id_water=h.WATER
     left join cwatertype as cwtt on cwtt.id_watertype=h.WATERTYPE
     left join cgarbage as cg on cg.id_garbage=h.GARBAGE
     left join chousing as cho on cho.id_housing=h.HOUSING
     left join cdurability as cd on cd.id_durability=h.DURABILITY
     left join ccleanliness as ccl on ccl.id_cleanliness=h.CLEANLINESS
     left join cventilation as cv on cv.id_ventilation=h.VENTILATION
     left join clight as cli on cli.id_light=h.LIGHT
     left join cwatertm as cwa on cwa.id_watertm=h.WATERTM
     left join cmfood as cmf on cmf.id_mfood=h.MFOOD
     left join cbcontrol as cbc on cbc.id_bcontrol=h.BCONTROL
     left join cacontrol as cac on cac.id_acontrol=h.ACONTROL
     left join cchemical as cch on cch.id_chemical=h.CHEMICAL

     limit 10
     */
  };

  validatorFactory.doCheckPerson = function (data) {

    var q = $q.defer();

    var result = [];

    _.each(data, function (v) {
      var error = [];
      if (v.CID.length != 13) error.push('PE01');
      else {
        var sum = 0, i;
        for (i = 0; i < 12; i++)
        {
          sum += parseFloat(v.CID.charAt(i)) * (13 - i);
        }

        var valid = (11 - (sum % 11)) % 10 == parseFloat(v.CID.charAt(12));

        if (!valid) error.push('PE01');
      }

      if (!v.PID) error.push('PE02');
      if (!v.TYPEAREA) error.push('PE19');
      else {
        if (v.TYPEAREA == '3') {
          if (!v.HID) error.push('PE03');
        }
      }
      if (!v.PRENAME) error.push('PE04');
      if (!v.NAME) error.push('PE05');
      if (!v.LNAME) error.push('PE06');
      if (!v.SEX || !_.contains(['1', '2'], v.SEX)) error.push('PE07');
      if (!v.BIRTH || !moment(v.BIRTH).isValid()) error.push('PE08');
      if (!v.mstatus_code) error.push('PE09');
      if (!v.occupation_new_code) error.push('PE11');
      if (!v.race_code) error.push('PE12');
      if (!v.nation_code) error.push('PE13');
      if (!v.religion_code) error.push('PE14');
      if (!v.education_code) error.push('PE15');
      if (!v.discharge_code) error.push('PE16');
      if (v.NATION != '099') {
        if (!v.labor_code) error.push('PE18');
      }

      var birth_year = moment(v.BIRTH).format('YYYY'),
          current_year = moment().format('YYYY'),
          age = parseInt(current_year) - parseInt(birth_year);

      if (age > 110) error.push('PE22');
      if (!v.fstatus_code) error.push('PE23');
      //if (!v.vstatus_code) error.push('PE24');
      //if (!v.abogroup_code) error.push('PE25');
      //if (!v.rhgroup_code) error.push('PE26');
      if (error.length) {
        result.push({id: v.ID, error: error.join(',')});
      } else {
        result.push({id: v.ID, error: ''});
      }

    });

    q.resolve(result);
    return q.promise;

  };

  validatorFactory.doUpdateErrorCode = function (table, data) {

    var q = $q.defer();

    _.each(data, function (v) {

      //console.log(v);

      knex(table)
        .where('ID', v.id)
        .update({
          ERROR_CODE: v.error
        })
        .exec(function (err) {
          if (err) q.reject(err);
          else q.resolve();
        });
    });

    return q.promise;

  };

  validatorFactory.getResult = function (table, file_id) {

    var q = $q.defer();
     /* select
     (select count(*) FROM person WHERE FILE_ID="F43_04911_20140929150200.ZIP") as total,
     (select count(*) FROM person WHERE FILE_ID="F43_04911_20140929150200.ZIP" AND LENGTH(ERROR_CODE) = 0) as total_pass,
     (select count(*) FROM person WHERE FILE_ID="F43_04911_20140929150200.ZIP" AND LENGTH(ERROR_CODE) > 0) as total_error */
    var result = {
      total: 0,
      total_pass: 0,
      total_error: 0
    };

    knex(table).count('* as total').where('FILE_ID', file_id)
      .then(function (rows) {
        result.total = rows[0].total;
        return knex(table).where('FILE_ID', file_id).whereRaw('LENGTH(ERROR_CODE) = 0').count('* as total_pass');
      })
      .then(function (rows) {
        result.total_pass = rows[0].total_pass;
        return knex(table).where('FILE_ID', file_id).whereRaw('LENGTH(ERROR_CODE) > 0').count('* as total_error');
      })
      .then(function (rows) {
        result.total_error = rows[0].total_error;
        q.resolve(result);
      }, function (err) {
        q.reject(err);
      });

    return q.promise;
  };

  validatorFactory.setImported = function (file_id) {
    var q = $q.defer();
    knex('imported_files')
      .where('file_id', file_id)
      .update({
        validated: 'Y',
        validated_date: moment().format('YYYY-MM-DD HH:mm:ss')
      })
      .exec(function (err) {
        // update success
        if (err) q.reject(err);
        else q.resolve();
      });

    return q.promise;

  };

  return validatorFactory;

});