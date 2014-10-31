/**
 * Import controller
 */
var path = require('path'),
  fs = require('fs'),
  jf = require('jsonfile'),
  AdmZip = require('adm-zip'),
  moment = require('moment'),
  _ = require('underscore'),
  finder = require('fs-finder'),
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

App.controller('ImportCtrl', function ($scope, $rootScope, $activityIndicator, toaster, ImportFactory) {

  $activityIndicator.startAnimating();
  $rootScope.showLoading = false;

  $scope.readyImport = false;
  $scope.importedFile = [];

  $scope.remainFile = 0;

  $scope.fileChange = function (element) {
    var file = element.files[0];
    $scope.$apply(function () {
      $scope.filePath = file.path; // full file path
      $scope.fileZipName = path.basename(file.path).toUpperCase(); // file name with uppercase
      $scope.readyImport = true; // enabled button
      $scope.importedFile = []; // clear temp file list
      $scope.remainFile = 0;
    });
  };

  // Import file
  $scope.doImport = function () {

    $scope.importedFile = [];
    $scope.remainFile = 0;

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
        if (fileName == 'HOME.TXT') objFiles.home = file;
        if (fileName == 'ADDRESS.TXT') objFiles.address = file;
        if (fileName == 'CHARGE_OPD.TXT') objFiles.charge_opd = file;
        if (fileName == 'ADMISSION.TXT') objFiles.admission = file;
        if (fileName == 'DIAGNOSIS_IPD.TXT') objFiles.diagnosis_ipd = file;
        if (fileName == 'DRUG_IPD.TXT') objFiles.drug_ipd = file;
        if (fileName == 'PROCEDURE_IPD.TXT') objFiles.procedure_ipd = file;
        if (fileName == 'CHARGE_IPD.TXT') objFiles.charge_ipd = file;
        if (fileName == 'ANC.TXT') objFiles.anc = file;
        if (fileName == 'EPI.TXT') objFiles.epi = file;
        if (fileName == 'FP.TXT') objFiles.fp = file;
        if (fileName == 'SURVEILLANCE.TXT') objFiles.surveillance = file;
        if (fileName == 'ACCIDENT.TXT') objFiles.accident = file;
        if (fileName == 'DRUGALLERGY.TXT') objFiles.drugallergy = file;
        if (fileName == 'DENTAL.TXT') objFiles.dental = file;
        if (fileName == 'CHRONIC.TXT') objFiles.chronic = file;
        if (fileName == 'NCDSCREEN.TXT') objFiles.ncdscreen = file;
        if (fileName == 'CHRONICFU.TXT') objFiles.chronicfu = file;
        if (fileName == 'LABFU.TXT') objFiles.labfu = file;
        if (fileName == 'PRENATAL.TXT') objFiles.prenatal = file;
        if (fileName == 'LABOR.TXT') objFiles.labor = file;
        if (fileName == 'POSTNATAL.TXT') objFiles.postnatal = file;
        if (fileName == 'NEWBORN.TXT') objFiles.newborn = file;
        if (fileName == 'NEWBORNCARE.TXT') objFiles.newborncare = file;
        if (fileName == 'NUTRITION.TXT') objFiles.nutrition = file;
        if (fileName == 'COMMUNITY_SERVICE.TXT') objFiles.community_service = file;
        if (fileName == 'COMMUNITY_ACTIVITY.TXT') objFiles.community_activity = file;
        if (fileName == 'DISABILITY.TXT') objFiles.disability = file;
        if (fileName == 'FUNCTIONAL.TXT') objFiles.functional = file;
        if (fileName == 'ICF.TXT') objFiles.icf = file;
        if (fileName == 'REHABILITATION.TXT') objFiles.rehabilitation = file;
        if (fileName == 'PROVIDER.TXT') objFiles.provider = file;
        if (fileName == 'VILLAGE.TXT') objFiles.village = file;
        if (fileName == 'APPOINTMENT.TXT') objFiles.appointment = file;
      });

      ImportFactory.checkImportedFile($scope.fileZipName)
        .then(function (total) {

          if (!total) {

            $rootScope.showLoading = true;
            $scope.readyImport = false;

            // Import file with promise
            var importPromise = ImportFactory
              .importPerson(objFiles.person, $scope.fileZipName);

            importPromise
              .then(function () {
                $scope.remainFile++;
                $scope.importedFile.push({fileName: 'PERSON', imported: true});
                return ImportFactory
                  .importService(objFiles.service, $scope.fileZipName);
              })
              .then(function () {
                $scope.remainFile++;
                $scope.importedFile.push({fileName: 'SERVICE', imported: true});
                return ImportFactory
                  .importVillage(objFiles.village, $scope.fileZipName);
              })
              .then(function () {
                $scope.remainFile++;
                $scope.importedFile.push({fileName: 'VILLAGE', imported: true});
                return ImportFactory
                  .importHome(objFiles.home, $scope.fileZipName);
              })
              .then(function () {
                $scope.remainFile++;
                $scope.importedFile.push({fileName: 'HOME', imported: true});
                return ImportFactory
                  .importAddress(objFiles.address, $scope.fileZipName);
              })
              .then(function () {
                $scope.remainFile++;
                $scope.importedFile.push({fileName: 'ADDRESS', imported: true});
                return ImportFactory
                  .importDiagnosisOpd(objFiles.diagnosis_opd, $scope.fileZipName);
              })
              .then(function () {
                $scope.remainFile++;
                $scope.importedFile.push({fileName: 'DIAGNOSIS_OPD', imported: true});
                return ImportFactory
                  .importDrugOpd(objFiles.drug_opd, $scope.fileZipName);
              })
              .then(function () {
                $scope.remainFile++;
                $scope.importedFile.push({fileName: 'DRUG_OPD', imported: true});
                return ImportFactory
                  .importProcedureOpd(objFiles.procedure_opd, $scope.fileZipName);
              })
              .then(function () {
                $scope.remainFile++;
                $scope.importedFile.push({fileName: 'PROCEDURE_OPD', imported: true});
                return ImportFactory
                  .importChargeOPD(objFiles.charge_opd, $scope.fileZipName);
              })
              .then(function () {
                $scope.remainFile++;
                $scope.importedFile.push({fileName: 'CHARGE_OPD', imported: true});
                return ImportFactory
                  .importAdmission(objFiles.admission, $scope.fileZipName);
              })
              .then(function () {
                $scope.remainFile++;
                $scope.importedFile.push({fileName: 'ADMISSION', imported: true});
                return ImportFactory
                  .importDiagnosisIpd(objFiles.diagnosis_ipd, $scope.fileZipName);
              })
              .then(function () {
                $scope.remainFile++;
                $scope.importedFile.push({fileName: 'DIAGNOSIS_IPD', imported: true});
                return ImportFactory
                  .importDrugIpd(objFiles.drug_ipd, $scope.fileZipName);
              })
              .then(function () {
                $scope.remainFile++;
                $scope.importedFile.push({fileName: 'DRUG_IPD', imported: true});
                return ImportFactory
                  .importProcedureIpd(objFiles.procedure_ipd, $scope.fileZipName);
              })
              .then(function () {
                $scope.remainFile++;
                $scope.importedFile.push({fileName: 'PROCEDURE_IPD', imported: true});
                return ImportFactory
                  .importChargeIpd(objFiles.charge_ipd, $scope.fileZipName);
              })
              .then(function () {
                $scope.remainFile++;
                $scope.importedFile.push({fileName: 'CHARGE_IPD', imported: true});
                return ImportFactory
                  .importANC(objFiles.anc, $scope.fileZipName);
              })
              .then(function () {
                $scope.remainFile++;
                $scope.importedFile.push({fileName: 'ANC', imported: true});
                return ImportFactory
                  .importAppointment(objFiles.appointment, $scope.fileZipName);
              })
              .then(function () {
                $scope.remainFile++;
                $scope.importedFile.push({fileName: 'APPOINTMENT', imported: true});
                return ImportFactory
                  .importEPI(objFiles.epi, $scope.fileZipName);
              })
              .then(function () {
                $scope.remainFile++;
                $scope.importedFile.push({fileName: 'EPI', imported: true});
                return ImportFactory
                  .importFP(objFiles.fp, $scope.fileZipName);
              })
              .then(function () {
                $scope.remainFile++;
                $scope.importedFile.push({fileName: 'FP', imported: true});
                return ImportFactory
                  .importSurveillance(objFiles.surveillance, $scope.fileZipName);
              })
              .then(function () {
                $scope.remainFile++;
                $scope.importedFile.push({fileName: 'SURVEILLANCE', imported: true});
                return ImportFactory
                  .importAccident(objFiles.accident, $scope.fileZipName);
              })
              .then(function () {
                $scope.remainFile++;
                $scope.importedFile.push({fileName: 'ACCIDENT', imported: true});
                return ImportFactory
                  .importDrugAllergy(objFiles.drugallergy, $scope.fileZipName);
              })
              .then(function () {
                $scope.remainFile++;
                $scope.importedFile.push({fileName: 'DRUGALLERGY', imported: true});
                return ImportFactory
                  .importDental(objFiles.dental, $scope.fileZipName);
              })
              .then(function () {
                $scope.remainFile++;
                $scope.importedFile.push({fileName: 'DENTAL', imported: true});
                return ImportFactory
                  .importChronic(objFiles.chronic, $scope.fileZipName);
              })
              .then(function () {
                $scope.remainFile++;
                $scope.importedFile.push({fileName: 'CHRONIC', imported: true});
                return ImportFactory
                  .importNCDScreen(objFiles.ncdscreen, $scope.fileZipName);
              })
              .then(function () {
                $scope.remainFile++;
                $scope.importedFile.push({fileName: 'NCDSCREEN', imported: true});
                return ImportFactory
                  .importChronicFU(objFiles.chronicfu, $scope.fileZipName);
              })
              .then(function () {
                $scope.remainFile++;
                $scope.importedFile.push({fileName: 'CHRONICFU', imported: true});
                return ImportFactory
                  .importLABFU(objFiles.labfu, $scope.fileZipName);
              })
              .then(function () {
                $scope.remainFile++;
                $scope.importedFile.push({fileName: 'LABFU', imported: true});
                return ImportFactory
                  .importPrenatal(objFiles.prenatal, $scope.fileZipName);
              })
              .then(function () {
                $scope.remainFile++;
                $scope.importedFile.push({fileName: 'PRENATAL', imported: true});
                return ImportFactory
                  .importLabor(objFiles.labor, $scope.fileZipName);
              })
              .then(function () {
                $scope.remainFile++;
                $scope.importedFile.push({fileName: 'LABOR', imported: true});
                return ImportFactory
                  .importPostnatal(objFiles.postnatal, $scope.fileZipName);
              })
              .then(function () {
                $scope.remainFile++;
                $scope.importedFile.push({fileName: 'POSTNATAL', imported: true});
                return ImportFactory
                  .importNewborn(objFiles.newborn, $scope.fileZipName);
              })
              .then(function () {
                $scope.remainFile++;
                $scope.importedFile.push({fileName: 'NEWBORN', imported: true});
                return ImportFactory
                  .importNewbornCare(objFiles.newborncare, $scope.fileZipName);
              })
              .then(function () {
                $scope.remainFile++;
                $scope.importedFile.push({fileName: 'NEWBORNCARE', imported: true});
                return ImportFactory
                  .importNutrition(objFiles.nutrition, $scope.fileZipName);
              })
              .then(function () {
                $scope.remainFile++;
                $scope.importedFile.push({fileName: 'NUTRITION', imported: true});
                return ImportFactory
                  .importCommunityService(objFiles.community_service, $scope.fileZipName);
              })
              .then(function () {
                $scope.remainFile++;
                $scope.importedFile.push({fileName: 'COMMUNITY_SERVICE', imported: true});
                return ImportFactory
                  .importCommunityActivity(objFiles.community_activity, $scope.fileZipName);
              })
              .then(function () {
                $scope.remainFile++;
                $scope.importedFile.push({fileName: 'COMMUNITY_ACTIVITY', imported: true});
                return ImportFactory
                  .importDisability(objFiles.disability, $scope.fileZipName);
              })
              .then(function () {
                $scope.remainFile++;
                $scope.importedFile.push({fileName: 'DISABILITY', imported: true});
                return ImportFactory
                  .importFunctional(objFiles.functional, $scope.fileZipName);
              })
              .then(function () {
                $scope.remainFile++;
                $scope.importedFile.push({fileName: 'FUNCTIONAL', imported: true});
                return ImportFactory
                  .importICF(objFiles.icf, $scope.fileZipName);
              })
              .then(function () {
                $scope.remainFile++;
                $scope.importedFile.push({fileName: 'ICF', imported: true});
                return ImportFactory
                  .importRehabilitation(objFiles.rehabilitation, $scope.fileZipName);
              })
              .then(function () {
                $scope.remainFile++;
                $scope.importedFile.push({fileName: 'REHABILITATION', imported: true});
                return ImportFactory
                  .importProvider(objFiles.provider, $scope.fileZipName);
              })
              .then(function() {
                $scope.remainFile++;
                $scope.importedFile.push({fileName: 'PROVIDER', imported: true});
                $scope.readyImport = true;
                $rootScope.showLoading = false;

                ImportFactory.saveImportedFile($scope.fileZipName);

                toaster.pop('success', 'การนำเข้าข้อมูล', 'นำเข้าข้อมูลเสร็จเรียบร้อยแล้ว');

              }, function (err) {
                $rootScope.showLoading = false;
                $scope.readyImport = true;
                toaster.pop('error', 'เกิดข้อผิดพลาด', 'ไม่สามารถนำเข้าข้อมูลได้ ['+err.code+']', 5000);
              });
          } else {
            $rootScope.showLoading = false;
            $scope.readyImport = true;
            toaster.pop('error', 'เกิดข้อผิดพลาด', 'ไฟล์นี้เคยนำเข้าระบบแล้วไม่สามารถนำเข้าได้อีก', 5000);
          }
        }, function (err) {
          $rootScope.showLoading = false;
          $scope.readyImport = true;
          toaster.pop('error', 'เกิดข้อผิดพลาด', err, 5000);
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

    knex('person')
      .where('FILE_ID', fileId)
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

    knex('service')
      .where('FILE_ID', fileId)
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

    knex('drug_opd')
      .where('FILE_ID', fileId)
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

    knex('diagnosis_opd')
      .where('FILE_ID', fileId)
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

    knex('procedure_opd')
      .where('FILE_ID', fileId)
      .delete()
      .exec(function(err) {
        if (err) q.reject(err);
        else q.resolve();
      });

    return q.promise;
  };

  // Add imported file
  importFactory.saveImportedFile = function (file_id) {
    knex('imported_files')
      .insert({
        file_id: file_id,
        imported_date: moment().format('YYYY-MM-DD HH:mm:ss')
      })
      .exec(function (err) {

      });
  };

  importFactory.checkImportedFile = function (file_id) {
    var q = $q.defer();

    knex('imported_files')
      .where('file_id', file_id)
      .count('* as t')
      .exec(function (err, rows) {
        if (err) q.reject(err);
        else q.resolve(rows[0].t);
      });

    return q.promise;
  };
  // Import data

  importFactory.importPerson = function (file, fileId) {
    var q = $q.defer();
    knex.raw(
      'LOAD DATA LOCAL INFILE ? REPLACE INTO TABLE person FIELDS TERMINATED BY "|" LINES TERMINATED BY "\n" IGNORE 1 ROWS (HOSPCODE, CID, PID, HID, PRENAME, NAME, LNAME, HN, SEX, @BIRTH, MSTATUS, OCCUPATION_OLD, OCCUPATION_NEW, RACE, NATION, RELIGION, EDUCATION, FSTATUS, FATHER, MOTHER, COUPLE, VSTATUS, @MOVEIN, DISCHARGE, @DDISCHARGE, ABOGROUP, RHGROUP, LABOR, PASSPORT, TYPEAREA, @D_UPDATE) SET BIRTH=STR_TO_DATE(@BIRTH, "%Y%m%d"), MOVEIN=STR_TO_DATE(@MOVEIN, "%Y%m%d"), DDISCHARGE=STR_TO_DATE(@DDISCHARGE, "%Y%m%d"), D_UPDATE=STR_TO_DATE(@D_UPDATE, "%Y%m%d%H%i%s"), FILE_ID=?, ERROR_CODE="UNKNOWN";',
      [file, fileId])
      .then(function() {
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
      'LOAD DATA LOCAL INFILE ? REPLACE INTO TABLE service FIELDS TERMINATED BY "|" LINES TERMINATED BY "\n" IGNORE 1 ROWS (HOSPCODE, PID, HN, SEQ, @DATE_SERV, @TIME_SERV, LOCATION, INTIME, INSTYPE, INSID, MAIN, TYPEIN, REFERINHOSP, CAUSEIN, CHIEFCOMP, SERVPLACE, BTEMP, SBP, DBP, PR, RR, TYPEOUT, REFEROUTHOSP, CAUSEOUT, COST, PRICE, PAYPRICE, ACTUALPAY, @D_UPDATE) SET DATE_SERV=STR_TO_DATE(@DATE_SERV, "%Y%m%d"), TIME_SERV=STR_TO_DATE(@TIME_SERV, "%H%i%s"), D_UPDATE=STR_TO_DATE(@D_UPDATE, "%Y%m%d%H%i%s"), FILE_ID=?, ERROR_CODE="UNKNOWN";', [file, fileId])
      .then(function() {
        q.resolve();
      }, function (err) {
        q.reject(err);
      });

    return q.promise;

  };


  importFactory.importDiagnosisOpd = function (file, fileId) {
    var q = $q.defer();

    knex.raw(
      'LOAD DATA LOCAL INFILE ? REPLACE INTO TABLE diagnosis_opd FIELDS TERMINATED BY "|" LINES TERMINATED BY "\n" IGNORE 1 ROWS (HOSPCODE, PID, SEQ, @DATE_SERV, DIAGTYPE, DIAGCODE, CLINIC, PROVIDER, @D_UPDATE) SET DATE_SERV=STR_TO_DATE(@DATE_SERV, "%Y%m%d"), D_UPDATE=STR_TO_DATE(@D_UPDATE, "%Y%m%d%H%i%s"), FILE_ID=?, ERROR_CODE="UNKNOWN";', [file, fileId])
      .then(function() {
        q.resolve();
      }, function (err) {
        q.reject(err);
      });

    return q.promise;
  };

  importFactory.importDrugOpd = function (file, fileId) {
    var q = $q.defer();

    knex.raw(
      'LOAD DATA LOCAL INFILE ? REPLACE INTO TABLE drug_opd FIELDS TERMINATED BY "|" LINES TERMINATED BY "\n" IGNORE 1 ROWS (HOSPCODE, PID, SEQ, @DATE_SERV, CLINIC, DIDSTD, DNAME, AMOUNT, UNIT, UNIT_PACKING, DRUGPRICE, DRUGCOST, PROVIDER, @D_UPDATE) SET DATE_SERV=STR_TO_DATE(@DATE_SERV, "%Y%m%d"), D_UPDATE=STR_TO_DATE(@D_UPDATE, "%Y%m%d%H%i%s"), FILE_ID=?, ERROR_CODE="UNKNOWN";', [file, fileId])
      .then(function() {
        q.resolve();
      }, function (err) {
        q.reject(err);
      });

    return q.promise;
  };

  importFactory.importProcedureOpd = function (file, fileId) {
    var q = $q.defer();

    knex.raw(
      'LOAD DATA LOCAL INFILE ? REPLACE INTO TABLE procedure_opd FIELDS TERMINATED BY "|" LINES TERMINATED BY "\n" IGNORE 1 ROWS (HOSPCODE, PID, SEQ, @DATE_SERV, CLINIC, PROCEDCODE, SERVICEPRICE, PROVIDER, @D_UPDATE) SET DATE_SERV=STR_TO_DATE(@DATE_SERV, "%Y%m%d"), D_UPDATE=STR_TO_DATE(@D_UPDATE, "%Y%m%d%H%i%s"), FILE_ID=?, ERROR_CODE="UNKNOWN";',
      [file, fileId])
      .then(function() {
        q.resolve();
      }, function (err) {
        q.reject(err);
      });

    return q.promise;
  };
  // Import HOME
  importFactory.importHome = function (file, fileId) {
    var q = $q.defer();

    knex.raw(
      'LOAD DATA LOCAL INFILE ? REPLACE INTO TABLE home FIELDS TERMINATED BY "|" LINES TERMINATED BY "\n" IGNORE 1 ROWS (HOSPCODE, HID, HOUSE_ID, HOUSETYPE, ROOMNO, CONDO, HOUSE, SOISUB, SOIMAIN, ROAD, VILLANAME, VILLAGE, TAMBON, AMPUR, CHANGWAT, TELEPHONE, LATITUDE, LONGITUDE, NFAMILY, LOCATYPE, VHVID, HEADID, TOILET, WATER, WATERTYPE, GARBAGE, HOUSING, DURABILITY, CLEANLINESS, VENTILATION, LIGHT, WATERTM, MFOOD, BCONTROL, ACONTROL, CHEMICAL, @OUTDATE, @D_UPDATE) SET OUTDATE=STR_TO_DATE(@OUTDATE, "%Y%m%d"), D_UPDATE=STR_TO_DATE(@D_UPDATE, "%Y%m%d%H%i%s"), FILE_ID=?, ERROR_CODE="UNKNOWN";',
      [file, fileId])
      .then(function() {
        q.resolve();
      }, function (err) {
        q.reject(err);
      });

    return q.promise;
  };

  // Import ADDRESS
  importFactory.importAddress = function (file, fileId) {
    var q = $q.defer();

    knex.raw(
      'LOAD DATA LOCAL INFILE ? REPLACE INTO TABLE address FIELDS TERMINATED BY "|" LINES TERMINATED BY "\n" IGNORE 1 ROWS (HOSPCODE, PID, ADDRESSTYPE, HOUSE_ID, HOUSETYPE, ROOMNO, CONDO, HOUSENO, SOISUB, SOIMAIN, ROAD, VILLANAME, VILLAGE, TAMBON, AMPUR, CHANGWAT, TELEPHONE, MOBILE, @D_UPDATE) SET D_UPDATE=STR_TO_DATE(@D_UPDATE, "%Y%m%d%H%i%s"), FILE_ID=?, ERROR_CODE="UNKNOWN";',
      [file, fileId])
      .then(function() {
        q.resolve();
      }, function (err) {
        q.reject(err);
      });

    return q.promise;
  };

  // Import CHARGE_OPD
  importFactory.importChargeOPD = function (file, fileId) {
    var q = $q.defer();

    knex.raw(
      'LOAD DATA LOCAL INFILE ? REPLACE INTO TABLE charge_opd FIELDS TERMINATED BY "|" LINES TERMINATED BY "\n" IGNORE 1 ROWS (HOSPCODE, PID, SEQ, @DATE_SERV, CLINIC, CHARGEITEM, CHARGELIST, QUANTITY, INSTYPE, COST, PRICE, PAYPRICE, @D_UPDATE) SET DATE_SERV=STR_TO_DATE(@DATE_SERV, "%Y%m%d"), D_UPDATE=STR_TO_DATE(@D_UPDATE, "%Y%m%d%H%i%s"), FILE_ID=?, ERROR_CODE="UNKNOWN";',
      [file, fileId])
      .then(function() {
        q.resolve();
      }, function (err) {
        q.reject(err);
      });

    return q.promise;
  };

  // Import ADMISSION
  importFactory.importAdmission = function (file, fileId) {
    var q = $q.defer();

    knex.raw(
      'LOAD DATA LOCAL INFILE ? REPLACE INTO TABLE admission FIELDS TERMINATED BY "|" LINES TERMINATED BY "\n" IGNORE 1 ROWS (HOSPCODE, PID, SEQ, AN, @DATETIME_ADMIT, WARDADMIT, INSTYPE, TYPEIN, REFERINHOSP, CAUSEIN, ADMITWEIGHT, ADMITHEIGHT, @DATETIME_DISCH, WARDDISCH, DISCHSTATUS, DISCHTYPE, REFEROUTHOSP, CAUSEOUT, COST, PRICE, PAYPRICE, ACTUALPAY, PROVIDER, @D_UPDATE) SET D_UPDATE=STR_TO_DATE(@D_UPDATE, "%Y%m%d%H%i%s"), DATETIME_ADMIT=STR_TO_DATE(@DATETIME_ADMIT, "%Y%m%d%H%i%s"), DATETIME_DISCH=STR_TO_DATE(@DATETIME_DISCH, "%Y%m%d%H%i%s"), FILE_ID=?, ERROR_CODE="UNKNOWN";',
      [file, fileId])
      .then(function() {
        q.resolve();
      }, function (err) {
        q.reject(err);
      });

    return q.promise;
  };

  // Import DIAGNOSIS_IPD
  importFactory.importDiagnosisIpd = function (file, fileId) {
    var q = $q.defer();

    knex.raw(
      'LOAD DATA LOCAL INFILE ? REPLACE INTO TABLE diagnosis_ipd FIELDS TERMINATED BY "|" LINES TERMINATED BY "\n" IGNORE 1 ROWS (HOSPCODE, PID, AN, @DATETIME_ADMIT, WARDDIAG, DIAGTYPE, DIAGCODE, PROVIDER, @D_UPDATE) SET D_UPDATE=STR_TO_DATE(@D_UPDATE, "%Y%m%d%H%i%s"), DATETIME_ADMIT=STR_TO_DATE(@DATETIME_ADMIT, "%Y%m%d%H%i%s"), FILE_ID=?, ERROR_CODE="UNKNOWN";',
      [file, fileId])
      .then(function() {
        q.resolve();
      }, function (err) {
        q.reject(err);
      });

    return q.promise;
  };

  // Import DRUG_IPD
  importFactory.importDrugIpd = function (file, fileId) {
    var q = $q.defer();

    knex.raw(
      'LOAD DATA LOCAL INFILE ? REPLACE INTO TABLE drug_ipd FIELDS TERMINATED BY "|" LINES TERMINATED BY "\n" IGNORE 1 ROWS (HOSPCODE, PID, AN, @DATETIME_ADMIT, WARDSTAY, TYPEDRUG, DIDSTD, DNAME, @DATESTART, @DATEFINISH, AMOUNT, UNIT, UNIT_PACKING, DRUGPRICE, DRUGCOST, PROVIDER, @D_UPDATE) SET D_UPDATE=STR_TO_DATE(@D_UPDATE, "%Y%m%d%H%i%s"), DATETIME_ADMIT=STR_TO_DATE(@DATETIME_ADMIT, "%Y%m%d%H%i%s"), DATESTART=STR_TO_DATE(@DATESTART, "%Y%m%d"), DATEFINISH=STR_TO_DATE(@DATEFINISH, "%Y%m%d"), FILE_ID=?, ERROR_CODE="UNKNOWN";', [file, fileId])
      .then(function() {
        q.resolve();
      }, function (err) {
        q.reject(err);
      });

    return q.promise;
  };
  // Import PROCEDURE_IPD
  importFactory.importProcedureIpd = function (file, fileId) {
    var q = $q.defer();

    knex.raw(
      'LOAD DATA LOCAL INFILE ? REPLACE INTO TABLE procedure_ipd FIELDS TERMINATED BY "|" LINES TERMINATED BY "\n" IGNORE 1 ROWS (HOSPCODE, PID, AN, @DATETIME_ADMIT, WARDSTAY, PROCEDCODE, @TIMESTART, @TIMEFINISH, SERVICEPRICE, PROVIDER, @D_UPDATE) SET D_UPDATE=STR_TO_DATE(@D_UPDATE, "%Y%m%d%H%i%s"), DATETIME_ADMIT=STR_TO_DATE(@DATETIME_ADMIT, "%Y%m%d%H%i%s"), TIMESTART=STR_TO_DATE(@TIMESTART, "%H%i%s"), TIMEFINISH=STR_TO_DATE(@TIMEFINISH, "%H%i%s"), FILE_ID=?, ERROR_CODE="UNKNOWN";', [file, fileId])
      .then(function() {
        q.resolve();
      }, function (err) {
        q.reject(err);
      });

    return q.promise;
  };
  // Import CHARGE_IPD
  importFactory.importChargeIpd = function (file, fileId) {
    var q = $q.defer();

    knex.raw(
      'LOAD DATA LOCAL INFILE ? REPLACE INTO TABLE charge_ipd FIELDS TERMINATED BY "|" LINES TERMINATED BY "\n" IGNORE 1 ROWS (HOSPCODE, PID, AN, @DATETIME_ADMIT, WARDSTAY, CHARGEITEM, CHARGELIST, QUANTITY, INSTYPE, COST, PRICE, PAYPRICE, @D_UPDATE) SET D_UPDATE=STR_TO_DATE(@D_UPDATE, "%Y%m%d%H%i%s"), DATETIME_ADMIT=STR_TO_DATE(@DATETIME_ADMIT, "%Y%m%d%H%i%s"), FILE_ID=?, ERROR_CODE="UNKNOWN";', [file, fileId])
      .then(function() {
        q.resolve();
      }, function (err) {
        q.reject(err);
      });

    return q.promise;
  };
  // Import ANC
  importFactory.importANC = function (file, fileId) {
    var q = $q.defer();

    knex.raw(
      'LOAD DATA LOCAL INFILE ? REPLACE INTO TABLE anc FIELDS TERMINATED BY "|" LINES TERMINATED BY "\n" IGNORE 1 ROWS (HOSPCODE, PID, SEQ, @DATE_SERV, GRAVIDA, ANCNO, GA, ANCRESULT, ANCPLACE, PROVIDER, @D_UPDATE) SET D_UPDATE=STR_TO_DATE(@D_UPDATE, "%Y%m%d%H%i%s"), DATE_SERV=STR_TO_DATE(@DATE_SERV, "%Y%m%d"), FILE_ID=?, ERROR_CODE="UNKNOWN";', [file, fileId])
      .then(function() {
        q.resolve();
      }, function (err) {
        q.reject(err);
      });

    return q.promise;
  };
  // Import EPI
  importFactory.importEPI = function (file, fileId) {
    var q = $q.defer();

    knex.raw(
      'LOAD DATA LOCAL INFILE ? REPLACE INTO TABLE epi FIELDS TERMINATED BY "|" LINES TERMINATED BY "\n" IGNORE 1 ROWS (HOSPCODE, PID, SEQ, @DATE_SERV, VACCINETYPE, VACCINEPLACE, PROVIDER, @D_UPDATE) SET D_UPDATE=STR_TO_DATE(@D_UPDATE, "%Y%m%d%H%i%s"), DATE_SERV=STR_TO_DATE(@DATE_SERV, "%Y%m%d"), FILE_ID=?, ERROR_CODE="UNKNOWN";', [file, fileId])
      .then(function() {
        q.resolve();
      }, function (err) {
        q.reject(err);
      });

    return q.promise;
  };
  // Import FP
  importFactory.importFP = function (file, fileId) {
    var q = $q.defer();

    knex.raw(
      'LOAD DATA LOCAL INFILE ? REPLACE INTO TABLE fp FIELDS TERMINATED BY "|" LINES TERMINATED BY "\n" IGNORE 1 ROWS (HOSPCODE, PID, SEQ, @DATE_SERV, FPTYPE, FPPLACE, PROVIDER, @D_UPDATE) SET D_UPDATE=STR_TO_DATE(@D_UPDATE, "%Y%m%d%H%i%s"), DATE_SERV=STR_TO_DATE(@DATE_SERV, "%Y%m%d"), FILE_ID=?, ERROR_CODE="UNKNOWN";', [file, fileId])
      .then(function() {
        q.resolve();
      }, function (err) {
        q.reject(err);
      });

    return q.promise;
  };
  // Import SURVEILLANCE
  importFactory.importSurveillance = function (file, fileId) {
    var q = $q.defer();

    knex.raw(
      'LOAD DATA LOCAL INFILE ? REPLACE INTO TABLE surveillance FIELDS TERMINATED BY "|" LINES TERMINATED BY "\n" IGNORE 1 ROWS (HOSPCODE, PID, SEQ, @DATE_SERV, AN, @DATETIME_ADMIT, SYNDROME, DIAGCODE, CODE506, DIAGCODELAST, CODE506LAST, ILLDATE, ILLHOUSE, ILLVILLAGE, ILLTAMBON, ILLAMPUR, ILLCHANGWAT, LATITUDE, LONGITUDE, PTSTATUS, @DATE_DEATH, COMPLICATION, ORGANISM, PROVIDER, @D_UPDATE) SET D_UPDATE=STR_TO_DATE(@D_UPDATE, "%Y%m%d%H%i%s"), DATETIME_ADMIT=STR_TO_DATE(@DATETIME_ADMIT, "%Y%m%d%H%i%s"), DATE_SERV=STR_TO_DATE(@DATE_SERV, "%Y%m%d"), DATE_DEATH=STR_TO_DATE(@DATE_DEATH, "%Y%m%d"), FILE_ID=?, ERROR_CODE="UNKNOWN";', [file, fileId])
      .then(function() {
        q.resolve();
      }, function (err) {
        q.reject(err);
      });

    return q.promise;
  };

  // Import ACCIDENT
  importFactory.importAccident = function (file, fileId) {
    var q = $q.defer();

    knex.raw(
      'LOAD DATA LOCAL INFILE ? REPLACE INTO TABLE accident FIELDS TERMINATED BY "|" LINES TERMINATED BY "\n" IGNORE 1 ROWS (HOSPCODE, PID, SEQ, @DATETIME_SERV, @DATETIME_AE, AETYPE, AEPLACE, TYPEIN_AE, TRAFFIC, VEHICLE, ALCOHOL, NACROTIC_DRUG, BELT, HELMET, AIRWAY, STOPBLEED, SPLINT, FLUID, URGENCY, COMA_EYE, COMA_SPEAK, COMA_MOVEMENT, @D_UPDATE) SET D_UPDATE=STR_TO_DATE(@D_UPDATE, "%Y%m%d%H%i%s"), DATETIME_SERV=STR_TO_DATE(@DATETIME_SERV, "%Y%m%d%H%i%s"), DATETIME_AE=STR_TO_DATE(@DATETIME_AE, "%Y%m%d%H%i%s"), FILE_ID=?, ERROR_CODE="UNKNOWN";', [file, fileId])
      .then(function() {
        q.resolve();
      }, function (err) {
        q.reject(err);
      });

    return q.promise;
  };

  // Import DRUG_ALLERGY
  importFactory.importDrugAllergy = function (file, fileId) {
    var q = $q.defer();

    knex.raw(
      'LOAD DATA LOCAL INFILE ? REPLACE INTO TABLE drugallergy FIELDS TERMINATED BY "|" LINES TERMINATED BY "\n" IGNORE 1 ROWS (HOSPCODE, PID, @DATERECORD, DRUGALLERGY, DNAME, TYPEDX, ALEVEL, SYMPTOM, INFORMANT, INFORMHOSP, @D_UPDATE) SET D_UPDATE=STR_TO_DATE(@D_UPDATE, "%Y%m%d%H%i%s"), DATERECORD=STR_TO_DATE(@DATERECORD, "%Y%m%d"), FILE_ID=?, ERROR_CODE="UNKNOWN";', [file, fileId])
      .then(function() {
        q.resolve();
      }, function (err) {
        q.reject(err);
      });

    return q.promise;
  };

  // Import DENTAL
  importFactory.importDental = function (file, fileId) {
    var q = $q.defer();

    knex.raw(
      'LOAD DATA LOCAL INFILE ? REPLACE INTO TABLE dental FIELDS TERMINATED BY "|" LINES TERMINATED BY "\n" IGNORE 1 ROWS (HOSPCODE, PID, SEQ, @DATE_SERV, DENTTYPE, SERVPLACE, PTEETH, PCARIES, PFILLING, PEXTRACT, DTEETH,  DCARIES, DFILLING, DEXTRACT, NEED_FLUORIDE, NEED_SCALING, NEED_SEALANT, NEED_PFILLING, NEED_DFILLING, NEED_PEXTRACT, NEED_DEXTRACT, NPROSTHESIS, PERMANENT_PERMANENT, PERMANENT_PROSTHESIS, PROSTHESIS_PROSTHESIS, GUM, SCHOOLTYPE, CLASS, PROVIDER, @D_UPDATE) SET D_UPDATE=STR_TO_DATE(@D_UPDATE, "%Y%m%d%H%i%s"), DATE_SERV=STR_TO_DATE(@DATE_SERV, "%Y%m%d"), FILE_ID=?, ERROR_CODE="UNKNOWN";', [file, fileId])
      .then(function() {
        q.resolve();
      }, function (err) {
        q.reject(err);
      });

    return q.promise;
  };

  // Import CHRONIC
  importFactory.importChronic = function (file, fileId) {
    var q = $q.defer();

    knex.raw(
      'LOAD DATA LOCAL INFILE ? REPLACE INTO TABLE chronic FIELDS TERMINATED BY "|" LINES TERMINATED BY "\n" IGNORE 1 ROWS (HOSPCODE, PID, @DATE_DIAG, CHRONIC, HOSP_DX, HOSP_RX, @DATE_DISCH, TYPEDISCH, @D_UPDATE) SET D_UPDATE=STR_TO_DATE(@D_UPDATE, "%Y%m%d%H%i%s"), DATE_DIAG=STR_TO_DATE(@DATE_DIAG, "%Y%m%d"), DATE_DISCH=STR_TO_DATE(@DATE_DISCH, "%Y%m%d"), FILE_ID=?, ERROR_CODE="UNKNOWN";', [file, fileId])
      .then(function() {
        q.resolve();
      }, function (err) {
        q.reject(err);
      });

    return q.promise;
  };

  // Import NCDSCREEN
  importFactory.importNCDScreen = function (file, fileId) {
    var q = $q.defer();

    knex.raw(
      'LOAD DATA LOCAL INFILE ? REPLACE INTO TABLE ncdscreen FIELDS TERMINATED BY "|" LINES TERMINATED BY "\n" IGNORE 1 ROWS (HOSPCODE, PID, SEQ, @DATE_SERV, SERVPLACE, SMOKE, ALCOHOL, DMFAMILY, HTFAMILY, WEIGHT, HEIGHT, WAIST_CM, SBP_1, DBP_1, SBP_2, DBP_2, BSLEVEL, BSTEST, SCREENPLACE, PROVIDER, @D_UPDATE) SET D_UPDATE=STR_TO_DATE(@D_UPDATE, "%Y%m%d%H%i%s"), DATE_SERV=STR_TO_DATE(@DATE_SERV, "%Y%m%d"), FILE_ID=?, ERROR_CODE="UNKNOWN";', [file, fileId])
      .then(function() {
        q.resolve();
      }, function (err) {
        q.reject(err);
      });

    return q.promise;
  };

  // Import CHRONIC_FU
  importFactory.importChronicFU = function (file, fileId) {
    var q = $q.defer();

    knex.raw(
      'LOAD DATA LOCAL INFILE ? REPLACE INTO TABLE chronicfu FIELDS TERMINATED BY "|" LINES TERMINATED BY "\n" IGNORE 1 ROWS (HOSPCODE, PID, SEQ, @DATE_SERV, WEIGHT, HEIGHT, WAIST_CM, SBP, DBP, FOOT, RETINA, PROVIDER, @D_UPDATE) SET D_UPDATE=STR_TO_DATE(@D_UPDATE, "%Y%m%d%H%i%s"), DATE_SERV=STR_TO_DATE(@DATE_SERV, "%Y%m%d"), FILE_ID=?, ERROR_CODE="UNKNOWN";', [file, fileId])
      .then(function() {
        q.resolve();
      }, function (err) {
        q.reject(err);
      });

    return q.promise;
  };

  // Import LAB_FU
  importFactory.importLABFU = function (file, fileId) {
    var q = $q.defer();

    knex.raw(
      'LOAD DATA LOCAL INFILE ? REPLACE INTO TABLE labfu FIELDS TERMINATED BY "|" LINES TERMINATED BY "\n" IGNORE 1 ROWS (HOSPCODE, PID, SEQ, @DATE_SERV, LABTEST, LABRESULT, @D_UPDATE) SET D_UPDATE=STR_TO_DATE(@D_UPDATE, "%Y%m%d%H%i%s"), DATE_SERV=STR_TO_DATE(@DATE_SERV, "%Y%m%d"), FILE_ID=?, ERROR_CODE="UNKNOWN";', [file, fileId])
      .then(function() {
        q.resolve();
      }, function (err) {
        q.reject(err);
      });

    return q.promise;
  };


  // Import PRENATAL
  importFactory.importPrenatal = function (file, fileId) {
    var q = $q.defer();

    knex.raw(
      'LOAD DATA LOCAL INFILE ? REPLACE INTO TABLE prenatal FIELDS TERMINATED BY "|" LINES TERMINATED BY "\n" IGNORE 1 ROWS (HOSPCODE, PID, GRAVIDA, @LMP, @EDC, VDRL_RESULT, HB_RESULT, HIV_RESULT, @DATE_HCT, HCT_RESULT, THALASSEMIA, @D_UPDATE) SET D_UPDATE=STR_TO_DATE(@D_UPDATE, "%Y%m%d%H%i%s"), LMP=STR_TO_DATE(@LMP, "%Y%m%d"), EDC=STR_TO_DATE(@EDC, "%Y%m%d"), DATE_HCT=STR_TO_DATE(@DATE_HCT, "%Y%m%d"), FILE_ID=?, ERROR_CODE="UNKNOWN";', [file, fileId])
      .then(function() {
        q.resolve();
      }, function (err) {
        q.reject(err);
      });

    return q.promise;
  };

  // Import LABOR
  importFactory.importLabor = function (file, fileId) {
    var q = $q.defer();

    knex.raw(
      'LOAD DATA LOCAL INFILE ? REPLACE INTO TABLE labor FIELDS TERMINATED BY "|" LINES TERMINATED BY "\n" IGNORE 1 ROWS (HOSPCODE, PID, GRAVIDA, @LMP, @EDC, @BDATE, BRESULT, BPLACE, BHOSP, BTYPE, BDOCTOR, LBORN, SBORN, @D_UPDATE) SET D_UPDATE=STR_TO_DATE(@D_UPDATE, "%Y%m%d%H%i%s"), LMP=STR_TO_DATE(@LMP, "%Y%m%d"), EDC=STR_TO_DATE(@EDC, "%Y%m%d"), BDATE=STR_TO_DATE(@BDATE, "%Y%m%d"), FILE_ID=?, ERROR_CODE="UNKNOWN";', [file, fileId])
      .then(function() {
        q.resolve();
      }, function (err) {
        q.reject(err);
      });

    return q.promise;
  };
  // Import POSTNATAL
  importFactory.importPostnatal = function (file, fileId) {
    var q = $q.defer();

    knex.raw(
      'LOAD DATA LOCAL INFILE ? REPLACE INTO TABLE postnatal FIELDS TERMINATED BY "|" LINES TERMINATED BY "\n" IGNORE 1 ROWS (HOSPCODE, PID, SEQ, GRAVIDA, @BDATE, @PPCARE, PPPLACE, PPRESULT, PROVIDER, @D_UPDATE) SET D_UPDATE=STR_TO_DATE(@D_UPDATE, "%Y%m%d%H%i%s"), PPCARE=STR_TO_DATE(@PPCARE, "%Y%m%d"), BDATE=STR_TO_DATE(@BDATE, "%Y%m%d"), FILE_ID=?, ERROR_CODE="UNKNOWN";', [file, fileId])
      .then(function() {
        q.resolve();
      }, function (err) {
        q.reject(err);
      });

    return q.promise;
  };
  // Import NEWBORN
  importFactory.importNewborn = function (file, fileId) {
    var q = $q.defer();

    knex.raw(
      'LOAD DATA LOCAL INFILE ? REPLACE INTO TABLE newborn FIELDS TERMINATED BY "|" LINES TERMINATED BY "\n" IGNORE 1 ROWS (HOSPCODE, PID, MPID, GRAVIDA, GA, @BDATE, BTIME, BPLACE, BHOSP, BIRTHNO, BTYPE, BDOCTOR, BWEIGHT, ASPHYXIA, VITK, TSH, TSHRESULT, @D_UPDATE) SET BDATE=STR_TO_DATE(@BDATE, "%Y%m%d"), D_UPDATE=STR_TO_DATE(@D_UPDATE, "%Y%m%d%H%i%s"), FILE_ID=?, ERROR_CODE="UNKNOWN";',
      [file, fileId])
      .then(function() {
        q.resolve();
      }, function (err) {
        q.reject(err);
      });

    return q.promise;
  };

  // Import NEWBORNCARE
  importFactory.importNewbornCare = function (file, fileId) {
    var q = $q.defer();

    knex.raw(
      'LOAD DATA LOCAL INFILE ? REPLACE INTO TABLE newborncare FIELDS TERMINATED BY "|" LINES TERMINATED BY "\n" IGNORE 1 ROWS (HOSPCODE, PID, SEQ, @BDATE, BCARE, BCPLACE, BCARERESULT, FOOD, PROVIDER, @D_UPDATE) SET D_UPDATE=STR_TO_DATE(@D_UPDATE, "%Y%m%d%H%i%s"), BDATE=STR_TO_DATE(@BDATE, "%Y%m%d"), FILE_ID=?, ERROR_CODE="UNKNOWN";', [file, fileId])
      .then(function() {
        q.resolve();
      }, function (err) {
        q.reject(err);
      });

    return q.promise;
  };

  // Import NUTRITION
  importFactory.importNutrition = function (file, fileId) {
    var q = $q.defer();

    knex.raw(
      'LOAD DATA LOCAL INFILE ? REPLACE INTO TABLE nutrition FIELDS TERMINATED BY "|" LINES TERMINATED BY "\n" IGNORE 1 ROWS (HOSPCODE, PID, SEQ, @DATE_SERV, NUTRITIONPLACE, WEIGHT, HEIGHT, HEADCIRCUM, CHILDDEVELOP, FOOD, BOTTLE, PROVIDER, @D_UPDATE) SET D_UPDATE=STR_TO_DATE(@D_UPDATE, "%Y%m%d%H%i%s"), DATE_SERV=STR_TO_DATE(@DATE_SERV, "%Y%m%d"), FILE_ID=?, ERROR_CODE="UNKNOWN";', [file, fileId])
      .then(function() {
        q.resolve();
      }, function (err) {
        q.reject(err);
      });

    return q.promise;
  };

  // Import COMMUNITY_SERVICE
  importFactory.importCommunityService = function (file, fileId) {
    var q = $q.defer();

    knex.raw(
      'LOAD DATA LOCAL INFILE ? REPLACE INTO TABLE community_service FIELDS TERMINATED BY "|" LINES TERMINATED BY "\n" IGNORE 1 ROWS (HOSPCODE, PID, SEQ, @DATE_SERV, COMSERVICE, PROVIDER, @D_UPDATE) SET D_UPDATE=STR_TO_DATE(@D_UPDATE, "%Y%m%d%H%i%s"), DATE_SERV=STR_TO_DATE(@DATE_SERV, "%Y%m%d"), FILE_ID=?, ERROR_CODE="UNKNOWN";', [file, fileId])
      .then(function() {
        q.resolve();
      }, function (err) {
        q.reject(err);
      });

    return q.promise;
  };

  // Import COMMUNITY_ACTIVITY
  importFactory.importCommunityActivity = function (file, fileId) {
    var q = $q.defer();

    knex.raw(
      'LOAD DATA LOCAL INFILE ? REPLACE INTO TABLE community_activity FIELDS TERMINATED BY "|" LINES TERMINATED BY "\n" IGNORE 1 ROWS (HOSPCODE, VID, @DATE_START, @DATE_FINISH, COMACTIVITY, PROVIDER, @D_UPDATE) SET D_UPDATE=STR_TO_DATE(@D_UPDATE, "%Y%m%d%H%i%s"), DATE_START=STR_TO_DATE(@DATE_START, "%Y%m%d"), DATE_FINISH=STR_TO_DATE(@DATE_FINISH, "%Y%m%d"), FILE_ID=?, ERROR_CODE="UNKNOWN";', [file, fileId])
      .then(function() {
        q.resolve();
      }, function (err) {
        q.reject(err);
      });

    return q.promise;
  };

  // Import DISABILITY
  importFactory.importDisability = function (file, fileId) {
    var q = $q.defer();

    knex.raw(
      'LOAD DATA LOCAL INFILE ? REPLACE INTO TABLE disability FIELDS TERMINATED BY "|" LINES TERMINATED BY "\n" IGNORE 1 ROWS (HOSPCODE, DISABID, PID, DISABTYPE, DISABCAUSE, DIAGCODE, @DATE_DETECT, @DATE_DISAB, @D_UPDATE) SET D_UPDATE=STR_TO_DATE(@D_UPDATE, "%Y%m%d%H%i%s"), DATE_DETECT=STR_TO_DATE(@DATE_DETECT, "%Y%m%d"), DATE_DISAB=STR_TO_DATE(@DATE_DISAB, "%Y%m%d"), FILE_ID=?, ERROR_CODE="UNKNOWN";', [file, fileId])
      .then(function() {
        q.resolve();
      }, function (err) {
        q.reject(err);
      });

    return q.promise;
  };

  // Import FUNCTIONAL
  importFactory.importFunctional = function (file, fileId) {
    var q = $q.defer();

    knex.raw(
      'LOAD DATA LOCAL INFILE ? REPLACE INTO TABLE functional FIELDS TERMINATED BY "|" LINES TERMINATED BY "\n" IGNORE 1 ROWS (HOSPCODE, PID, SEQ, @DATE_SERV, FUNCTIONAL_TEST, TESTRESULT, DEPENDENT, PROVIDER, @D_UPDATE) SET D_UPDATE=STR_TO_DATE(@D_UPDATE, "%Y%m%d%H%i%s"), DATE_SERV=STR_TO_DATE(@DATE_SERV, "%Y%m%d"), FILE_ID=?, ERROR_CODE="UNKNOWN";', [file, fileId])
      .then(function() {
        q.resolve();
      }, function (err) {
        q.reject(err);
      });

    return q.promise;
  };

  // Import ICF
  importFactory.importICF = function (file, fileId) {
    var q = $q.defer();

    knex.raw(
      'LOAD DATA LOCAL INFILE ? REPLACE INTO TABLE icf FIELDS TERMINATED BY "|" LINES TERMINATED BY "\n" IGNORE 1 ROWS (HOSPCODE, DISABID, PID, SEQ, @DATE_SERV, ICF, QUALIFIER, PROVIDER, @D_UPDATE) SET D_UPDATE=STR_TO_DATE(@D_UPDATE, "%Y%m%d%H%i%s"), DATE_SERV=STR_TO_DATE(@DATE_SERV, "%Y%m%d"), FILE_ID=?, ERROR_CODE="UNKNOWN";', [file, fileId])
      .then(function() {
        q.resolve();
      }, function (err) {
        q.reject(err);
      });

    return q.promise;
  };

  // Import REHABILITATION
  importFactory.importRehabilitation = function (file, fileId) {
    var q = $q.defer();

    knex.raw(
      'LOAD DATA LOCAL INFILE ? REPLACE INTO TABLE rehabilitation FIELDS TERMINATED BY "|" LINES TERMINATED BY "\n" IGNORE 1 ROWS (HOSPCODE, PID, SEQ, AN, @DATE_ADMIT, @DATE_SERV, @DATE_START, @DATE_FINISH, REHABCODE, AT_DEVICE, AT_NO, REHABPLACE, PROVIDER, @D_UPDATE) SET D_UPDATE=STR_TO_DATE(@D_UPDATE, "%Y%m%d%H%i%s"), DATE_SERV=STR_TO_DATE(@DATE_SERV, "%Y%m%d"), DATE_ADMIT=STR_TO_DATE(@DATE_ADMIT, "%Y%m%d"), DATE_START=STR_TO_DATE(@DATE_START, "%Y%m%d"), DATE_FINISH=STR_TO_DATE(@DATE_FINISH, "%Y%m%d"), FILE_ID=?, ERROR_CODE="UNKNOWN";', [file, fileId])
      .then(function() {
        q.resolve();
      }, function (err) {
        q.reject(err);
      });

    return q.promise;
  };

  // Import PROVIDER
  importFactory.importProvider = function (file, fileId) {
    var q = $q.defer();

    knex.raw(
      'LOAD DATA LOCAL INFILE ? REPLACE INTO TABLE provider FIELDS TERMINATED BY "|" LINES TERMINATED BY "\n" IGNORE 1 ROWS (HOSPCODE, PROVIDER, REGISTERNO, COUNCIL, CID, PRENAME,NAME, LNAME, SEX, @BIRTH, PROVIDERTYPE, @STARTDATE, @OUTDATE, MOVEFROM, MOVETO, @D_UPDATE) SET D_UPDATE=STR_TO_DATE(@D_UPDATE, "%Y%m%d%H%i%s"), BIRTH=STR_TO_DATE(@BIRTH, "%Y%m%d"), STARTDATE=STR_TO_DATE(@STARTDATE, "%Y%m%d"), OUTDATE=STR_TO_DATE(@OUTDATE, "%Y%m%d"), FILE_ID=?, ERROR_CODE="UNKNOWN";', [file, fileId])
      .then(function() {
        q.resolve();
      }, function (err) {
        q.reject(err);
      });

    return q.promise;
  };
  // Import VILLAGE
  importFactory.importVillage = function (file, fileId) {
    var q = $q.defer();

    knex.raw(
      'LOAD DATA LOCAL INFILE ? REPLACE INTO TABLE village FIELDS TERMINATED BY "|" LINES TERMINATED BY "\n" IGNORE 1 ROWS (HOSPCODE, VID, NTRADITIONAL, NMONK, NRELIGIONLEADER, NBROADCAST, NRADIO, NPCHC, NCLINIC, NDRUGSTORE, NCHILDCENTER, NPSCHOOL, NSSCHOOL, NTEMPLE, NRELIGIOUSPLACE, NMARKET, NSHOP, NFOODSHOP, NSTALL, NRAINTANK, NCHICKENFARM, NPIGFARM, WASTEWATER, GARBAGE, NFACTORY, LATITUDE, LONGITUDE, OUTDATE, NUMACTUALLY, RISKTYPE, NUMSTATELESS, NEXERCISECLUB, NOLDERLYCLUB, NDISABLECLUB, NNUMBERONECLUB, @D_UPDATE) SET D_UPDATE=STR_TO_DATE(@D_UPDATE, "%Y%m%d%H%i%s"), FILE_ID=?, ERROR_CODE="UNKNOWN";', [file, fileId])
      .then(function() {
        q.resolve();
      }, function (err) {
        q.reject(err);
      });

    return q.promise;
  };
  // Import DEATH
  importFactory.importDeath = function (file, fileId) {
    var q = $q.defer();

    knex.raw(
      'LOAD DATA LOCAL INFILE ? REPLACE INTO TABLE death FIELDS TERMINATED BY "|" LINES TERMINATED BY "\n" IGNORE 1 ROWS (HOSPCODE, PID, HOSPDEATH, AN, SEQ, @DDEATH, CDEATH_A, CDEATH_B, CDEATH_C, CDEATH_D, ODISEASE, CDEATH, PREGDEATH, PDEATH, PROVIDER, @D_UPDATE) SET D_UPDATE=STR_TO_DATE(@D_UPDATE, "%Y%m%d%H%i%s"), DDEATH=STR_TO_DATE(@DDEATH, "%Y%m%d"), FILE_ID=?, ERROR_CODE="UNKNOWN";', [file, fileId])
      .then(function() {
        q.resolve();
      }, function (err) {
        q.reject(err);
      });

    return q.promise;
  };
  // Import APPOINT
  importFactory.importAppointment = function (file, fileId) {
    var q = $q.defer();

    knex.raw(
      'LOAD DATA LOCAL INFILE ? REPLACE INTO TABLE appointment FIELDS TERMINATED BY "|" LINES TERMINATED BY "\n" IGNORE 1 ROWS (HOSPCODE, PID, AN, SEQ, @DATE_SERV, CLINIC, @APDATE, APTYPE, APDIAG, PROVIDER, @D_UPDATE) SET D_UPDATE=STR_TO_DATE(@D_UPDATE, "%Y%m%d%H%i%s"), DATE_SERV=STR_TO_DATE(@DATE_SERV, "%Y%m%d"), APDATE=STR_TO_DATE(@APDATE, "%Y%m%d"), FILE_ID=?, ERROR_CODE="UNKNOWN";', [file, fileId])
      .then(function() {
        q.resolve();
      }, function (err) {
        q.reject(err);
      });

    return q.promise;
  };

  return importFactory;
});