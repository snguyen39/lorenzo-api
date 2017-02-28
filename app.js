/**
 * Module dependencies.
 */

var express = require('express'),
  routes = require('./routes'),
  user = require('./routes/user'),
  http = require('http'),
  path = require('path'),
  fs = require('fs'),
  cors = require('cors');

var app = express();

var db;

var cloudant;

var fileToUpload;

var dbCredentials = {
  dbName: 'my_sample_db'
};

var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var logger = require('morgan');
var errorHandler = require('errorhandler');
var multipart = require('connect-multiparty')
var multipartMiddleware = multipart();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

// enable all cors request
app.use(cors());

app.use(logger('dev'));
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());
app.use(methodOverride());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/style', express.static(path.join(__dirname, '/views/style')));

// send headers
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Controll-Allow-Headers", "Origin, X-Requested-Width, Content-Type, Accept");
  next();
});

// development only
if ('development' == app.get('env')) {
  app.use(errorHandler());
}

function initDBConnection() {
  //When running on Bluemix, this variable will be set to a json object
  //containing all the service credentials of all the bound services
  if (process.env.VCAP_SERVICES) {
    var vcapServices = JSON.parse(process.env.VCAP_SERVICES);
    // Pattern match to find the first instance of a Cloudant service in
    // VCAP_SERVICES. If you know your service key, you can access the
    // service credentials directly by using the vcapServices object.
    for (var vcapService in vcapServices) {
      if (vcapService.match(/cloudant/i)) {
        dbCredentials.url = vcapServices[vcapService][0].credentials.url;
      }
    }
  } else { //When running locally, the VCAP_SERVICES will not be set

    // When running this app locally you can get your Cloudant credentials
    // from Bluemix (VCAP_SERVICES in "cf env" output or the Environment
    // Variables section for an app in the Bluemix console dashboard).
    // Alternately you could point to a local database here instead of a
    // Bluemix service.
    // url will be in this format: https://username:password@xxxxxxxxx-bluemix.cloudant.com
    dbCredentials.url = "REPLACE ME";
  }

  cloudant = require('cloudant')(dbCredentials.url);

  // check if DB exists if not create
  cloudant.db.create(dbCredentials.dbName, function (err, res) {
    if (err) {
      console.log('Could not create new db: ' + dbCredentials.dbName + ', it might already exist.');
    }
  });

  db = cloudant.use(dbCredentials.dbName);
}

initDBConnection();

app.get('/', routes.index);

app.get('/api/welcome', function (req, res) {

  var jsonObj = {
    message: "Welcome to the Lorenzo API"
  };
  res.json(jsonObj);
});

app.get('/api/fetal', function (req, res) {

  var patient_id = req.query.patient;

  if (patient_id) {
    var jsonObj = [
      {
        resourceType: 'Bundle',
        entry: [
          {
            resource: {
              resourceType: 'Fetal',
              id: 'FETID-RTX07179',
              fetalNumber: 'Fetus 1',
              gender: 'Male',
              fetalIdentifiedDate: '2017-01-02T11:1:00Z',
              status: 'viable',
              subject: {
                reference: 'http://hlblor005.cschealthlab.com/LMHIAService/api/v1/patient/1'
              },
              outCome: 'Live',
            }
          },
          {
            resource: {
              resourceType: 'Fetal',
              id: 'FETID-RTX07206',
              fetalNumber: 'Fetus 2',
              gender: 'Female',
              fetalIdentifiedDate: '2017-02-28T11:1:00Z',
              status: 'viable',
              subject: {
                reference: 'http://hlblor005.cschealthlab.com/LMHIAService/api/v1/patient/1'
              },
              outCome: 'Miscarriage',
            }
          },
          {
            resource: {
              resourceType: 'Fetal',
              id: 'FETID-RTX07207',
              fetalNumber: 'Fetus 3',
              gender: 'Male',
              fetalIdentifiedDate: '2017-02-28T11:1:00Z',
              status: 'viable',
              subject: {
                reference: 'http://hlblor005.cschealthlab.com/LMHIAService/api/v1/patient/1'
              },
              outCome: 'Other inc vanishing/ papyraceous twin ectopic',
            }
          },
          {
            resource: {
              resourceType: 'Fetal',
              id: 'FETID-RTX07208',
              fetalNumber: 'Fetus 1',
              gender: 'Male',
              fetalIdentifiedDate: '2017-02-28T11:1:00Z',
              status: 'viable',
              subject: {
                reference: 'http://hlblor005.cschealthlab.com/LMHIAService/api/v1/patient/8'
              },
              outCome: 'Stillbirth',
            }
          },
          {
            resource: {
              resourceType: 'Fetal',
              id: 'FETID-RTX07209',
              fetalNumber: 'Fetus 2',
              gender: 'Male',
              fetalIdentifiedDate: '2017-02-28T11:1:00Z',
              status: 'viable',
              subject: {
                reference: 'http://hlblor005.cschealthlab.com/LMHIAService/api/v1/patient/8'
              },
              outCome: 'Termination of Pregnancy < 24weeks',
            }
          },
          {
            resource: {
              resourceType: 'Fetal',
              id: 'FETID-RTX07210',
              fetalNumber: 'Fetus 1',
              gender: 'Unknown',
              fetalIdentifiedDate: '2017-02-28T11:1:00Z',
              status: 'viable',
              subject: {
                reference: 'http://hlblor005.cschealthlab.com/LMHIAService/api/v1/patient/14'
              },
              outCome: 'Termination of Pregnancy >= 24weeks',
            }
          },
        ]
      }

    ];

    res.json(jsonObj);
  } else {
    res.send("Error");
  }

});


app.get('/api/procedure', function (req, res) {

  var patient_id = req.query.patient;

  if (patient_id) {
    var jsonObj = [
      {
        resourceType: 'Bundle',
        entry: [
          {
            resource: {
              resourceType: 'Procedure',
              id: '1',
              subject: {
                reference: 'http://hlblor005.cschealthlab.com/LMHIAService/api/v1/patient/1'
              },
              status: 'completed',
              code: {
                coding: [
                  {
                    code: '84901000000108',
                    display: 'Percutaneous transluminal balloon angioplasty with insertion of stent into coronary artery'
                  }
                ]
              },
              bodySite: {
                coding: [
                  {
                    code: '84901000000108',
                    display: 'Structure of tendon and tendon sheath of leg and ankle Structure of tendon and tendon sheath of leg and ankle'
                  }
                ]
              },
              performer: [
                {
                  actor: {
                    reference: 'BROWN-ONE Ratony'
                  },
                  role: {
                    coding: [
                      {
                        system: 'CSC_HC_Practitioner-Role_1_Ext',
                        code: 'administrator',
                        display: 'administrator Role'
                      }
                    ]
                  }
                }
              ],
              performedDate: '2016-12-03T09:53:00Z',
              request: {
                reference: 'http://hlblor005.cschealthlab.com/LMHIAService/api/v1/patient/pas%20number~PAS-0843/ProcedureRequest?id=1000000001548'
              }
            }
          },
          {
            resource: {
              resourceType: 'Procedure',
              id: '2',
              subject: {
                reference: 'http://hlblor005.cschealthlab.com/LMHIAService/api/v1/patient/1'
              },
              status: 'completed',
              code: {
                coding: [
                  {
                    code: '201631000000101',
                    display: 'Cardiac rehabilitation'
                  }
                ]
              },
              request: {
                reference: 'http://hlblor005.cschealthlab.com/LMHIAService/api/v1/patient/pas%20number~PAS-0843/ProcedureRequest?id=1000000001550'
              }
            }
          },
          {
            resource: {
              resourceType: 'Procedure',
              id: '3',
              subject: {
                reference: 'http://hlblor005.cschealthlab.com/LMHIAService/api/v1/patient/1'
              },
              status: 'completed',
              code: {
                coding: [
                  {
                    code: '84901000000108',
                    display: 'Anaesthesia for procedure on spine'
                  }
                ]
              },
              performer: [
                {
                  actor: {
                    reference: 'BROWN-ONE Ratony'
                  },
                  role: {
                    coding: [
                      {
                        system: 'CSC_HC_Practitioner-Role_1_Ext',
                        code: 'administrator',
                        display: 'administrator Role'
                      }
                    ]
                  }
                }
              ],
              performedDate: '2016-12-03T10:53:00Z',
              request: {
                reference: 'http://hlblor005.cschealthlab.com/LMHIAService/api/v1/patient/pas%20number~PAS-0843/ProcedureRequest?id=1000000001548'
              }
            }
          },
          {
            resource: {
              resourceType: 'Procedure',
              id: '4',
              subject: {
                reference: 'http://hlblor005.cschealthlab.com/LMHIAService/api/v1/patient/1'
              },
              status: 'completed',
              code: {
                coding: [
                  {
                    code: '201631000000101',
                    display: 'Application of skeletal traction via the femur'
                  }
                ]
              },
              request: {
                reference: 'http://hlblor005.cschealthlab.com/LMHIAService/api/v1/patient/pas%20number~PAS-0843/ProcedureRequest?id=1000000001550'
              }
            }
          },
          {
            resource: {
              resourceType: 'Procedure',
              id: '5',
              subject: {
                reference: 'http://hlblor005.cschealthlab.com/LMHIAService/api/v1/patient/8'
              },
              status: 'completed',
              code: {
                coding: [
                  {
                    code: '201631000000101',
                    display: 'Operative procedure on lower leg'
                  }
                ]
              },
              bodySite: {
                coding: [
                  {
                    code: '84901000000108',
                    display: 'Structure of cardiovascular system'
                  }
                ]
              },
              performedDate: '2016-12-03T09:53:00Z',
              request: {
                reference: 'http://hlblor005.cschealthlab.com/LMHIAService/api/v1/patient/pas%20number~PAS-0843/ProcedureRequest?id=1000000001550'
              }
            }
          },
          {
            resource: {
              resourceType: 'Procedure',
              id: '6',
              subject: {
                reference: 'http://hlblor005.cschealthlab.com/LMHIAService/api/v1/patient/8'
              },
              status: 'completed',
              code: {
                coding: [
                  {
                    code: '84901000000108',
                    display: 'Laparoscopic Appendectomy'
                  }
                ]
              },
              bodySite: {
                coding: [
                  {
                    code: '84901000000108',
                    display: 'Structure of tendon and tendon sheath of leg and ankle'
                  }
                ]
              },
              performer: [
                {
                  actor: {
                    reference: 'BROWN-ONE Ratony'
                  },
                  role: {
                    coding: [
                      {
                        system: 'CSC_HC_Practitioner-Role_1_Ext',
                        code: 'administrator',
                        display: 'administrator Role'
                      }
                    ]
                  }
                }
              ],
              performedDate: '2016-12-03T09:53:00Z',
              request: {
                reference: 'http://hlblor005.cschealthlab.com/LMHIAService/api/v1/patient/pas%20number~PAS-0843/ProcedureRequest?id=1000000001548'
              }
            }
          },
          {
            resource: {
              resourceType: 'Procedure',
              id: '7',
              subject: {
                reference: 'http://hlblor005.cschealthlab.com/LMHIAService/api/v1/patient/8'
              },
              status: 'completed',
              code: {
                coding: [
                  {
                    code: '201631000000101',
                    display: 'FemPop bypass'
                  }
                ]
              },
              bodySite: {
                coding: [
                  {
                    code: '84901000000108',
                    display: 'Bone structure of femur (left)'
                  }
                ]
              },
              performer: [
                {
                  actor: {
                    reference: 'BROWN-ONE Ratony'
                  },
                  role: {
                    coding: [
                      {
                        system: 'CSC_HC_Practitioner-Role_1_Ext',
                        code: 'administrator',
                        display: 'administrator Role'
                      }
                    ]
                  }
                }
              ],
              performedDate: '2016-12-03T09:53:00Z',
              request: {
                reference: 'http://hlblor005.cschealthlab.com/LMHIAService/api/v1/patient/pas%20number~PAS-0843/ProcedureRequest?id=1000000001550'
              }
            }
          },


          {
            resource: {
              resourceType: 'Procedure',
              id: '8',
              subject: {
                reference: 'http://hlblor005.cschealthlab.com/LMHIAService/api/v1/patient/14'
              },
              status: 'completed',
              code: {
                coding: [
                  {
                    code: '84901000000108',
                    display: 'Percutaneous transluminal balloon angioplasty with insertion of stent into coronary artery'
                  }
                ]
              },
              bodySite: {
                coding: [
                  {
                    code: '84901000000108',
                    display: 'Structure of tendon and tendon sheath of leg and ankle Structure of tendon and tendon sheath of leg and ankle'
                  }
                ]
              },
              performer: [
                {
                  actor: {
                    reference: 'BROWN-ONE Ratony'
                  },
                  role: {
                    coding: [
                      {
                        system: 'CSC_HC_Practitioner-Role_1_Ext',
                        code: 'administrator',
                        display: 'administrator Role'
                      }
                    ]
                  }
                }
              ],
              performedDate: '2016-12-03T09:53:00Z',
              request: {
                reference: 'http://hlblor005.cschealthlab.com/LMHIAService/api/v1/patient/pas%20number~PAS-0843/ProcedureRequest?id=1000000001548'
              }
            }
          },
          {
            resource: {
              resourceType: 'Procedure',
              id: '9',
              subject: {
                reference: 'http://hlblor005.cschealthlab.com/LMHIAService/api/v1/patient/14'
              },
              status: 'completed',
              code: {
                coding: [
                  {
                    code: '201631000000101',
                    display: 'Cardiac rehabilitation'
                  }
                ]
              },
              request: {
                reference: 'http://hlblor005.cschealthlab.com/LMHIAService/api/v1/patient/pas%20number~PAS-0843/ProcedureRequest?id=1000000001550'
              }
            }
          },
          {
            resource: {
              resourceType: 'Procedure',
              id: '10',
              subject: {
                reference: 'http://hlblor005.cschealthlab.com/LMHIAService/api/v1/patient/14'
              },
              status: 'completed',
              code: {
                coding: [
                  {
                    code: '84901000000108',
                    display: 'Anaesthesia for procedure on spine'
                  }
                ]
              },
              performer: [
                {
                  actor: {
                    reference: 'BROWN-ONE Ratony'
                  },
                  role: {
                    coding: [
                      {
                        system: 'CSC_HC_Practitioner-Role_1_Ext',
                        code: 'administrator',
                        display: 'administrator Role'
                      }
                    ]
                  }
                }
              ],
              performedDate: '2016-12-03T10:53:00Z',
              request: {
                reference: 'http://hlblor005.cschealthlab.com/LMHIAService/api/v1/patient/pas%20number~PAS-0843/ProcedureRequest?id=1000000001548'
              }
            }
          },
          {
            resource: {
              resourceType: 'Procedure',
              id: '11',
              subject: {
                reference: 'http://hlblor005.cschealthlab.com/LMHIAService/api/v1/patient/14'
              },
              status: 'completed',
              code: {
                coding: [
                  {
                    code: '201631000000101',
                    display: 'Application of skeletal traction via the femur'
                  }
                ]
              },
              request: {
                reference: 'http://hlblor005.cschealthlab.com/LMHIAService/api/v1/patient/pas%20number~PAS-0843/ProcedureRequest?id=1000000001550'
              }
            }
          },
          {
            resource: {
              resourceType: 'Procedure',
              id: '12',
              subject: {
                reference: 'http://hlblor005.cschealthlab.com/LMHIAService/api/v1/patient/14'
              },
              status: 'completed',
              code: {
                coding: [
                  {
                    code: '201631000000101',
                    display: 'Operative procedure on lower leg'
                  }
                ]
              },
              bodySite: {
                coding: [
                  {
                    code: '84901000000108',
                    display: 'Structure of cardiovascular system'
                  }
                ]
              },
              performedDate: '2016-12-03T09:53:00Z',
              request: {
                reference: 'http://hlblor005.cschealthlab.com/LMHIAService/api/v1/patient/pas%20number~PAS-0843/ProcedureRequest?id=1000000001550'
              }
            }
          },
        ]
      }
    ];

    res.json(jsonObj);
  } else {
    res.send("Error");
  }

});

app.get('/api/flag', function (req, res) {

  var patient_id = req.query.patient;

  if (patient_id) {
    var jsonObj = [
      {
        resourceType: 'Bundle',
        entry: [
          {
            resource: {
              resourceType: 'Flag',
              id: '1',
              category: {
                coding: [
                  {
                    system: 'CSC_HC_AlertCategory_1_Ext',
                    display: 'Infection'
                  }
                ]
              },
              status: 'active',
              period: {
                start: '2015-08-12T11:1:00Z'
              },
              subject: {
                reference: 'http://hlblor005.cschealthlab.com/LMHIAService/api/v1/patient/1'
              },
              author: {
                reference: 'http://hlblor005.cschealthlab.com/LMHIAService/api/v1/practitioner/0'
              },
              code: {
                coding: [
                  {
                    system: 'CSC_HC_AlertTypeCode_1_Ext',
                    code: 'CC_HISTORYTHEFT',
                    display: 'MRSA Positive'
                  }
                ]
              }
            }
          },
          {
            resource: {
              resourceType: 'Flag',
              id: '2',
              category: {
                coding: [
                  {
                    system: 'CSC_HC_AlertCategory_1_Ext',
                    display: 'Environmental'
                  }
                ]
              },
              status: 'active',
              period: {
                start: ''
              },
              subject: {
                reference: 'http://hlblor005.cschealthlab.com/LMHIAService/api/v1/patient/1'
              },
              author: {
                reference: 'http://hlblor005.cschealthlab.com/LMHIAService/api/v1/practitioner/0'
              },
              code: {
                coding: [
                  {
                    system: 'CSC_HC_AlertTypeCode_1_Ext',
                    code: 'CC_CPHFGM',
                    display: 'Pet Hazard'
                  }
                ]
              }
            }
          },
          {
            resource: {
              resourceType: 'Flag',
              id: '3',
              category: {
                coding: [
                  {
                    system: 'CSC_HC_AlertCategory_1_Ext',
                    display: 'Administrative'
                  }
                ]
              },
              status: 'active',
              period: {
                start: ''
              },
              subject: {
                reference: 'http://hlblor005.cschealthlab.com/LMHIAService/api/v1/patient/1'
              },
              author: {
                reference: 'http://hlblor005.cschealthlab.com/LMHIAService/api/v1/practitioner/0'
              },
              code: {
                coding: [
                  {
                    system: 'CSC_HC_AlertTypeCode_1_Ext',
                    code: 'CC_HISTORYTHEFT',
                    display: 'No Permanent Address'
                  }
                ]
              }
            }
          },
          {
            resource: {
              resourceType: 'Flag',
              id: '4',
              category: {
                coding: [
                  {
                    system: 'CSC_HC_AlertCategory_1_Ext',
                    display: 'Subject Contact'
                  }
                ]
              },
              status: 'active',
              period: {
                start: '2015-12-10T10:12:00Z'
              },
              subject: {
                reference: 'http://hlblor005.cschealthlab.com/LMHIAService/api/v1/patient/1'
              },
              author: {
                reference: 'http://hlblor005.cschealthlab.com/LMHIAService/api/v1/practitioner/0'
              },
              code: {
                coding: [
                  {
                    system: 'CSC_HC_AlertTypeCode_1_Ext',
                    code: 'CC_CPHFGM',
                    display: 'Partially Deaf'
                  }
                ]
              }
            }
          },
          {
            resource: {
              resourceType: 'Flag',
              id: '5',
              category: {
                coding: [
                  {
                    system: 'CSC_HC_AlertCategory_1_Ext',
                    display: 'Infection'
                  }
                ]
              },
              status: 'active',
              period: {
                start: '2015-08-12T11:1:00Z'
              },
              subject: {
                reference: 'http://hlblor005.cschealthlab.com/LMHIAService/api/v1/patient/8'
              },
              author: {
                reference: 'http://hlblor005.cschealthlab.com/LMHIAService/api/v1/practitioner/0'
              },
              code: {
                coding: [
                  {
                    system: 'CSC_HC_AlertTypeCode_1_Ext',
                    code: 'CC_HISTORYTHEFT',
                    display: 'MRSA Positive'
                  }
                ]
              }
            }
          },
          {
            resource: {
              resourceType: 'Flag',
              id: '6',
              category: {
                coding: [
                  {
                    system: 'CSC_HC_AlertCategory_1_Ext',
                    display: 'Environmental'
                  }
                ]
              },
              status: 'active',
              period: {
                start: ''
              },
              subject: {
                reference: 'http://hlblor005.cschealthlab.com/LMHIAService/api/v1/patient/8'
              },
              author: {
                reference: 'http://hlblor005.cschealthlab.com/LMHIAService/api/v1/practitioner/0'
              },
              code: {
                coding: [
                  {
                    system: 'CSC_HC_AlertTypeCode_1_Ext',
                    code: 'CC_CPHFGM',
                    display: 'Pet Hazard'
                  }
                ]
              }
            }
          },
          {
            resource: {
              resourceType: 'Flag',
              id: '7',
              category: {
                coding: [
                  {
                    system: 'CSC_HC_AlertCategory_1_Ext',
                    display: 'Administrative'
                  }
                ]
              },
              status: 'active',
              period: {
                start: ''
              },
              subject: {
                reference: 'http://hlblor005.cschealthlab.com/LMHIAService/api/v1/patient/14'
              },
              author: {
                reference: 'http://hlblor005.cschealthlab.com/LMHIAService/api/v1/practitioner/0'
              },
              code: {
                coding: [
                  {
                    system: 'CSC_HC_AlertTypeCode_1_Ext',
                    code: 'CC_HISTORYTHEFT',
                    display: 'No Permanent Address'
                  }
                ]
              }
            }
          },
        ]
      }

    ];

    res.json(jsonObj);
  } else {
    res.send("Error");
  }

});

app.get('/api/condition', function (req, res) {

  var patient_id = req.query.patient;

  if (patient_id) {
    var jsonObj = [{
      resourceType: 'Condition',
      id: '1',
      patient: {
        reference: 'Patient/1'
      },
      encounter: {
        reference: 'Encounter/1'
      },
      asserter: {
        reference: 'Practitioner/1'
      },
      category: {
        coding: [{
          system: 'http://hl7.org/fhir/condition-category',
          code: 'diagnosis',
          display: 'Diagnosis'
        }]
      },
      code: {
        coding: [{
          system: 'http://snomed.info/sct',
          code: '2805007',
          display: 'Acute myocardial infarction'
        }]
      },
      severity: {
        coding: [{
          system: 'http://snomed.info/sct',
          code: '24484000',
          display: 'Severe'
        }]
      },
      clinicalStatus: 'active',
      verificationStatus: 'provisional',
      onsetDateTime: "2015-11-12"
    },
    {
      resourceType: 'Condition',
      id: '2',
      patient: {
        reference: 'Patient/1'
      },
      encounter: {
        reference: 'Encounter/1'
      },
      asserter: {
        reference: 'Practitioner/1'
      },
      category: {
        coding: [{
          system: 'http://hl7.org/fhir/condition-category',
          code: 'symptom',
          display: 'Symptoms'
        }]
      },
      code: {
        coding: [{
          system: 'http://snomed.info/sct',
          code: '386661006',
          display: 'Central chest pain'
        }]
      },
      severity: {
        coding: [{
          system: 'http://snomed.info/sct',
          code: '255604002',
          display: 'Mild'
        }]
      },
      clinicalStatus: 'resolved',
      verificationStatus: 'confirmed',
      onsetDateTime: "2015-11-05",
      abatementDateTime: "2016-09-10"
    },
    {
      resourceType: 'Condition',
      id: '3',
      patient: {
        reference: 'Patient/1'
      },
      encounter: {
        reference: 'Encounter/1'
      },
      asserter: {
        reference: 'Practitioner/1'
      },
      category: {
        coding: [{
          system: 'http://hl7.org/fhir/condition-category',
          code: 'symptom',
          display: 'Symptoms'
        }]
      },
      code: {
        coding: [{
          system: 'http://snomed.info/sct',
          code: '18099001',
          display: 'Back ache'
        }]
      },
      severity: {
        coding: [{
          system: 'http://snomed.info/sct',
          code: '255604002',
          display: 'Mild'
        }]
      },
      clinicalStatus: 'active',
      verificationStatus: 'confirmed',
      onsetDateTime: "2016-09-12"
    },
    {
      resourceType: 'Condition',
      id: '4',
      patient: {
        reference: 'Patient/1'
      },
      encounter: {
        reference: 'Encounter/1'
      },
      asserter: {
        reference: 'Practitioner/1'
      },
      category: {
        coding: [{
          system: 'http://hl7.org/fhir/condition-category',
          code: 'symptom',
          display: 'Symptoms'
        }]
      },
      code: {
        coding: [{
          system: 'http://snomed.info/sct',
          code: '18099001',
          display: 'Acquired fracture of neck of femur'
        }]
      },
      severity: {
        coding: [{
          system: 'http://snomed.info/sct',
          code: '255604002',
          display: 'Mild'
        }]
      },
      clinicalStatus: 'active',
      verificationStatus: 'confirmed',
      onsetDateTime: "2015-10-25"
    },
    {
      resourceType: 'Condition',
      id: '5',
      patient: {
        reference: 'Patient/2'
      },
      encounter: {
        reference: 'Encounter/4'
      },
      asserter: {
        reference: 'Practitioner/1'
      },
      category: {
        coding: [{
          system: 'http://hl7.org/fhir/condition-category',
          code: 'diagnosis',
          display: 'Diagnosis'
        }]
      },
      code: {
        coding: [{
          system: 'http://snomed.info/sct',
          code: '368009',
          display: 'Heart valve disorder'
        }]
      },
      severity: {
        coding: [{
          system: 'http://snomed.info/sct',
          code: '24484000',
          display: 'Severe'
        }]
      },
      clinicalStatus: 'active',
      verificationStatus: 'confirmed',
      onsetDateTime: "2016-09-12"
    },
    {
      resourceType: 'Condition',
      id: '6',
      patient: {
        reference: 'Patient/3'
      },
      encounter: {
        reference: 'Encounter/5'
      },
      asserter: {
        reference: 'Practitioner/1'
      },
      category: {
        coding: [{
          system: 'http://hl7.org/fhir/condition-category',
          code: 'diagnosis',
          display: 'Diagnosis'
        }]
      },
      code: {
        coding: [{
          system: 'http://snomed.info/sct',
          code: '254637007',
          display: 'NSCLC - Non-small cell lung cancer'
        }]
      },
      severity: {
        coding: [{
          system: 'http://snomed.info/sct',
          code: '24484000',
          display: 'Severe'
        }]
      },
      clinicalStatus: 'relapse',
      verificationStatus: 'confirmed',
      onsetDateTime: "2016-05-05"
    },
    {
      resourceType: 'Condition',
      id: '7',
      patient: {
        reference: 'Patient/8'
      },
      encounter: {
        reference: 'Encounter/5'
      },
      asserter: {
        reference: 'Practitioner/1'
      },
      category: {
        coding: [{
          system: 'http://hl7.org/fhir/condition-category',
          code: 'diagnosis',
          display: 'Diagnosis'
        }]
      },
      code: {
        coding: [{
          system: 'http://snomed.info/sct',
          code: '254637007',
          display: 'Asthma'
        }]
      },
      severity: {
        coding: [{
          system: 'http://snomed.info/sct',
          code: '24484000',
          display: 'Severe'
        }]
      },
      clinicalStatus: 'relapse',
      verificationStatus: 'confirmed',
      onsetDateTime: "2015-01-12"
    },
    {
      resourceType: 'Condition',
      id: '8',
      patient: {
        reference: 'Patient/8'
      },
      encounter: {
        reference: 'Encounter/5'
      },
      asserter: {
        reference: 'Practitioner/1'
      },
      category: {
        coding: [{
          system: 'http://hl7.org/fhir/condition-category',
          code: 'diagnosis',
          display: 'Diagnosis'
        }]
      },
      code: {
        coding: [{
          system: 'http://snomed.info/sct',
          code: '254637007',
          display: 'Diabets'
        }]
      },
      severity: {
        coding: [{
          system: 'http://snomed.info/sct',
          code: '24484000',
          display: 'Severe'
        }]
      },
      clinicalStatus: 'relapse',
      verificationStatus: 'confirmed',
      onsetDateTime: "2015-05-06"
    },
    {
      resourceType: 'Condition',
      id: '9',
      patient: {
        reference: 'Patient/8'
      },
      encounter: {
        reference: 'Encounter/5'
      },
      asserter: {
        reference: 'Practitioner/1'
      },
      category: {
        coding: [{
          system: 'http://hl7.org/fhir/condition-category',
          code: 'diagnosis',
          display: 'Diagnosis'
        }]
      },
      code: {
        coding: [{
          system: 'http://snomed.info/sct',
          code: '254637007',
          display: 'High blood pressure'
        }]
      },
      severity: {
        coding: [{
          system: 'http://snomed.info/sct',
          code: '24484000',
          display: 'Severe'
        }]
      },
      clinicalStatus: 'relapse',
      verificationStatus: 'confirmed',
      onsetDateTime: "2015-02-07"
    },
    {
      resourceType: 'Condition',
      id: '10',
      patient: {
        reference: 'Patient/14'
      },
      encounter: {
        reference: 'Encounter/1'
      },
      asserter: {
        reference: 'Practitioner/1'
      },
      category: {
        coding: [{
          system: 'http://hl7.org/fhir/condition-category',
          code: 'diagnosis',
          display: 'Diagnosis'
        }]
      },
      code: {
        coding: [{
          system: 'http://snomed.info/sct',
          code: '2805007',
          display: 'Inherited renal tubule insufficiency with cholestatic jaundice'
        }]
      },
      severity: {
        coding: [{
          system: 'http://snomed.info/sct',
          code: '24484000',
          display: 'Severe'
        }]
      },
      clinicalStatus: 'active',
      verificationStatus: 'provisional',
      onsetDateTime: "2016-05-23"
    },
    {
      resourceType: 'Condition',
      id: '11',
      patient: {
        reference: 'Patient/14'
      },
      encounter: {
        reference: 'Encounter/1'
      },
      asserter: {
        reference: 'Practitioner/1'
      },
      category: {
        coding: [{
          system: 'http://hl7.org/fhir/condition-category',
          code: 'symptom',
          display: 'Symptoms'
        }]
      },
      code: {
        coding: [{
          system: 'http://snomed.info/sct',
          code: '2805007',
          display: 'Abdominal bloating'
        }]
      },
      severity: {
        coding: [{
          system: 'http://snomed.info/sct',
          code: '24484000',
          display: 'Severe'
        }]
      },
      clinicalStatus: 'active',
      verificationStatus: 'provisional',
      onsetDateTime: "2016-05-13"
    },
    {
      resourceType: 'Condition',
      id: '12',
      patient: {
        reference: 'Patient/14'
      },
      encounter: {
        reference: 'Encounter/1'
      },
      asserter: {
        reference: 'Practitioner/1'
      },
      category: {
        coding: [{
          system: 'http://hl7.org/fhir/condition-category',
          code: 'diagnosis',
          display: 'Diagnosis'
        }]
      },
      code: {
        coding: [{
          system: 'http://snomed.info/sct',
          code: '2805007',
          display: 'Able to move all four limbs'
        }]
      },
      severity: {
        coding: [{
          system: 'http://snomed.info/sct',
          code: '24484000',
          display: 'Severe'
        }]
      },
      clinicalStatus: 'active',
      verificationStatus: 'provisional',
      onsetDateTime: "2016-12-14"
    },
    {
      resourceType: 'Condition',
      id: '13',
      patient: {
        reference: 'Patient/14'
      },
      encounter: {
        reference: 'Encounter/1'
      },
      asserter: {
        reference: 'Practitioner/1'
      },
      category: {
        coding: [{
          system: 'http://hl7.org/fhir/condition-category',
          code: 'symptom',
          display: 'Symptoms'
        }]
      },
      code: {
        coding: [{
          system: 'http://snomed.info/sct',
          code: '2805007',
          display: 'Shortness of breath'
        }]
      },
      severity: {
        coding: [{
          system: 'http://snomed.info/sct',
          code: '24484000',
          display: 'Severe'
        }]
      },
      clinicalStatus: 'active',
      verificationStatus: 'provisional',
      onsetDateTime: "2016-05-23"
    },
    {
      resourceType: 'Condition',
      id: '14',
      patient: {
        reference: 'Patient/14'
      },
      encounter: {
        reference: 'Encounter/1'
      },
      asserter: {
        reference: 'Practitioner/1'
      },
      category: {
        coding: [{
          system: 'http://hl7.org/fhir/condition-category',
          code: 'diagnosis',
          display: 'Diagnosis'
        }]
      },
      code: {
        coding: [{
          system: 'http://snomed.info/sct',
          code: '2805007',
          display: 'Fracture of neck of femur'
        }]
      },
      severity: {
        coding: [{
          system: 'http://snomed.info/sct',
          code: '24484000',
          display: 'Severe'
        }]
      },
      clinicalStatus: 'active',
      verificationStatus: 'provisional',
      onsetDateTime: "2016-05-13"
    },
    ];

    res.json(jsonObj);
  } else {
    res.send("Error");
  }

});

app.get('/api/Patient/:patient_id', function (req, res) {

  var jsonObj = [{
    resourceType: 'Patient',
    id: '1',
    identifier: [
      {
        use: 'official',
        type: {
          coding: [
            {
              system: 'http://hl7.org/fhir/ValueSet/identifier-type',
              code: 'NHSNo',
              display: 'National Health Service'
            }
          ]
        },
        value: '0165892390',
      },
      {
        use: 'usual',
        type: {
          coding: [
            {
              system: 'http://hl7.org/fhir/ValueSet/identifier-type',
              code: 'PAS',
              display: 'PAS ID'
            }
          ]
        },
        value: 'RY10001294',
      }
    ],
    name: [
      {
        use: 'usual',
        family: [
          'hart'
        ],
        given: [
          'Marie',
          'Susan'
        ],
        prefix: [
          'Mrs'
        ]
      }
    ],
    gender: 'Female',
    birthDate: '1990-04-12T06:30:00Z',
    deceasedBoolean: false,
    numberOfFetus: 3,
    agreedEddDate: '17-Mar-2017',
    gravida: 'G1',
    parity: 'P1+0',
    lmpDate: '10-Jun-16',
    leadName: 'BobbieJo Eckart',
    address: [
      {
        use: 'home',
        line: [
          '61 Wellfield Road'
        ],
        city: 'Bulimba',
        state: '',
        postalCode: 'QLD4171',
        country: 'UK',
      }
    ],
    telecom: [
      {
        system: 'phone',
        use: 'mobile',
        value: '043823832',
        rank: 1
      },
      {
        system: 'phone',
        use: 'home',
        value: '016 8778 4428',
        rank: 2
      },
      {
        system: 'phone',
        use: 'work',
        value: '043823832',
        rank: 3
      },
      {
        system: 'email',
        use: 'work',
        value: 'hart.Susan@example.com',
        rank: 4
      }
    ],
    contact: [
      {
        relationship: [
          {
            coding: [
              {
                system: 'http://hl7.org/fhir/ValueSet/identifier-type',
                code: 'partner',
                display: 'Partner'
              }
            ]
          }
        ],
        name: {
          use: 'usual',
          family: [
            "hart"
          ],
          given: [
            'Michael'
          ],
          prefix: [
            'Mr'
          ]
        },
        telecom: [
          {
            system: 'phone',
            use: 'mobile',
            value: '0403 123 456',
            rank: 1
          },
          {
            system: 'phone',
            use: 'home',
            value: '08 4564 3214',
            rank: 2
          },
          {
            system: 'phone',
            use: 'work',
            value: '08 9994 5547',
            rank: 3
          },
          {
            system: 'email',
            use: 'work',
            value: 'mike@work.com',
            rank: 4
          }
        ],
        address: {
          use: 'home',
          line: [
            '52 Kenbury St'
          ],
          city: 'Bulimba',
          state: '',
          postalCode: 'QLD4171',
          country: 'UK',
        },
        gender: 'male'
      }
    ],
    careProvider: [
      {
        reference: 'Practitioner/1'
      }
    ]
  },
  {
    resourceType: 'Patient',
    id: '2',
    identifier: [
      {
        use: 'official',
        type: {
          coding: [
            {
              system: 'http://hl7.org/fhir/ValueSet/identifier-type',
              code: 'NHSNo',
              display: 'National Health Service'
            }
          ]
        },
        value: '0165892391',
      },
      {
        use: 'usual',
        type: {
          coding: [
            {
              system: 'http://hl7.org/fhir/ValueSet/identifier-type',
              code: 'PAS',
              display: 'PAS ID'
            }
          ]
        },
        value: 'RY10001295',
      }
    ],
    name: [
      {
        use: 'usual',
        family: [
          'ava'
        ],
        given: [
          '',
          'Smith'
        ],
        prefix: [
          'Mrs'
        ]
      }
    ],
    gender: 'Female',
    birthDate: '1989-04-10T06:30:00Z',
    deceasedBoolean: false,
    numberOfFetus: 1,
    agreedEddDate: '01-Aug-2017',
    gravida: 'G1',
    parity: 'P1+0',
    lmpDate: '25-Oct-16',
    leadName: 'Mary Watsons',
    address: [
      {
        use: 'home',
        line: [
          '101 Staint James'
        ],
        city: 'Northampton',
        state: '',
        postalCode: 'NN55JP',
        country: 'UK',
      }
    ],
    telecom: [
      {
        system: 'phone',
        use: 'mobile',
        value: '0403 823 832',
        rank: 1
      },
      {
        system: 'phone',
        use: 'home',
        value: '08 9398 1165',
        rank: 2
      },
      {
        system: 'phone',
        use: 'work',
        value: '08 9876 5432',
        rank: 3
      },
      {
        system: 'email',
        use: 'work',
        value: 'ava.Smith@gmail.com',
        rank: 4
      }
    ],
    contact: [
      {
        relationship: [
          {
            coding: [
              {
                system: 'http://hl7.org/fhir/ValueSet/identifier-type',
                code: 'partner',
                display: 'Partner'
              }
            ]
          }
        ],
        name: {
          use: 'usual',
          family: [
            "ava"
          ],
          given: [
            'Michael'
          ],
          prefix: [
            'Mr'
          ]
        },
        telecom: [
          {
            system: 'phone',
            use: 'mobile',
            value: '0403 123 456',
            rank: 1
          },
          {
            system: 'phone',
            use: 'home',
            value: '08 4564 3214',
            rank: 2
          },
          {
            system: 'phone',
            use: 'work',
            value: '08 9994 5547',
            rank: 3
          },
          {
            system: 'email',
            use: 'work',
            value: 'mike@work.com',
            rank: 4
          }
        ],
        address: {
          use: 'home',
          line: [
            '101 Staint James'
          ],
          city: 'Northampton',
          state: '',
          postalCode: 'NN55JP',
          country: 'UK',
        },
        gender: 'male'
      }
    ],
    careProvider: [
      {
        reference: 'Practitioner/1'
      }
    ]
  },
  {
    resourceType: 'Patient',
    id: '3',
    identifier: [
      {
        use: 'official',
        type: {
          coding: [
            {
              system: 'http://hl7.org/fhir/ValueSet/identifier-type',
              code: 'NHSNo',
              display: 'National Health Service'
            }
          ]
        },
        value: '0165892392',
      },
      {
        use: 'usual',
        type: {
          coding: [
            {
              system: 'http://hl7.org/fhir/ValueSet/identifier-type',
              code: 'PAS',
              display: 'PAS ID'
            }
          ]
        },
        value: 'RY10001296',
      }
    ],
    name: [
      {
        use: 'usual',
        family: [
          'alice'
        ],
        given: [
          'Cristin',
          'Evens'
        ],
        prefix: [
          'Mrs'
        ]
      }
    ],
    gender: 'Female',
    birthDate: '1992-02-29T06:30:00Z',
    deceasedBoolean: false,
    numberOfFetus: 2,
    agreedEddDate: '08-Jul-2017',
    gravida: 'G2',
    parity: 'P1+0',
    lmpDate: '01-Oct-16',
    leadName: 'Mary Watsons',
    address: [
      {
        use: 'home',
        line: [
          'Unit 3, Capricorn Centre, Coppen Rd'
        ],
        city: 'Dagenham',
        state: '',
        postalCode: 'RM81HJ',
        country: 'UK',
      }
    ],
    telecom: [
      {
        system: 'phone',
        use: 'mobile',
        value: '0403 823 832',
        rank: 1
      },
      {
        system: 'phone',
        use: 'home',
        value: '08 9398 1165',
        rank: 2
      },
      {
        system: 'phone',
        use: 'work',
        value: '08 9876 5432',
        rank: 3
      },
      {
        system: 'email',
        use: 'work',
        value: 'alice.Evens@gmail.com',
        rank: 4
      }
    ],
    contact: [
      {
        relationship: [
          {
            coding: [
              {
                system: 'http://hl7.org/fhir/ValueSet/identifier-type',
                code: 'partner',
                display: 'Partner'
              }
            ]
          }
        ],
        name: {
          use: 'usual',
          family: [
            "alice"
          ],
          given: [
            'Michael'
          ],
          prefix: [
            'Mr'
          ]
        },
        telecom: [
          {
            system: 'phone',
            use: 'mobile',
            value: '0403 123 456',
            rank: 1
          },
          {
            system: 'phone',
            use: 'home',
            value: '08 4564 3214',
            rank: 2
          },
          {
            system: 'phone',
            use: 'work',
            value: '08 9994 5547',
            rank: 3
          },
          {
            system: 'email',
            use: 'work',
            value: 'mike@work.com',
            rank: 4
          }
        ],
        address: {
          use: 'home',
          line: [
            'Unit 3, Capricorn Centre, Coppen Rd'
          ],
          city: 'Dagenham',
          state: '',
          postalCode: 'RM81HJ',
          country: 'UK',
        },
        gender: 'male'
      }
    ],
    careProvider: [
      {
        reference: 'Practitioner/1'
      }
    ]
  },
  {
    resourceType: 'Patient',
    id: '4',
    identifier: [
      {
        use: 'official',
        type: {
          coding: [
            {
              system: 'http://hl7.org/fhir/ValueSet/identifier-type',
              code: 'NHSNo',
              display: 'National Health Service'
            }
          ]
        },
        value: '0165892393',
      },
      {
        use: 'usual',
        type: {
          coding: [
            {
              system: 'http://hl7.org/fhir/ValueSet/identifier-type',
              code: 'PAS',
              display: 'PAS ID'
            }
          ]
        },
        value: 'RY10001297',
      }
    ],
    name: [
      {
        use: 'usual',
        family: [
          'amelia'
        ],
        given: [
          'Carolin',
          'Hall'
        ],
        prefix: [
          'Mrs'
        ]
      }
    ],
    gender: 'Female',
    birthDate: '1992-02-29T06:30:00Z',
    deceasedBoolean: false,
    numberOfFetus: 1,
    agreedEddDate: '15-Mar-2017',
    gravida: 'G1',
    parity: 'P1+0',
    lmpDate: '08-Jun-16',
    leadName: 'Amie Craver',
    address: [
      {
        use: 'home',
        line: [
          '15a, Raven Rd'
        ],
        city: 'London',
        state: '',
        postalCode: 'E181HB',
        country: 'UK',
      }
    ],
    telecom: [
      {
        system: 'phone',
        use: 'mobile',
        value: '0403 823 832',
        rank: 1
      },
      {
        system: 'phone',
        use: 'home',
        value: '08 9398 1165',
        rank: 2
      },
      {
        system: 'phone',
        use: 'work',
        value: '08 9876 5432',
        rank: 3
      },
      {
        system: 'email',
        use: 'work',
        value: 'amelia.Hall@gmail.com',
        rank: 4
      }
    ],
    contact: [
      {
        relationship: [
          {
            coding: [
              {
                system: 'http://hl7.org/fhir/ValueSet/identifier-type',
                code: 'partner',
                display: 'Partner'
              }
            ]
          }
        ],
        name: {
          use: 'usual',
          family: [
            "amelia"
          ],
          given: [
            'Michael'
          ],
          prefix: [
            'Mr'
          ]
        },
        telecom: [
          {
            system: 'phone',
            use: 'mobile',
            value: '0403 123 456',
            rank: 1
          },
          {
            system: 'phone',
            use: 'home',
            value: '08 4564 3214',
            rank: 2
          },
          {
            system: 'phone',
            use: 'work',
            value: '08 9994 5547',
            rank: 3
          },
          {
            system: 'email',
            use: 'work',
            value: 'mike@work.com',
            rank: 4
          }
        ],
        address: {
          use: 'home',
          line: [
            '15a, Raven Rd'
          ],
          city: 'London',
          state: '',
          postalCode: 'E181HB',
          country: 'UK',
        },
        gender: 'male'
      }
    ],
    careProvider: [
      {
        reference: 'Practitioner/1'
      }
    ]
  },
  {
    resourceType: 'Patient',
    id: '5',
    identifier: [
      {
        use: 'official',
        type: {
          coding: [
            {
              system: 'http://hl7.org/fhir/ValueSet/identifier-type',
              code: 'NHSNo',
              display: 'National Health Service'
            }
          ]
        },
        value: '0165892394',
      },
      {
        use: 'usual',
        type: {
          coding: [
            {
              system: 'http://hl7.org/fhir/ValueSet/identifier-type',
              code: 'PAS',
              display: 'PAS ID'
            }
          ]
        },
        value: 'RY10001298',
      }
    ],
    name: [
      {
        use: 'usual',
        family: [
          'ruby'
        ],
        given: [
          'Rose',
          'White'
        ],
        prefix: [
          'Mrs'
        ]
      }
    ],
    gender: 'Female',
    birthDate: '1992-02-29T06:30:00Z',
    deceasedBoolean: false,
    numberOfFetus: 3,
    agreedEddDate: '13-Feb-2017',
    gravida: 'G1',
    parity: 'P1+0',
    lmpDate: '09-May-16',
    leadName: 'Mary Watsons',
    address: [
      {
        use: 'home',
        line: [
          'Linen Green'
        ],
        city: 'Dungannon',
        state: '',
        postalCode: 'BT717HB',
        country: 'UK',
      }
    ],
    telecom: [
      {
        system: 'phone',
        use: 'mobile',
        value: '0403 823 832',
        rank: 1
      },
      {
        system: 'phone',
        use: 'home',
        value: '08 9398 1165',
        rank: 2
      },
      {
        system: 'phone',
        use: 'work',
        value: '08 9876 5432',
        rank: 3
      },
      {
        system: 'email',
        use: 'work',
        value: 'ruby.White@gmail.com',
        rank: 4
      }
    ],
    contact: [
      {
        relationship: [
          {
            coding: [
              {
                system: 'http://hl7.org/fhir/ValueSet/identifier-type',
                code: 'partner',
                display: 'Partner'
              }
            ]
          }
        ],
        name: {
          use: 'usual',
          family: [
            "ruby"
          ],
          given: [
            'Michael'
          ],
          prefix: [
            'Mr'
          ]
        },
        telecom: [
          {
            system: 'phone',
            use: 'mobile',
            value: '0403 123 456',
            rank: 1
          },
          {
            system: 'phone',
            use: 'home',
            value: '08 4564 3214',
            rank: 2
          },
          {
            system: 'phone',
            use: 'work',
            value: '08 9994 5547',
            rank: 3
          },
          {
            system: 'email',
            use: 'work',
            value: 'mike@work.com',
            rank: 4
          }
        ],
        address: {
          use: 'home',
          line: [
            'Linen Green'
          ],
          city: 'Dungannon',
          state: '',
          postalCode: 'BT717HB',
          country: 'UK',
        },
        gender: 'male'
      }
    ],
    careProvider: [
      {
        reference: 'Practitioner/1'
      }
    ]
  },
  {
    resourceType: 'Patient',
    id: '6',
    identifier: [
      {
        use: 'official',
        type: {
          coding: [
            {
              system: 'http://hl7.org/fhir/ValueSet/identifier-type',
              code: 'NHSNo',
              display: 'National Health Service'
            }
          ]
        },
        value: '0165892395',
      },
      {
        use: 'usual',
        type: {
          coding: [
            {
              system: 'http://hl7.org/fhir/ValueSet/identifier-type',
              code: 'PAS',
              display: 'PAS ID'
            }
          ]
        },
        value: 'RY10001299',
      }
    ],
    name: [
      {
        use: 'usual',
        family: [
          'john'
        ],
        given: [
          'Nicolis',
          'Henry'
        ],
        prefix: [
          'Mrs'
        ]
      }
    ],
    gender: 'Female',
    birthDate: '1995-05-29T06:30:00Z',
    deceasedBoolean: false,
    numberOfFetus: 1,
    agreedEddDate: '17-Jun-2017',
    gravida: 'G1',
    parity: 'P1+0',
    lmpDate: '10-Sep-16',
    leadName: 'Mary Watsons',
    address: [
      {
        use: 'home',
        line: [
          '62 Clyde Crescent'
        ],
        city: 'Upminster',
        state: '',
        postalCode: 'RM141SU',
        country: 'UK',
      }
    ],
    telecom: [
      {
        system: 'phone',
        use: 'mobile',
        value: '0403 823 832',
        rank: 1
      },
      {
        system: 'phone',
        use: 'home',
        value: '08 9398 1165',
        rank: 2
      },
      {
        system: 'phone',
        use: 'work',
        value: '08 9876 5432',
        rank: 3
      },
      {
        system: 'email',
        use: 'work',
        value: 'john.Henry@gmail.com',
        rank: 4
      }
    ],
    contact: [
      {
        relationship: [
          {
            coding: [
              {
                system: 'http://hl7.org/fhir/ValueSet/identifier-type',
                code: 'partner',
                display: 'Partner'
              }
            ]
          }
        ],
        name: {
          use: 'usual',
          family: [
            "john"
          ],
          given: [
            'Michael'
          ],
          prefix: [
            'Mr'
          ]
        },
        telecom: [
          {
            system: 'phone',
            use: 'mobile',
            value: '0403 123 456',
            rank: 1
          },
          {
            system: 'phone',
            use: 'home',
            value: '08 4564 3214',
            rank: 2
          },
          {
            system: 'phone',
            use: 'work',
            value: '08 9994 5547',
            rank: 3
          },
          {
            system: 'email',
            use: 'work',
            value: 'mike@work.com',
            rank: 4
          }
        ],
        address: {
          use: 'home',
          line: [
            '62 Clyde Crescent'
          ],
          city: 'Upminster',
          state: '',
          postalCode: 'RM141SU',
          country: 'UK',
        },
        gender: 'male'
      }
    ],
    careProvider: [
      {
        reference: 'Practitioner/1'
      }
    ]
  },
  {
    resourceType: 'Patient',
    id: '7',
    identifier: [
      {
        use: 'official',
        type: {
          coding: [
            {
              system: 'http://hl7.org/fhir/ValueSet/identifier-type',
              code: 'NHSNo',
              display: 'National Health Service'
            }
          ]
        },
        value: '0165892396',
      },
      {
        use: 'usual',
        type: {
          coding: [
            {
              system: 'http://hl7.org/fhir/ValueSet/identifier-type',
              code: 'PAS',
              display: 'PAS ID'
            }
          ]
        },
        value: 'RY10001300',
      }
    ],
    name: [
      {
        use: 'usual',
        family: [
          'martha'
        ],
        given: [
          'Lee',
          'Taylor'
        ],
        prefix: [
          'Mrs'
        ]
      }
    ],
    gender: 'Female',
    birthDate: '1994-02-04T06:30:00Z',
    deceasedBoolean: false,
    numberOfFetus: 1,
    agreedEddDate: '01-Sep-2017',
    gravida: 'G1',
    parity: 'P1+0',
    lmpDate: '25-Nov-16',
    leadName: 'Mary Watsons',
    address: [
      {
        use: 'home',
        line: [
          '671 Bilsland Drive'
        ],
        city: 'Glasgow',
        state: '',
        postalCode: 'G209NF',
        country: 'UK',
      }
    ],
    telecom: [
      {
        system: 'phone',
        use: 'mobile',
        value: '0403 823 832',
        rank: 1
      },
      {
        system: 'phone',
        use: 'home',
        value: '08 9398 1165',
        rank: 2
      },
      {
        system: 'phone',
        use: 'work',
        value: '08 9876 5432',
        rank: 3
      },
      {
        system: 'email',
        use: 'work',
        value: 'martha.Taylor@gmail.com',
        rank: 4
      }
    ],
    contact: [
      {
        relationship: [
          {
            coding: [
              {
                system: 'http://hl7.org/fhir/ValueSet/identifier-type',
                code: 'partner',
                display: 'Partner'
              }
            ]
          }
        ],
        name: {
          use: 'usual',
          family: [
            "martha"
          ],
          given: [
            'Michael'
          ],
          prefix: [
            'Mr'
          ]
        },
        telecom: [
          {
            system: 'phone',
            use: 'mobile',
            value: '0403 123 456',
            rank: 1
          },
          {
            system: 'phone',
            use: 'home',
            value: '08 4564 3214',
            rank: 2
          },
          {
            system: 'phone',
            use: 'work',
            value: '08 9994 5547',
            rank: 3
          },
          {
            system: 'email',
            use: 'work',
            value: 'mike@work.com',
            rank: 4
          }
        ],
        address: {
          use: 'home',
          line: [
            '671 Bilsland Drive'
          ],
          city: 'Glasgow',
          state: '',
          postalCode: 'G209NF',
          country: 'UK',
        },
        gender: 'male'
      }
    ],
    careProvider: [
      {
        reference: 'Practitioner/1'
      }
    ]
  },
  {
    resourceType: 'Patient',
    id: '8',
    identifier: [
      {
        use: 'official',
        type: {
          coding: [
            {
              system: 'http://hl7.org/fhir/ValueSet/identifier-type',
              code: 'NHSNo',
              display: 'National Health Service'
            }
          ]
        },
        value: '0165892397',
      },
      {
        use: 'usual',
        type: {
          coding: [
            {
              system: 'http://hl7.org/fhir/ValueSet/identifier-type',
              code: 'PAS',
              display: 'PAS ID'
            }
          ]
        },
        value: 'RY10001301',
      }
    ],
    name: [
      {
        use: 'usual',
        family: [
          'edith'
        ],
        given: [
          'Kelly',
          'Wright'
        ],
        prefix: [
          'Mrs'
        ]
      }
    ],
    gender: 'Female',
    birthDate: '1980-12-10T06:30:00Z',
    deceasedBoolean: false,
    numberOfFetus: 2,
    agreedEddDate: '15-Jan-2017',
    gravida: 'G4',
    parity: 'P1+0',
    lmpDate: '10-Apr-16',
    leadName: 'BobbieJo Eckart',
    address: [
      {
        use: 'home',
        line: [
          '12 Eton Road'
        ],
        city: 'Swansea',
        state: '',
        postalCode: 'SA55AW',
        country: 'UK',
      }
    ],
    telecom: [
      {
        system: 'phone',
        use: 'mobile',
        value: '12547 154265',
        rank: 1
      },
      {
        system: 'phone',
        use: 'home',
        value: '016 7977 4323',
        rank: 2
      },
      {
        system: 'phone',
        use: 'work',
        value: '',
        rank: 3
      },
      {
        system: 'email',
        use: 'work',
        value: 'example@gmail.com',
        rank: 4
      }
    ],
    contact: [
      {
        relationship: [
          {
            coding: [
              {
                system: 'http://hl7.org/fhir/ValueSet/identifier-type',
                code: 'partner',
                display: 'Partner'
              }
            ]
          }
        ],
        name: {
          use: 'usual',
          family: [
            "edith"
          ],
          given: [
            'Michael'
          ],
          prefix: [
            'Mr'
          ]
        },
        telecom: [
          {
            system: 'phone',
            use: 'mobile',
            value: '0403 123 456',
            rank: 1
          },
          {
            system: 'phone',
            use: 'home',
            value: '08 4564 3214',
            rank: 2
          },
          {
            system: 'phone',
            use: 'work',
            value: '08 9994 5547',
            rank: 3
          },
          {
            system: 'email',
            use: 'work',
            value: 'mike@work.com',
            rank: 4
          }
        ],
        address: {
          use: 'home',
          line: [
            '38 Ravenhill Rd'
          ],
          city: 'Swansea',
          state: '',
          postalCode: 'SA55AW',
          country: 'UK',
        },
        gender: 'male'
      }
    ],
    careProvider: [
      {
        reference: 'Practitioner/1'
      }
    ]
  },
  {
    resourceType: 'Patient',
    id: '9',
    identifier: [
      {
        use: 'official',
        type: {
          coding: [
            {
              system: 'http://hl7.org/fhir/ValueSet/identifier-type',
              code: 'NHSNo',
              display: 'National Health Service'
            }
          ]
        },
        value: '0165892398',
      },
      {
        use: 'usual',
        type: {
          coding: [
            {
              system: 'http://hl7.org/fhir/ValueSet/identifier-type',
              code: 'PAS',
              display: 'PAS ID'
            }
          ]
        },
        value: 'RY10001302',
      }
    ],
    name: [
      {
        use: 'usual',
        family: [
          'sophia'
        ],
        given: [
          'Dinah',
          'Wilson'
        ],
        prefix: [
          'Mrs'
        ]
      }
    ],
    gender: 'Female',
    birthDate: '1985-12-11T06:30:00Z',
    deceasedBoolean: false,
    numberOfFetus: 1,
    agreedEddDate: '18-May-2017',
    gravida: 'G1',
    parity: 'P1+0',
    lmpDate: '11-Aug-16',
    leadName: 'Saeid Izadpanah PE',
    address: [
      {
        use: 'home',
        line: [
          '8 Elm Place'
        ],
        city: 'Houghton Le Spring',
        state: '',
        postalCode: 'DH44EX',
        country: 'UK',
      }
    ],
    telecom: [
      {
        system: 'phone',
        use: 'mobile',
        value: '0403 823 832',
        rank: 1
      },
      {
        system: 'phone',
        use: 'home',
        value: '08 9398 1165',
        rank: 2
      },
      {
        system: 'phone',
        use: 'work',
        value: '08 9876 5432',
        rank: 3
      },
      {
        system: 'email',
        use: 'work',
        value: 'sophia.Wilson@gmail.com',
        rank: 4
      }
    ],
    contact: [
      {
        relationship: [
          {
            coding: [
              {
                system: 'http://hl7.org/fhir/ValueSet/identifier-type',
                code: 'partner',
                display: 'Partner'
              }
            ]
          }
        ],
        name: {
          use: 'usual',
          family: [
            "sophia"
          ],
          given: [
            'Michael'
          ],
          prefix: [
            'Mr'
          ]
        },
        telecom: [
          {
            system: 'phone',
            use: 'mobile',
            value: '0403 123 456',
            rank: 1
          },
          {
            system: 'phone',
            use: 'home',
            value: '08 4564 3214',
            rank: 2
          },
          {
            system: 'phone',
            use: 'work',
            value: '08 9994 5547',
            rank: 3
          },
          {
            system: 'email',
            use: 'work',
            value: 'mike@work.com',
            rank: 4
          }
        ],
        address: {
          use: 'home',
          line: [
            '8 Elm Place'
          ],
          city: 'Houghton Le Spring',
          state: '',
          postalCode: 'DH44EX',
          country: 'UK',
        },
        gender: 'male'
      }
    ],
    careProvider: [
      {
        reference: 'Practitioner/1'
      }
    ]
  },
  {
    resourceType: 'Patient',
    id: '10',
    identifier: [
      {
        use: 'official',
        type: {
          coding: [
            {
              system: 'http://hl7.org/fhir/ValueSet/identifier-type',
              code: 'NHSNo',
              display: 'National Health Service'
            }
          ]
        },
        value: '0165892399',
      },
      {
        use: 'usual',
        type: {
          coding: [
            {
              system: 'http://hl7.org/fhir/ValueSet/identifier-type',
              code: 'PAS',
              display: 'PAS ID'
            }
          ]
        },
        value: 'RY10001303',
      }
    ],
    name: [
      {
        use: 'usual',
        family: [
          'lily'
        ],
        given: [
          'Maisie',
          'Roberts'
        ],
        prefix: [
          'Mrs'
        ]
      }
    ],
    gender: 'Female',
    birthDate: '1991-12-12T06:30:00Z',
    deceasedBoolean: false,
    numberOfFetus: 1,
    agreedEddDate: '12-Aug-2017',
    gravida: 'G2',
    parity: 'P1+0',
    lmpDate: '05-Nov-16',
    leadName: 'Saeid Izadpanah PE',
    address: [
      {
        use: 'home',
        line: [
          '7 Jenning Wood'
        ],
        city: 'Hertfordshire',
        state: '',
        postalCode: 'AL60SL',
        country: 'UK',
      }
    ],
    telecom: [
      {
        system: 'phone',
        use: 'mobile',
        value: '0403 823 832',
        rank: 1
      },
      {
        system: 'phone',
        use: 'home',
        value: '08 9398 1165',
        rank: 2
      },
      {
        system: 'phone',
        use: 'work',
        value: '08 9876 5432',
        rank: 3
      },
      {
        system: 'email',
        use: 'work',
        value: 'lily.Roberts@gmail.com',
        rank: 4
      }
    ],
    contact: [
      {
        relationship: [
          {
            coding: [
              {
                system: 'http://hl7.org/fhir/ValueSet/identifier-type',
                code: 'partner',
                display: 'Partner'
              }
            ]
          }
        ],
        name: {
          use: 'usual',
          family: [
            "lily"
          ],
          given: [
            'Michael'
          ],
          prefix: [
            'Mr'
          ]
        },
        telecom: [
          {
            system: 'phone',
            use: 'mobile',
            value: '0403 123 456',
            rank: 1
          },
          {
            system: 'phone',
            use: 'home',
            value: '08 4564 3214',
            rank: 2
          },
          {
            system: 'phone',
            use: 'work',
            value: '08 9994 5547',
            rank: 3
          },
          {
            system: 'email',
            use: 'work',
            value: 'mike@work.com',
            rank: 4
          }
        ],
        address: {
          use: 'home',
          line: [
            '7 Jenning Wood'
          ],
          city: 'Hertfordshire',
          state: '',
          postalCode: 'AL60SL',
          country: 'UK',
        },
        gender: 'male'
      }
    ],
    careProvider: [
      {
        reference: 'Practitioner/1'
      }
    ]
  },
  {
    resourceType: 'Patient',
    id: '11',
    identifier: [
      {
        use: 'official',
        type: {
          coding: [
            {
              system: 'http://hl7.org/fhir/ValueSet/identifier-type',
              code: 'NHSNo',
              display: 'National Health Service'
            }
          ]
        },
        value: '0165892400',
      },
      {
        use: 'usual',
        type: {
          coding: [
            {
              system: 'http://hl7.org/fhir/ValueSet/identifier-type',
              code: 'PAS',
              display: 'PAS ID'
            }
          ]
        },
        value: 'RY10001304',
      }
    ],
    name: [
      {
        use: 'usual',
        family: [
          'mia'
        ],
        given: [
          'Gideon',
          'Hall'
        ],
        prefix: [
          'Mrs'
        ]
      }
    ],
    gender: 'Female',
    birthDate: '1998-12-13T06:30:00Z',
    deceasedBoolean: false,
    numberOfFetus: 2,
    agreedEddDate: '06-Mar-2017',
    gravida: 'G1',
    parity: 'P1+0',
    lmpDate: '30-May-16',
    leadName: 'Saeid Izadpanah PE',
    address: [
      {
        use: 'home',
        line: [
          'An Bairne, Clay Lane'
        ],
        city: 'Warrington',
        state: '',
        postalCode: 'WA54DJ',
        country: 'UK',
      }
    ],
    telecom: [
      {
        system: 'phone',
        use: 'mobile',
        value: '0403 823 832',
        rank: 1
      },
      {
        system: 'phone',
        use: 'home',
        value: '08 9398 1165',
        rank: 2
      },
      {
        system: 'phone',
        use: 'work',
        value: '08 9876 5432',
        rank: 3
      },
      {
        system: 'email',
        use: 'work',
        value: 'mia.Hall@gmail.com',
        rank: 4
      }
    ],
    contact: [
      {
        relationship: [
          {
            coding: [
              {
                system: 'http://hl7.org/fhir/ValueSet/identifier-type',
                code: 'partner',
                display: 'Partner'
              }
            ]
          }
        ],
        name: {
          use: 'usual',
          family: [
            "mia"
          ],
          given: [
            'Michael'
          ],
          prefix: [
            'Mr'
          ]
        },
        telecom: [
          {
            system: 'phone',
            use: 'mobile',
            value: '0403 123 456',
            rank: 1
          },
          {
            system: 'phone',
            use: 'home',
            value: '08 4564 3214',
            rank: 2
          },
          {
            system: 'phone',
            use: 'work',
            value: '08 9994 5547',
            rank: 3
          },
          {
            system: 'email',
            use: 'work',
            value: 'mike@work.com',
            rank: 4
          }
        ],
        address: {
          use: 'home',
          line: [
            'An Bairne, Clay Lane'
          ],
          city: 'Warrington',
          state: '',
          postalCode: 'WA54DJ',
          country: 'UK',
        },
        gender: 'male'
      }
    ],
    careProvider: [
      {
        reference: 'Practitioner/1'
      }
    ]
  },
  {
    resourceType: 'Patient',
    id: '12',
    identifier: [
      {
        use: 'official',
        type: {
          coding: [
            {
              system: 'http://hl7.org/fhir/ValueSet/identifier-type',
              code: 'NHSNo',
              display: 'National Health Service'
            }
          ]
        },
        value: '0165892400',
      },
      {
        use: 'usual',
        type: {
          coding: [
            {
              system: 'http://hl7.org/fhir/ValueSet/identifier-type',
              code: 'PAS',
              display: 'PAS ID'
            }
          ]
        },
        value: 'RY10001304',
      }
    ],
    name: [
      {
        use: 'usual',
        family: [
          'mia'
        ],
        given: [
          'Gideon',
          'Hall'
        ],
        prefix: [
          'Mrs'
        ]
      }
    ],
    gender: 'Female',
    birthDate: '1998-12-13T06:30:00Z',
    deceasedBoolean: false,
    numberOfFetus: 2,
    agreedEddDate: '06-Mar-2017',
    gravida: 'G1',
    parity: 'P1+0',
    lmpDate: '30-May-16',
    leadName: 'Saeid Izadpanah PE',
    address: [
      {
        use: 'home',
        line: [
          'An Bairne, Clay Lane'
        ],
        city: 'Warrington',
        state: '',
        postalCode: 'WA54DJ',
        country: 'UK',
      }
    ],
    telecom: [
      {
        system: 'phone',
        use: 'mobile',
        value: '0403 823 832',
        rank: 1
      },
      {
        system: 'phone',
        use: 'home',
        value: '08 9398 1165',
        rank: 2
      },
      {
        system: 'phone',
        use: 'work',
        value: '08 9876 5432',
        rank: 3
      },
      {
        system: 'email',
        use: 'work',
        value: 'mia.Hall@gmail.com',
        rank: 4
      }
    ],
    contact: [
      {
        relationship: [
          {
            coding: [
              {
                system: 'http://hl7.org/fhir/ValueSet/identifier-type',
                code: 'partner',
                display: 'Partner'
              }
            ]
          }
        ],
        name: {
          use: 'usual',
          family: [
            "mia"
          ],
          given: [
            'Michael'
          ],
          prefix: [
            'Mr'
          ]
        },
        telecom: [
          {
            system: 'phone',
            use: 'mobile',
            value: '0403 123 456',
            rank: 1
          },
          {
            system: 'phone',
            use: 'home',
            value: '08 4564 3214',
            rank: 2
          },
          {
            system: 'phone',
            use: 'work',
            value: '08 9994 5547',
            rank: 3
          },
          {
            system: 'email',
            use: 'work',
            value: 'mike@work.com',
            rank: 4
          }
        ],
        address: {
          use: 'home',
          line: [
            'An Bairne, Clay Lane'
          ],
          city: 'Warrington',
          state: '',
          postalCode: 'WA54DJ',
          country: 'UK',
        },
        gender: 'male'
      }
    ],
    careProvider: [
      {
        reference: 'Practitioner/1'
      }
    ]
  },
  {
    resourceType: 'Patient',
    id: '13',
    identifier: [
      {
        use: 'official',
        type: {
          coding: [
            {
              system: 'http://hl7.org/fhir/ValueSet/identifier-type',
              code: 'NHSNo',
              display: 'National Health Service'
            }
          ]
        },
        value: '0165892401',
      },
      {
        use: 'usual',
        type: {
          coding: [
            {
              system: 'http://hl7.org/fhir/ValueSet/identifier-type',
              code: 'PAS',
              display: 'PAS ID'
            }
          ]
        },
        value: 'RY10001305',
      }
    ],
    name: [
      {
        use: 'usual',
        family: [
          'isla'
        ],
        given: [
          'Ariela',
          'Lewis'
        ],
        prefix: [
          'Mrs'
        ]
      }
    ],
    gender: 'Female',
    birthDate: '1980-12-14T06:30:00Z',
    deceasedBoolean: false,
    numberOfFetus: 1,
    agreedEddDate: '11-Jun-2017',
    gravida: 'G3',
    parity: 'P1+0',
    lmpDate: '04-Sep-16',
    leadName: 'Saeid Izadpanah PE',
    address: [
      {
        use: 'home',
        line: [
          'West St'
        ],
        city: 'Somerton',
        state: '',
        postalCode: 'TA117PR',
        country: 'UK',
      }
    ],
    telecom: [
      {
        system: 'phone',
        use: 'mobile',
        value: '0403 823 832',
        rank: 1
      },
      {
        system: 'phone',
        use: 'home',
        value: '08 9398 1165',
        rank: 2
      },
      {
        system: 'phone',
        use: 'work',
        value: '08 9876 5432',
        rank: 3
      },
      {
        system: 'email',
        use: 'work',
        value: 'isla.Lewis@gmail.com',
        rank: 4
      }
    ],
    contact: [
      {
        relationship: [
          {
            coding: [
              {
                system: 'http://hl7.org/fhir/ValueSet/identifier-type',
                code: 'partner',
                display: 'Partner'
              }
            ]
          }
        ],
        name: {
          use: 'usual',
          family: [
            "isla"
          ],
          given: [
            'Michael'
          ],
          prefix: [
            'Mr'
          ]
        },
        telecom: [
          {
            system: 'phone',
            use: 'mobile',
            value: '0403 123 456',
            rank: 1
          },
          {
            system: 'phone',
            use: 'home',
            value: '08 4564 3214',
            rank: 2
          },
          {
            system: 'phone',
            use: 'work',
            value: '08 9994 5547',
            rank: 3
          },
          {
            system: 'email',
            use: 'work',
            value: 'mike@work.com',
            rank: 4
          }
        ],
        address: {
          use: 'home',
          line: [
            'West St'
          ],
          city: 'Somerton',
          state: '',
          postalCode: 'TA117PR',
          country: 'UK',
        },
        gender: 'male'
      }
    ],
    careProvider: [
      {
        reference: 'Practitioner/1'
      }
    ]
  },
  {
    resourceType: 'Patient',
    id: '14',
    identifier: [
      {
        use: 'official',
        type: {
          coding: [
            {
              system: 'http://hl7.org/fhir/ValueSet/identifier-type',
              code: 'NHSNo',
              display: 'National Health Service'
            }
          ]
        },
        value: '0165892403',
      },
      {
        use: 'usual',
        type: {
          coding: [
            {
              system: 'http://hl7.org/fhir/ValueSet/identifier-type',
              code: 'PAS',
              display: 'PAS ID'
            }
          ]
        },
        value: 'RY10001307',
      }
    ],
    name: [
      {
        use: 'usual',
        family: [
          'ann'
        ],
        given: [
          'Kleon',
          'Brown'
        ],
        prefix: [
          'Mrs'
        ]
      }
    ],
    gender: 'Female',
    birthDate: '1982-12-15T06:30:00Z',
    deceasedBoolean: false,
    numberOfFetus: 1,
    agreedEddDate: '21-Apr-2017',
    gravida: 'G3',
    parity: 'P1+0',
    lmpDate: '15-Jul-16',
    leadName: 'Saeid Izadpanah PE',
    address: [
      {
        use: 'home',
        line: [
          '124 Church Street'
        ],
        city: 'Wetherby',
        state: '',
        postalCode: 'LS236EA',
        country: 'UK',
      }
    ],
    telecom: [
      {
        system: 'phone',
        use: 'mobile',
        value: '043823832',
        rank: 1
      },
      {
        system: 'phone',
        use: 'home',
        value: '016 9890 5572',
        rank: 2
      },
      {
        system: 'phone',
        use: 'work',
        value: '043823832',
        rank: 3
      },
      {
        system: 'email',
        use: 'work',
        value: 'ann.Brown@example.com',
        rank: 4
      }
    ],
    contact: [
      {
        relationship: [
          {
            coding: [
              {
                system: 'http://hl7.org/fhir/ValueSet/identifier-type',
                code: 'partner',
                display: 'Partner'
              }
            ]
          }
        ],
        name: {
          use: 'usual',
          family: [
            "ann"
          ],
          given: [
            'Michael'
          ],
          prefix: [
            'Mr'
          ]
        },
        telecom: [
          {
            system: 'phone',
            use: 'mobile',
            value: '0403 123 456',
            rank: 1
          },
          {
            system: 'phone',
            use: 'home',
            value: '08 4564 3214',
            rank: 2
          },
          {
            system: 'phone',
            use: 'work',
            value: '08 9994 5547',
            rank: 3
          },
          {
            system: 'email',
            use: 'work',
            value: 'mike@work.com',
            rank: 4
          }
        ],
        address: {
          use: 'home',
          line: [
            '134 High St'
          ],
          city: 'Wetherby',
          state: '',
          postalCode: 'LS236EA',
          country: 'UK',
        },
        gender: 'male'
      }
    ],
    careProvider: [
      {
        reference: 'Practitioner/1'
      }
    ]
  },
  {
    resourceType: 'Patient',
    id: '15',
    identifier: [
      {
        use: 'official',
        type: {
          coding: [
            {
              system: 'http://hl7.org/fhir/ValueSet/identifier-type',
              code: 'NHSNo',
              display: 'National Health Service'
            }
          ]
        },
        value: '0165892403',
      },
      {
        use: 'usual',
        type: {
          coding: [
            {
              system: 'http://hl7.org/fhir/ValueSet/identifier-type',
              code: 'PAS',
              display: 'PAS ID'
            }
          ]
        },
        value: 'RY10001307',
      }
    ],
    name: [
      {
        use: 'usual',
        family: [
          'florence'
        ],
        given: [
          'Sawyere',
          'Thompson'
        ],
        prefix: [
          'Mrs'
        ]
      }
    ],
    gender: 'Female',
    birthDate: '1990-12-16T06:30:00Z',
    deceasedBoolean: false,
    numberOfFetus: 3,
    agreedEddDate: '18-Apr-2017',
    gravida: 'G1',
    parity: 'P1+0',
    lmpDate: '12-Jul-16',
    leadName: 'Mary Watsons',
    address: [
      {
        use: 'home',
        line: [
          '3 Bramble Avenue'
        ],
        city: 'Norwich',
        state: '',
        postalCode: 'NR66LJ',
        country: 'UK',
      }
    ],
    telecom: [
      {
        system: 'phone',
        use: 'mobile',
        value: '0403 823 832',
        rank: 1
      },
      {
        system: 'phone',
        use: 'home',
        value: '08 9398 1165',
        rank: 2
      },
      {
        system: 'phone',
        use: 'work',
        value: '08 9876 5432',
        rank: 3
      },
      {
        system: 'email',
        use: 'work',
        value: 'florence.Thompson@gmail.com',
        rank: 4
      }
    ],
    contact: [
      {
        relationship: [
          {
            coding: [
              {
                system: 'http://hl7.org/fhir/ValueSet/identifier-type',
                code: 'partner',
                display: 'Partner'
              }
            ]
          }
        ],
        name: {
          use: 'usual',
          family: [
            "florence"
          ],
          given: [
            'Michael'
          ],
          prefix: [
            'Mr'
          ]
        },
        telecom: [
          {
            system: 'phone',
            use: 'mobile',
            value: '0403 123 456',
            rank: 1
          },
          {
            system: 'phone',
            use: 'home',
            value: '08 4564 3214',
            rank: 2
          },
          {
            system: 'phone',
            use: 'work',
            value: '08 9994 5547',
            rank: 3
          },
          {
            system: 'email',
            use: 'work',
            value: 'mike@work.com',
            rank: 4
          }
        ],
        address: {
          use: 'home',
          line: [
            '3 Bramble Avenue'
          ],
          city: 'Norwich',
          state: '',
          postalCode: 'NR66LJ',
          country: 'UK',
        },
        gender: 'male'
      }
    ],
    careProvider: [
      {
        reference: 'Practitioner/1'
      }
    ]
  },
  {
    resourceType: 'Patient',
    id: '16',
    identifier: [
      {
        use: 'official',
        type: {
          coding: [
            {
              system: 'http://hl7.org/fhir/ValueSet/identifier-type',
              code: 'NHSNo',
              display: 'National Health Service'
            }
          ]
        },
        value: '0165892404',
      },
      {
        use: 'usual',
        type: {
          coding: [
            {
              system: 'http://hl7.org/fhir/ValueSet/identifier-type',
              code: 'PAS',
              display: 'PAS ID'
            }
          ]
        },
        value: 'RY10001308',
      }
    ],
    name: [
      {
        use: 'usual',
        family: [
          'dorothy'
        ],
        given: [
          'Terrell',
          'Wright'
        ],
        prefix: [
          'Mrs'
        ]
      }
    ],
    gender: 'Female',
    birthDate: '1991-12-17T06:30:00Z',
    deceasedBoolean: false,
    numberOfFetus: 1,
    agreedEddDate: '21-Feb-2017',
    gravida: 'G1',
    parity: 'P1+0',
    lmpDate: '17-May-16',
    leadName: 'Renee Lemmen',
    address: [
      {
        use: 'home',
        line: [
          '126 Main Road'
        ],
        city: 'Chelmsford',
        state: '',
        postalCode: 'CM17AG',
        country: 'UK',
      }
    ],
    telecom: [
      {
        system: 'phone',
        use: 'mobile',
        value: '0403 823 832',
        rank: 1
      },
      {
        system: 'phone',
        use: 'home',
        value: '08 9398 1165',
        rank: 2
      },
      {
        system: 'phone',
        use: 'work',
        value: '08 9876 5432',
        rank: 3
      },
      {
        system: 'email',
        use: 'work',
        value: 'dorothy.Wright@gmail.com',
        rank: 4
      }
    ],
    contact: [
      {
        relationship: [
          {
            coding: [
              {
                system: 'http://hl7.org/fhir/ValueSet/identifier-type',
                code: 'partner',
                display: 'Partner'
              }
            ]
          }
        ],
        name: {
          use: 'usual',
          family: [
            "dorothy"
          ],
          given: [
            'Michael'
          ],
          prefix: [
            'Mr'
          ]
        },
        telecom: [
          {
            system: 'phone',
            use: 'mobile',
            value: '0403 123 456',
            rank: 1
          },
          {
            system: 'phone',
            use: 'home',
            value: '08 4564 3214',
            rank: 2
          },
          {
            system: 'phone',
            use: 'work',
            value: '08 9994 5547',
            rank: 3
          },
          {
            system: 'email',
            use: 'work',
            value: 'mike@work.com',
            rank: 4
          }
        ],
        address: {
          use: 'home',
          line: [
            '126 Main Road'
          ],
          city: 'Chelmsford',
          state: '',
          postalCode: 'CM17AG',
          country: 'UK',
        },
        gender: 'male'
      }
    ],
    careProvider: [
      {
        reference: 'Practitioner/1'
      }
    ]
  },
  {
    resourceType: 'Patient',
    id: '17',
    identifier: [
      {
        use: 'official',
        type: {
          coding: [
            {
              system: 'http://hl7.org/fhir/ValueSet/identifier-type',
              code: 'NHSNo',
              display: 'National Health Service'
            }
          ]
        },
        value: '0165892405',
      },
      {
        use: 'usual',
        type: {
          coding: [
            {
              system: 'http://hl7.org/fhir/ValueSet/identifier-type',
              code: 'PAS',
              display: 'PAS ID'
            }
          ]
        },
        value: 'RY10001309',
      }
    ],
    name: [
      {
        use: 'usual',
        family: [
          'elsie'
        ],
        given: [
          'Tiffanie',
          'Green'
        ],
        prefix: [
          'Mrs'
        ]
      }
    ],
    gender: 'Female',
    birthDate: '1981-12-18T06:30:00Z',
    deceasedBoolean: false,
    numberOfFetus: 1,
    agreedEddDate: '08-Jul-2017',
    gravida: 'G3',
    parity: 'P1+0',
    lmpDate: '01-Oct-16',
    leadName: 'Mary Watsons',
    address: [
      {
        use: 'home',
        line: [
          'Kingsgate Shopping Centre, King St'
        ],
        city: 'Huddersfield',
        state: '',
        postalCode: 'HD12QB',
        country: 'UK',
      }
    ],
    telecom: [
      {
        system: 'phone',
        use: 'mobile',
        value: '0403 823 832',
        rank: 1
      },
      {
        system: 'phone',
        use: 'home',
        value: '08 9398 1165',
        rank: 2
      },
      {
        system: 'phone',
        use: 'work',
        value: '08 9876 5432',
        rank: 3
      },
      {
        system: 'email',
        use: 'work',
        value: 'elsie.Green@gmail.com',
        rank: 4
      }
    ],
    contact: [
      {
        relationship: [
          {
            coding: [
              {
                system: 'http://hl7.org/fhir/ValueSet/identifier-type',
                code: 'partner',
                display: 'Partner'
              }
            ]
          }
        ],
        name: {
          use: 'usual',
          family: [
            "elsie"
          ],
          given: [
            'Michael'
          ],
          prefix: [
            'Mr'
          ]
        },
        telecom: [
          {
            system: 'phone',
            use: 'mobile',
            value: '0403 123 456',
            rank: 1
          },
          {
            system: 'phone',
            use: 'home',
            value: '08 4564 3214',
            rank: 2
          },
          {
            system: 'phone',
            use: 'work',
            value: '08 9994 5547',
            rank: 3
          },
          {
            system: 'email',
            use: 'work',
            value: 'mike@work.com',
            rank: 4
          }
        ],
        address: {
          use: 'home',
          line: [
            'Kingsgate Shopping Centre, King St'
          ],
          city: 'Huddersfield',
          state: '',
          postalCode: 'HD12QB',
          country: 'UK',
        },
        gender: 'male'
      }
    ],
    careProvider: [
      {
        reference: 'Practitioner/1'
      }
    ]
  },
  {
    resourceType: 'Patient',
    id: '18',
    identifier: [
      {
        use: 'official',
        type: {
          coding: [
            {
              system: 'http://hl7.org/fhir/ValueSet/identifier-type',
              code: 'NHSNo',
              display: 'National Health Service'
            }
          ]
        },
        value: '0165892406',
      },
      {
        use: 'usual',
        type: {
          coding: [
            {
              system: 'http://hl7.org/fhir/ValueSet/identifier-type',
              code: 'PAS',
              display: 'PAS ID'
            }
          ]
        },
        value: 'RY10001310',
      }
    ],
    name: [
      {
        use: 'usual',
        family: [
          'daisy'
        ],
        given: [
          'Winfred',
          'Edwards'
        ],
        prefix: [
          'Mrs'
        ]
      }
    ],
    gender: 'Female',
    birthDate: '1989-12-19T06:30:00Z',
    deceasedBoolean: false,
    numberOfFetus: 2,
    agreedEddDate: '11-Feb-2017',
    gravida: 'G1',
    parity: 'P1+0',
    lmpDate: '07-May-16',
    leadName: 'Mary Watsons',
    address: [
      {
        use: 'home',
        line: [
          'The Nest, Lower Rd'
        ],
        city: 'Shrewsbury',
        state: '',
        postalCode: 'SY43QX',
        country: 'UK',
      }
    ],
    telecom: [
      {
        system: 'phone',
        use: 'mobile',
        value: '0403 823 832',
        rank: 1
      },
      {
        system: 'phone',
        use: 'home',
        value: '08 9398 1165',
        rank: 2
      },
      {
        system: 'phone',
        use: 'work',
        value: '08 9876 5432',
        rank: 3
      },
      {
        system: 'email',
        use: 'work',
        value: 'daisy.Edwards@gmail.com',
        rank: 4
      }
    ],
    contact: [
      {
        relationship: [
          {
            coding: [
              {
                system: 'http://hl7.org/fhir/ValueSet/identifier-type',
                code: 'partner',
                display: 'Partner'
              }
            ]
          }
        ],
        name: {
          use: 'usual',
          family: [
            "daisy"
          ],
          given: [
            'Michael'
          ],
          prefix: [
            'Mr'
          ]
        },
        telecom: [
          {
            system: 'phone',
            use: 'mobile',
            value: '0403 123 456',
            rank: 1
          },
          {
            system: 'phone',
            use: 'home',
            value: '08 4564 3214',
            rank: 2
          },
          {
            system: 'phone',
            use: 'work',
            value: '08 9994 5547',
            rank: 3
          },
          {
            system: 'email',
            use: 'work',
            value: 'mike@work.com',
            rank: 4
          }
        ],
        address: {
          use: 'home',
          line: [
            'The Nest, Lower Rd'
          ],
          city: 'Shrewsbury',
          state: '',
          postalCode: 'SY43QX',
          country: 'UK',
        },
        gender: 'male'
      }
    ],
    careProvider: [
      {
        reference: 'Practitioner/1'
      }
    ]
  },
  {
    resourceType: 'Patient',
    id: '19',
    identifier: [
      {
        use: 'official',
        type: {
          coding: [
            {
              system: 'http://hl7.org/fhir/ValueSet/identifier-type',
              code: 'NHSNo',
              display: 'National Health Service'
            }
          ]
        },
        value: '0165892407',
      },
      {
        use: 'usual',
        type: {
          coding: [
            {
              system: 'http://hl7.org/fhir/ValueSet/identifier-type',
              code: 'PAS',
              display: 'PAS ID'
            }
          ]
        },
        value: 'RY10001311',
      }
    ],
    name: [
      {
        use: 'usual',
        family: [
          'charlotte'
        ],
        given: [
          'Beverlie',
          'Turner'
        ],
        prefix: [
          'Mrs'
        ]
      }
    ],
    gender: 'Female',
    birthDate: '1991-12-20T06:30:00Z',
    deceasedBoolean: false,
    numberOfFetus: 1,
    agreedEddDate: '01-Apr-2017',
    gravida: 'G1',
    parity: 'P1+0',
    lmpDate: '25-Jun-16',
    leadName: 'Mary Watsons',
    address: [
      {
        use: 'home',
        line: [
          '68 Tavistock Road'
        ],
        city: 'Callington',
        state: '',
        postalCode: 'PL177DU',
        country: 'UK',
      }
    ],
    telecom: [
      {
        system: 'phone',
        use: 'mobile',
        value: '0403 823 832',
        rank: 1
      },
      {
        system: 'phone',
        use: 'home',
        value: '08 9398 1165',
        rank: 2
      },
      {
        system: 'phone',
        use: 'work',
        value: '08 9876 5432',
        rank: 3
      },
      {
        system: 'email',
        use: 'work',
        value: 'charlotte.Turner@gmail.com',
        rank: 4
      }
    ],
    contact: [
      {
        relationship: [
          {
            coding: [
              {
                system: 'http://hl7.org/fhir/ValueSet/identifier-type',
                code: 'partner',
                display: 'Partner'
              }
            ]
          }
        ],
        name: {
          use: 'usual',
          family: [
            "charlotte"
          ],
          given: [
            'Michael'
          ],
          prefix: [
            'Mr'
          ]
        },
        telecom: [
          {
            system: 'phone',
            use: 'mobile',
            value: '0403 123 456',
            rank: 1
          },
          {
            system: 'phone',
            use: 'home',
            value: '08 4564 3214',
            rank: 2
          },
          {
            system: 'phone',
            use: 'work',
            value: '08 9994 5547',
            rank: 3
          },
          {
            system: 'email',
            use: 'work',
            value: 'mike@work.com',
            rank: 4
          }
        ],
        address: {
          use: 'home',
          line: [
            '68 Tavistock Road'
          ],
          city: 'Callington',
          state: '',
          postalCode: 'PL177DU',
          country: 'UK',
        },
        gender: 'male'
      }
    ],
    careProvider: [
      {
        reference: 'Practitioner/1'
      }
    ]
  },
  {
    resourceType: 'Patient',
    id: '20',
    identifier: [
      {
        use: 'official',
        type: {
          coding: [
            {
              system: 'http://hl7.org/fhir/ValueSet/identifier-type',
              code: 'NHSNo',
              display: 'National Health Service'
            }
          ]
        },
        value: '0165892408',
      },
      {
        use: 'usual',
        type: {
          coding: [
            {
              system: 'http://hl7.org/fhir/ValueSet/identifier-type',
              code: 'PAS',
              display: 'PAS ID'
            }
          ]
        },
        value: 'RY10001312',
      }
    ],
    name: [
      {
        use: 'usual',
        family: [
          'isabelle'
        ],
        given: [
          'Alibie',
          'Harris'
        ],
        prefix: [
          'Mrs'
        ]
      }
    ],
    gender: 'Female',
    birthDate: '1989-12-20T06:30:00Z',
    deceasedBoolean: false,
    numberOfFetus: 1,
    agreedEddDate: '04-Feb-2017',
    gravida: 'G1',
    parity: 'P1+0',
    lmpDate: '30-Apr-16',
    leadName: 'Amie Craver',
    address: [
      {
        use: 'home',
        line: [
          'Tip Rd'
        ],
        city: 'Gravesend',
        state: '',
        postalCode: 'NSW2401',
        country: 'UK',
      }
    ],
    telecom: [
      {
        system: 'phone',
        use: 'mobile',
        value: '0403 823 832',
        rank: 1
      },
      {
        system: 'phone',
        use: 'home',
        value: '08 9398 1165',
        rank: 2
      },
      {
        system: 'phone',
        use: 'work',
        value: '08 9876 5432',
        rank: 3
      },
      {
        system: 'email',
        use: 'work',
        value: 'isabelle.Harris@gmail.com',
        rank: 4
      }
    ],
    contact: [
      {
        relationship: [
          {
            coding: [
              {
                system: 'http://hl7.org/fhir/ValueSet/identifier-type',
                code: 'partner',
                display: 'Partner'
              }
            ]
          }
        ],
        name: {
          use: 'usual',
          family: [
            "isabelle"
          ],
          given: [
            'Michael'
          ],
          prefix: [
            'Mr'
          ]
        },
        telecom: [
          {
            system: 'phone',
            use: 'mobile',
            value: '0403 123 456',
            rank: 1
          },
          {
            system: 'phone',
            use: 'home',
            value: '08 4564 3214',
            rank: 2
          },
          {
            system: 'phone',
            use: 'work',
            value: '08 9994 5547',
            rank: 3
          },
          {
            system: 'email',
            use: 'work',
            value: 'mike@work.com',
            rank: 4
          }
        ],
        address: {
          use: 'home',
          line: [
            'Tip Rd'
          ],
          city: 'Gravesend',
          state: '',
          postalCode: 'NSW2401',
          country: 'UK',
        },
        gender: 'male'
      }
    ],
    careProvider: [
      {
        reference: 'Practitioner/1'
      }
    ]
  },
  {
    resourceType: 'Patient',
    id: '21',
    identifier: [
      {
        use: 'official',
        type: {
          coding: [
            {
              system: 'http://hl7.org/fhir/ValueSet/identifier-type',
              code: 'NHSNo',
              display: 'National Health Service'
            }
          ]
        },
        value: '0165892409',
      },
      {
        use: 'usual',
        type: {
          coding: [
            {
              system: 'http://hl7.org/fhir/ValueSet/identifier-type',
              code: 'PAS',
              display: 'PAS ID'
            }
          ]
        },
        value: 'RY10001313',
      }
    ],
    name: [
      {
        use: 'usual',
        family: [
          'grace'
        ],
        given: [
          'Jervis',
          'Smith'
        ],
        prefix: [
          'Mrs'
        ]
      }
    ],
    gender: 'Female',
    birthDate: '1982-12-22T06:30:00Z',
    deceasedBoolean: false,
    numberOfFetus: 2,
    agreedEddDate: '22-May-2017',
    gravida: 'G3',
    parity: 'P1+0',
    lmpDate: '15-Aug-16',
    leadName: 'Mary Watsons',
    address: [
      {
        use: 'home',
        line: [
          '31 Cooper Ave'
        ],
        city: 'Woonona',
        state: '',
        postalCode: 'NSW2517',
        country: 'UK',
      }
    ],
    telecom: [
      {
        system: 'phone',
        use: 'mobile',
        value: '0403 823 832',
        rank: 1
      },
      {
        system: 'phone',
        use: 'home',
        value: '08 9398 1165',
        rank: 2
      },
      {
        system: 'phone',
        use: 'work',
        value: '08 9876 5432',
        rank: 3
      },
      {
        system: 'email',
        use: 'work',
        value: 'grace.Smith@gmail.com',
        rank: 4
      }
    ],
    contact: [
      {
        relationship: [
          {
            coding: [
              {
                system: 'http://hl7.org/fhir/ValueSet/identifier-type',
                code: 'partner',
                display: 'Partner'
              }
            ]
          }
        ],
        name: {
          use: 'usual',
          family: [
            "grace"
          ],
          given: [
            'Michael'
          ],
          prefix: [
            'Mr'
          ]
        },
        telecom: [
          {
            system: 'phone',
            use: 'mobile',
            value: '0403 123 456',
            rank: 1
          },
          {
            system: 'phone',
            use: 'home',
            value: '08 4564 3214',
            rank: 2
          },
          {
            system: 'phone',
            use: 'work',
            value: '08 9994 5547',
            rank: 3
          },
          {
            system: 'email',
            use: 'work',
            value: 'mike@work.com',
            rank: 4
          }
        ],
        address: {
          use: 'home',
          line: [
            '31 Cooper Ave'
          ],
          city: 'Woonona',
          state: '',
          postalCode: 'NSW2517',
          country: 'UK',
        },
        gender: 'male'
      }
    ],
    careProvider: [
      {
        reference: 'Practitioner/1'
      }
    ]
  },
  {
    resourceType: 'Patient',
    id: '22',
    identifier: [
      {
        use: 'official',
        type: {
          coding: [
            {
              system: 'http://hl7.org/fhir/ValueSet/identifier-type',
              code: 'NHSNo',
              display: 'National Health Service'
            }
          ]
        },
        value: '0165892410',
      },
      {
        use: 'usual',
        type: {
          coding: [
            {
              system: 'http://hl7.org/fhir/ValueSet/identifier-type',
              code: 'PAS',
              display: 'PAS ID'
            }
          ]
        },
        value: 'RY10001314',
      }
    ],
    name: [
      {
        use: 'usual',
        family: [
          'jessica'
        ],
        given: [
          'Wynn',
          'Hughes'
        ],
        prefix: [
          'Mrs'
        ]
      }
    ],
    gender: 'Female',
    birthDate: '1979-12-23T06:30:00Z',
    deceasedBoolean: false,
    numberOfFetus: 2,
    agreedEddDate: '11-Apr-2017',
    gravida: 'G1',
    parity: 'P1+0',
    lmpDate: '05-Jul-16',
    leadName: 'Mary Watsons',
    address: [
      {
        use: 'home',
        line: [
          '2 Harlesden Cct'
        ],
        city: 'Pakenham',
        state: '',
        postalCode: 'VIC3810',
        country: 'UK',
      }
    ],
    telecom: [
      {
        system: 'phone',
        use: 'mobile',
        value: '0403 823 832',
        rank: 1
      },
      {
        system: 'phone',
        use: 'home',
        value: '08 9398 1165',
        rank: 2
      },
      {
        system: 'phone',
        use: 'work',
        value: '08 9876 5432',
        rank: 3
      },
      {
        system: 'email',
        use: 'work',
        value: 'jessica.Hughes@gmail.com',
        rank: 4
      }
    ],
    contact: [
      {
        relationship: [
          {
            coding: [
              {
                system: 'http://hl7.org/fhir/ValueSet/identifier-type',
                code: 'partner',
                display: 'Partner'
              }
            ]
          }
        ],
        name: {
          use: 'usual',
          family: [
            "jessica"
          ],
          given: [
            'Michael'
          ],
          prefix: [
            'Mr'
          ]
        },
        telecom: [
          {
            system: 'phone',
            use: 'mobile',
            value: '0403 123 456',
            rank: 1
          },
          {
            system: 'phone',
            use: 'home',
            value: '08 4564 3214',
            rank: 2
          },
          {
            system: 'phone',
            use: 'work',
            value: '08 9994 5547',
            rank: 3
          },
          {
            system: 'email',
            use: 'work',
            value: 'mike@work.com',
            rank: 4
          }
        ],
        address: {
          use: 'home',
          line: [
            '2 Harlesden Cct'
          ],
          city: 'Pakenham',
          state: '',
          postalCode: 'VIC3810',
          country: 'UK',
        },
        gender: 'male'
      }
    ],
    careProvider: [
      {
        reference: 'Practitioner/1'
      }
    ]
  },
  {
    resourceType: 'Patient',
    id: '23',
    identifier: [
      {
        use: 'official',
        type: {
          coding: [
            {
              system: 'http://hl7.org/fhir/ValueSet/identifier-type',
              code: 'NHSNo',
              display: 'National Health Service'
            }
          ]
        },
        value: '0165892411',
      },
      {
        use: 'usual',
        type: {
          coding: [
            {
              system: 'http://hl7.org/fhir/ValueSet/identifier-type',
              code: 'PAS',
              display: 'PAS ID'
            }
          ]
        },
        value: 'RY10001315',
      }
    ],
    name: [
      {
        use: 'usual',
        family: [
          'ada'
        ],
        given: [
          'Rouvin',
          'Jackson'
        ],
        prefix: [
          'Mrs'
        ]
      }
    ],
    gender: 'Female',
    birthDate: '1977-12-24T06:30:00Z',
    deceasedBoolean: false,
    numberOfFetus: 1,
    agreedEddDate: '04-Feb-2017',
    gravida: 'G4',
    parity: 'P1+0',
    lmpDate: '30-Apr-16',
    leadName: 'Mary Watsons',
    address: [
      {
        use: 'home',
        line: [
          '117 Kirra Rd'
        ],
        city: 'Maroochy River',
        state: '',
        postalCode: 'QLD4561',
        country: 'UK',
      }
    ],
    telecom: [
      {
        system: 'phone',
        use: 'mobile',
        value: '0403 823 832',
        rank: 1
      },
      {
        system: 'phone',
        use: 'home',
        value: '08 9398 1165',
        rank: 2
      },
      {
        system: 'phone',
        use: 'work',
        value: '08 9876 5432',
        rank: 3
      },
      {
        system: 'email',
        use: 'work',
        value: 'ada.Jackson@gmail.com',
        rank: 4
      }
    ],
    contact: [
      {
        relationship: [
          {
            coding: [
              {
                system: 'http://hl7.org/fhir/ValueSet/identifier-type',
                code: 'partner',
                display: 'Partner'
              }
            ]
          }
        ],
        name: {
          use: 'usual',
          family: [
            "ada"
          ],
          given: [
            'Michael'
          ],
          prefix: [
            'Mr'
          ]
        },
        telecom: [
          {
            system: 'phone',
            use: 'mobile',
            value: '0403 123 456',
            rank: 1
          },
          {
            system: 'phone',
            use: 'home',
            value: '08 4564 3214',
            rank: 2
          },
          {
            system: 'phone',
            use: 'work',
            value: '08 9994 5547',
            rank: 3
          },
          {
            system: 'email',
            use: 'work',
            value: 'mike@work.com',
            rank: 4
          }
        ],
        address: {
          use: 'home',
          line: [
            '117 Kirra Rd'
          ],
          city: 'Maroochy River',
          state: '',
          postalCode: 'QLD4561',
          country: 'UK',
        },
        gender: 'male'
      }
    ],
    careProvider: [
      {
        reference: 'Practitioner/1'
      }
    ]
  },
  {
    resourceType: 'Patient',
    id: '24',
    identifier: [
      {
        use: 'official',
        type: {
          coding: [
            {
              system: 'http://hl7.org/fhir/ValueSet/identifier-type',
              code: 'NHSNo',
              display: 'National Health Service'
            }
          ]
        },
        value: '0165892412',
      },
      {
        use: 'usual',
        type: {
          coding: [
            {
              system: 'http://hl7.org/fhir/ValueSet/identifier-type',
              code: 'PAS',
              display: 'PAS ID'
            }
          ]
        },
        value: 'RY10001316',
      }
    ],
    name: [
      {
        use: 'usual',
        family: [
          'aaron'
        ],
        given: [
          'Dave',
          'Nichole'
        ],
        prefix: [
          'Mrs'
        ]
      }
    ],
    gender: 'Female',
    birthDate: '1988-04-10T06:30:00Z',
    deceasedBoolean: false,
    numberOfFetus: 1,
    agreedEddDate: '12-Feb-2017',
    gravida: 'G1',
    parity: 'P1+0',
    lmpDate: '08-May-16',
    leadName: 'Saeid Izadpanah PE',
    address: [
      {
        use: 'home',
        line: [
          '6 Main St'
        ],
        city: 'Lake Albert',
        state: '',
        postalCode: 'NSW2650',
        country: 'UK',
      }
    ],
    telecom: [
      {
        system: 'phone',
        use: 'mobile',
        value: '0403 823 832',
        rank: 1
      },
      {
        system: 'phone',
        use: 'home',
        value: '08 9398 1165',
        rank: 2
      },
      {
        system: 'phone',
        use: 'work',
        value: '08 9876 5432',
        rank: 3
      },
      {
        system: 'email',
        use: 'work',
        value: 'aaron.Nichole@gmail.com',
        rank: 4
      }
    ],
    contact: [
      {
        relationship: [
          {
            coding: [
              {
                system: 'http://hl7.org/fhir/ValueSet/identifier-type',
                code: 'partner',
                display: 'Partner'
              }
            ]
          }
        ],
        name: {
          use: 'usual',
          family: [
            "aaron"
          ],
          given: [
            'Michael'
          ],
          prefix: [
            'Mr'
          ]
        },
        telecom: [
          {
            system: 'phone',
            use: 'mobile',
            value: '0403 123 456',
            rank: 1
          },
          {
            system: 'phone',
            use: 'home',
            value: '08 4564 3214',
            rank: 2
          },
          {
            system: 'phone',
            use: 'work',
            value: '08 9994 5547',
            rank: 3
          },
          {
            system: 'email',
            use: 'work',
            value: 'mike@work.com',
            rank: 4
          }
        ],
        address: {
          use: 'home',
          line: [
            '6 Main St'
          ],
          city: 'Lake Albert',
          state: '',
          postalCode: 'NSW2650',
          country: 'UK',
        },
        gender: 'male'
      }
    ],
    careProvider: [
      {
        reference: 'Practitioner/1'
      }
    ]
  },
  {
    resourceType: 'Patient',
    id: '25',
    identifier: [
      {
        use: 'official',
        type: {
          coding: [
            {
              system: 'http://hl7.org/fhir/ValueSet/identifier-type',
              code: 'NHSNo',
              display: 'National Health Service'
            }
          ]
        },
        value: '0165892413',
      },
      {
        use: 'usual',
        type: {
          coding: [
            {
              system: 'http://hl7.org/fhir/ValueSet/identifier-type',
              code: 'PAS',
              display: 'PAS ID'
            }
          ]
        },
        value: 'RY10001317',
      }
    ],
    name: [
      {
        use: 'usual',
        family: [
          'dahmer'
        ],
        given: [
          'Oliviero',
          'Lorraine'
        ],
        prefix: [
          'Mrs'
        ]
      }
    ],
    gender: 'Female',
    birthDate: '1983-05-14T06:30:00Z',
    deceasedBoolean: false,
    numberOfFetus: 1,
    agreedEddDate: '13-May-2017',
    gravida: 'G2',
    parity: 'P1+0',
    lmpDate: '06-Aug-16',
    leadName: 'Mary Watsons',
    address: [
      {
        use: 'home',
        line: [
          '77 Raphael Crs'
        ],
        city: 'Frankston',
        state: '',
        postalCode: 'VIC3199',
        country: 'UK',
      }
    ],
    telecom: [
      {
        system: 'phone',
        use: 'mobile',
        value: '0403 823 832',
        rank: 1
      },
      {
        system: 'phone',
        use: 'home',
        value: '08 9398 1165',
        rank: 2
      },
      {
        system: 'phone',
        use: 'work',
        value: '08 9876 5432',
        rank: 3
      },
      {
        system: 'email',
        use: 'work',
        value: 'dahmer.Lorraine@gmail.com',
        rank: 4
      }
    ],
    contact: [
      {
        relationship: [
          {
            coding: [
              {
                system: 'http://hl7.org/fhir/ValueSet/identifier-type',
                code: 'partner',
                display: 'Partner'
              }
            ]
          }
        ],
        name: {
          use: 'usual',
          family: [
            "dahmer"
          ],
          given: [
            'Michael'
          ],
          prefix: [
            'Mr'
          ]
        },
        telecom: [
          {
            system: 'phone',
            use: 'mobile',
            value: '0403 123 456',
            rank: 1
          },
          {
            system: 'phone',
            use: 'home',
            value: '08 4564 3214',
            rank: 2
          },
          {
            system: 'phone',
            use: 'work',
            value: '08 9994 5547',
            rank: 3
          },
          {
            system: 'email',
            use: 'work',
            value: 'mike@work.com',
            rank: 4
          }
        ],
        address: {
          use: 'home',
          line: [
            '77 Raphael Crs'
          ],
          city: 'Frankston',
          state: '',
          postalCode: 'VIC3199',
          country: 'UK',
        },
        gender: 'male'
      }
    ],
    careProvider: [
      {
        reference: 'Practitioner/1'
      }
    ]
  },
  {
    resourceType: 'Patient',
    id: '26',
    identifier: [
      {
        use: 'official',
        type: {
          coding: [
            {
              system: 'http://hl7.org/fhir/ValueSet/identifier-type',
              code: 'NHSNo',
              display: 'National Health Service'
            }
          ]
        },
        value: '0165892414',
      },
      {
        use: 'usual',
        type: {
          coding: [
            {
              system: 'http://hl7.org/fhir/ValueSet/identifier-type',
              code: 'PAS',
              display: 'PAS ID'
            }
          ]
        },
        value: 'RY10001318',
      }
    ],
    name: [
      {
        use: 'usual',
        family: [
          'alicuben'
        ],
        given: [
          'Elbertina',
          'Ramonita'
        ],
        prefix: [
          'Mrs'
        ]
      }
    ],
    gender: 'Female',
    birthDate: '1983-07-03T06:30:00Z',
    deceasedBoolean: false,
    numberOfFetus: 5,
    agreedEddDate: '19-May-2017',
    gravida: 'G2',
    parity: 'P1+0',
    lmpDate: '12-Aug-16',
    leadName: 'Mary Watsons',
    address: [
      {
        use: 'home',
        line: [
          '15 Masjakan Crt'
        ],
        city: 'Murrumba Downs',
        state: '',
        postalCode: 'QLD4503',
        country: 'UK',
      }
    ],
    telecom: [
      {
        system: 'phone',
        use: 'mobile',
        value: '0403 823 832',
        rank: 1
      },
      {
        system: 'phone',
        use: 'home',
        value: '08 9398 1165',
        rank: 2
      },
      {
        system: 'phone',
        use: 'work',
        value: '08 9876 5432',
        rank: 3
      },
      {
        system: 'email',
        use: 'work',
        value: 'alicuben.Ramonita@gmail.com',
        rank: 4
      }
    ],
    contact: [
      {
        relationship: [
          {
            coding: [
              {
                system: 'http://hl7.org/fhir/ValueSet/identifier-type',
                code: 'partner',
                display: 'Partner'
              }
            ]
          }
        ],
        name: {
          use: 'usual',
          family: [
            "alicuben"
          ],
          given: [
            'Michael'
          ],
          prefix: [
            'Mr'
          ]
        },
        telecom: [
          {
            system: 'phone',
            use: 'mobile',
            value: '0403 123 456',
            rank: 1
          },
          {
            system: 'phone',
            use: 'home',
            value: '08 4564 3214',
            rank: 2
          },
          {
            system: 'phone',
            use: 'work',
            value: '08 9994 5547',
            rank: 3
          },
          {
            system: 'email',
            use: 'work',
            value: 'mike@work.com',
            rank: 4
          }
        ],
        address: {
          use: 'home',
          line: [
            '15 Masjakan Crt'
          ],
          city: 'Murrumba Downs',
          state: '',
          postalCode: 'QLD4503',
          country: 'UK',
        },
        gender: 'male'
      }
    ],
    careProvider: [
      {
        reference: 'Practitioner/1'
      }
    ]
  },
  {
    resourceType: 'Patient',
    id: '27',
    identifier: [
      {
        use: 'official',
        type: {
          coding: [
            {
              system: 'http://hl7.org/fhir/ValueSet/identifier-type',
              code: 'NHSNo',
              display: 'National Health Service'
            }
          ]
        },
        value: '0165892415',
      },
      {
        use: 'usual',
        type: {
          coding: [
            {
              system: 'http://hl7.org/fhir/ValueSet/identifier-type',
              code: 'PAS',
              display: 'PAS ID'
            }
          ]
        },
        value: 'RY10001319',
      }
    ],
    name: [
      {
        use: 'usual',
        family: [
          'schoessow'
        ],
        given: [
          '',
          'Cathie'
        ],
        prefix: [
          'Mrs'
        ]
      }
    ],
    gender: 'Female',
    birthDate: '1985-02-03T06:30:00Z',
    deceasedBoolean: false,
    numberOfFetus: 1,
    agreedEddDate: '18-Mar-2017',
    gravida: 'G1',
    parity: 'P1+0',
    lmpDate: '11-Jun-16',
    leadName: 'Renee Lemmen',
    address: [
      {
        use: 'home',
        line: [
          '17 Yarralumla Drv'
        ],
        city: 'Wodonga West',
        state: '',
        postalCode: 'VIC3690',
        country: 'UK',
      }
    ],
    telecom: [
      {
        system: 'phone',
        use: 'mobile',
        value: '0403 823 832',
        rank: 1
      },
      {
        system: 'phone',
        use: 'home',
        value: '08 9398 1165',
        rank: 2
      },
      {
        system: 'phone',
        use: 'work',
        value: '08 9876 5432',
        rank: 3
      },
      {
        system: 'email',
        use: 'work',
        value: 'schoessow.Cathie@gmail.com',
        rank: 4
      }
    ],
    contact: [
      {
        relationship: [
          {
            coding: [
              {
                system: 'http://hl7.org/fhir/ValueSet/identifier-type',
                code: 'partner',
                display: 'Partner'
              }
            ]
          }
        ],
        name: {
          use: 'usual',
          family: [
            "schoessow"
          ],
          given: [
            'Michael'
          ],
          prefix: [
            'Mr'
          ]
        },
        telecom: [
          {
            system: 'phone',
            use: 'mobile',
            value: '0403 123 456',
            rank: 1
          },
          {
            system: 'phone',
            use: 'home',
            value: '08 4564 3214',
            rank: 2
          },
          {
            system: 'phone',
            use: 'work',
            value: '08 9994 5547',
            rank: 3
          },
          {
            system: 'email',
            use: 'work',
            value: 'mike@work.com',
            rank: 4
          }
        ],
        address: {
          use: 'home',
          line: [
            '17 Yarralumla Drv'
          ],
          city: 'Wodonga West',
          state: '',
          postalCode: 'VIC3690',
          country: 'UK',
        },
        gender: 'male'
      }
    ],
    careProvider: [
      {
        reference: 'Practitioner/1'
      }
    ]
  },
  {
    resourceType: 'Patient',
    id: '28',
    identifier: [
      {
        use: 'official',
        type: {
          coding: [
            {
              system: 'http://hl7.org/fhir/ValueSet/identifier-type',
              code: 'NHSNo',
              display: 'National Health Service'
            }
          ]
        },
        value: '0165892416',
      },
      {
        use: 'usual',
        type: {
          coding: [
            {
              system: 'http://hl7.org/fhir/ValueSet/identifier-type',
              code: 'PAS',
              display: 'PAS ID'
            }
          ]
        },
        value: 'RY10001320',
      }
    ],
    name: [
      {
        use: 'usual',
        family: [
          'woods'
        ],
        given: [
          'Elvyn',
          'Modesta'
        ],
        prefix: [
          'Mrs'
        ]
      }
    ],
    gender: 'Female',
    birthDate: '1985-09-03T06:30:00Z',
    deceasedBoolean: false,
    numberOfFetus: 1,
    agreedEddDate: '12-May-2017',
    gravida: 'G1',
    parity: 'P1+0',
    lmpDate: '05-Aug-16',
    leadName: 'Renee Lemmen',
    address: [
      {
        use: 'home',
        line: [
          '341 Wearne Rd'
        ],
        city: 'Pental Island',
        state: '',
        postalCode: 'VIC3586',
        country: 'UK',
      }
    ],
    telecom: [
      {
        system: 'phone',
        use: 'mobile',
        value: '0403 823 832',
        rank: 1
      },
      {
        system: 'phone',
        use: 'home',
        value: '08 9398 1165',
        rank: 2
      },
      {
        system: 'phone',
        use: 'work',
        value: '08 9876 5432',
        rank: 3
      },
      {
        system: 'email',
        use: 'work',
        value: 'woods.Modesta@gmail.com',
        rank: 4
      }
    ],
    contact: [
      {
        relationship: [
          {
            coding: [
              {
                system: 'http://hl7.org/fhir/ValueSet/identifier-type',
                code: 'partner',
                display: 'Partner'
              }
            ]
          }
        ],
        name: {
          use: 'usual',
          family: [
            "woods"
          ],
          given: [
            'Michael'
          ],
          prefix: [
            'Mr'
          ]
        },
        telecom: [
          {
            system: 'phone',
            use: 'mobile',
            value: '0403 123 456',
            rank: 1
          },
          {
            system: 'phone',
            use: 'home',
            value: '08 4564 3214',
            rank: 2
          },
          {
            system: 'phone',
            use: 'work',
            value: '08 9994 5547',
            rank: 3
          },
          {
            system: 'email',
            use: 'work',
            value: 'mike@work.com',
            rank: 4
          }
        ],
        address: {
          use: 'home',
          line: [
            '341 Wearne Rd'
          ],
          city: 'Pental Island',
          state: '',
          postalCode: 'VIC3586',
          country: 'UK',
        },
        gender: 'male'
      }
    ],
    careProvider: [
      {
        reference: 'Practitioner/1'
      }
    ]
  },
  {
    resourceType: 'Patient',
    id: '29',
    identifier: [
      {
        use: 'official',
        type: {
          coding: [
            {
              system: 'http://hl7.org/fhir/ValueSet/identifier-type',
              code: 'NHSNo',
              display: 'National Health Service'
            }
          ]
        },
        value: '0165892417',
      },
      {
        use: 'usual',
        type: {
          coding: [
            {
              system: 'http://hl7.org/fhir/ValueSet/identifier-type',
              code: 'PAS',
              display: 'PAS ID'
            }
          ]
        },
        value: 'RY10001321',
      }
    ],
    name: [
      {
        use: 'usual',
        family: [
          'aalbers'
        ],
        given: [
          'Melania',
          'Monet'
        ],
        prefix: [
          'Mrs'
        ]
      }
    ],
    gender: 'Female',
    birthDate: '1985-07-15T06:30:00Z',
    deceasedBoolean: false,
    numberOfFetus: 2,
    agreedEddDate: '08-Jul-2017',
    gravida: 'G3',
    parity: 'P1+0',
    lmpDate: '01-Oct-16',
    leadName: 'Mary Watsons',
    address: [
      {
        use: 'home',
        line: [
          '6 Ellis St'
        ],
        city: 'Newstead',
        state: '',
        postalCode: 'QLD4006',
        country: 'UK',
      }
    ],
    telecom: [
      {
        system: 'phone',
        use: 'mobile',
        value: '0403 823 832',
        rank: 1
      },
      {
        system: 'phone',
        use: 'home',
        value: '08 9398 1165',
        rank: 2
      },
      {
        system: 'phone',
        use: 'work',
        value: '08 9876 5432',
        rank: 3
      },
      {
        system: 'email',
        use: 'work',
        value: 'aalbers.Monet@gmail.com',
        rank: 4
      }
    ],
    contact: [
      {
        relationship: [
          {
            coding: [
              {
                system: 'http://hl7.org/fhir/ValueSet/identifier-type',
                code: 'partner',
                display: 'Partner'
              }
            ]
          }
        ],
        name: {
          use: 'usual',
          family: [
            "aalbers"
          ],
          given: [
            'Michael'
          ],
          prefix: [
            'Mr'
          ]
        },
        telecom: [
          {
            system: 'phone',
            use: 'mobile',
            value: '0403 123 456',
            rank: 1
          },
          {
            system: 'phone',
            use: 'home',
            value: '08 4564 3214',
            rank: 2
          },
          {
            system: 'phone',
            use: 'work',
            value: '08 9994 5547',
            rank: 3
          },
          {
            system: 'email',
            use: 'work',
            value: 'mike@work.com',
            rank: 4
          }
        ],
        address: {
          use: 'home',
          line: [
            '6 Ellis St'
          ],
          city: 'Newstead',
          state: '',
          postalCode: 'QLD4006',
          country: 'UK',
        },
        gender: 'male'
      }
    ],
    careProvider: [
      {
        reference: 'Practitioner/1'
      }
    ]
  },
  {
    resourceType: 'Patient',
    id: '30',
    identifier: [
      {
        use: 'official',
        type: {
          coding: [
            {
              system: 'http://hl7.org/fhir/ValueSet/identifier-type',
              code: 'NHSNo',
              display: 'National Health Service'
            }
          ]
        },
        value: '0165892418',
      },
      {
        use: 'usual',
        type: {
          coding: [
            {
              system: 'http://hl7.org/fhir/ValueSet/identifier-type',
              code: 'PAS',
              display: 'PAS ID'
            }
          ]
        },
        value: 'RY10001322',
      }
    ],
    name: [
      {
        use: 'usual',
        family: [
          'abajian'
        ],
        given: [
          'Marabel',
          'Clarissa'
        ],
        prefix: [
          'Mrs'
        ]
      }
    ],
    gender: 'Female',
    birthDate: '1987-07-15T06:30:00Z',
    deceasedBoolean: false,
    numberOfFetus: 3,
    agreedEddDate: '15-May-2017',
    gravida: 'G1',
    parity: 'P1+0',
    lmpDate: '08-Aug-16',
    leadName: 'Mary Watsons',
    address: [
      {
        use: 'home',
        line: [
          '5 Commodore St'
        ],
        city: 'Sunnybank Hills',
        state: '',
        postalCode: 'QLD4109',
        country: 'UK',
      }
    ],
    telecom: [
      {
        system: 'phone',
        use: 'mobile',
        value: '0403 823 832',
        rank: 1
      },
      {
        system: 'phone',
        use: 'home',
        value: '08 9398 1165',
        rank: 2
      },
      {
        system: 'phone',
        use: 'work',
        value: '08 9876 5432',
        rank: 3
      },
      {
        system: 'email',
        use: 'work',
        value: 'abajian.Clarissa@gmail.com',
        rank: 4
      }
    ],
    contact: [
      {
        relationship: [
          {
            coding: [
              {
                system: 'http://hl7.org/fhir/ValueSet/identifier-type',
                code: 'partner',
                display: 'Partner'
              }
            ]
          }
        ],
        name: {
          use: 'usual',
          family: [
            "abajian"
          ],
          given: [
            'Michael'
          ],
          prefix: [
            'Mr'
          ]
        },
        telecom: [
          {
            system: 'phone',
            use: 'mobile',
            value: '0403 123 456',
            rank: 1
          },
          {
            system: 'phone',
            use: 'home',
            value: '08 4564 3214',
            rank: 2
          },
          {
            system: 'phone',
            use: 'work',
            value: '08 9994 5547',
            rank: 3
          },
          {
            system: 'email',
            use: 'work',
            value: 'mike@work.com',
            rank: 4
          }
        ],
        address: {
          use: 'home',
          line: [
            '5 Commodore St'
          ],
          city: 'Sunnybank Hills',
          state: '',
          postalCode: 'QLD4109',
          country: 'UK',
        },
        gender: 'male'
      }
    ],
    careProvider: [
      {
        reference: 'Practitioner/1'
      }
    ]
  },
  {
    resourceType: 'Patient',
    id: '31',
    identifier: [
      {
        use: 'official',
        type: {
          coding: [
            {
              system: 'http://hl7.org/fhir/ValueSet/identifier-type',
              code: 'NHSNo',
              display: 'National Health Service'
            }
          ]
        },
        value: '0165892419',
      },
      {
        use: 'usual',
        type: {
          coding: [
            {
              system: 'http://hl7.org/fhir/ValueSet/identifier-type',
              code: 'PAS',
              display: 'PAS ID'
            }
          ]
        },
        value: 'RY10001323',
      }
    ],
    name: [
      {
        use: 'usual',
        family: [
          'ogzewalla'
        ],
        given: [
          'Constantina',
          'Millie'
        ],
        prefix: [
          'Mrs'
        ]
      }
    ],
    gender: 'Female',
    birthDate: '1986-01-18T06:30:00Z',
    deceasedBoolean: false,
    numberOfFetus: 1,
    agreedEddDate: '08-Jun-2017',
    gravida: 'G1',
    parity: 'P1+0',
    lmpDate: '01-Sep-16',
    leadName: 'Amie Craver',
    address: [
      {
        use: 'home',
        line: [
          '4 Bruce Ave'
        ],
        city: 'Surf Beach',
        state: '',
        postalCode: 'VIC3922',
        country: 'UK',
      }
    ],
    telecom: [
      {
        system: 'phone',
        use: 'mobile',
        value: '0403 823 832',
        rank: 1
      },
      {
        system: 'phone',
        use: 'home',
        value: '08 9398 1165',
        rank: 2
      },
      {
        system: 'phone',
        use: 'work',
        value: '08 9876 5432',
        rank: 3
      },
      {
        system: 'email',
        use: 'work',
        value: 'ogzewalla.Millie@gmail.com',
        rank: 4
      }
    ],
    contact: [
      {
        relationship: [
          {
            coding: [
              {
                system: 'http://hl7.org/fhir/ValueSet/identifier-type',
                code: 'partner',
                display: 'Partner'
              }
            ]
          }
        ],
        name: {
          use: 'usual',
          family: [
            "ogzewalla"
          ],
          given: [
            'Michael'
          ],
          prefix: [
            'Mr'
          ]
        },
        telecom: [
          {
            system: 'phone',
            use: 'mobile',
            value: '0403 123 456',
            rank: 1
          },
          {
            system: 'phone',
            use: 'home',
            value: '08 4564 3214',
            rank: 2
          },
          {
            system: 'phone',
            use: 'work',
            value: '08 9994 5547',
            rank: 3
          },
          {
            system: 'email',
            use: 'work',
            value: 'mike@work.com',
            rank: 4
          }
        ],
        address: {
          use: 'home',
          line: [
            '4 Bruce Ave'
          ],
          city: 'Surf Beach',
          state: '',
          postalCode: 'VIC3922',
          country: 'UK',
        },
        gender: 'male'
      }
    ],
    careProvider: [
      {
        reference: 'Practitioner/1'
      }
    ]
  },
  {
    resourceType: 'Patient',
    id: '32',
    identifier: [
      {
        use: 'official',
        type: {
          coding: [
            {
              system: 'http://hl7.org/fhir/ValueSet/identifier-type',
              code: 'NHSNo',
              display: 'National Health Service'
            }
          ]
        },
        value: '0165892420',
      },
      {
        use: 'usual',
        type: {
          coding: [
            {
              system: 'http://hl7.org/fhir/ValueSet/identifier-type',
              code: 'PAS',
              display: 'PAS ID'
            }
          ]
        },
        value: 'RY10001324',
      }
    ],
    name: [
      {
        use: 'usual',
        family: [
          'sobol'
        ],
        given: [
          'Ian',
          'Mindi'
        ],
        prefix: [
          'Mrs'
        ]
      }
    ],
    gender: 'Female',
    birthDate: '1986-11-09T06:30:00Z',
    deceasedBoolean: false,
    numberOfFetus: 2,
    agreedEddDate: '18-Mar-2017',
    gravida: 'G1',
    parity: 'P1+0',
    lmpDate: '11-Jun-16',
    leadName: 'Mary Watsons',
    address: [
      {
        use: 'home',
        line: [
          '32 Central Ave'
        ],
        city: 'Moonah',
        state: '',
        postalCode: 'TAS7009',
        country: 'UK',
      }
    ],
    telecom: [
      {
        system: 'phone',
        use: 'mobile',
        value: '0403 823 832',
        rank: 1
      },
      {
        system: 'phone',
        use: 'home',
        value: '08 9398 1165',
        rank: 2
      },
      {
        system: 'phone',
        use: 'work',
        value: '08 9876 5432',
        rank: 3
      },
      {
        system: 'email',
        use: 'work',
        value: 'sobol.Mindi@gmail.com',
        rank: 4
      }
    ],
    contact: [
      {
        relationship: [
          {
            coding: [
              {
                system: 'http://hl7.org/fhir/ValueSet/identifier-type',
                code: 'partner',
                display: 'Partner'
              }
            ]
          }
        ],
        name: {
          use: 'usual',
          family: [
            "sobol"
          ],
          given: [
            'Michael'
          ],
          prefix: [
            'Mr'
          ]
        },
        telecom: [
          {
            system: 'phone',
            use: 'mobile',
            value: '0403 123 456',
            rank: 1
          },
          {
            system: 'phone',
            use: 'home',
            value: '08 4564 3214',
            rank: 2
          },
          {
            system: 'phone',
            use: 'work',
            value: '08 9994 5547',
            rank: 3
          },
          {
            system: 'email',
            use: 'work',
            value: 'mike@work.com',
            rank: 4
          }
        ],
        address: {
          use: 'home',
          line: [
            '32 Central Ave'
          ],
          city: 'Moonah',
          state: '',
          postalCode: 'TAS7009',
          country: 'UK',
        },
        gender: 'male'
      }
    ],
    careProvider: [
      {
        reference: 'Practitioner/1'
      }
    ]
  },
  {
    resourceType: 'Patient',
    id: '33',
    identifier: [
      {
        use: 'official',
        type: {
          coding: [
            {
              system: 'http://hl7.org/fhir/ValueSet/identifier-type',
              code: 'NHSNo',
              display: 'National Health Service'
            }
          ]
        },
        value: '0165892421',
      },
      {
        use: 'usual',
        type: {
          coding: [
            {
              system: 'http://hl7.org/fhir/ValueSet/identifier-type',
              code: 'PAS',
              display: 'PAS ID'
            }
          ]
        },
        value: 'RY10001325',
      }
    ],
    name: [
      {
        use: 'usual',
        family: [
          'socci'
        ],
        given: [
          'Fenelia',
          'Daisey'
        ],
        prefix: [
          'Mrs'
        ]
      }
    ],
    gender: 'Female',
    birthDate: '1990-11-09T06:30:00Z',
    deceasedBoolean: false,
    numberOfFetus: 5,
    agreedEddDate: '06-Apr-2017',
    gravida: 'G2',
    parity: 'P1+0',
    lmpDate: '30-Jun-16',
    leadName: 'Amie Craver',
    address: [
      {
        use: 'home',
        line: [
          '74 Brighton Rd'
        ],
        city: 'Scarborough',
        state: '',
        postalCode: 'WA6019',
        country: 'UK',
      }
    ],
    telecom: [
      {
        system: 'phone',
        use: 'mobile',
        value: '0403 823 832',
        rank: 1
      },
      {
        system: 'phone',
        use: 'home',
        value: '08 9398 1165',
        rank: 2
      },
      {
        system: 'phone',
        use: 'work',
        value: '08 9876 5432',
        rank: 3
      },
      {
        system: 'email',
        use: 'work',
        value: 'socci.Daisey@gmail.com',
        rank: 4
      }
    ],
    contact: [
      {
        relationship: [
          {
            coding: [
              {
                system: 'http://hl7.org/fhir/ValueSet/identifier-type',
                code: 'partner',
                display: 'Partner'
              }
            ]
          }
        ],
        name: {
          use: 'usual',
          family: [
            "socci"
          ],
          given: [
            'Michael'
          ],
          prefix: [
            'Mr'
          ]
        },
        telecom: [
          {
            system: 'phone',
            use: 'mobile',
            value: '0403 123 456',
            rank: 1
          },
          {
            system: 'phone',
            use: 'home',
            value: '08 4564 3214',
            rank: 2
          },
          {
            system: 'phone',
            use: 'work',
            value: '08 9994 5547',
            rank: 3
          },
          {
            system: 'email',
            use: 'work',
            value: 'mike@work.com',
            rank: 4
          }
        ],
        address: {
          use: 'home',
          line: [
            '74 Brighton Rd'
          ],
          city: 'Scarborough',
          state: '',
          postalCode: 'WA6019',
          country: 'UK',
        },
        gender: 'male'
      }
    ],
    careProvider: [
      {
        reference: 'Practitioner/1'
      }
    ]
  },
  {
    resourceType: 'Patient',
    id: '34',
    identifier: [
      {
        use: 'official',
        type: {
          coding: [
            {
              system: 'http://hl7.org/fhir/ValueSet/identifier-type',
              code: 'NHSNo',
              display: 'National Health Service'
            }
          ]
        },
        value: '0165892422',
      },
      {
        use: 'usual',
        type: {
          coding: [
            {
              system: 'http://hl7.org/fhir/ValueSet/identifier-type',
              code: 'PAS',
              display: 'PAS ID'
            }
          ]
        },
        value: 'RY10001326',
      }
    ],
    name: [
      {
        use: 'usual',
        family: [
          'corria'
        ],
        given: [
          'Jada',
          'Lorie'
        ],
        prefix: [
          'Mrs'
        ]
      }
    ],
    gender: 'Female',
    birthDate: '1991-10-05T06:30:00Z',
    deceasedBoolean: false,
    numberOfFetus: 4,
    agreedEddDate: '12-Jun-2017',
    gravida: 'G1',
    parity: 'P1+0',
    lmpDate: '05-Sep-16',
    leadName: 'Renee Lemmen',
    address: [
      {
        use: 'home',
        line: [
          '14 Rogan Cl'
        ],
        city: 'Cowes',
        state: '',
        postalCode: 'VIC3922',
        country: 'UK',
      }
    ],
    telecom: [
      {
        system: 'phone',
        use: 'mobile',
        value: '0403 823 832',
        rank: 1
      },
      {
        system: 'phone',
        use: 'home',
        value: '08 9398 1165',
        rank: 2
      },
      {
        system: 'phone',
        use: 'work',
        value: '08 9876 5432',
        rank: 3
      },
      {
        system: 'email',
        use: 'work',
        value: 'corria.Lorie@gmail.com',
        rank: 4
      }
    ],
    contact: [
      {
        relationship: [
          {
            coding: [
              {
                system: 'http://hl7.org/fhir/ValueSet/identifier-type',
                code: 'partner',
                display: 'Partner'
              }
            ]
          }
        ],
        name: {
          use: 'usual',
          family: [
            "corria"
          ],
          given: [
            'Michael'
          ],
          prefix: [
            'Mr'
          ]
        },
        telecom: [
          {
            system: 'phone',
            use: 'mobile',
            value: '0403 123 456',
            rank: 1
          },
          {
            system: 'phone',
            use: 'home',
            value: '08 4564 3214',
            rank: 2
          },
          {
            system: 'phone',
            use: 'work',
            value: '08 9994 5547',
            rank: 3
          },
          {
            system: 'email',
            use: 'work',
            value: 'mike@work.com',
            rank: 4
          }
        ],
        address: {
          use: 'home',
          line: [
            '14 Rogan Cl'
          ],
          city: 'Cowes',
          state: '',
          postalCode: 'VIC3922',
          country: 'UK',
        },
        gender: 'male'
      }
    ],
    careProvider: [
      {
        reference: 'Practitioner/1'
      }
    ]
  },
  {
    resourceType: 'Patient',
    id: '35',
    identifier: [
      {
        use: 'official',
        type: {
          coding: [
            {
              system: 'http://hl7.org/fhir/ValueSet/identifier-type',
              code: 'NHSNo',
              display: 'National Health Service'
            }
          ]
        },
        value: '0165892423',
      },
      {
        use: 'usual',
        type: {
          coding: [
            {
              system: 'http://hl7.org/fhir/ValueSet/identifier-type',
              code: 'PAS',
              display: 'PAS ID'
            }
          ]
        },
        value: 'RY10001327',
      }
    ],
    name: [
      {
        use: 'usual',
        family: [
          'muscatello'
        ],
        given: [
          'Cris',
          'Rudolph'
        ],
        prefix: [
          'Mrs'
        ]
      }
    ],
    gender: 'Female',
    birthDate: '1990-10-02T06:30:00Z',
    deceasedBoolean: false,
    numberOfFetus: 1,
    agreedEddDate: '09-May-2017',
    gravida: 'G2',
    parity: 'P1+0',
    lmpDate: '02-Aug-16',
    leadName: 'Mary Watsons',
    address: [
      {
        use: 'home',
        line: [
          '3 Birubi Crs'
        ],
        city: 'Bilgola',
        state: '',
        postalCode: 'NSW2107',
        country: 'UK',
      }
    ],
    telecom: [
      {
        system: 'phone',
        use: 'mobile',
        value: '0403 823 832',
        rank: 1
      },
      {
        system: 'phone',
        use: 'home',
        value: '08 9398 1165',
        rank: 2
      },
      {
        system: 'phone',
        use: 'work',
        value: '08 9876 5432',
        rank: 3
      },
      {
        system: 'email',
        use: 'work',
        value: 'muscatello.Rudolph@gmail.com',
        rank: 4
      }
    ],
    contact: [
      {
        relationship: [
          {
            coding: [
              {
                system: 'http://hl7.org/fhir/ValueSet/identifier-type',
                code: 'partner',
                display: 'Partner'
              }
            ]
          }
        ],
        name: {
          use: 'usual',
          family: [
            "muscatello"
          ],
          given: [
            'Michael'
          ],
          prefix: [
            'Mr'
          ]
        },
        telecom: [
          {
            system: 'phone',
            use: 'mobile',
            value: '0403 123 456',
            rank: 1
          },
          {
            system: 'phone',
            use: 'home',
            value: '08 4564 3214',
            rank: 2
          },
          {
            system: 'phone',
            use: 'work',
            value: '08 9994 5547',
            rank: 3
          },
          {
            system: 'email',
            use: 'work',
            value: 'mike@work.com',
            rank: 4
          }
        ],
        address: {
          use: 'home',
          line: [
            '3 Birubi Crs'
          ],
          city: 'Bilgola',
          state: '',
          postalCode: 'NSW2107',
          country: 'UK',
        },
        gender: 'male'
      }
    ],
    careProvider: [
      {
        reference: 'Practitioner/1'
      }
    ]
  },
  {
    resourceType: 'Patient',
    id: '36',
    identifier: [
      {
        use: 'official',
        type: {
          coding: [
            {
              system: 'http://hl7.org/fhir/ValueSet/identifier-type',
              code: 'NHSNo',
              display: 'National Health Service'
            }
          ]
        },
        value: '0165892424',
      },
      {
        use: 'usual',
        type: {
          coding: [
            {
              system: 'http://hl7.org/fhir/ValueSet/identifier-type',
              code: 'PAS',
              display: 'PAS ID'
            }
          ]
        },
        value: 'RY10001328',
      }
    ],
    name: [
      {
        use: 'usual',
        family: [
          'schwend'
        ],
        given: [
          'Ellery',
          'Cassey'
        ],
        prefix: [
          'Mrs'
        ]
      }
    ],
    gender: 'Female',
    birthDate: '1990-08-29T06:30:00Z',
    deceasedBoolean: false,
    numberOfFetus: 2,
    agreedEddDate: '11-Apr-2017',
    gravida: 'G1',
    parity: 'P1+0',
    lmpDate: '02-Aug-16',
    leadName: 'Mary Watsons',
    address: [
      {
        use: 'home',
        line: [
          '2 Oxford Rd'
        ],
        city: 'Worton',
        state: '',
        postalCode: 'SN10 7WN',
        country: 'UK',
      }
    ],
    telecom: [
      {
        system: 'phone',
        use: 'mobile',
        value: '0403 823 832',
        rank: 1
      },
      {
        system: 'phone',
        use: 'home',
        value: '08 9398 1165',
        rank: 2
      },
      {
        system: 'phone',
        use: 'work',
        value: '08 9876 5432',
        rank: 3
      },
      {
        system: 'email',
        use: 'work',
        value: 'schwend.Cassey@gmail.com',
        rank: 4
      }
    ],
    contact: [
      {
        relationship: [
          {
            coding: [
              {
                system: 'http://hl7.org/fhir/ValueSet/identifier-type',
                code: 'partner',
                display: 'Partner'
              }
            ]
          }
        ],
        name: {
          use: 'usual',
          family: [
            "schwend"
          ],
          given: [
            'Michael'
          ],
          prefix: [
            'Mr'
          ]
        },
        telecom: [
          {
            system: 'phone',
            use: 'mobile',
            value: '0403 123 456',
            rank: 1
          },
          {
            system: 'phone',
            use: 'home',
            value: '08 4564 3214',
            rank: 2
          },
          {
            system: 'phone',
            use: 'work',
            value: '08 9994 5547',
            rank: 3
          },
          {
            system: 'email',
            use: 'work',
            value: 'mike@work.com',
            rank: 4
          }
        ],
        address: {
          use: 'home',
          line: [
            '2 Oxford Rd'
          ],
          city: 'Worton',
          state: '',
          postalCode: 'SN10 7WN',
          country: 'UK',
        },
        gender: 'male'
      }
    ],
    careProvider: [
      {
        reference: 'Practitioner/1'
      }
    ]
  }
  ];

  res.json(jsonObj);

});

app.post('/api/AllergyIntolerance', function (req, res) {

  var patient_id = req.body.patient;

  if (patient_id) {
    var jsonObj = [{
      resourceType: 'AllergyIntolerance',
      id: '1',
      recordedDate: '2016-09-26',
      recorder: {
        reference: 'Practitioner/1'
      },
      patient: {
        reference: 'Patient/1'
      },
      substance: {
        coding: [{
          system: 'http://snomed.info/sct',
          code: '227493005',
          display: 'Cashew Nuts'
        }]
      },
      clinicalStatus: 'active', verificationStatus: 'confirmed',
      type: 'allergy',
      category: 'food',
      note: {
        text: 'Note text'
      },
      reaction: [{
        severity: 'severe',
        manifestation: [{
          coding: [{
            system: 'http://snomed.info/sct',
            code: '39579001',
            display: 'Anaphylactic reaction'
          }]
        }]
      }]
    },
    {
      resourceType: 'AllergyIntolerance',
      id: '2',
      recordedDate: '2016-10-01',
      recorder: {
        reference: 'Practitioner/2'
      },
      patient: {
        reference: 'Patient/1'
      },
      substance: {
        coding: [{
          system: 'http://snomed.info/sct',
          code: '3145006',
          display: 'Penicillin'
        }]
      },
      clinicalStatus: 'active', verificationStatus: 'confirmed',
      type: 'allergy',
      category: 'medication',
      reaction: [{
        severity: 'moderate',
        manifestation: [{
          coding: [{
            system: 'http://snomed.info/sct',
            code: '247472004',
            display: 'Hives'
          }]
        }]
      }]
    },
    {
      resourceType: 'AllergyIntolerance',
      id: '3',
      recordedDate: '2015-08-06',
      recorder: {
        reference: 'Practitioner/1'
      },
      patient: {
        reference: 'Patient/1'
      },
      substance: {
        coding: [{
          system: 'http://snomed.info/sct',
          code: '227037002',
          display: 'Fish'
        }]
      },
      verificationStatus: 'unconfirmed',
      type: 'intolerance',
      category: 'food',
      reaction: [{
        severity: 'moderate',
        manifestation: [{
          coding: [{
            system: 'http://snomed.info/sct',
            code: '247472004',
            display: 'Hives'
          }]
        }]
      }]
    }
    ];

    res.send(jsonObj);
  } else {
    res.send("Error");
  }

});

app.get('/api/AllergyIntolerance', function (req, res) {

  var patient_id = req.query.patient;

  if (patient_id) {
    var jsonObj = [{
      resourceType: 'AllergyIntolerance',
      id: '1',
      recordedDate: '2010',
      recorder: {
        reference: 'Practitioner/1',
      },
      patient: {
        reference: 'Patient/35',
      },
      substance: {
        coding: [
          {
            system: 'http://snomed.info/sct',
            code: '20847002',
            display: 'Streptokinase',
          }
        ]
      },
      clinicalStatus: 'active', verificationStatus: 'confirmed',
      type: 'allergy',
      category: 'drug',
      note: {
        text: 'Note text'
      },
      reaction: [
        {
          severity: '',
          manifestation: [
            {
              coding: [
                {
                  system: 'http://snomed.info/sct',
                  code: '',
                  display: '',
                }
              ]
            }
          ]
        }
      ]
    },
    {
      resourceType: 'AllergyIntolerance',
      id: '2',
      recordedDate: '01-Oct-2015',
      recorder: {
        reference: 'Practitioner/2',
      },
      patient: {
        reference: 'Patient/35',
      },
      substance: {
        coding: [
          {
            system: 'http://snomed.info/sct',
            code: '227493005',
            display: 'Cashew Nuts',
          }
        ]
      },
      clinicalStatus: 'active', verificationStatus: 'confirmed',
      type: 'allergy',
      category: 'food',
      note: {
        text: 'Note text'
      },
      reaction: [
        {
          severity: '',
          manifestation: [
            {
              coding: [
                {
                  system: 'http://snomed.info/sct',
                  code: '',
                  display: '',
                }
              ]
            }
          ]
        }
      ]
    },
    {
      resourceType: 'AllergyIntolerance',
      id: '3',
      recordedDate: '25-Feb-2015',
      recorder: {
        reference: 'Practitioner/1',
      },
      patient: {
        reference: 'Patient/35',
      },
      substance: {
        coding: [
          {
            system: 'http://snomed.info/sct',
            code: '',
            display: 'Anadin Paracetamol',
          }
        ]
      },
      clinicalStatus: 'active', verificationStatus: 'confirmed',
      type: 'allergy',
      category: 'medication',
      note: {
        text: 'Note text'
      },
      reaction: [
        {
          severity: '',
          manifestation: [
            {
              coding: [
                {
                  system: 'http://snomed.info/sct',
                  code: '',
                  display: '',
                }
              ]
            }
          ]
        }
      ]
    },
    {
      resourceType: 'AllergyIntolerance',
      id: '4',
      recordedDate: '10-Oct-2016',
      recorder: {
        reference: 'Practitioner/1',
      },
      patient: {
        reference: 'Patient/8',
      },
      substance: {
        coding: [
          {
            system: 'http://snomed.info/sct',
            code: '227493005',
            display: 'Macadamia Nuts',
          }
        ]
      },
      clinicalStatus: 'active', verificationStatus: 'confirmed',
      type: 'allergy',
      category: 'food',
      note: {
        text: 'Note text'
      },
      reaction: [
        {
          severity: '',
          manifestation: [
            {
              coding: [
                {
                  system: 'http://snomed.info/sct',
                  code: '',
                  display: '',
                }
              ]
            }
          ]
        }
      ]
    },
    {
      resourceType: 'AllergyIntolerance',
      id: '5',
      recordedDate: '11-Nov-2016',
      recorder: {
        reference: 'Practitioner/1',
      },
      patient: {
        reference: 'Patient/8',
      },
      substance: {
        coding: [
          {
            system: 'http://snomed.info/sct',
            code: '20847002',
            display: 'Streptokinase',
          }
        ]
      },
      clinicalStatus: 'active', verificationStatus: 'confirmed',
      type: 'allergy',
      category: 'medication',
      note: {
        text: 'Note text'
      },
      reaction: [
        {
          severity: 'severe',
          manifestation: [
            {
              coding: [
                {
                  system: 'http://snomed.info/sct',
                  code: '',
                  display: 'Blanching rash',
                }
              ]
            }
          ]
        }
      ]
    },
    {
      resourceType: 'AllergyIntolerance',
      id: '6',
      recordedDate: '09-Sep-2016',
      recorder: {
        reference: 'Practitioner/2',
      },
      patient: {
        reference: 'Patient/8',
      },
      substance: {
        coding: [
          {
            system: 'http://snomed.info/sct',
            code: '',
            display: 'Cat',
          }
        ]
      },
      clinicalStatus: 'inactive', verificationStatus: 'confirmed',
      type: 'allergy',
      category: 'pet',
      note: {
        text: 'Note text'
      },
      reaction: [
        {
          severity: 'moderate',
          manifestation: [
            {
              coding: [
                {
                  system: 'http://snomed.info/sct',
                  code: '',
                  display: 'Hives',
                }
              ]
            }
          ]
        }
      ]
    },
    {
      resourceType: 'AllergyIntolerance',
      id: '7',
      recordedDate: '10-Oct-2016',
      recorder: {
        reference: 'Practitioner/1',
      },
      patient: {
        reference: 'Patient/13',
      },
      substance: {
        coding: [
          {
            system: 'http://snomed.info/sct',
            code: '227493005',
            display: 'Cashew Nuts',
          }
        ]
      },
      clinicalStatus: 'active', verificationStatus: 'confirmed',
      type: 'allergy',
      category: 'food',
      note: {
        text: 'Note text'
      },
      reaction: [
        {
          severity: '',
          manifestation: [
            {
              coding: [
                {
                  system: 'http://snomed.info/sct',
                  code: '',
                  display: '',
                }
              ]
            }
          ]
        }
      ]
    },
    {
      resourceType: 'AllergyIntolerance',
      id: '8',
      recordedDate: '20-Dec-2016',
      recorder: {
        reference: 'Practitioner/1',
      },
      patient: {
        reference: 'Patient/13',
      },
      substance: {
        coding: [
          {
            system: 'http://snomed.info/sct',
            code: '3145006',
            display: 'Penicillin',
          }
        ]
      },
      clinicalStatus: 'active', verificationStatus: 'confirmed',
      type: 'allergy',
      category: 'drug',
      note: {
        text: 'Note text'
      },
      reaction: [
        {
          severity: 'severe',
          manifestation: [
            {
              coding: [
                {
                  system: 'http://snomed.info/sct',
                  code: '',
                  display: 'Moderate to severe',
                }
              ]
            }
          ]
        }
      ]
    },
    {
      resourceType: 'AllergyIntolerance',
      id: '9',
      recordedDate: '20-Dec-2016',
      recorder: {
        reference: 'Practitioner/1',
      },
      patient: {
        reference: 'Patient/13',
      },
      substance: {
        coding: [
          {
            system: 'http://snomed.info/sct',
            code: '44027008',
            display: 'Seafood',
          }
        ]
      },
      clinicalStatus: 'active', verificationStatus: 'confirmed',
      type: 'allergy',
      category: 'food',
      note: {
        text: 'Note text'
      },
      reaction: [
        {
          severity: 'severe',
          manifestation: [
            {
              coding: [
                {
                  system: 'http://snomed.info/sct',
                  code: '',
                  display: 'Moderate to severe',
                }
              ]
            }
          ]
        }
      ]
    },
    {
      resourceType: 'AllergyIntolerance',
      id: '10',
      recordedDate: '',
      recorder: {
        reference: 'Practitioner/2',
      },
      patient: {
        reference: 'Patient/13',
      },
      substance: {
        coding: [
          {
            system: 'http://snomed.info/sct',
            code: '3145006',
            display: 'Penicillin',
          }
        ]
      },
      clinicalStatus: 'active', verificationStatus: 'confirmed',
      type: 'allergy',
      category: 'drug',
      note: {
        text: 'Note text'
      },
      reaction: [
        {
          severity: 'severe',
          manifestation: [
            {
              coding: [
                {
                  system: 'http://snomed.info/sct',
                  code: '',
                  display: '',
                }
              ]
            }
          ]
        }
      ]
    },
    {
      resourceType: 'AllergyIntolerance',
      id: '11',
      recordedDate: '',
      recorder: {
        reference: 'Practitioner/1',
      },
      patient: {
        reference: 'Patient/4',
      },
      substance: {
        coding: [
          {
            system: 'http://snomed.info/sct',
            code: '96068000',
            display: 'Amoxicillin',
          }
        ]
      },
      clinicalStatus: 'active', verificationStatus: 'confirmed',
      type: 'allergy',
      category: 'drug',
      note: {
        text: 'Note text'
      },
      reaction: [
        {
          severity: '',
          manifestation: [
            {
              coding: [
                {
                  system: 'http://snomed.info/sct',
                  code: '',
                  display: '',
                }
              ]
            }
          ]
        }
      ]
    },
    {
      resourceType: 'AllergyIntolerance',
      id: '12',
      recordedDate: '',
      recorder: {
        reference: 'Practitioner/1',
      },
      patient: {
        reference: 'Patient/4',
      },
      substance: {
        coding: [
          {
            system: 'http://snomed.info/sct',
            code: '96070009',
            display: 'Ampicillin sodium',
          }
        ]
      },
      clinicalStatus: 'active', verificationStatus: 'confirmed',
      type: 'allergy',
      category: 'drug',
      note: {
        text: 'Note text'
      },
      reaction: [
        {
          severity: '',
          manifestation: [
            {
              coding: [
                {
                  system: 'http://snomed.info/sct',
                  code: '',
                  display: '',
                }
              ]
            }
          ]
        }
      ]
    },
    {
      resourceType: 'AllergyIntolerance',
      id: '13',
      recordedDate: '10-Oct-2016',
      recorder: {
        reference: 'Practitioner/1',
      },
      patient: {
        reference: 'Patient/14',
      },
      substance: {
        coding: [
          {
            system: 'http://snomed.info/sct',
            code: '227493005',
            display: 'Macadamia Nuts',
          }
        ]
      },
      clinicalStatus: 'active', verificationStatus: 'confirmed',
      type: 'allergy',
      category: 'food',
      note: {
        text: 'Note text'
      },
      reaction: [
        {
          severity: '',
          manifestation: [
            {
              coding: [
                {
                  system: 'http://snomed.info/sct',
                  code: '',
                  display: '',
                }
              ]
            }
          ]
        }
      ]
    },
    {
      resourceType: 'AllergyIntolerance',
      id: '14',
      recordedDate: '30-Dec-2016',
      recorder: {
        reference: 'Practitioner/2',
      },
      patient: {
        reference: 'Patient/14',
      },
      substance: {
        coding: [
          {
            system: 'http://snomed.info/sct',
            code: '',
            display: 'Dog',
          }
        ]
      },
      clinicalStatus: 'active', verificationStatus: 'confirmed',
      type: 'allergy',
      category: 'pet',
      note: {
        text: 'Note text'
      },
      reaction: [
        {
          severity: 'moderate',
          manifestation: [
            {
              coding: [
                {
                  system: 'http://snomed.info/sct',
                  code: '',
                  display: 'Hives',
                }
              ]
            }
          ]
        }
      ]
    },
    ];

    res.send(jsonObj);
  } else {
    res.send("Error");
  }

});

app.get('/api/questionnaireResponse', function (req, res) {

  var patient_id = req.query.patient;

  if (patient_id) {
    var jsonObj = [
      {
        resourceType: 'Bundle',
        formId: 'INFECTION_RISK_ASSESSMENT',
        formTitle: 'Infection Risk Assessment',
        groups: [
          {
            groupId: '1',
            groupTitle: 'MRSA Risk Assessment',
            groupType: 'Section',
            questions: [
              {
                questionId: '1',
                questionText: 'Has the patient ever attended any hospital in the last 6 months',
                questionType: 'Boolean',
                answers: [
                  {
                    answerId: '1',
                    answerText: 'Yes',
                    answerBoolean: '1',
                    answerType: 'Boolean'
                  },
                  {
                    answerId: '2',
                    answerText: 'No',
                    answerBoolean: '0',
                    answerType: 'Boolean'
                  }
                ]
              },
              {
                questionId: '2',
                questionText: 'Has the patient ever been admitted/transferred from another ward?',
                questionType: 'Boolean',
                answers: [
                  {
                    answerId: '3',
                    answerText: 'Yes',
                    answerBoolean: '1',
                    answerType: 'Boolean'
                  },
                  {
                    answerId: '4',
                    answerText: 'No',
                    answerBoolean: '0',
                    answerType: 'Boolean'
                  }
                ]
              },
              {
                questionId: '3',
                questionText: 'Has the patient ever been prviously MRSA positive?',
                questionType: 'Boolean',
                answers: [
                  {
                    answerId: '5',
                    answerText: 'Yes',
                    answerBoolean: '1',
                    answerType: 'Boolean'
                  },
                  {
                    answerId: '6',
                    answerText: 'No',
                    answerBoolean: '0',
                    answerType: 'Boolean'
                  }
                ]
              },
              {
                questionId: '4',
                questionText: 'Has the patient ever had a raised temperature?',
                questionType: 'Boolean',
                answers: [
                  {
                    answerId: '7',
                    answerText: 'Yes',
                    answerBoolean: '1',
                    answerType: 'Boolean'
                  },
                  {
                    answerId: '8',
                    answerText: 'No',
                    answerBoolean: '0',
                    answerType: 'Boolean'
                  }
                ]
              },
              {
                questionId: '5',
                questionText: 'Has the patient ever had a full medical examination in the UK?',
                questionType: 'Boolean',
                answers: [
                  {
                    answerId: '9',
                    answerText: 'Yes',
                    answerBoolean: '1',
                    answerType: 'Boolean'
                  },
                  {
                    answerId: '10',
                    answerText: 'No',
                    answerBoolean: '0',
                    answerType: 'Boolean'
                  }
                ]
              },
              {
                questionId: '6',
                questionText: 'Is the patient having an elective procedure carried out?',
                questionType: 'Boolean',
                answers: [
                  {
                    answerId: '11',
                    answerText: 'Yes',
                    answerBoolean: '1',
                    answerType: 'Boolean'
                  },
                  {
                    answerId: '12',
                    answerText: 'No',
                    answerBoolean: '0',
                    answerType: 'Boolean'
                  }
                ]
              },
              {
                questionId: '7',
                questionText: 'Consent for screening after discussion',
                questionType: 'Boolean',
                answers: [
                  {
                    answerId: '13',
                    answerText: 'Offered and accepted',
                    answerBoolean: '1',
                    answerType: 'Boolean'
                  },
                  {
                    answerId: '14',
                    answerText: 'Not offered',
                    answerBoolean: '0',
                    answerType: 'Boolean'
                  }
                ]
              },
              {
                questionId: '8',
                questionText: 'MRSA Treatment required',
                questionType: 'Boolean',
                answers: [
                  {
                    answerId: '15',
                    answerText: 'Awaiting results',
                    answerBoolean: '1',
                    answerType: 'Boolean'
                  }
                ]
              }
            ]
          },
          {
            groupId: '2',
            groupTitle: 'MRSA Risk Assessment Actions',
            groupType: 'Section',
            questions: [
              {
                questionId: '9',
                questionText: 'MRSA Swabs taken',
                questionType: 'Boolean',
                answers: [
                  {
                    answerId: '16',
                    answerText: 'Yes',
                    answerBoolean: '1',
                    answerType: 'Boolean'
                  },
                  {
                    answerId: '17',
                    answerText: 'No',
                    answerBoolean: '0',
                    answerType: 'Boolean'
                  }
                ]
              },
              {
                questionId: '10',
                questionText: 'Generate Task for MRSA request',
                questionType: 'Boolean',
                answers: [
                  {
                    answerId: '18',
                    answerText: 'Yes',
                    answerBoolean: '1',
                    answerType: 'Boolean'
                  },
                  {
                    answerId: '19',
                    answerText: 'No',
                    answerBoolean: '0',
                    answerType: 'Boolean'
                  }
                ]
              },
              {
                questionId: '11',
                questionText: 'Generate Task to ask GP to Prescribe Treatment for MRSA Result Outcome',
                questionType: 'Boolean',
                answers: [
                  {
                    answerId: '20',
                    answerText: 'Yes',
                    answerBoolean: '1',
                    answerType: 'Boolean'
                  },
                  {
                    answerId: '21',
                    answerText: 'No',
                    answerBoolean: '0',
                    answerType: 'Boolean'
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        resourceType: 'Bundle',
        formId: 'VTE_RISK_ASSESSMENT',
        formTitle: 'VTE Risk Assessment',
        groups: [
          {
            groupId: 'reasonAssessment',
            groupTitle: 'Reason Assessment',
            groupType: 'Section',
            questions: [
              {
                questionId: 'reasonAssessment',
                questionText: 'Reason for assessment',
                questionType: 'Boolean',
                questionVisible: '1',
                questionEnable: '1',
                answers: [
                  {
                    answerId: 'REASON_BOOKING',
                    answerText: 'Booking Visit or Early Pregnancy',
                    answerBoolean: '1',
                    answerType: 'Boolean'
                  },
                  {
                    answerId: 'REASON_OTHER',
                    answerText: 'Other',
                    answerBoolean: '0',
                    answerType: 'Boolean'
                  }
                ]
              },
            ]
          },
          {
            groupId: 'bodyMassIndex',
            groupTitle: 'Body Mass Index',
            groupType: 'Section',
            questions: [
              {
                questionId: 'bodyMassIndex',
                questionText: 'Pre-existing risk factors  (Select all relevant)',
                questionType: 'Boolean',
                questionVisible: '1',
                questionEnable: '1',
                answers: [
                  {
                    answerId: 'BMI_30_40',
                    answerText: 'Between 30 and 40 (0.5)',
                    answerBoolean: '1',
                    answerReal: '0.5',
                    answerType: 'Boolean'
                  },
                  {
                    answerId: 'BMI_OVER_40',
                    answerText: 'Over 40 (1)',
                    answerBoolean: '0',
                    answerReal: '1',
                    answerType: 'Boolean'
                  },
                ]
              },
            ]
          },
          {
            groupId: 'preRiskFactor',
            groupTitle: 'Pre Risk Factor',
            groupType: 'Section',
            questions: [
              {
                questionId: 'preRiskFactor',
                questionText: 'Pre-existing risk factors  (Select all relevant)',
                questionType: 'Boolean',
                questionVisible: '1',
                questionEnable: '1',
                answers: [
                  {
                    answerId: 'PRE_EXISTING_1',
                    answerText: 'Known Thrombophilia: Factor V Leiden/PT20210A/Protein C deficiency/Protein S deficiency Antiphospholipid Syndrome (2)',
                    answerBoolean: '0',
                    answerReal: '2',
                    answerType: 'Boolean'
                  },
                  {
                    answerId: 'PRE_EXISTING_2',
                    answerText: 'Previous VTE- unapproved or pregnancy/oral contraceptive pill related (3)',
                    answerBoolean: '0',
                    answerReal: '3',
                    answerType: 'Boolean'
                  },
                  {
                    answerId: 'PRE_EXISTING_3',
                    answerText: 'Medical conditions (e.g. systemic lupus erythematosus,colitis, cardiac, disease) (2)',
                    answerBoolean: '0',
                    answerReal: '2',
                    answerType: 'Boolean'
                  },
                  {
                    answerId: 'PRE_EXISTING_4',
                    answerText: 'Party ≥ 3 (previous pregnancies) (0.5)',
                    answerBoolean: '0',
                    answerReal: '0.5',
                    answerType: 'Boolean'
                  },
                  {
                    answerId: 'PRE_EXISTING_5',
                    answerText: 'Varicose veins with phlebitis (2)',
                    answerBoolean: '0',
                    answerReal: '2',
                    answerType: 'Boolean'
                  },
                  {
                    answerId: 'PRE_EXISTING_6',
                    answerText: 'Family History of VTE (in patient/ sibling or in 2 other family members) (1)',
                    answerBoolean: '0',
                    answerReal: '1',
                    answerType: 'Boolean'
                  },
                  {
                    answerId: 'PRE_EXISTING_7',
                    answerText: 'Previous Recurrent VTE (3)',
                    answerBoolean: '0',
                    answerReal: '3',
                    answerType: 'Boolean'
                  },
                  {
                    answerId: 'PRE_EXISTING_8',
                    answerText: 'Previous Recurrent VTE Provoked (Post Trauma/Surgery) (2)',
                    answerBoolean: '0',
                    answerReal: '2',
                    answerType: 'Boolean'
                  },
                  {
                    answerId: 'PRE_EXISTING_9',
                    answerText: 'Antithrombin deficiency (3)',
                    answerBoolean: '0',
                    answerReal: '3',
                    answerType: 'Boolean'
                  },
                  {
                    answerId: 'PRE_EXISTING_10',
                    answerText: 'Nephrotic syndrome (3)',
                    answerBoolean: '0',
                    answerReal: '3',
                    answerType: 'Boolean'
                  },
                  {
                    answerId: 'PRE_EXISTING_12',
                    answerText: 'Smoker (0.5)',
                    answerBoolean: '0',
                    answerReal: '0.5',
                    answerType: 'Boolean'
                  },
                ]
              },
            ]
          },
          {
            groupId: 'currentRiskFactor',
            groupTitle: 'Current Risk Factor',
            groupType: 'Section',
            questions: [
              {
                questionId: 'currentRiskFactor',
                questionText: 'Current Obstetric risk factors (Select all relevant)',
                questionType: 'Boolean',
                questionVisible: '1',
                questionEnable: '1',
                answers: [
                  {
                    answerId: 'CURRENT_1',
                    answerText: 'Pre-eclampsia (1)',
                    answerBoolean: '0',
                    answerReal: '1',
                    answerType: 'Boolean'
                  },
                  {
                    answerId: 'CURRENT_2',
                    answerText: 'Multiple pregnancy (1)',
                    answerBoolean: '0',
                    answerReal: '1',
                    answerType: 'Boolean'
                  },
                  {
                    answerId: 'CURRENT_3',
                    answerText: 'Dehydration/ hyperemesis/ overian hyperstimulation (1)',
                    answerBoolean: '0',
                    answerReal: '1',
                    answerType: 'Boolean'
                  },
                  {
                    answerId: 'CURRENT_4',
                    answerText: 'Elective caesarean section (1.5)',
                    answerBoolean: '0',
                    answerReal: '1.5',
                    answerType: 'Boolean'
                  },
                  {
                    answerId: 'CURRENT_5',
                    answerText: 'Prolonged labour (>24 hours) (1)',
                    answerBoolean: '0',
                    answerReal: '1',
                    answerType: 'Boolean'
                  },
                  {
                    answerId: 'CURRENT_6',
                    answerText: 'Emergency caesarean section (2)',
                    answerBoolean: '0',
                    answerReal: '2',
                    answerType: 'Boolean'
                  },
                  {
                    answerId: 'CURRENT_7',
                    answerText: 'Mid-cavity or rotational forceps (1)',
                    answerBoolean: '0',
                    answerReal: '1',
                    answerType: 'Boolean'
                  },
                  {
                    answerId: 'CURRENT_8',
                    answerText: 'Postpartum haemorrhage (>1 litre or requring transfusion) (2)',
                    answerBoolean: '0',
                    answerReal: '1',
                    answerType: 'Boolean'
                  },
                ]
              },
            ]
          },
          {
            groupId: 'transientRiskFactor',
            groupTitle: 'Transient Risk Factor',
            groupType: 'Section',
            questions: [
              {
                questionId: 'transientRiskFactor',
                questionText: 'Transient risk factors (Select all relevant)',
                questionType: 'Boolean',
                questionVisible: '1',
                questionEnable: '1',
                answers: [
                  {
                    answerId: 'TRANSIENT_1',
                    answerText: 'Current systemic infection (1)',
                    answerBoolean: '0',
                    answerReal: '1',
                    answerType: 'Boolean'
                  },
                  {
                    answerId: 'TRANSIENT_2',
                    answerText: 'Surgical procedure in pregnancy or postpartum period (2)',
                    answerBoolean: '0',
                    answerReal: '2',
                    answerType: 'Boolean'
                  },
                  {
                    answerId: 'TRANSIENT_3',
                    answerText: 'Prolonged immobility (1)',
                    answerBoolean: '0',
                    answerReal: '1',
                    answerType: 'Boolean'
                  },
                ]
              },
            ]
          },
          {
            groupId: 'possibleRiskFactor',
            groupTitle: 'Possible Risk Factor',
            groupType: 'Section',
            questions: [
              {
                questionId: 'possibleRiskFactor',
                questionText: 'Possible contra indications to anticoagulation *(Select all relevant)',
                questionType: 'Boolean',
                questionVisible: '1',
                questionEnable: '1',
                answers: [
                  {
                    answerId: 'POSSIBLE_NONE',
                    answerText: 'None',
                    answerBoolean: '0',
                    answerReal: '0',
                    answerType: 'Boolean'
                  },
                  {
                    answerId: 'POSSIBLE_2',
                    answerText: 'Known bleeding disorder (e.g. Haemophilia/ von Willebrands disease)',
                    answerBoolean: '0',
                    answerReal: '0',
                    answerType: 'Boolean'
                  },
                  {
                    answerId: 'POSSIBLE_3',
                    answerText: 'Active antenatal or postnatal bleeding',
                    answerBoolean: '0',
                    answerReal: '0',
                    answerType: 'Boolean'
                  },
                  {
                    answerId: 'POSSIBLE_4',
                    answerText: 'Platelet count <75',
                    answerBoolean: '0',
                    answerReal: '0',
                    answerType: 'Boolean'
                  },
                  {
                    answerId: 'POSSIBLE_5',
                    answerText: 'Acute stroke in previous 4 weeks',
                    answerBoolean: '0',
                    answerReal: '0',
                    answerType: 'Boolean'
                  },
                  {
                    answerId: 'POSSIBLE_6',
                    answerText: 'Women considered at risk of major haemorrhage (e.g. placenta praevia)',
                    answerBoolean: '0',
                    answerReal: '0',
                    answerType: 'Boolean'
                  },
                  {
                    answerId: 'POSSIBLE_7',
                    answerText: 'Severe renal disease (glomerular filtration rate < 30ml/min) or severe liver disease',
                    answerBoolean: '0',
                    answerReal: '0',
                    answerType: 'Boolean'
                  },
                  {
                    answerId: 'POSSIBLE_8',
                    answerText: 'Uncontrolled hypertension (>200 mmHg systolic or > 120 diastolic)',
                    answerBoolean: '0',
                    answerReal: '0',
                    answerType: 'Boolean'
                  },
                  {
                    answerId: 'POSSIBLE_OTHER',
                    answerText: 'Other',
                    answerBoolean: '0',
                    answerReal: '0',
                    answerType: 'Boolean'
                  },
                ]
              },
              {
                questionId: 'possibleComment',
                questionText: 'Possible Comment',
                questionType: 'String',
                questionVisible: '0',
                questionEnable: '1',
                answers: [
                  {
                    answerId: 'POSSIBLE_COMMENT',
                    answerText: 'Free Text(256 chars)',
                    answerBoolean: '0',
                    answerReal: '0',
                    answerType: 'String'
                  },
                ]
              },
            ]
          },
          {
            groupId: 'additionalScoreFields',
            groupTitle: 'Additional Score Fields',
            groupType: 'Section',
            questions: [
              {
                questionId: 'additionalScoreFields',
                questionText: 'VTE pregnancy risk assessment score',
                questionType: 'Boolean',
                questionVisible: '1',
                questionEnable: '1',
                answers: [
                  {
                    answerId: 'ADDITIONAL_OVER_40',
                    answerText: 'Age 40 or over (1)',
                    answerBoolean: '0',
                    answerReal: '1',
                    answerType: 'Boolean',
                    answerVisible: '1',
                    answerEnable: '1',
                  },
                  {
                    answerId: 'ADDITIONAL_35_TO_39',
                    answerText: 'Age 35 to 39 (0.5)',
                    answerBoolean: '0',
                    answerReal: '0.5',
                    answerType: 'Boolean',
                    answerVisible: '1',
                    answerEnable: '1',
                  },
                ]
              },
            ]
          },
        ]
      }
    ];

    res.json(jsonObj);
  } else {
    res.send("Error");
  }

});

app.get('/api/beginsignin', function (request, response) {

  console.log('Generate a secret state and store it');
  var secretState = uuidV4();
  console.log('State = ' + secretState);

  response.redirect(302, 'https://cis.ncrs.nhs.uk/connect/authorize?response_type=code&scope=openid&client_id=s6BhdRkqt3&redirect_uri=' + encodeURIComponent('http://lorenzo-api.mybluemix.net/connect/authorize') + '&state=' + secretState);
})

http.createServer(app).listen(app.get('port'), '0.0.0.0', function () {
  console.log('Express server listening on port ' + app.get('port'));
});
