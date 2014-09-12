/**
 * Import controller
 */
var path = require('path'),
  fs = require('fs'),
  jf = require('jsonfile'),
  AdmZip = require('adm-zip'),
  moment = require('moment'),
  _ = require('underscore'),
  finder = require('fs-finder');

var config = jf.readFileSync(configFile);

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

App.controller('ImportCtrl', function ($scope, $rootScope, $activityIndicator, toaster, ImportFactory) {

  $activityIndicator.startAnimating();
  $rootScope.showLoading = false;

  $scope.readyImport = false;
  $scope.importedFile = [];

  $scope.fileChange = function (element) {
    var file = element.files[0];
    $scope.$apply(function () {
      $scope.filePath = file.path; // full file path
      $scope.fileZipName = path.basename(file.path).toUpperCase(); // file name with uppercase
      $scope.readyImport = true; // enabled button
      $scope.importedFile = []; // clear temp file list
    });
  };

  // Import file
  $scope.doImport = function () {

    $rootScope.showLoading = true;
    $scope.readyImport = false;

    var rnd = Math.floor(Math.random() * 10000000);
    var newExtractDir = path.join(tmpPath, moment().format('YYYYMMDDHHMMSS') + rnd);
    var zip = new AdmZip($scope.filePath);
    // create new directory
    fs.mkdirSync(newExtractDir);
    // extract file
    zip.extractAllTo(newExtractDir, true);

    finder.from(newExtractDir).findFiles(function (files) {
      var objFiles = [];

      // Assign fie name and path
      _.each(files, function (file) {
        var fileName = path.basename(file).toUpperCase();
        if (fileName == 'PERSON.TXT') objFiles.person = file;
        if (fileName == 'SERVICE.TXT') objFiles.service = file;
        if (fileName == 'DRUG_OPD.TXT') objFiles.drug_opd = file;
        if (fileName == 'DIAGNOSIS_OPD.TXT') objFiles.diagnosis_opd = file;
        if (fileName == 'PROCEDURE_OPD.TXT') objFiles.procedure_opd = file;
      });

      // Import file with promise
      var importPromise = ImportFactory
        .importPerson(objFiles.person, $scope.fileZipName);

      importPromise
        .then(function () {
          $scope.importedFile.push({fileName: 'PERSON', imported: true});
          return ImportFactory
            .importService(objFiles.service, $scope.fileZipName);
        })
        .then(function () {
          $scope.importedFile.push({fileName: 'SERVICE', imported: true});
          return ImportFactory
            .importDiagnosisOpd(objFiles.diagnosis_opd, $scope.fileZipName);
        })
        .then(function () {
          $scope.importedFile.push({fileName: 'DIAGNOSIS_OPD', imported: true});
          return ImportFactory
            .importDrugOpd(objFiles.drug_opd, $scope.fileZipName);
        })
        .then(function () {
          $scope.importedFile.push({fileName: 'DRUG_OPD', imported: true});
          return ImportFactory
            .importProcedureOpd(objFiles.procedure_opd, $scope.fileZipName);
        })
        .then(function() {
          $scope.importedFile.push({fileName: 'PROCEDURE_OPD', imported: true});
          $scope.readyImport = true;
          $rootScope.showLoading = false;

          toaster.pop('success', 'การนำเข้าข้อมูล', 'นำเข้าข้อมูลเสร็จเรียบร้อยแล้ว');

        }, function (err) {
          $rootScope.showLoading = false;
          toaster.pop('error', 'เกิดข้อผิดพลาด', 'ไม่สามารถนำเข้าข้อมูลได้ ['+err.code+']', 5000);
        });
    });

    // Remove old data with same file
//    var promise = ImportFactory.removeTmpPerson($scope.fileZipName);
//    promise
//      .then(function() {
//        return ImportFactory.removeTmpService($scope.fileZipName);
//      })
//      .then(function() {
//        return ImportFactory.removeTmpDiagnosisOpd($scope.fileZipName);
//      })
//      .then(function() {
//        return ImportFactory.removeTmpDrugOpd($scope.fileZipName);
//      })
//      .then(function() {
//        return ImportFactory.removeTmpProcedureOpd($scope.fileZipName);
//      })
//      .then(function() {
//
//        // search file
//
//
//      },
//      function(err) {
//        console.log('[Error] Remove old file: ' + err);
//      });
  };

});

App.factory('ImportFactory', function ($q) {

  var importFactory = {};

  importFactory.removePerson = function (fileId) {
    var q = $q.defer();

    knex('tmp_person')
      .where('file_id', fileId)
      .delete()
      .exec(function(err) {
        if (err) q.reject(err);
        else q.resolve();
      });

    return q.promise;
  };

  // remove tmp service
  importFactory.removeService = function (fileId) {
    var q = $q.defer();

    knex('tmp_service')
      .where('file_id', fileId)
      .delete()
      .exec(function(err) {
        if (err) q.reject(err);
        else q.resolve();
      });

    return q.promise;
  };
  // remove tmp drug opd
  importFactory.removeDrugOpd = function (fileId) {
    var q = $q.defer();

    knex('tmp_drug_opd')
      .where('file_id', fileId)
      .delete()
      .exec(function(err) {
        if (err) q.reject(err);
        else q.resolve();
      });

    return q.promise;
  };
  // remove tmp Diagnosis Opd
  importFactory.removeDiagnosisOpd = function (fileId) {
    var q = $q.defer();

    knex('tmp_diagnosis_opd')
      .where('file_id', fileId)
      .delete()
      .exec(function(err) {
        if (err) q.reject(err);
        else q.resolve();
      });

    return q.promise;
  };
  // remove tmp Diagnosis Opd
  importFactory.removeProcedureOpd = function (fileId) {
    var q = $q.defer();

    knex('tmp_procedure_opd')
      .where('file_id', fileId)
      .delete()
      .exec(function(err) {
        if (err) q.reject(err);
        else q.resolve();
      });

    return q.promise;
  };

  importFactory.importPerson = function (file, fileId) {
    var q = $q.defer();
/*
 (hospcode, cid, pid, hid, prename, name, lname, hn, sex, birth, mstatus, occupation_old, occupation_new, race, nation, religion, education, fstatus, father, mother, couple, vstatus, movein, discharge, ddischarge, abogroup, rhgroup, labor, passport, typearea, d_update)
 */
    knex.raw(
      'LOAD DATA LOCAL INFILE ? REPLACE INTO TABLE person FIELDS TERMINATED BY "|" LINES TERMINATED BY "\n" IGNORE 1 ROWS (hospcode, cid, pid, hid, prename, name, lname, hn, sex, @birth, mstatus, occupation_old, occupation_new, race, nation, religion, education, fstatus, father, mother, couple, vstatus, @movein, discharge, @ddischarge, abogroup, rhgroup, labor, passport, typearea, @d_update) SET file_id=?, birth=STR_TO_DATE(@birth, "%Y%m%d"), movein=STR_TO_DATE(@movein, "%Y%m%d"), ddischarge=STR_TO_DATE(@ddischarge, "%Y%m%d"), d_update=STR_TO_DATE(@d_update, "%Y%m%d%H%i%s");',
      [file, fileId])
      .then(function(rep) {
        q.resolve();
      }, function (err) {
        console.log(err);
        q.reject(err);
      });

    return q.promise;
  };

  importFactory.importService = function (file, fileId) {
    var q = $q.defer();

    knex.raw(
      'LOAD DATA LOCAL INFILE ? REPLACE INTO TABLE service FIELDS TERMINATED BY "|" LINES TERMINATED BY "\n" IGNORE 1 ROWS (hospcode, pid, hn, seq, @date_serv, @time_serv, location, intime, instype, insid, main, typein, referinhosp, causein, chiefcomp, servplace, btemp, sbp, dbp, pr, rr, typeout, referouthosp, causeout, cost, price, payprice, actualpay, @d_update) SET file_id=?, date_serv=STR_TO_DATE(@date_serv, "%Y%m%d"), time_serv=STR_TO_DATE(@time_serv, "%H%i%s"), d_update=STR_TO_DATE(@d_update, "%Y%m%d%H%i%s");',
      [file, fileId])
      .then(function(rep) {
        q.resolve();
      }, function (err) {
        q.reject(err);
      });

    return q.promise;
  };


  importFactory.importDiagnosisOpd = function (file, fileId) {
    var q = $q.defer();

    knex.raw(
      'LOAD DATA LOCAL INFILE ? REPLACE INTO TABLE diagnosis_opd FIELDS TERMINATED BY "|" LINES TERMINATED BY "\n" IGNORE 1 ROWS (hospcode, pid, seq, @date_serv, diagtype, diagcode, clinic, provider, @d_update) SET file_id=?, date_serv=STR_TO_DATE(@date_serv, "%Y%m%d"), d_update=STR_TO_DATE(@d_update, "%Y%m%d%H%i%s");',
      [file, fileId])
      .then(function(rep) {
        q.resolve();
      }, function (err) {
        q.reject(err);
      });

    return q.promise;
  };

  importFactory.importDrugOpd = function (file, fileId) {
    var q = $q.defer();

    knex.raw(
      'LOAD DATA LOCAL INFILE ? REPLACE INTO TABLE drug_opd FIELDS TERMINATED BY "|" LINES TERMINATED BY "\n" IGNORE 1 ROWS (hospcode, pid, seq, @date_serv, clinic, didstd, dname, amount, unit, unit_packing, drugprice, drugcost, provider, @d_update) SET file_id=?, date_serv=STR_TO_DATE(@date_serv, "%Y%m%d"), d_update=STR_TO_DATE(@d_update, "%Y%m%d%H%i%s");',
      [file, fileId])
      .then(function(rep) {
        q.resolve();
      }, function (err) {
        q.reject(err);
      });

    return q.promise;
  };

  importFactory.importProcedureOpd = function (file, fileId) {
    var q = $q.defer();

    knex.raw(
      'LOAD DATA LOCAL INFILE ? REPLACE INTO TABLE procedure_opd FIELDS TERMINATED BY "|" LINES TERMINATED BY "\n" IGNORE 1 ROWS (hospcode, pid, seq, @date_serv, clinic, procedcode, serviceprice, provider, d_update) SET file_id=?, date_serv=STR_TO_DATE(@date_serv, "%Y%m%d"), d_update=STR_TO_DATE(@d_update, "%Y%m%d%H%i%s");',
      [file, fileId])
      .then(function(rep) {
        q.resolve();
      }, function (err) {
        q.reject(err);
      });

    return q.promise;
  };

  return importFactory;
});